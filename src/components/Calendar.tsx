import { useState } from 'react';
import { Workout } from '../types';
import { getTrainingWeeks, getWeekDays, toISODate, isInTrainingRange, isSameDate } from '../utils/dateUtils';
import { WorkoutCard } from './WorkoutCard';
import { WorkoutForm } from './WorkoutForm';
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const weeks = getTrainingWeeks();
  const today = new Date();

  const handleDayClick = (date: Date) => {
    if (!isInTrainingRange(date) || !canEdit) return;
    setSelectedDate(toISODate(date));
    setEditingWorkout(null);
  };

  const handleWorkoutEdit = (workout: Workout) => {
    if (!canEdit) return;
    setEditingWorkout(workout);
    setSelectedDate(null);
  };

  const handleWorkoutClick = (workout: Workout, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    handleWorkoutEdit(workout);
  };

  const handleAddWorkout = async (workout: Omit<Workout, 'id'>) => {
    await onAddWorkout(workout);
    setSelectedDate(null);
  };

  const handleUpdateWorkout = async (workout: Omit<Workout, 'id'>) => {
    if (editingWorkout) {
      await onUpdateWorkout(editingWorkout.id, workout);
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
                            onClick={canEdit ? (e) => handleWorkoutClick(workout, e) : undefined}
                            style={{ cursor: canEdit ? 'pointer' : 'default' }}
                          >
                            <WorkoutCard
                              workout={workout}
                              onUpdate={onUpdateWorkout}
                              onDelete={onDeleteWorkout}
                              onEdit={() => handleWorkoutEdit(workout)}
                              canEdit={canEdit}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {isInRange && dayWorkouts.length === 0 && canEdit && (
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

      {selectedDate && canEdit && (
        <WorkoutForm
          defaultDate={selectedDate}
          onSave={handleAddWorkout}
          onCancel={handleCancel}
        />
      )}

      {editingWorkout && canEdit && (
        <WorkoutForm
          workout={editingWorkout}
          onSave={handleUpdateWorkout}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

