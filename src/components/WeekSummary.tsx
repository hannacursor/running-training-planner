import { useMemo } from 'react';
import { Workout } from '../types';
import { formatDate } from '../utils/dateUtils';
import { parseISO, startOfWeek, endOfWeek, startOfDay } from 'date-fns';

interface WeekSummaryProps {
  weekStart: Date;
  workouts: Workout[];
  weekNumber: number;
}

export function WeekSummary({ weekStart, workouts, weekNumber }: WeekSummaryProps) {
  const summary = useMemo(() => {
    // Ensure weekStart is normalized to Monday at start of day
    const normalizedWeekStart = startOfDay(startOfWeek(weekStart, { weekStartsOn: 1 }));
    const weekEnd = startOfDay(endOfWeek(normalizedWeekStart, { weekStartsOn: 1 }));
    
    const weekWorkouts = workouts.filter(w => {
      const workoutDate = startOfDay(parseISO(w.date));
      // Check if workout date is within the week range (inclusive of both Monday and Sunday)
      return workoutDate >= normalizedWeekStart && workoutDate <= weekEnd;
    });

    const plannedMiles = weekWorkouts.reduce((sum, w) => sum + w.plannedMileage, 0);
    const completedMiles = weekWorkouts
      .filter(w => w.completed && w.actualMileage !== undefined)
      .reduce((sum, w) => sum + (w.actualMileage || 0), 0);

    const progress = plannedMiles > 0 ? (completedMiles / plannedMiles) * 100 : 0;

    return {
      plannedMiles: Math.round(plannedMiles * 10) / 10,
      completedMiles: Math.round(completedMiles * 10) / 10,
      progress: Math.round(progress),
    };
  }, [weekStart, workouts]);

  return (
    <div className="week-summary">
      <div className="week-summary-header">
        <h3>Week of {formatDate(weekStart)} - Week {weekNumber} of 16</h3>
      </div>
      <div className="week-summary-stats">
        <div className="stat">
          <span className="stat-label">Planned:</span>
          <span className="stat-value">{summary.plannedMiles} mi</span>
        </div>
        <div className="stat">
          <span className="stat-label">Completed:</span>
          <span className="stat-value">{summary.completedMiles} mi</span>
        </div>
        <div className="stat">
          <span className="stat-label">Progress:</span>
          <span className="stat-value">{summary.progress}%</span>
        </div>
      </div>
    </div>
  );
}

