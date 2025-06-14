import { formatDateString } from './date-utils';

export interface FrequencyOption {
  value: string;
  label: string;
  description: string;
}

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: 'daily',
    label: 'Dagligt',
    description: 'Hver dag'
  },
  {
    value: 'every-other-day',
    label: 'Hver anden dag',
    description: 'Dag 1, dag 3, dag 5, osv.'
  },
  {
    value: 'weekdays',
    label: 'Alle hverdage',
    description: 'Mandag til fredag'
  },
  {
    value: 'weekends',
    label: 'I weekenden',
    description: 'Lørdag og søndag'
  },
  {
    value: 'weekly',
    label: '1 gang om ugen',
    description: 'Én gang hver uge'
  },
  {
    value: 'twice-weekly',
    label: '2 gange om ugen',
    description: 'To gange hver uge'
  },
  {
    value: 'three-times-weekly',
    label: '3 gange om ugen',
    description: 'Tre gange hver uge'
  },
  {
    value: 'monthly',
    label: 'Månedligt',
    description: 'Én gang om måneden'
  }
];

/**
 * Check if a habit should be tracked on a specific date based on its frequency and start date
 */
export function shouldTrackHabitOnDate(
  habitStartDate: string,
  frequency: string,
  checkDate: string
): boolean {
  const startDate = new Date(habitStartDate + 'T00:00:00');
  const targetDate = new Date(checkDate + 'T00:00:00');
  
  // If the check date is before the start date, don't track
  if (targetDate < startDate) {
    return false;
  }
  
  const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysSinceStart = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (frequency) {
    case 'daily':
      return true;
      
    case 'every-other-day':
      return daysSinceStart % 2 === 0;
      
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
      
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      
    case 'weekly':
      return dayOfWeek === startDate.getDay(); // Same day of week as start date
      
    case 'twice-weekly':
      // Track on start day and 3 days later in the week
      const startDayOfWeek = startDate.getDay();
      const secondDay = (startDayOfWeek + 3) % 7;
      return dayOfWeek === startDayOfWeek || dayOfWeek === secondDay;
      
    case 'three-times-weekly':
      // Track on start day, +2 days, and +4 days in the week
      const startDay = startDate.getDay();
      const secondDayThrice = (startDay + 2) % 7;
      const thirdDay = (startDay + 4) % 7;
      return dayOfWeek === startDay || dayOfWeek === secondDayThrice || dayOfWeek === thirdDay;
      
    case 'monthly':
      return targetDate.getDate() === startDate.getDate();
      
    default:
      return true; // Default to daily if unknown frequency
  }
}

/**
 * Get the expected number of habit completions for a date range based on frequency
 */
export function getExpectedCompletions(
  habitStartDate: string,
  frequency: string,
  fromDate: string,
  toDate: string
): number {
  let expectedCount = 0;
  let currentDate = new Date(fromDate + 'T00:00:00');
  const endDate = new Date(toDate + 'T00:00:00');
  
  while (currentDate <= endDate) {
    const dateString = formatDateString(currentDate);
    if (shouldTrackHabitOnDate(habitStartDate, frequency, dateString)) {
      expectedCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return expectedCount;
}

/**
 * Get the completion rate for a habit based on actual vs expected completions
 */
export function getCompletionRate(
  habitStartDate: string,
  frequency: string,
  fromDate: string,
  toDate: string,
  actualCompletions: number
): number {
  const expectedCompletions = getExpectedCompletions(habitStartDate, frequency, fromDate, toDate);
  
  if (expectedCompletions === 0) {
    return 0;
  }
  
  return Math.min(100, Math.round((actualCompletions / expectedCompletions) * 100));
}

/**
 * Get a human-readable description of the frequency
 */
export function getFrequencyDescription(frequency: string): string {
  const option = FREQUENCY_OPTIONS.find(opt => opt.value === frequency);
  return option ? option.description : frequency;
} 