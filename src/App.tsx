import { useState, useEffect } from 'react';
import { useWorkouts } from './hooks/useWorkouts';
import { Calendar } from './components/Calendar';
import { CalendarHeader } from './components/CalendarHeader';
import { Login } from './components/Login';
import { isAuthenticated, getCurrentUser, logout, canEdit } from './utils/auth';
import './styles/App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      setIsLoggedIn(true);
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

