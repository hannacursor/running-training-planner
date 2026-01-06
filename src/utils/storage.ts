import { Workout } from '../types';

const STORAGE_KEY = 'running-training-workouts';

/**
 * Load workouts from localStorage
 */
export function loadWorkouts(): Workout[] {
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
 * Save workouts to localStorage
 */
export function saveWorkouts(workouts: Workout[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error('Error saving workouts to localStorage:', error);
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

