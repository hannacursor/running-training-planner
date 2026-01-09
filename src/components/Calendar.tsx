import { useState } from 'react';
import { Workout } from '../types';
import { getTrainingWeeks, getWeekDays, toISODate, isInTrainingRange, isSameDate } from '../utils/dateUtils';
import { WorkoutCard } from './WorkoutCard';
import { InlineWorkoutForm } from './InlineWorkoutForm';
import { WeekSummary } from './WeekSummary';
import { formatDayName, formatDayNumber } from '../utils/dateUtils';

interface CalendarProps {
  workouts: Workout[];
  onUpdateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>;
  onDeleteWorkout: (id: string) => Promise<void>;
  onAddWorkout: (workout: Omit<Workout, 'id'>) => Promise<Workout>;
  canEdit: boolean;
}

export function Calendar({ workouts, onUpdateWorkout, onDeleteWorkout, onAddWorkout, canEdit }: CalendarProps) {
  // Track which date has an active inline form (for adding new workout)
  const [addingToDate, setAddingToDate] = useState<string | null>(null);
  // Track which workout is being edited inline
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  const weeks = getTrainingWeeks();
  const today = new Date();

  const handleDayClick = (date: Date) => {
    if (!isInTrainingRange(date) || !canEdit) return;
    const dateStr = toISODate(date);
    // If already adding to this date, cancel
    if (addingToDate === dateStr) {
      setAddingToDate(null);
      return;
    }
    setAddingToDate(dateStr);
    setEditingWorkoutId(null);
  };

  const handleWorkoutEdit = (workout: Workout) => {
    if (!canEdit) return;
    // If already editing this workout, cancel
    if (editingWorkoutId === workout.id) {
      setEditingWorkoutId(null);
      return;
    }
    setEditingWorkoutId(workout.id);
    setAddingToDate(null);
  };

  const handleAddWorkout = async (workout: Omit<Workout, 'id'>) => {
    await onAddWorkout(workout);
    setAddingToDate(null);
  };

  const handleCancel = () => {
    setAddingToDate(null);
    setEditingWorkoutId(null);
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
                      className={`calendar-day ${!isInRange ? 'out-of-range' : ''} ${isTodayDate ? 'today' : ''} ${!canEdit && isInRange ? 'view-only' : ''}`}
                      onClick={() => handleDayClick(day)}
                      style={{ cursor: !canEdit && isInRange ? 'default' : undefined }}
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
                            onClick={canEdit && editingWorkoutId !== workout.id ? (e) => {
                              // Don't trigger edit if clicking on a button or interactive element
                              const target = e.target as HTMLElement;
                              if (target.closest('button') || target.closest('input') || target.closest('label')) {
                                return;
                              }
                              e.stopPropagation();
                              handleWorkoutEdit(workout);
                            } : undefined}
                            style={{ cursor: canEdit && editingWorkoutId !== workout.id ? 'pointer' : 'default' }}
                          >
                            <WorkoutCard
                              workout={workout}
                              onUpdate={onUpdateWorkout}
                              onDelete={onDeleteWorkout}
                              onEdit={() => handleWorkoutEdit(workout)}
                              canEdit={canEdit}
                              isEditing={editingWorkoutId === workout.id}
                              onCancelEdit={handleCancel}
                            />
                          </div>
                        ))}
                        
                        {/* Inline form for adding new workout */}
                        {isInRange && addingToDate === toISODate(day) && canEdit && (
                          <InlineWorkoutForm
                            defaultDate={toISODate(day)}
                            onSave={handleAddWorkout}
                            onCancel={handleCancel}
                          />
                        )}
                      </div>
                      
                      {isInRange && dayWorkouts.length === 0 && addingToDate !== toISODate(day) && canEdit && (
                        <div className="add-workout-hint">Click to add workout</div>
                      )}
                      {isInRange && dayWorkouts.length === 0 && !canEdit && (
                        <div className="add-workout-hint view-only">View only mode</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

    </div>
  );
}

