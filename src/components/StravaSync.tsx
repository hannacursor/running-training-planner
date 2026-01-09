import { useState } from 'react';
import { getStoredStravaToken, initiateStravaAuth, syncStravaActivities, clearStravaToken } from '../utils/strava';
import { Workout } from '../types';
import './StravaSync.css';

interface StravaSyncProps {
  workouts: Workout[];
  onUpdateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>;
  canEdit: boolean;
}

export function StravaSync({ workouts, onUpdateWorkout, canEdit }: StravaSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ matched: number; updated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConnected = getStoredStravaToken() !== null;

  const handleConnect = () => {
    initiateStravaAuth();
  };

  const handleDisconnect = () => {
    clearStravaToken();
    setSyncResult(null);
    setError(null);
  };

  const handleSync = async () => {
    if (!canEdit) {
      setError('Only admin users can sync Strava activities');
      return;
    }

    setIsSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const result = await syncStravaActivities(workouts, onUpdateWorkout);
      setSyncResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync Strava activities');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!canEdit) {
    return null; // Don't show Strava sync for view-only users
  }

  return (
    <div className="strava-sync">
      <div className="strava-sync-header">
        <h3>Strava Integration</h3>
        {isConnected && (
          <button onClick={handleDisconnect} className="btn-disconnect" title="Disconnect Strava">
            Disconnect
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="strava-connect">
          <p>Connect your Strava account to automatically sync your runs</p>
          <button onClick={handleConnect} className="btn-strava">
            Connect Strava
          </button>
        </div>
      ) : (
        <div className="strava-synced">
          <p className="strava-status">✓ Connected to Strava</p>
          <button 
            onClick={handleSync} 
            className="btn-sync"
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Sync Activities Now'}
          </button>
          
          {syncResult && (
            <div className="sync-result">
              <p>Found {syncResult.matched} matching activities</p>
              <p>Updated {syncResult.updated} workouts</p>
            </div>
          )}

          {error && (
            <div className="sync-error">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

