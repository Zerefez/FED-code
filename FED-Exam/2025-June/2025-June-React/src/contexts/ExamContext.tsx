import { useExamData } from '@/hooks/useExamData';
import type { Exam, Student } from '@/types/exam';
import React, { createContext, ReactNode, useContext } from 'react';

// Interface defining the shape of the exam context
// This provides type safety for all consumers of the context
interface ExamContextType {
  // Data
  exam: Exam | null;                    // Current exam being managed, null if not loaded
  students: Student[];                  // Array of all students in this exam
  isLoading: boolean;                   // Whether data is currently being loaded
  completedStudentsCount: number;       // Computed count of students who have finished
  uncompletedStudents: Student[];       // Computed array of students who haven't finished
  
  // Actions
  handleStudentAdded: (student: Student) => void;    // Function to add a new student
  handleStudentUpdate: (student: Student) => void;   // Function to update existing student
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>; // Direct setter for students array
}

// Create the context with undefined initial value
// This forces consumers to check if context exists and prevents accidental usage outside provider
const ExamContext = createContext<ExamContextType | undefined>(undefined);

// Props interface for the ExamProvider component
// Defines what props are needed to set up the exam context
interface ExamProviderProps {
  children: ReactNode;           // React children that will have access to this context
  examId: string | undefined;    // ID of the exam to load, undefined if no exam selected
}

// Provider component that manages exam state and provides it to child components
// This centralizes exam data management and makes it available throughout the component tree
export function ExamProvider({ children, examId }: ExamProviderProps) {
  // Use the custom hook to get all exam-related data and functions
  // This hook handles the API calls, state management, and computed values
  const examData = useExamData(examId);

  // Provide the exam data to all child components through context
  // Any component in the tree can access this data using useExamContext()
  return (
    <ExamContext.Provider value={examData}>
      {children}
    </ExamContext.Provider>
  );
}

// Custom hook to consume the exam context
// This provides a clean API for components to access exam data
export function useExamContext() {
  // Get the context value from React's context system
  const context = useContext(ExamContext);
  
  // Throw error if hook is used outside of provider
  // This prevents bugs from components trying to use exam data when it's not available
  if (context === undefined) {
    throw new Error('useExamContext must be used within an ExamProvider');
  }
  
  // Return the context value, which is guaranteed to be defined at this point
  return context;
} 