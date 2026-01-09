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
  start_date: string; // ISO 8601 date string
  type: string; // Activity type (Run, Ride, etc.)
  workout_type?: number; // Strava workout type
}

export interface StravaToken {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp
  athlete_id?: number;
}
