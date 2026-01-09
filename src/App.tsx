import { useState, useEffect } from 'react';
import { useWorkouts } from './hooks/useWorkouts';
import { Calendar } from './components/Calendar';
import { CalendarHeader } from './components/CalendarHeader';
import { Login } from './components/Login';
import { StravaSync } from './components/StravaSync';
import { isAuthenticated, getCurrentUser, logout, canEdit } from './utils/auth';
import { exchangeStravaCode } from './utils/strava';
import './styles/App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      setIsLoggedIn(true);
    }

    // Handle Strava OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code) {
      // Exchange code for token
      exchangeStravaCode(code).then((token) => {
        if (token) {
          // Store token (handled in exchangeStravaCode)
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    } else if (error) {
      console.error('Strava OAuth error:', error);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const user = getCurrentUser();
  const hasEditPermission = canEdit();

  return (
    <div className="app">
      <div className="app-header-bar">
        <CalendarHeader />
        <div className="user-info">
          <span className="username">Logged in as: {user?.username}</span>
          {!hasEditPermission && (
            <span className="view-only-badge">View Only</span>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      {hasEditPermission && (
        <StravaSync
          workouts={workouts}
          onUpdateWorkout={updateWorkout}
          canEdit={hasEditPermission}
        />
      )}
      <Calendar
        workouts={workouts}
        onAddWorkout={hasEditPermission ? addWorkout : async () => ({ id: '', date: '', plannedMileage: 0, workoutType: 'Easy Run', completed: false })}
        onUpdateWorkout={hasEditPermission ? updateWorkout : async () => {}}
        onDeleteWorkout={hasEditPermission ? deleteWorkout : async () => {}}
        canEdit={hasEditPermission}
      />
    </div>
  );
}

export default App;

