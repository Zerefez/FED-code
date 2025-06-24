// Context providers and hooks barrel export
// This file provides easy access to all application context providers and their hooks
// Contexts manage shared state across component trees without prop drilling

// ExamContext - manages exam data, student lists, and exam-related operations
// Provider wraps components that need access to current exam information
// Hook provides type-safe access to exam data and manipulation functions
export { ExamProvider, useExamContext } from './ExamContext';

// ExamSessionContext - manages the workflow state of conducting exams
// Provider handles navigation between different phases of exam administration
// Hook provides access to session state and workflow control functions
export { ExamSessionProvider, useExamSessionContext } from './ExamSessionContext';

