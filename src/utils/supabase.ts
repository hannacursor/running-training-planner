import { createClient } from '@supabase/supabase-js';
import { Workout } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Falling back to localStorage.');
  console.warn('Make sure .env.local file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
} else {
  console.log('Supabase connection configured successfully');
}

// Create Supabase client (will be null if credentials are missing)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database table name
const TABLE_NAME = 'workouts';

/**
 * Load workouts from Supabase
 */
export async function loadWorkoutsFromSupabase(): Promise<Workout[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading workouts from Supabase:', error);
      return [];
    }

    // Transform database format to app format
    return (data || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      plannedMileage: parseFloat(row.planned_mileage),
      actualMileage: row.actual_mileage ? parseFloat(row.actual_mileage) : undefined,
      workoutType: row.workout_type as Workout['workoutType'],
      completed: row.completed || false,
      details: row.details || undefined,
      stravaActivity: row.strava_activity ? JSON.parse(row.strava_activity) : undefined,
    }));
  } catch (error) {
    console.error('Error loading workouts from Supabase:', error);
    return [];
  }
}

/**
 * Save a single workout to Supabase
 */
export async function saveWorkoutToSupabase(workout: Workout): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        id: workout.id,
        date: workout.date,
        planned_mileage: workout.plannedMileage,
        actual_mileage: workout.actualMileage || null,
        workout_type: workout.workoutType,
        completed: workout.completed,
        details: workout.details || null,
        strava_activity: workout.stravaActivity ? JSON.stringify(workout.stravaActivity) : null,
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error saving workout to Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('Workout saved to Supabase successfully:', workout.id);
    return true;
  } catch (error) {
    console.error('Error saving workout to Supabase:', error);
    return false;
  }
}

/**
 * Delete a workout from Supabase
 */
export async function deleteWorkoutFromSupabase(id: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workout from Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting workout from Supabase:', error);
    return false;
  }
}

