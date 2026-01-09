import { StravaActivity, StravaToken, Workout } from '../types';
import { parseISO, isSameDay } from 'date-fns';

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
 * Fetch athlete activities from Strava
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
 * Sync Strava activities to workouts
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

  for (const activity of activities) {
    const workout = matchActivityToWorkout(activity, workouts);
    
    if (workout) {
      matched++;
      const miles = metersToMiles(activity.distance);
      
      // Only update if not already completed or if mileage is different
      if (!workout.completed || workout.actualMileage !== miles) {
        await onUpdateWorkout(workout.id, {
          actualMileage: miles,
          completed: true,
        });
        updated++;
      }
    }
  }

  return { matched, updated };
}

