import { useState } from 'react';
import { Workout, WorkoutType } from '../types';
import { secondsToPace } from '../utils/strava';
import { ActivityDetailModal } from './ActivityDetailModal';

interface WorkoutCardProps {
  workout: Workout;
  onUpdate: (id: string, updates: Partial<Workout>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: () => void;
  canEdit: boolean;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

const WORKOUT_TYPES: WorkoutType[] = ['Easy Run', 'Threshold', 'Intervals', 'Long Run', 'Rest'];

export function WorkoutCard({ workout, onUpdate, onDelete, canEdit, isEditing, onCancelEdit }: WorkoutCardProps) {
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Editing state
  const [editWorkoutType, setEditWorkoutType] = useState<WorkoutType>(workout.workoutType);
  const [editPlannedMileage, setEditPlannedMileage] = useState(workout.plannedMileage.toString());
  const [editDetails, setEditDetails] = useState(workout.details || '');

  const handleCompleteToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    await onUpdate(workout.id, { completed: e.target.checked });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const mileage = parseFloat(editPlannedMileage);
    if (isNaN(mileage) || mileage < 0) return;
    
    await onUpdate(workout.id, {
      workoutType: editWorkoutType,
      plannedMileage: mileage,
      details: editDetails.trim() || undefined,
    });
    onCancelEdit?.();
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Reset to original values
    setEditWorkoutType(workout.workoutType);
    setEditPlannedMileage(workout.plannedMileage.toString());
    setEditDetails(workout.details || '');
    onCancelEdit?.();
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

  // Use editing type for color scheme when editing
  const colorScheme = getWorkoutTypeColorScheme(isEditing ? editWorkoutType : workout.workoutType);

  // Editing mode - show inline editable fields
  if (isEditing && canEdit) {
    return (
      <div 
        className="workout-card editing"
        style={{ 
          borderLeftColor: colorScheme.borderLeft,
          backgroundColor: colorScheme.background,
          color: colorScheme.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSaveEdit}>
          <div className="workout-card-header">
            <select
              value={editWorkoutType}
              onChange={(e) => setEditWorkoutType(e.target.value as WorkoutType)}
              className="inline-type-select"
              style={{ color: colorScheme.text, borderColor: colorScheme.borderLeft }}
            >
              {WORKOUT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="workout-actions">
              <button type="button" className="btn-icon" onClick={handleCancelEdit} title="Cancel">
                ✕
              </button>
              <button type="submit" className="btn-icon save-btn" title="Save">
                ✓
              </button>
            </div>
          </div>
          
          <div className="workout-card-body">
            <div className="workout-mileage">
              <span className="mileage-label" style={{ color: colorScheme.label }}>Planned:</span>
              <input
                type="number"
                value={editPlannedMileage}
                onChange={(e) => setEditPlannedMileage(e.target.value)}
                min="0"
                step="0.1"
                className="inline-mileage-input"
                style={{ color: colorScheme.text, borderColor: colorScheme.borderLeft }}
              />
              <span className="mileage-unit" style={{ color: colorScheme.label }}>mi</span>
            </div>
            
            {(workout.actualMileage !== undefined && workout.actualMileage > 0) && (
              <div className="workout-mileage">
                <span className="mileage-label" style={{ color: colorScheme.label }}>Actual:</span>
                <span className="mileage-value" style={{ color: colorScheme.text }}>
                  {workout.actualMileage.toFixed(2)} mi
                </span>
                {pace && (
                  <span className="pace-value" style={{ color: colorScheme.label, marginLeft: '8px' }}>
                    ({pace} /mi)
                  </span>
                )}
              </div>
            )}

            <textarea
              value={editDetails}
              onChange={(e) => setEditDetails(e.target.value)}
              className="inline-details-textarea"
              placeholder="Notes..."
              rows={2}
              style={{ borderColor: colorScheme.borderLeft }}
            />
          </div>
        </form>
      </div>
    );
  }

  // View mode - normal display
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
            <button 
              className="btn-icon" 
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
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
        
        {(workout.actualMileage !== undefined && workout.actualMileage > 0) && (
          <div className="workout-mileage">
            <span className="mileage-label" style={{ color: colorScheme.label }}>Actual:</span>
            <span className="mileage-value" style={{ color: colorScheme.text }}>
              {workout.actualMileage.toFixed(2)} mi
            </span>
            {pace && (
              <span className="pace-value" style={{ color: colorScheme.label, marginLeft: '8px' }}>
                ({pace} /mi)
              </span>
            )}
          </div>
        )}

        {workout.stravaActivity && (
          <button
            type="button"
            className="strava-detail-btn"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
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
            <span className="details-label" style={{ color: colorScheme.label }}>Notes:</span>
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

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          onConfirm={async () => {
            setShowDeleteConfirm(false);
            await onDelete(workout.id);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

// Delete confirmation dialog component
function DeleteConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-confirm-icon">🗑️</div>
        <h3>Delete Workout?</h3>
        <p>Are you sure you want to delete this workout? This action cannot be undone.</p>
        <div className="delete-confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

