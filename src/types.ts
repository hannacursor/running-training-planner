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

