import { useState, useEffect, useCallback } from 'react';
import { Workout } from '../types';
import { loadWorkouts, saveWorkout, deleteWorkout, generateWorkoutId } from '../utils/storage';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workouts on mount (tries Supabase, falls back to localStorage)
  useEffect(() => {
    const loadData = async () => {
      const loaded = await loadWorkouts();
      setWorkouts(loaded);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const addWorkout = useCallback(async (workout: Omit<Workout, 'id'>): Promise<Workout> => {
    const newWorkout: Workout = {
      ...workout,
      id: generateWorkoutId(),
    };
    
    // Save to backend/localStorage
    await saveWorkout(newWorkout);
    
    setWorkouts(prev => [...prev, newWorkout]);
    return newWorkout;
  }, []);

  const updateWorkout = useCallback(async (id: string, updates: Partial<Workout>): Promise<void> => {
    const updatedWorkout = workouts.find(w => w.id === id);
    if (!updatedWorkout) return;

    const newWorkout = { ...updatedWorkout, ...updates };
    
    // Save to backend/localStorage
    await saveWorkout(newWorkout);
    
    setWorkouts(prev =>
      prev.map(w => (w.id === id ? newWorkout : w))
    );
  }, [workouts]);

  const deleteWorkoutHandler = useCallback(async (id: string): Promise<void> => {
    // Delete from backend/localStorage
    await deleteWorkout(id);
    
    setWorkouts(prev => prev.filter(w => w.id !== id));
  }, []);

  const getWorkout = useCallback((id: string): Workout | undefined => {
    return workouts.find(w => w.id === id);
  }, [workouts]);

  const getWorkoutsForDate = useCallback((date: string): Workout[] => {
    return workouts.filter(w => w.date === date);
  }, [workouts]);

  return {
    workouts,
    isLoading,
    addWorkout,
    updateWorkout,
    deleteWorkout: deleteWorkoutHandler,
    getWorkout,
    getWorkoutsForDate,
  };
}

