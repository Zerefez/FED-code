// Components
// Export all exam session UI components for easy importing by parent components
// This barrel export pattern provides a clean API for consuming exam session functionality

// Component for final grade assignment and exam completion
// Handles grade input, data summary, and final submission
export { GradingCard } from './grading-card';

// Component for capturing examiner notes during and after examination
// Provides text area for real-time note-taking and later editing
export { NotesCard } from './notes-card';

// Component for initiating random question selection
// First step in the exam process - draws a random question number
export { QuestionDrawingCard } from './question-drawing-card';

// Component that displays the randomly drawn question number
// Shows the result of question drawing with prominent visual display
export { QuestionResultCard } from './question-result-card';

// Component for starting the timed examination phase
// Bridge between question drawing and active examination
export { StartExamCard } from './start-exam-card';

// Component displaying current student information during exam
// Shows student details and progress through the exam sequence
export { StudentInfoCard } from './student-info-card';

// Component that appears when allocated exam time expires
// Provides urgent notification and option to end examination
export { TimeUpNotification } from './time-up-notification';

// Component for displaying timer and providing exam control
// Central control panel showing countdown, elapsed time, and stop button
export { TimerControlsCard } from './timer-controls-card';

// Hooks
// Export custom hooks that encapsulate complex exam session logic

// Custom hook for exam timer functionality
// Manages countdown timer, elapsed time tracking, and audio notifications
export { useExamTimer } from './hooks/use-exam-timer';

// Utils
// Export utility functions used across exam session components

// Utility functions for exam session operations:
// - drawRandomQuestion: Generates random question numbers for fair distribution
// - formatTime: Converts seconds to MM:SS format for consistent display
// - getTimerColor: Returns appropriate color based on remaining time
export { drawRandomQuestion, formatTime, getTimerColor } from './utils/exam-utils';

