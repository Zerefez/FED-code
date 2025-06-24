// Import the exam service that handles API calls for exam operations
import { examService } from '@/services/exam-service';
// Import type definitions for exam entities and creation data
import type { CreateExamData, Exam } from '@/types/exam';
// Import the generic CRUD hook that this hook will specialize
import { useCrud } from './useCrud';

// Adapter object to bridge exam service methods with the generic CRUD interface
// This mapping allows the generic useCrud hook to work with exam-specific API methods
const examCrudService = {
  getAll: examService.getExams,      // Map getAll to getExams API method
  getById: examService.getExam,      // Map getById to getExam API method
  create: examService.createExam,    // Map create to createExam API method
  update: examService.updateExam,    // Map update to updateExam API method
  delete: examService.deleteExam,    // Map delete to deleteExam API method
};

// Custom hook that provides CRUD operations specifically for exam entities
// This specializes the generic useCrud hook for exam management
export function useExams() {
  // Return the result of useCrud configured for Exam entities
  // Type parameters ensure type safety: Exam for entity type, CreateExamData for creation
  return useCrud<Exam, CreateExamData>(examCrudService);
} 