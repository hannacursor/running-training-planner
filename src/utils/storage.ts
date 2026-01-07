import { Workout } from '../types';
import { 
  loadWorkoutsFromSupabase, 
  saveWorkoutToSupabase, 
  deleteWorkoutFromSupabase,
  supabase 
} from './supabase';

const STORAGE_KEY = 'running-training-workouts';

/**
 * Load workouts - tries Supabase first, falls back to localStorage
 */
export async function loadWorkouts(): Promise<Workout[]> {
  // Try Supabase first if configured
  if (supabase) {
    try {
      const workouts = await loadWorkoutsFromSupabase();
      if (workouts.length > 0) {
        // Also sync to localStorage as backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
        return workouts;
      }
    } catch (error) {
      console.error('Error loading from Supabase, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const workouts = JSON.parse(stored) as Workout[];
    // Validate that all required fields are present
    return workouts.filter(w => 
      w.id && 
      w.date && 
      typeof w.plannedMileage === 'number' &&
      w.workoutType &&
      typeof w.completed === 'boolean'
    );
  } catch (error) {
    console.error('Error loading workouts from localStorage:', error);
    return [];
  }
}

/**
 * Save workouts - saves to Supabase and localStorage
 */
export async function saveWorkouts(workouts: Workout[]): Promise<void> {
  // Save to Supabase if configured
  if (supabase) {
    try {
      // Save each workout to Supabase
      await Promise.all(workouts.map(workout => saveWorkoutToSupabase(workout)));
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  }

  // Always save to localStorage as backup
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error('Error saving workouts to localStorage:', error);
  }
}

/**
 * Save a single workout
 */
export async function saveWorkout(workout: Workout): Promise<void> {
  // Save to Supabase if configured
  if (supabase) {
    console.log('Attempting to save workout to Supabase:', workout.id);
    const success = await saveWorkoutToSupabase(workout);
    if (!success) {
      console.warn('Failed to save to Supabase, saving to localStorage only');
    }
  } else {
    console.log('Supabase not configured, saving to localStorage only');
  }

  // Always update localStorage as backup
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const workouts = stored ? JSON.parse(stored) as Workout[] : [];
    const index = workouts.findIndex(w => w.id === workout.id);
    
    if (index >= 0) {
      workouts[index] = workout;
    } else {
      workouts.push(workout);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    console.log('Workout saved to localStorage:', workout.id);
  } catch (error) {
    console.error('Error saving workout to localStorage:', error);
  }
}

/**
 * Delete a workout
 */
export async function deleteWorkout(id: string): Promise<void> {
  // Delete from Supabase if configured
  if (supabase) {
    await deleteWorkoutFromSupabase(id);
  }

  // Delete from localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const workouts = JSON.parse(stored) as Workout[];
      const filtered = workouts.filter(w => w.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error deleting workout from localStorage:', error);
  }
}

/**
 * Get workout by ID
 */
export function getWorkoutById(workouts: Workout[], id: string): Workout | undefined {
  return workouts.find(w => w.id === id);
}

/**
 * Get workouts for a specific date
 */
export function getWorkoutsForDate(workouts: Workout[], date: string): Workout[] {
  return workouts.filter(w => w.date === date);
}

/**
 * Generate a unique ID for a workout
 */
export function generateWorkoutId(): string {
  return `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

