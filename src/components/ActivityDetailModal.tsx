import { createPortal } from 'react-dom';
import { StravaActivity } from '../types';
import { secondsToPace, formatDuration } from '../utils/strava';
import './ActivityDetailModal.css';

interface ActivityDetailModalProps {
  activity: StravaActivity;
  onClose: () => void;
}

/**
 * Decode Google polyline encoding to array of [lat, lng] coordinates
 */
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

/**
 * Convert coordinates to SVG path
 */
function coordinatesToSvgPath(
  coordinates: [number, number][],
  width: number,
  height: number,
  padding: number = 20
): string {
  if (coordinates.length === 0) return '';

  // Find bounds
  const lats = coordinates.map(c => c[0]);
  const lngs = coordinates.map(c => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Calculate scale
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;
  const scaleX = (width - 2 * padding) / lngRange;
  const scaleY = (height - 2 * padding) / latRange;
  const scale = Math.min(scaleX, scaleY);

  // Convert to SVG coordinates (flip Y axis)
  const points = coordinates.map(([lat, lng]) => {
    const x = padding + (lng - minLng) * scale;
    const y = padding + (maxLat - lat) * scale;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}

function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}

// Zone colors matching typical HR zone colors
const ZONE_COLORS = [
  '#90CAF9', // Zone 1 - Light blue (Recovery)
  '#81C784', // Zone 2 - Green (Endurance)  
  '#FFD54F', // Zone 3 - Yellow (Tempo)
  '#FF8A65', // Zone 4 - Orange (Threshold)
  '#E57373', // Zone 5 - Red (Anaerobic)
];

const ZONE_NAMES = [
  'Recovery',
  'Endurance',
  'Tempo',
  'Threshold',
  'Anaerobic',
];

interface HRZoneChartProps {
  zones: Array<{ zone: number; min: number; max: number; time: number }>;
}

function HRZoneChart({ zones }: HRZoneChartProps) {
  const totalTime = zones.reduce((sum, z) => sum + z.time, 0);
  
  if (totalTime === 0) return null;

  return (
    <div className="hr-zone-chart">
      {zones.map((zone, index) => {
        const percentage = (zone.time / totalTime) * 100;
        const minutes = Math.floor(zone.time / 60);
        const seconds = zone.time % 60;
        const timeStr = minutes > 0 
          ? `${minutes}m ${seconds}s`
          : `${seconds}s`;
        
        return (
          <div key={zone.zone} className="zone-row">
            <div className="zone-label">
              <span className="zone-number" style={{ backgroundColor: ZONE_COLORS[index] }}>
                Z{zone.zone}
              </span>
              <span className="zone-name">{ZONE_NAMES[index]}</span>
            </div>
            <div className="zone-bar-container">
              <div 
                className="zone-bar"
                style={{ 
                  width: `${Math.max(percentage, 2)}%`,
                  backgroundColor: ZONE_COLORS[index],
                }}
              />
            </div>
            <div className="zone-stats">
              <span className="zone-time">{timeStr}</span>
              <span className="zone-percent">{percentage.toFixed(0)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ActivityDetailModal({ activity, onClose }: ActivityDetailModalProps) {
  const miles = metersToMiles(activity.distance);
  const pace = secondsToPace(activity.moving_time, activity.distance);
  const duration = formatDuration(activity.moving_time);
  
  // Decode polyline for map
  const polyline = activity.map?.summary_polyline;
  const coordinates = polyline ? decodePolyline(polyline) : [];
  const svgPath = coordinatesToSvgPath(coordinates, 400, 250);

  // Use portal to render modal at document body level
  // This prevents parent component re-renders from affecting the modal
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="activity-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{activity.name}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="activity-detail-content">
          {/* Map Section */}
          {svgPath && (
            <div className="activity-map-section">
              <svg 
                viewBox="0 0 400 250" 
                className="activity-route-map"
                preserveAspectRatio="xMidYMid meet"
              >
                <rect x="0" y="0" width="400" height="250" fill="#1a1a2e" rx="8" />
                <path
                  d={svgPath}
                  fill="none"
                  stroke="#ff6b35"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Start marker */}
                {coordinates.length > 0 && (
                  <circle
                    cx={svgPath.split(' ')[1].split(',')[0]}
                    cy={svgPath.split(' ')[1].split(',')[1]}
                    r="6"
                    fill="#4CAF50"
                  />
                )}
                {/* End marker */}
                {coordinates.length > 0 && (
                  <circle
                    cx={svgPath.split(' L ').pop()?.split(',')[0]}
                    cy={svgPath.split(' L ').pop()?.split(',')[1]}
                    r="6"
                    fill="#f44336"
                  />
                )}
              </svg>
              <div className="map-legend">
                <span className="legend-item"><span className="dot start"></span> Start</span>
                <span className="legend-item"><span className="dot end"></span> Finish</span>
              </div>
            </div>
          )}

          {/* Main Stats */}
          <div className="activity-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📏</div>
              <div className="stat-info">
                <span className="stat-value">{miles.toFixed(2)}</span>
                <span className="stat-label">Miles</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <span className="stat-value">{duration}</span>
                <span className="stat-label">Duration</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🏃</div>
              <div className="stat-info">
                <span className="stat-value">{pace}</span>
                <span className="stat-label">Avg Pace /mi</span>
              </div>
            </div>
            
            {activity.calories && (
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <span className="stat-value">{activity.calories}</span>
                  <span className="stat-label">Calories</span>
                </div>
              </div>
            )}
          </div>

          {/* Heart Rate Section */}
          {(activity.average_heartrate || activity.max_heartrate) && (
            <div className="activity-section">
              <h3>❤️ Heart Rate</h3>
              <div className="hr-stats">
                {activity.average_heartrate && (
                  <div className="hr-stat">
                    <span className="hr-value">{Math.round(activity.average_heartrate)}</span>
                    <span className="hr-label">Avg BPM</span>
                  </div>
                )}
                {activity.max_heartrate && (
                  <div className="hr-stat">
                    <span className="hr-value">{Math.round(activity.max_heartrate)}</span>
                    <span className="hr-label">Max BPM</span>
                  </div>
                )}
                {activity.suffer_score && (
                  <div className="hr-stat">
                    <span className="hr-value">{activity.suffer_score}</span>
                    <span className="hr-label">Relative Effort</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HR Zone Distribution Chart */}
          {activity.zone_distribution && activity.zone_distribution.length > 0 && (
            <div className="activity-section">
              <h3>📊 Time in HR Zones</h3>
              <HRZoneChart zones={activity.zone_distribution} />
            </div>
          )}

          {/* Elevation Section */}
          {activity.total_elevation_gain && activity.total_elevation_gain > 0 && (
            <div className="activity-section">
              <h3>⛰️ Elevation</h3>
              <div className="elevation-stat">
                <span className="elevation-value">
                  {Math.round(activity.total_elevation_gain * 3.28084)} ft
                </span>
                <span className="elevation-label">Total Gain</span>
              </div>
            </div>
          )}

          {/* Segment Efforts Section */}
          {activity.segment_efforts && activity.segment_efforts.length > 0 && (
            <div className="activity-section segments-section">
              <h3>🏁 Segments ({activity.segment_efforts.length})</h3>
              <div className="segments-list">
                {activity.segment_efforts.slice(0, 10).map((effort) => (
                  <div key={effort.id} className="segment-item">
                    <div className="segment-header">
                      <span className="segment-name">{effort.name}</span>
                      {effort.pr_rank && effort.pr_rank <= 3 && (
                        <span className={`pr-badge pr-${effort.pr_rank}`}>
                          {effort.pr_rank === 1 ? '🥇 PR' : effort.pr_rank === 2 ? '🥈 2nd' : '🥉 3rd'}
                        </span>
                      )}
                    </div>
                    <div className="segment-stats">
                      <span>{(metersToMiles(effort.distance)).toFixed(2)} mi</span>
                      <span>{formatDuration(effort.elapsed_time)}</span>
                      <span>{secondsToPace(effort.elapsed_time, effort.distance)} /mi</span>
                    </div>
                  </div>
                ))}
                {activity.segment_efforts.length > 10 && (
                  <div className="segments-more">
                    +{activity.segment_efforts.length - 10} more segments
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

