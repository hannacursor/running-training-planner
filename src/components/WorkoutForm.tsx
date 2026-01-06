import { useState, useEffect } from 'react';
import { Workout, WorkoutType, TRAINING_START_DATE, TRAINING_END_DATE } from '../types';
import { isInTrainingRange } from '../utils/dateUtils';
import { parseISO } from 'date-fns';

interface WorkoutFormProps {
  workout?: Workout;
  defaultDate?: string;
  onSave: (workout: Omit<Workout, 'id'>) => void;
  onCancel: () => void;
}

const WORKOUT_TYPES: WorkoutType[] = ['Easy Run', 'Threshold', 'Intervals', 'Long Run', 'Rest'];

export function WorkoutForm({ workout, defaultDate, onSave, onCancel }: WorkoutFormProps) {
  const [date, setDate] = useState(workout?.date || defaultDate || TRAINING_START_DATE);
  const [workoutType, setWorkoutType] = useState<WorkoutType>(workout?.workoutType || 'Easy Run');
  const [plannedMileage, setPlannedMileage] = useState(workout?.plannedMileage.toString() || '0');
  const [actualMileage, setActualMileage] = useState(workout?.actualMileage?.toString() || '');
  const [details, setDetails] = useState(workout?.details || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (workout) {
      setDate(workout.date);
      setWorkoutType(workout.workoutType);
      setPlannedMileage(workout.plannedMileage.toString());
      setActualMileage(workout.actualMileage?.toString() || '');
      setDetails(workout.details || '');
    }
  }, [workout]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const dateObj = parseISO(date);
    if (!isInTrainingRange(dateObj)) {
      newErrors.date = `Date must be between ${TRAINING_START_DATE} and ${TRAINING_END_DATE}`;
    }

    const mileage = parseFloat(plannedMileage);
    if (isNaN(mileage) || mileage < 0) {
      newErrors.plannedMileage = 'Planned mileage must be a positive number';
    }

    if (workoutType === 'Rest' && mileage > 0) {
      newErrors.plannedMileage = 'Rest days should have 0 miles';
    }

    if (actualMileage && actualMileage.trim() !== '') {
      const actualMileageNum = parseFloat(actualMileage);
      if (isNaN(actualMileageNum) || actualMileageNum < 0) {
        newErrors.actualMileage = 'Actual mileage must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const mileage = parseFloat(plannedMileage);
    const actualMileageNum = actualMileage && actualMileage.trim() !== '' 
      ? parseFloat(actualMileage) 
      : undefined;
    
    onSave({
      date,
      workoutType,
      plannedMileage: mileage,
      completed: workout?.completed || false,
      actualMileage: actualMileageNum,
      details: details.trim() || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{workout ? 'Edit Workout' : 'Add Workout'}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={TRAINING_START_DATE}
              max={TRAINING_END_DATE}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="workoutType">Workout Type</label>
            <select
              id="workoutType"
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
            >
              {WORKOUT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="plannedMileage">Planned Mileage</label>
            <input
              type="number"
              id="plannedMileage"
              value={plannedMileage}
              onChange={(e) => setPlannedMileage(e.target.value)}
              min="0"
              step="0.1"
              className={errors.plannedMileage ? 'error' : ''}
            />
            {errors.plannedMileage && (
              <span className="error-message">{errors.plannedMileage}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="actualMileage">Completed Mileage</label>
            <input
              type="number"
              id="actualMileage"
              value={actualMileage}
              onChange={(e) => setActualMileage(e.target.value)}
              min="0"
              step="0.1"
              placeholder="Enter actual distance run"
              className={errors.actualMileage ? 'error' : ''}
            />
            {errors.actualMileage && (
              <span className="error-message">{errors.actualMileage}</span>
            )}
            <small className="form-hint">You can log your completed mileage here</small>
          </div>

          <div className="form-group">
            <label htmlFor="details">Workout Details</label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Add notes about your workout (e.g., pace, how you felt, route, etc.)"
              className="form-textarea"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {workout ? 'Update' : 'Add'} Workout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

