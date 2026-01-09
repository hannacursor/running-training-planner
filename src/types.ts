// Date range constants
export const TRAINING_START_DATE = '2026-01-05'; // January 5, 2026
export const TRAINING_END_DATE = '2026-04-26';   // April 26, 2026

export type WorkoutType = 'Easy Run' | 'Threshold' | 'Intervals' | 'Long Run' | 'Rest';

export interface Workout {
  id: string;
  date: string; // ISO date string
  plannedMileage: number;
  actualMileage?: number;
  workoutType: WorkoutType;
  completed: boolean;
  details?: string;
  stravaActivity?: StravaActivity; // Full Strava activity data
}

export interface WeekSummary {
  weekStart: string; // ISO date of Monday
  plannedMiles: number;
  completedMiles: number;
}

export type UserRole = 'admin' | 'viewer';

export interface User {
  username: string;
  role: UserRole;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number; // in meters
  moving_time: number; // in seconds
  elapsed_time: number; // in seconds
  start_date: string; // ISO 8601 date string
  start_date_local: string; // ISO 8601 in local timezone
  type: string; // Activity type (Run, Ride, etc.)
  workout_type?: number; // Strava workout type
  average_speed: number; // meters per second
  max_speed: number; // meters per second
  total_elevation_gain?: number; // meters
  calories?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  map?: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  segment_efforts?: SegmentEffort[];
}

export interface SegmentEffort {
  id: number;
  name: string;
  elapsed_time: number; // seconds
  moving_time: number; // seconds
  distance: number; // meters
  start_index: number;
  end_index: number;
  average_heartrate?: number;
  max_heartrate?: number;
  segment: {
    id: number;
    name: string;
    distance: number;
    average_grade: number;
    maximum_grade: number;
    elevation_high: number;
    elevation_low: number;
  };
  pr_rank?: number | null; // 1, 2, or 3 for top 3 PRs
  achievements?: Array<{
    type_id: number;
    type: string;
    rank: number;
  }>;
}

export interface StravaToken {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp
  athlete_id?: number;
}
