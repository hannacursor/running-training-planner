import { useWorkouts } from './hooks/useWorkouts';
import { Calendar } from './components/Calendar';
import { CalendarHeader } from './components/CalendarHeader';
import './styles/App.css';

function App() {
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();

  return (
    <div className="app">
      <CalendarHeader />
      <Calendar
        workouts={workouts}
        onAddWorkout={addWorkout}
        onUpdateWorkout={updateWorkout}
        onDeleteWorkout={deleteWorkout}
      />
    </div>
  );
}

export default App;

