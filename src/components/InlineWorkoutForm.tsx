import { useState, useEffect } from 'react';
import { Workout, WorkoutType } from '../types';

interface InlineWorkoutFormProps {
  workout?: Workout;
  defaultDate: string;
  onSave: (workout: Omit<Workout, 'id'>) => void;
  onCancel: () => void;
}

const WORKOUT_TYPES: WorkoutType[] = ['Easy Run', 'Threshold', 'Intervals', 'Long Run', 'Rest'];

export function InlineWorkoutForm({ workout, defaultDate, onSave, onCancel }: InlineWorkoutFormProps) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>(workout?.workoutType || 'Easy Run');
  const [plannedMileage, setPlannedMileage] = useState(workout?.plannedMileage.toString() || '0');
  const [actualMileage, setActualMileage] = useState(workout?.actualMileage?.toString() || '');
  const [details, setDetails] = useState(workout?.details || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workout) {
      setWorkoutType(workout.workoutType);
      setPlannedMileage(workout.plannedMileage.toString());
      setActualMileage(workout.actualMileage?.toString() || '');
      setDetails(workout.details || '');
    }
  }, [workout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const mileage = parseFloat(plannedMileage);
    if (isNaN(mileage) || mileage < 0) {
      setError('Invalid mileage');
      return;
    }

    if (workoutType === 'Rest' && mileage > 0) {
      setError('Rest days should be 0 miles');
      return;
    }

    const actualMileageNum = actualMileage && actualMileage.trim() !== '' 
      ? parseFloat(actualMileage) 
      : undefined;
    
    onSave({
      date: workout?.date || defaultDate,
      workoutType,
      plannedMileage: mileage,
      completed: workout?.completed || false,
      actualMileage: actualMileageNum,
      details: details.trim() || undefined,
      stravaActivity: workout?.stravaActivity,
    });
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  return (
    <div className="inline-workout-form" onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit}>
        <div className="inline-form-row">
          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
            className="inline-select"
          >
            {WORKOUT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="inline-form-row">
          <label className="inline-label">Planned</label>
          <input
            type="number"
            value={plannedMileage}
            onChange={(e) => setPlannedMileage(e.target.value)}
            min="0"
            step="0.1"
            className="inline-input"
            placeholder="0"
          />
          <span className="inline-unit">mi</span>
        </div>

        <div className="inline-form-row">
          <label className="inline-label">Actual</label>
          <input
            type="number"
            value={actualMileage}
            onChange={(e) => setActualMileage(e.target.value)}
            min="0"
            step="0.1"
            className="inline-input"
            placeholder="0"
          />
          <span className="inline-unit">mi</span>
        </div>

        <div className="inline-form-row">
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="inline-textarea"
            placeholder="Notes..."
            rows={2}
          />
        </div>

        {error && <div className="inline-error">{error}</div>}

        <div className="inline-form-actions">
          <button type="button" onClick={handleCancel} className="inline-btn-cancel">
            ✕
          </button>
          <button type="submit" className="inline-btn-save">
            ✓
          </button>
        </div>
      </form>
    </div>
  );
}

