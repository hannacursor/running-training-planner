import { StravaActivity, StravaToken, Workout, ZoneDistribution, AthleteZones } from '../types';
import { parseISO, isSameDay, format } from 'date-fns';

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

const STORAGE_KEY = 'strava_token';

/**
 * Get stored Strava token
 */
export function getStoredStravaToken(): StravaToken | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StravaToken;
  } catch {
    return null;
  }
}

/**
 * Store Strava token
 */
export function storeStravaToken(token: StravaToken): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
}

/**
 * Clear stored Strava token
 */
export function clearStravaToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if Strava token is expired
 */
export function isTokenExpired(token: StravaToken): boolean {
  return Date.now() / 1000 >= token.expires_at;
}

/**
 * Initiate Strava OAuth flow
 */
export function initiateStravaAuth(): void {
  if (!STRAVA_CLIENT_ID) {
    console.error('Strava Client ID not configured');
    return;
  }

  // Use window.location.origin as redirect URI (must match Strava callback domain)
  const redirectUri = window.location.origin;
  const scope = 'activity:read,activity:read_all';
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&approval_prompt=force`;

  console.log('Strava OAuth redirect URI:', redirectUri);
  window.location.href = authUrl;
}

/**
 * Exchange authorization code for access token
 * Note: This requires a backend endpoint since we need the client secret
 */
export async function exchangeStravaCode(code: string): Promise<StravaToken | null> {
  try {
    const response = await fetch('/api/strava/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('Strava token exchange failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const token: StravaToken = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete_id: data.athlete_id,
    };
    
    // Store the token
    storeStravaToken(token);
    return token;
  } catch (error) {
    console.error('Error exchanging Strava code:', error);
    return null;
  }
}

/**
 * Refresh Strava access token
 */
export async function refreshStravaToken(refreshToken: string): Promise<StravaToken | null> {
  try {
    const response = await fetch('/api/strava/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refreshing Strava token:', error);
    return null;
  }
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = getStoredStravaToken();
  if (!token) return null;

  if (isTokenExpired(token)) {
    // Try to refresh
    const newToken = await refreshStravaToken(token.refresh_token);
    if (newToken) {
      storeStravaToken(newToken);
      return newToken.access_token;
    }
    // Refresh failed, clear token
    clearStravaToken();
    return null;
  }

  return token.access_token;
}

/**
 * Fetch athlete activities from Strava (list endpoint - basic data)
 */
export async function fetchStravaActivities(
  accessToken: string,
  after?: Date,
  before?: Date
): Promise<StravaActivity[]> {
  try {
    const params = new URLSearchParams();
    if (after) {
      params.append('after', Math.floor(after.getTime() / 1000).toString());
    }
    if (before) {
      params.append('before', Math.floor(before.getTime() / 1000).toString());
    }
    params.append('per_page', '200'); // Max per page

    const response = await fetch(
      `${STRAVA_API_BASE}/athlete/activities?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.status}`);
    }

    const activities = await response.json();
    return activities.filter((activity: any) => activity.type === 'Run');
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    return [];
  }
}

/**
 * Fetch detailed activity data (includes segment efforts)
 */
export async function fetchStravaActivityDetail(
  accessToken: string,
  activityId: number
): Promise<StravaActivity | null> {
  try {
    const response = await fetch(
      `${STRAVA_API_BASE}/activities/${activityId}?include_all_efforts=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Strava activity detail:', error);
    return null;
  }
}

/**
 * Fetch athlete's configured HR zones
 */
export async function fetchAthleteZones(accessToken: string): Promise<AthleteZones | null> {
  try {
    const response = await fetch(
      `${STRAVA_API_BASE}/athlete/zones`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching athlete zones:', error);
    return null;
  }
}

/**
 * Fetch activity zones (time in each HR zone)
 * Note: This may fail with 402 if rate limited or requires Strava premium
 */
export async function fetchActivityZones(
  accessToken: string,
  activityId: number
): Promise<ZoneDistribution[] | null> {
  try {
    console.log(`[Zones API] Requesting zones for activity ${activityId}`);
    const response = await fetch(
      `${STRAVA_API_BASE}/activities/${activityId}/zones`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(`[Zones API] Response status: ${response.status}`);

    if (!response.ok) {
      // Try to get error message
      const errorText = await response.text();
      console.log(`[Zones API] Error response: ${errorText}`);
      
      // 404 = Activity doesn't have HR data
      // 402 = Rate limited or premium required
      // 401/403 = Auth issues
      if (response.status === 404 || response.status === 402 || response.status === 401 || response.status === 403) {
        console.log(`[Zones API] Zones not available (status: ${response.status})`);
        return null;
      }
      throw new Error(`Strava API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Zones API] Raw response:`, data);
    
    // Find heart rate distribution
    const hrData = data.find((d: any) => d.type === 'heartrate');
    if (!hrData || !hrData.distribution_buckets) {
      console.log(`[Zones API] No HR distribution found in response`);
      return null;
    }

    console.log(`[Zones API] Found HR data with ${hrData.distribution_buckets.length} buckets`);

    // Map to our ZoneDistribution format
    return hrData.distribution_buckets.map((bucket: any, index: number) => ({
      zone: index + 1,
      min: bucket.min,
      max: bucket.max,
      time: bucket.time,
    }));
  } catch (error) {
    console.error('[Zones API] Error fetching activity zones:', error);
    return null;
  }
}

/**
 * Small delay helper to avoid rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert meters to miles
 */
function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}

/**
 * Match Strava activity to workout by date
 */
export function matchActivityToWorkout(
  activity: StravaActivity,
  workouts: Workout[]
): Workout | null {
  const activityDate = parseISO(activity.start_date);
  
  return workouts.find(workout => {
    const workoutDate = parseISO(workout.date);
    return isSameDay(activityDate, workoutDate);
  }) || null;
}

/**
 * Find workout for a given date (ISO date string YYYY-MM-DD)
 */
function findWorkoutForDate(dateStr: string, workouts: Workout[]): Workout | null {
  return workouts.find(w => w.date === dateStr) || null;
}

/**
 * Merge zone distributions from multiple activities (sum time per zone)
 */
function mergeZoneDistributions(
  distributions: (ZoneDistribution[] | undefined)[]
): ZoneDistribution[] | undefined {
  const zoneMap = new Map<number, number>();
  
  for (const dist of distributions) {
    if (!dist) continue;
    for (const z of dist) {
      if (z.zone >= 1 && z.zone <= 5) {
        zoneMap.set(z.zone, (zoneMap.get(z.zone) ?? 0) + z.time);
      }
    }
  }
  
  if (zoneMap.size === 0) return undefined;
  
  return Array.from(zoneMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([zone, time]) => ({ zone, min: 0, max: 0, time }));
}

/**
 * Sync Strava activities to workouts.
 * When multiple activities occur on the same day, their mileage is summed.
 */
export async function syncStravaActivities(
  workouts: Workout[],
  onUpdateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>
): Promise<{ matched: number; updated: number }> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('No valid Strava token. Please connect Strava first.');
  }

  // Fetch activities from training period
  const startDate = parseISO('2026-01-05');
  const endDate = parseISO('2026-04-26');
  
  const activities = await fetchStravaActivities(token, startDate, endDate);
  
  let matched = 0;
  let updated = 0;

  console.log(`[Strava Sync] Found ${activities.length} activities to process`);

  // Group activities by date (YYYY-MM-DD)
  const activitiesByDate = new Map<string, StravaActivity[]>();
  for (const activity of activities) {
    const dateStr = format(parseISO(activity.start_date), 'yyyy-MM-dd');
    const list = activitiesByDate.get(dateStr) ?? [];
    list.push(activity);
    activitiesByDate.set(dateStr, list);
  }

  for (const [dateStr, dayActivities] of activitiesByDate) {
    const workout = findWorkoutForDate(dateStr, workouts);
    if (!workout) continue;

    matched += dayActivities.length;
    console.log(`[Strava Sync] Processing ${dayActivities.length} activit${dayActivities.length === 1 ? 'y' : 'ies'} on ${dateStr}`);

    const detailedActivities: StravaActivity[] = [];
    let totalDistanceMeters = 0;
    let totalMovingTimeSeconds = 0;
    let totalElapsedTimeSeconds = 0;
    let maxSpeed = 0;
    let totalElevationGain = 0;
    let totalCalories = 0;
    const zoneDistributions: (ZoneDistribution[] | undefined)[] = [];

    for (const activity of dayActivities) {
      await delay(200);
      const detailedActivity = await fetchStravaActivityDetail(token, activity.id);
      const activityData = detailedActivity || activity;
      detailedActivities.push(activityData);

      totalDistanceMeters += activityData.distance;
      totalMovingTimeSeconds += activityData.moving_time;
      totalElapsedTimeSeconds += activityData.elapsed_time;
      maxSpeed = Math.max(maxSpeed, activityData.max_speed ?? 0);
      totalElevationGain += activityData.total_elevation_gain ?? 0;
      totalCalories += activityData.calories ?? 0;

      await delay(200);
      const zoneDistribution = await fetchActivityZones(token, activity.id);
      if (zoneDistribution) {
        activityData.zone_distribution = zoneDistribution;
        zoneDistributions.push(zoneDistribution);
      } else {
        zoneDistributions.push(activityData.zone_distribution);
      }
    }

    const totalMiles = Math.round(metersToMiles(totalDistanceMeters) * 100) / 100;
    const mergedZoneDistribution = mergeZoneDistributions(zoneDistributions);

    // Use longest activity as base for display, with merged totals
    const primaryActivity = detailedActivities.reduce((a, b) =>
      a.distance >= b.distance ? a : b
    );
    const mergedActivity: StravaActivity = {
      ...primaryActivity,
      id: primaryActivity.id,
      name: dayActivities.length > 1
        ? `${primaryActivity.name} (+${dayActivities.length - 1} more)`
        : primaryActivity.name,
      distance: totalDistanceMeters,
      moving_time: totalMovingTimeSeconds,
      elapsed_time: totalElapsedTimeSeconds,
      average_speed: totalMovingTimeSeconds > 0 ? totalDistanceMeters / totalMovingTimeSeconds : primaryActivity.average_speed,
      max_speed: maxSpeed,
      total_elevation_gain: totalElevationGain > 0 ? totalElevationGain : undefined,
      calories: totalCalories > 0 ? totalCalories : undefined,
      zone_distribution: mergedZoneDistribution,
    };

    const needsUpdate =
      !workout.completed ||
      workout.actualMileage !== totalMiles ||
      !workout.stravaActivity ||
      (workout.stravaActivity &&
        !workout.stravaActivity.zone_distribution &&
        mergedZoneDistribution);

    if (needsUpdate) {
      await onUpdateWorkout(workout.id, {
        actualMileage: totalMiles,
        completed: true,
        stravaActivity: mergedActivity,
      });
      updated++;
    }
  }

  console.log(`[Strava Sync] Complete: ${matched} activities processed, ${updated} workouts updated`);

  return { matched, updated };
}

/**
 * Convert seconds to pace string (min:sec per mile)
 */
export function secondsToPace(seconds: number, meters: number): string {
  if (meters === 0) return '--:--';
  const miles = metersToMiles(meters);
  const paceSeconds = seconds / miles;
  const minutes = Math.floor(paceSeconds / 60);
  const secs = Math.round(paceSeconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format duration from seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

