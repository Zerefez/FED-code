/**
 * Get today's date in YYYY-MM-DD format in Denmark timezone
 */
export function getTodayString(): string {
  const now = new Date();
  // Get Denmark date directly
  const denmarkDateString = now.toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Copenhagen'
  });
  return denmarkDateString;
}

/**
 * Format a date string to YYYY-MM-DD format in Denmark timezone
 */
export function formatDateString(date: Date | string): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Get Denmark date directly using Swedish locale which gives YYYY-MM-DD format
  const denmarkDateString = dateObj.toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Copenhagen'
  });
  return denmarkDateString;
}

/**
 * Get date N days ago in Denmark timezone
 */
export function getDaysAgo(days: number): Date {
  const now = new Date();
  // Calculate in Denmark timezone
  const denmarkNow = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Copenhagen"}));
  denmarkNow.setDate(denmarkNow.getDate() - days);
  return denmarkNow;
}

/**
 * Check if two dates are the same day in Denmark timezone
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return formatDateString(d1) === formatDateString(d2);
}

/**
 * Format date for display in Danish format with full date information
 */
export function formatDisplayDate(dateString: string): string {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Parse the date string and format it for Denmark
  const date = new Date(dateString + 'T00:00:00');
  const fullDateString = date.toLocaleDateString('da-DK', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Copenhagen'
  });

  if (dateString === today) {
    return `I dag - ${fullDateString}`;
  } else if (dateString === yesterday) {
    return `I går - ${fullDateString}`;
  } else {
    return fullDateString;
  }
}

/**
 * Get yesterday's date in YYYY-MM-DD format in Denmark timezone
 */
function getYesterdayString(): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return yesterday.toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Copenhagen'
  });
} 