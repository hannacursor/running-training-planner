import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Workout, ZoneDistribution } from '../types';
import { formatDate } from '../utils/dateUtils';
import { parseISO, startOfWeek, endOfWeek, startOfDay } from 'date-fns';

// Zone colors and names
const ZONE_COLORS = ['#90CAF9', '#81C784', '#FFD54F', '#FF8A65', '#E57373'];
const ZONE_NAMES = ['Recovery', 'Endurance', 'Tempo', 'Threshold', 'Anaerobic'];

interface WeekSummaryProps {
  weekStart: Date;
  workouts: Workout[];
  weekNumber: number;
  weekNote: string;
  onWeekNoteSave: (note: string) => void;
  canEdit: boolean;
}

function formatZoneTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function WeekSummary({
  weekStart,
  workouts,
  weekNumber,
  weekNote,
  onWeekNoteSave,
  canEdit,
}: WeekSummaryProps) {
  const [noteDraft, setNoteDraft] = useState(weekNote);
  const noteInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setNoteDraft(weekNote);
  }, [weekNote]);

  useLayoutEffect(() => {
    const textarea = noteInputRef.current;
    if (!textarea) return;

    const maxFontSizePx = 14;
    const minFontSizePx = 9;
    const stepPx = 0.5;

    let currentFontSize = maxFontSizePx;
    textarea.style.fontSize = `${currentFontSize}px`;

    while (
      (textarea.scrollHeight > textarea.clientHeight || textarea.scrollWidth > textarea.clientWidth) &&
      currentFontSize > minFontSizePx
    ) {
      currentFontSize -= stepPx;
      textarea.style.fontSize = `${currentFontSize}px`;
    }
  }, [noteDraft]);

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

    // Aggregate zone distribution from all activities in the week
    const zoneAggregates: number[] = [0, 0, 0, 0, 0]; // 5 zones
    let hasZoneData = false;

    weekWorkouts.forEach(w => {
      if (w.stravaActivity?.zone_distribution) {
        hasZoneData = true;
        w.stravaActivity.zone_distribution.forEach((zone: ZoneDistribution) => {
          if (zone.zone >= 1 && zone.zone <= 5) {
            zoneAggregates[zone.zone - 1] += zone.time;
          }
        });
      }
    });

    const totalZoneTime = zoneAggregates.reduce((sum, t) => sum + t, 0);

    return {
      plannedMiles: Math.round(plannedMiles * 10) / 10,
      completedMiles: Math.round(completedMiles * 10) / 10,
      progress: Math.round(progress),
      zoneAggregates,
      totalZoneTime,
      hasZoneData,
    };
  }, [weekStart, workouts]);

  return (
    <div className="week-summary">
      <div className="week-summary-top">
        <div className="week-summary-left">
          <h3>Week of {formatDate(weekStart)} - Week {weekNumber} of 16</h3>
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
        <textarea
          ref={noteInputRef}
          className="week-note-input"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => onWeekNoteSave(noteDraft)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Add note..."
          aria-label={`Week ${weekNumber} note`}
          disabled={!canEdit}
        />
      </div>

      {/* Weekly HR Zone Distribution - always visible when data exists */}
      {summary.hasZoneData && (
        <div className="week-zone-summary">
          <div className="week-zone-bar">
            {summary.zoneAggregates.map((time, index) => {
              const percentage = summary.totalZoneTime > 0 
                ? (time / summary.totalZoneTime) * 100 
                : 0;
              if (percentage < 1) return null;
              return (
                <div
                  key={index}
                  className="week-zone-segment"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: ZONE_COLORS[index],
                  }}
                  title={`Z${index + 1} ${ZONE_NAMES[index]}: ${formatZoneTime(time)} (${percentage.toFixed(0)}%)`}
                />
              );
            })}
          </div>
          <div className="week-zone-legend">
            {summary.zoneAggregates.map((time, index) => {
              if (time === 0) return null;
              const percentage = (time / summary.totalZoneTime) * 100;
              return (
                <div key={index} className="zone-legend-item">
                  <span 
                    className="zone-legend-color" 
                    style={{ backgroundColor: ZONE_COLORS[index] }}
                  />
                  <span className="zone-legend-text">
                    Z{index + 1}: {formatZoneTime(time)} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

