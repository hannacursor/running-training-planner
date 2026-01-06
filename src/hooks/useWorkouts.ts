import { useState, useEffect, useCallback } from 'react';
import { Workout } from '../types';
import { loadWorkouts, saveWorkouts, generateWorkoutId } from '../utils/storage';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workouts from localStorage on mount
  useEffect(() => {
    const loaded = loadWorkouts();
    setWorkouts(loaded);
    setIsLoading(false);
  }, []);

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveWorkouts(workouts);
    }
  }, [workouts, isLoading]);

  const addWorkout = useCallback((workout: Omit<Workout, 'id'>): Workout => {
    const newWorkout: Workout = {
      ...workout,
      id: generateWorkoutId(),
    };
    
    setWorkouts(prev => [...prev, newWorkout]);
    return newWorkout;
  }, []);

  const updateWorkout = useCallback((id: string, updates: Partial<Workout>): void => {
    setWorkouts(prev =>
      prev.map(w => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  const deleteWorkout = useCallback((id: string): void => {
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
    deleteWorkout,
    getWorkout,
    getWorkoutsForDate,
  };
}

