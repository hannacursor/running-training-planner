import { TRAINING_START_DATE, TRAINING_END_DATE } from '../types';
import { formatDate } from '../utils/dateUtils';
import { parseISO } from 'date-fns';

export function CalendarHeader() {
  const startDate = formatDate(parseISO(TRAINING_START_DATE));
  const endDate = formatDate(parseISO(TRAINING_END_DATE));

  return (
    <div className="calendar-header">
      <h1>Running Training Planner</h1>
      <p className="date-range">
        {startDate} - {endDate}
      </p>
    </div>
  );
}

