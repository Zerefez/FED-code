import { HabitEntry } from '@/services/habit-entry-service';
import { formatDateString, getTodayString } from './date-utils';
import { shouldTrackHabitOnDate } from './frequency-utils';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  expectedThisWeek: number;
  completedThisWeek: number;
  completionRate: number;
}

/**
 * Calculate streak information for a specific habit considering its frequency
 */
export function calculateStreakInfo(habitId: string, habitEntries: HabitEntry[], habitStartDate: string, frequency: string = 'daily'): StreakInfo {
  // Filter entries for this habit and only completed ones
  const completedEntries = habitEntries
    .filter(entry => entry.habitId === habitId && entry.completed)
    .map(entry => ({
      ...entry,
      dateString: formatDateString(entry.date)
    }))
    .sort((a, b) => a.dateString.localeCompare(b.dateString));

  if (completedEntries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
      expectedThisWeek: 0,
      completedThisWeek: 0,
      completionRate: 0
    };
  }

  const today = getTodayString();
  const yesterday = formatDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
  
  // Get unique dates (in case there are multiple entries for the same day)
  const uniqueDates = [...new Set(completedEntries.map(entry => entry.dateString))].sort();
  
  // Calculate current streak based on frequency
  let currentStreak = 0;
  let checkDate = today;
  
  // If not completed today and today is an expected day, check from yesterday
  if (!uniqueDates.includes(today) && shouldTrackHabitOnDate(habitStartDate, frequency, today)) {
    checkDate = yesterday;
  } else if (!uniqueDates.includes(today)) {
    // Find the most recent expected day
    let daysBack = 1;
    while (daysBack <= 30) { // Limit search to 30 days back
      const pastDate = formatDateString(new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000));
      if (shouldTrackHabitOnDate(habitStartDate, frequency, pastDate)) {
        checkDate = pastDate;
        break;
      }
      daysBack++;
    }
  }
  
  // Count consecutive expected days that were completed
  let dateToCheck = checkDate;
  for (let i = 0; i < 365; i++) { // Limit to avoid infinite loop
    if (shouldTrackHabitOnDate(habitStartDate, frequency, dateToCheck)) {
      if (uniqueDates.includes(dateToCheck)) {
        currentStreak++;
      } else {
        break; // Break on first missed expected day
      }
    }
    
    // Move to previous day
    const currentDateObj = new Date(dateToCheck + 'T00:00:00');
    currentDateObj.setDate(currentDateObj.getDate() - 1);
    dateToCheck = formatDateString(currentDateObj);
    
    // Don't go before habit start date
    if (dateToCheck < formatDateString(new Date(habitStartDate))) {
      break;
    }
  }
  
  // Calculate longest streak considering frequency
  let longestStreak = 0;
  let tempStreak = 0;
  let allExpectedDates: string[] = [];
  
  // Generate all expected dates from start to today
  const startDate = new Date(habitStartDate + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  
  for (let d = new Date(startDate); d <= todayDate; d.setDate(d.getDate() + 1)) {
    const dateString = formatDateString(d);
    if (shouldTrackHabitOnDate(habitStartDate, frequency, dateString)) {
      allExpectedDates.push(dateString);
    }
  }
  
  // Calculate longest streak from expected dates
  for (const expectedDate of allExpectedDates) {
    if (uniqueDates.includes(expectedDate)) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  // Calculate weekly stats
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoString = formatDateString(weekAgo);
  
  let expectedThisWeek = 0;
  let completedThisWeek = 0;
  
  for (let i = 0; i < 7; i++) {
    const checkDateWeek = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const checkDateString = formatDateString(checkDateWeek);
    
    if (shouldTrackHabitOnDate(habitStartDate, frequency, checkDateString)) {
      expectedThisWeek++;
      if (uniqueDates.includes(checkDateString)) {
        completedThisWeek++;
      }
    }
  }
  
  const completionRate = expectedThisWeek > 0 ? Math.round((completedThisWeek / expectedThisWeek) * 100) : 0;
  
  return {
    currentStreak,
    longestStreak,
    lastCompletionDate: uniqueDates[uniqueDates.length - 1] || null,
    expectedThisWeek,
    completedThisWeek,
    completionRate
  };
}

/**
 * Get calendar data for the last N days showing habit completion
 */
export function getCalendarData(habitId: string, habitEntries: HabitEntry[], days: number = 30): CalendarDay[] {
  const calendarDays: CalendarDay[] = [];
  const today = new Date();
  
  // Get habit entries for this habit
  const habitEntriesMap = new Map<string, HabitEntry>();
  habitEntries
    .filter(entry => entry.habitId === habitId)
    .forEach(entry => {
      const dateKey = formatDateString(entry.date);
      // If multiple entries for same day, keep the latest one
      if (!habitEntriesMap.has(dateKey) || entry.date > habitEntriesMap.get(dateKey)!.date) {
        habitEntriesMap.set(dateKey, entry);
      }
    });
  
  // Generate calendar days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = formatDateString(date);
    
    const entry = habitEntriesMap.get(dateString);
    
    calendarDays.push({
      date: dateString,
      dayOfMonth: date.getDate(),
      dayOfWeek: date.getDay(),
      status: entry ? (entry.completed ? 'completed' : 'missed') : 'no-entry',
      reason: entry?.reason || null
    });
  }
  
  return calendarDays;
}

/**
 * Get calendar data for a specific month showing habit completion with frequency awareness
 */
export function getMonthCalendarData(habitId: string, habitEntries: HabitEntry[], year: number, month: number, habitStartDate?: string, frequency: string = 'daily'): CalendarDay[] {
  const calendarDays: CalendarDay[] = [];
  
  // Get habit entries for this habit
  const habitEntriesMap = new Map<string, HabitEntry>();
  habitEntries
    .filter(entry => entry.habitId === habitId)
    .forEach(entry => {
      const dateKey = formatDateString(entry.date);
      // If multiple entries for same day, keep the latest one
      if (!habitEntriesMap.has(dateKey) || entry.date > habitEntriesMap.get(dateKey)!.date) {
        habitEntriesMap.set(dateKey, entry);
      }
    });
  
  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Generate calendar days for the entire month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateString = formatDateString(date);
    
    const entry = habitEntriesMap.get(dateString);
    const isExpectedDay = habitStartDate ? shouldTrackHabitOnDate(habitStartDate, frequency, dateString) : true;
    
    let status: CalendarDay['status'] = 'no-entry';
    
    if (entry) {
      status = entry.completed ? 'completed' : 'missed';
    } else if (isExpectedDay) {
      // Only show as missed if it's an expected day and date has passed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        status = 'expected-missed';
      }
    }
    
    calendarDays.push({
      date: dateString,
      dayOfMonth: date.getDate(),
      dayOfWeek: date.getDay(),
      status,
      reason: entry?.reason || null,
      isExpectedDay
    });
  }
  
  return calendarDays;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD format
  dayOfMonth: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  status: 'completed' | 'missed' | 'expected-missed' | 'no-entry';
  reason: string | null;
  isExpectedDay?: boolean;
} 