import { useState } from 'react';
import { Workout } from '../types';
import { getTrainingWeeks, getWeekDays, toISODate, isInTrainingRange, isSameDate } from '../utils/dateUtils';
import { WorkoutCard } from './WorkoutCard';
import { WorkoutForm } from './WorkoutForm';
import { WeekSummary } from './WeekSummary';
import { formatDayName, formatDayNumber } from '../utils/dateUtils';

interface CalendarProps {
  workouts: Workout[];
  onUpdateWorkout: (id: string, updates: Partial<Workout>) => void;
  onDeleteWorkout: (id: string) => void;
  onAddWorkout: (workout: Omit<Workout, 'id'>) => void;
}

export function Calendar({ workouts, onUpdateWorkout, onDeleteWorkout, onAddWorkout }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const weeks = getTrainingWeeks();
  const today = new Date();

  const handleDayClick = (date: Date) => {
    if (!isInTrainingRange(date)) return;
    setSelectedDate(toISODate(date));
    setEditingWorkout(null);
  };

  const handleWorkoutEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setSelectedDate(null);
  };

  const handleWorkoutClick = (workout: Workout, e: React.MouseEvent) => {
    e.stopPropagation();
    handleWorkoutEdit(workout);
  };

  const handleAddWorkout = (workout: Omit<Workout, 'id'>) => {
    onAddWorkout(workout);
    setSelectedDate(null);
  };

  const handleUpdateWorkout = (workout: Omit<Workout, 'id'>) => {
    if (editingWorkout) {
      onUpdateWorkout(editingWorkout.id, workout);
      setEditingWorkout(null);
    }
  };

  const handleCancel = () => {
    setSelectedDate(null);
    setEditingWorkout(null);
  };

  const getWorkoutsForDate = (date: Date): Workout[] => {
    const dateStr = toISODate(date);
    return workouts.filter(w => w.date === dateStr);
  };

  const isToday = (date: Date): boolean => {
    return isSameDate(date, today);
  };

  return (
    <div className="calendar-container">
      {weeks.map((weekStart, weekIndex) => {
        const weekDays = getWeekDays(weekStart);
        
        return (
          <div key={weekStart.toISOString()} className="week-section">
            <WeekSummary weekStart={weekStart} workouts={workouts} weekNumber={weekIndex + 1} />
            
            <div className="calendar-week">
              <div className="calendar-grid">
                {weekDays.map((day) => {
                  const dayWorkouts = getWorkoutsForDate(day);
                  const isInRange = isInTrainingRange(day);
                  const isTodayDate = isToday(day);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`calendar-day ${!isInRange ? 'out-of-range' : ''} ${isTodayDate ? 'today' : ''}`}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="day-header">
                        <div className="day-name">{formatDayName(day)}</div>
                        <div className={`day-number ${isTodayDate ? 'today-number' : ''}`}>
                          {formatDayNumber(day)}
                        </div>
                      </div>
                      
                      <div className="day-workouts">
                        {dayWorkouts.map((workout) => (
                          <div
                            key={workout.id}
                            onClick={(e) => handleWorkoutClick(workout, e)}
                          >
                            <WorkoutCard
                              workout={workout}
                              onUpdate={onUpdateWorkout}
                              onDelete={onDeleteWorkout}
                              onEdit={() => handleWorkoutEdit(workout)}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {isInRange && dayWorkouts.length === 0 && (
                        <div className="add-workout-hint">Click to add workout</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {selectedDate && (
        <WorkoutForm
          defaultDate={selectedDate}
          onSave={handleAddWorkout}
          onCancel={handleCancel}
        />
      )}

      {editingWorkout && (
        <WorkoutForm
          workout={editingWorkout}
          onSave={handleUpdateWorkout}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

