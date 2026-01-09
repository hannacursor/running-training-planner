import { useState } from 'react';
import { Workout, WorkoutType } from '../types';

interface InlineWorkoutFormProps {
  defaultDate: string;
  onSave: (workout: Omit<Workout, 'id'>) => void;
  onCancel: () => void;
}

const WORKOUT_TYPES: WorkoutType[] = ['Easy Run', 'Threshold', 'Intervals', 'Long Run', 'Rest'];

export function InlineWorkoutForm({ defaultDate, onSave, onCancel }: InlineWorkoutFormProps) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>('Easy Run');
  const [plannedMileage, setPlannedMileage] = useState('0');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    
    onSave({
      date: defaultDate,
      workoutType,
      plannedMileage: mileage,
      completed: false,
      details: details.trim() || undefined,
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

