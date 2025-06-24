// Custom hooks barrel export
// This file provides easy access to all reusable custom hooks in the application
// Custom hooks encapsulate stateful logic and can be shared across components

// useCrud - Generic CRUD operations hook for any entity type
// Provides create, read, update, delete operations with loading and error states
export { useCrud } from './useCrud';

// useExamData - Specific hook for managing exam and student data together
// Combines exam information with associated students and provides computed properties
export { useExamData } from './useExamData';

// useExams - Hook for exam management and API operations
// Provides CRUD operations specifically for exam entities
export { useExams } from './useExams';

// useExamSession - Hook for managing exam session workflow state
// Handles navigation between different phases of conducting an exam
export { useExamSession } from './useExamSession';

// useForm - Generic form state management hook
// Provides data binding, error handling, and submission logic for any form
export { useForm } from './useForm';

// useStudents - Hook for student management and API operations
// Provides CRUD operations specifically for student entities
export { useStudents } from './useStudents';

// useValidation - Form validation hook with pre-built validators
// Provides validation logic and common validation functions for form fields
export { useValidation, validators } from './useValidation';

