import { completionLock } from '@/lib/utils';
import type { Student } from '@/types/exam';
import { useEffect, useState } from 'react';

// Type definition for the different states in the exam workflow
// This provides type safety and clear state transitions
type PageState = 'overview' | 'adding-students' | 'exam-running' | 'exam-completed';

// Interface defining what this hook returns
// This ensures type safety for consumers of this hook
interface UseExamSessionReturn {
  pageState: PageState;                              // Current workflow state
  currentStudentIndex: number;                       // Index of student being examined
  setPageState: (state: PageState) => void;          // Function to change workflow state
  setCurrentStudentIndex: (index: number) => void;   // Function to change student index
  handleStartExam: (students: Student[]) => void;    // Function to begin examination
  handleNextStudent: (students: Student[]) => void;  // Function to advance to next student
  handleExamComplete: () => void;                     // Function to complete entire exam
  handleShowStudentForm: () => void;                  // Function to show student addition form
  handleStudentFormCancel: () => void;               // Function to cancel student form
}

// Custom hook that manages the state and workflow of an exam session
// This encapsulates all the business logic for exam session management
export function useExamSession(): UseExamSessionReturn {
  // State for tracking which page/workflow step we're currently on
  // Starts with 'overview' as the initial state
  const [pageState, setPageState] = useState<PageState>('overview');
  
  // State for tracking which student is currently being examined
  // Zero-based index into the student array
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  // Effect that runs on component mount to check for completion lock
  // This handles the case where user refreshes page during completed exam
  useEffect(() => {
    // Check if there's a completion lock from a previous session
    if (completionLock.isLocked()) {
      // If locked, automatically show the completion state
      // This preserves the exam completion across page refreshes
      setPageState('exam-completed');
    }
  }, []); // Empty dependency array - only run on mount

  // Protected function to set page state with completion lock consideration
  // This prevents accidentally leaving the completed state
  const protectedSetPageState = (newState: PageState) => {
    // If exam is completed and locked, prevent state changes
    // This maintains the integrity of completed exams
    if (completionLock.isLocked() && newState !== 'exam-completed') {
      return; // Don't allow state changes when completion is locked
    }
    
    // Otherwise, allow the state change
    setPageState(newState);
  };

  // Function to start the examination workflow
  // This transitions from overview to active examination
  const handleStartExam = (students: Student[]) => {
    // Validate that there are students to examine
    if (students.length === 0) {
      console.warn('No students to examine');
      return;
    }
    
    // Filter to only uncompleted students
    // This allows resuming partially completed exams
    const uncompletedStudents = students.filter(student => 
      !student.grade // Student is incomplete if no grade assigned
    );
    
    // Check if there are actually students left to examine
    if (uncompletedStudents.length === 0) {
      // No uncompleted students, go directly to completion
      handleExamComplete();
      return;
    }
    
    // Reset to first uncompleted student
    setCurrentStudentIndex(0);
    
    // Transition to exam running state
    protectedSetPageState('exam-running');
  };

  // Function to advance to the next student in the examination
  // This handles the progression through the student list
  const handleNextStudent = (students: Student[]) => {
    // Filter to get only uncompleted students
    const uncompletedStudents = students.filter(student => !student.grade);
    
    // Calculate the next student index
    const nextIndex = currentStudentIndex + 1;
    
    // Check if there are more students to examine
    if (nextIndex < uncompletedStudents.length) {
      // Move to next student
      setCurrentStudentIndex(nextIndex);
    } else {
      // No more students, complete the exam
      handleExamComplete();
    }
  };

  // Function to complete the entire examination
  // This handles the final workflow transition and persistence
  const handleExamComplete = () => {
    // Set completion lock to prevent accidental state changes
    // This persists even through page refreshes
    completionLock.lock();
    
    // Reset student index for potential future use
    setCurrentStudentIndex(0);
    
    // Transition to completed state
    setPageState('exam-completed');
  };

  // Function to show the student addition form
  // This allows adding more students during the exam setup
  const handleShowStudentForm = () => {
    protectedSetPageState('adding-students');
  };

  // Function to cancel the student form and return to overview
  // This provides a way to back out of student addition
  const handleStudentFormCancel = () => {
    protectedSetPageState('overview');
  };

  // Return all state and functions for use by components
  return {
    pageState,
    currentStudentIndex,
    setPageState: protectedSetPageState,     // Use protected version
    setCurrentStudentIndex,
    handleStartExam,
    handleNextStudent,
    handleExamComplete,
    handleShowStudentForm,
    handleStudentFormCancel,
  };
} 