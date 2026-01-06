import { 
  startOfWeek, 
  endOfWeek, 
  eachWeekOfInterval, 
  format, 
  parseISO, 
  isSameWeek,
  isWithinInterval,
  addDays,
  isSameDay
} from 'date-fns';
import { TRAINING_START_DATE, TRAINING_END_DATE } from '../types';

/**
 * Get all weeks in the training date range
 * Returns an array of week start dates (Mondays)
 */
export function getTrainingWeeks(): Date[] {
  const start = parseISO(TRAINING_START_DATE);
  const end = parseISO(TRAINING_END_DATE);
  
  // Get all weeks that include any day in the range
  // Start from the Monday of the week containing the start date
  const weekStart = startOfWeek(start, { weekStartsOn: 1 }); // 1 = Monday
  const weekEnd = endOfWeek(end, { weekStartsOn: 1 });
  
  return eachWeekOfInterval(
    { start: weekStart, end: weekEnd },
    { weekStartsOn: 1 }
  );
}

/**
 * Get the start and end dates for a specific week
 */
export function getWeekBounds(weekStart: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(weekStart, { weekStartsOn: 1 }),
    end: endOfWeek(weekStart, { weekStartsOn: 1 })
  };
}

/**
 * Get all days in a week (Monday through Sunday)
 */
export function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  
  return days;
}

/**
 * Check if a date is within the training date range
 */
export function isInTrainingRange(date: Date): boolean {
  const start = parseISO(TRAINING_START_DATE);
  const end = parseISO(TRAINING_END_DATE);
  
  return isWithinInterval(date, { start, end });
}

/**
 * Check if a date is in a specific week
 */
export function isDateInWeek(date: Date, weekStart: Date): boolean {
  return isSameWeek(date, weekStart, { weekStartsOn: 1 });
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format date as short day name (Mon, Tue, etc.)
 */
export function formatDayName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEE');
}

/**
 * Format date as day number
 */
export function formatDayNumber(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'd');
}

/**
 * Get ISO date string from Date object
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Check if two dates are the same day
 */
export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
}

/**
 * Get the week start (Monday) for a given date
 */
export function getWeekStartForDate(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfWeek(dateObj, { weekStartsOn: 1 });
}

