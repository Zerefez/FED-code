import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function that combines clsx and tailwind-merge for optimal class name handling
// clsx handles conditional classes, twMerge resolves Tailwind class conflicts
export function cn(...inputs: ClassValue[]) {
  // First apply clsx to handle conditional logic and concatenation
  // Then apply twMerge to resolve any conflicting Tailwind classes
  // This ensures the last conflicting class wins (e.g., "bg-red-500 bg-blue-500" becomes "bg-blue-500")
  return twMerge(clsx(inputs))
}

// Function to format date strings in a human-readable format
// Supports both long (e.g., "January 1, 2025") and short (e.g., "1/1/2025") formats
export function formatDate(dateString: string, style: 'long' | 'short' = 'long'): string {
  // Create Date object from string input
  const date = new Date(dateString);
  
  // Use browser's built-in Intl.DateTimeFormat for localized formatting
  // 'da-DK' provides Danish locale formatting
  return new Intl.DateTimeFormat('da-DK', {
    // Choose formatting style based on parameter
    dateStyle: style === 'long' ? 'long' : 'short'
  }).format(date);
}

// Function to filter students who have completed their exam
// A student is considered completed if they have a grade assigned
export function filterCompletedStudents(students: any[]): any[] {
  return students.filter(student => student.grade);
}

// Function to filter students who have not completed their exam  
// A student is uncompleted if they don't have a grade assigned
export function filterUncompletedStudents(students: any[]): any[] {
  return students.filter(student => !student.grade);
}

// Simple validation function to check if a value is present and not empty
// Handles null, undefined, and empty strings
export function isRequired(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

// Generic function to find duplicate values in an array
// Returns an array containing only the duplicate values (without duplicates of duplicates)
export function findDuplicates<T>(array: T[]): T[] {
  // Use filter with indexOf to find items that appear at different positions
  // If indexOf returns a different index than current, it's a duplicate
  return array.filter((item, index) => array.indexOf(item) !== index);
}

// Function to calculate the average grade from an array of students
// Returns null if no valid grades are found
export function calculateAverageGrade(students: any[]): number | null {
  // Filter students who have grades assigned
  const studentsWithGrades = students.filter(student => student.grade);
  
  // Return null if no students have grades
  if (studentsWithGrades.length === 0) {
    return null;
  }
  
  // Danish grading scale conversion to numeric values for calculation
  const gradeValues: Record<string, number> = {
    '12': 12,   // Excellent
    '10': 10,   // Very good  
    '7': 7,     // Good
    '4': 4,     // Fair
    '02': 2,    // Adequate (written as 02 to distinguish from 2)
    '00': 0,    // Inadequate (written as 00 to distinguish from 0)
    '-3': -3    // Unacceptable
  };
  
  // Convert grades to numeric values and calculate sum
  const totalPoints = studentsWithGrades.reduce((sum, student) => {
    // Get numeric value for grade, default to 0 if not found
    const gradeValue = gradeValues[student.grade] || 0;
    return sum + gradeValue;
  }, 0);
  
  // Return average by dividing total points by number of students
  return totalPoints / studentsWithGrades.length;
}

// Completion lock utility for managing exam completion state persistence
// This prevents accidental loss of exam completion status on page refresh
export const completionLock = {
  // Check if completion lock is currently active
  isLocked(): boolean {
    try {
      // Check localStorage for the lock flag
      return localStorage.getItem(COMPLETION_LOCK_KEY) === 'true';
    } catch {
      // Return false if localStorage is not available (e.g., private browsing)
      return false;
    }
  },

  // Set the completion lock to prevent exam restart
  lock(): void {
    try {
      // Store lock flag in localStorage for persistence across page refreshes
      localStorage.setItem(COMPLETION_LOCK_KEY, 'true');
    } catch (error) {
      // Gracefully handle localStorage failures without crashing
      console.warn('Failed to set completion lock:', error);
    }
  },

  // Remove the completion lock to allow new exam sessions
  unlock(): void {
    try {
      // Remove lock flag from localStorage
      localStorage.removeItem(COMPLETION_LOCK_KEY);
    } catch (error) {
      // Gracefully handle localStorage failures without crashing
      console.warn('Failed to clear completion lock:', error);
    }
  }
};

// Constant key for localStorage to maintain consistency
// Using a constant prevents typos and makes the key easily changeable
const COMPLETION_LOCK_KEY = 'exam-completion-lock'; 