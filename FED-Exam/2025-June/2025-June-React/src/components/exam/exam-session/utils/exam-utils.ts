// Utility function to format time from seconds to MM:SS format
// This provides consistent time display throughout the exam interface
export function formatTime(seconds: number): string {
  // Calculate whole minutes by dividing by 60 and removing decimals
  const minutes = Math.floor(seconds / 60);
  
  // Calculate remaining seconds using modulo operator
  // This gives us the leftover seconds after removing complete minutes
  const remainingSeconds = seconds % 60;
  
  // Return formatted string with zero-padding for consistent display
  // padStart(2, '0') ensures single digits are displayed as "01", "02", etc.
  // This creates a consistent MM:SS format like "05:30" or "12:08"
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Function to determine the appropriate color for the timer based on remaining time
// This provides visual feedback to help examiners understand urgency
export function getTimerColor(timeRemaining: number): string {
  // Critical time (1 minute or less) - red to indicate urgency
  if (timeRemaining <= 60) return 'text-red-500';
  
  // Warning time (5 minutes or less) - orange to indicate caution
  if (timeRemaining <= 300) return 'text-orange-500';
  
  // Normal time - use default text color
  return 'text-foreground';
}

// Function to generate a random question number for fair exam distribution
// Ensures each student gets a random question from the available pool
export function drawRandomQuestion(numberOfQuestions: number): number {
  // Math.random() generates a number between 0 and 1 (exclusive)
  // Multiply by numberOfQuestions to get range 0 to numberOfQuestions (exclusive)
  // Math.floor() rounds down to get integer
  // Add 1 to shift range from 0-based to 1-based (1 to numberOfQuestions inclusive)
  return Math.floor(Math.random() * numberOfQuestions) + 1;
} 