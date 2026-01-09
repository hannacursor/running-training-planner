import { useState } from 'react';
import { Workout } from '../types';
import { secondsToPace } from '../utils/strava';
import { ActivityDetailModal } from './ActivityDetailModal';

interface WorkoutCardProps {
  workout: Workout;
  onUpdate: (id: string, updates: Partial<Workout>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: () => void;
  canEdit: boolean;
}

export function WorkoutCard({ workout, onUpdate, onDelete, onEdit, canEdit }: WorkoutCardProps) {
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  const handleCompleteToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await onUpdate(workout.id, { completed: e.target.checked });
  };

  // Calculate pace from Strava activity if available
  const getPace = () => {
    if (workout.stravaActivity) {
      return secondsToPace(workout.stravaActivity.moving_time, workout.stravaActivity.distance);
    }
    return null;
  };

  const pace = getPace();

  const getWorkoutTypeColorScheme = (type: string) => {
    switch (type) {
      case 'Easy Run':
        return {
          borderLeft: '#4CAF50', // Green
          background: '#E8F5E9', // Light green
          text: '#1B5E20', // Dark green
          label: '#2E7D32', // Medium green
        };
      case 'Threshold':
        return {
          borderLeft: '#FF9800', // Orange
          background: '#FFF3E0', // Light orange
          text: '#E65100', // Dark orange
          label: '#F57C00', // Medium orange
        };
      case 'Long Run':
        return {
          borderLeft: '#2196F3', // Blue
          background: '#E3F2FD', // Light blue
          text: '#0D47A1', // Dark blue
          label: '#1565C0', // Medium blue
        };
      case 'Intervals':
        return {
          borderLeft: '#F44336', // Red
          background: '#FFEBEE', // Light red
          text: '#B71C1C', // Dark red
          label: '#C62828', // Medium red
        };
      case 'Rest':
        return {
          borderLeft: '#9E9E9E', // Grey
          background: '#FFFFFF', // White
          text: '#424242', // Dark grey
          label: '#616161', // Medium grey
        };
      default:
        return {
          borderLeft: '#64b5f6',
          background: '#E3F2FD',
          text: '#1976d2',
          label: '#64b5f6',
        };
    }
  };

  const colorScheme = getWorkoutTypeColorScheme(workout.workoutType);

  return (
    <div 
      className={`workout-card ${workout.completed ? 'completed' : ''}`}
      style={{ 
        borderLeftColor: colorScheme.borderLeft,
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
    >
      <div className="workout-card-header">
        <div className="workout-type" style={{ color: colorScheme.text }}>{workout.workoutType}</div>
        {canEdit && (
          <div className="workout-actions">
            <button className="btn-icon" onClick={onEdit} title="Edit" style={{ color: colorScheme.text }}>
              ✏️
            </button>
            <button 
              className="btn-icon" 
              onClick={async (e) => {
                e.stopPropagation();
                await onDelete(workout.id);
              }}
              title="Delete"
              style={{ color: colorScheme.text }}
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      
      <div className="workout-card-body">
        <div className="workout-mileage">
          <span className="mileage-label" style={{ color: colorScheme.label }}>Planned:</span>
          <span className="mileage-value" style={{ color: colorScheme.text }}>{workout.plannedMileage} mi</span>
        </div>
        
        <div className="workout-mileage">
          <span className="mileage-label" style={{ color: colorScheme.label }}>Actual:</span>
          <span className="mileage-value" style={{ color: colorScheme.text }}>
            {workout.actualMileage !== undefined ? workout.actualMileage.toFixed(2) : '0'} mi
          </span>
          {pace && (
            <span className="pace-value" style={{ color: colorScheme.label, marginLeft: '8px' }}>
              ({pace} /mi)
            </span>
          )}
        </div>

        {workout.stravaActivity && (
          <button
            className="strava-detail-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowActivityDetail(true);
            }}
            style={{ 
              backgroundColor: colorScheme.borderLeft,
              color: 'white'
            }}
          >
            📊 View Details
          </button>
        )}

        {workout.details && (
          <div className="workout-details" style={{ borderTopColor: colorScheme.borderLeft }}>
            <span className="details-label" style={{ color: colorScheme.label }}>Details:</span>
            <p className="details-text" style={{ color: colorScheme.text }}>{workout.details}</p>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="workout-card-footer" style={{ borderTopColor: colorScheme.borderLeft }}>
          <label className="checkbox-label" onClick={(e) => e.stopPropagation()} style={{ color: colorScheme.text }}>
            <input
              type="checkbox"
              checked={workout.completed}
              onChange={handleCompleteToggle}
              onClick={(e) => e.stopPropagation()}
            />
            <span>Completed</span>
          </label>
        </div>
      )}

      {showActivityDetail && workout.stravaActivity && (
        <ActivityDetailModal
          activity={workout.stravaActivity}
          onClose={() => setShowActivityDetail(false)}
        />
      )}
    </div>
  );
}

