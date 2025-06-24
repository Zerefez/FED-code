import { useExamSession } from '@/hooks/useExamSession';
import type { Student } from '@/types/exam';
import { createContext, ReactNode, useContext } from 'react';

// Type definition for different page states in the exam session workflow
// This enum-like type ensures only valid states are used throughout the app
type PageState = 'overview' | 'adding-students' | 'exam-running' | 'exam-completed';

// Interface defining the shape of the exam session context
// This provides type safety for all context consumers
interface ExamSessionContextType {
  // State properties
  pageState: PageState;                          // Current page/workflow state
  currentStudentIndex: number;                   // Index of student currently being examined
  
  // State manipulation functions
  setPageState: (state: PageState) => void;                    // Direct state setter
  setCurrentStudentIndex: (index: number) => void;            // Direct index setter
  
  // Workflow control functions
  handleStartExam: (students: Student[]) => void;             // Start examination workflow
  handleNextStudent: (students: Student[]) => void;          // Move to next student
  handleExamComplete: () => void;                             // Complete entire exam
  handleShowStudentForm: () => void;                          // Show student addition form
  handleStudentFormCancel: () => void;                       // Cancel student form
}

// Create the context with undefined default value
// This forces proper provider wrapping and prevents silent failures
const ExamSessionContext = createContext<ExamSessionContextType | undefined>(undefined);

// Props interface for the context provider component
interface ExamSessionProviderProps {
  children: ReactNode;    // Child components that will have access to this context
}

// Provider component that supplies exam session state to child components
// This centralizes session state management and provides it throughout the component tree
export function ExamSessionProvider({ children }: ExamSessionProviderProps) {
  // Use the custom hook to get all session state and functions
  // This separates business logic from context provision
  const examSessionData = useExamSession();

  return (
    // Provide the session data to all child components
    <ExamSessionContext.Provider value={examSessionData}>
      {children}
    </ExamSessionContext.Provider>
  );
}

// Custom hook for consuming the exam session context
// This provides a clean API and enforces proper context usage
export function useExamSessionContext() {
  // Get the context value
  const context = useContext(ExamSessionContext);
  
  // Throw error if context is used outside of provider
  // This helps catch development errors early
  if (context === undefined) {
    throw new Error('useExamSessionContext must be used within an ExamSessionProvider');
  }
  
  return context;
} 