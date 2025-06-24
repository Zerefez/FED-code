// Import the student service that handles API calls for student operations
import { studentService } from '@/services/student-service';
// Import type definition for student entities
import type { Student } from '@/types/exam';
// Import the generic CRUD hook that this hook will specialize
import { useCrud } from './useCrud';

// Adapter object to bridge student service methods with the generic CRUD interface
// This mapping allows the generic useCrud hook to work with student-specific API methods
const studentCrudService = {
  getAll: studentService.getStudents,        // Map getAll to getStudents API method
  getById: studentService.getStudent,        // Map getById to getStudent API method
  create: studentService.createStudent,      // Map create to createStudent API method
  update: studentService.updateStudent,      // Map update to updateStudent API method
  delete: studentService.deleteStudent,      // Map delete to deleteStudent API method
};

// Custom hook that provides CRUD operations specifically for student entities
// This extends the generic useCrud hook with student-specific functionality
export function useStudents() {
  // Get standard CRUD operations for students using the generic hook
  const crud = useCrud<Student>(studentCrudService);

  return {
    // Spread all standard CRUD operations (create, read, update, delete, loading, etc.)
    ...crud,

    // Add student-specific method to get students by exam ID
    // This is not part of the generic CRUD interface but specific to student-exam relationships
    getByExam: studentService.getStudentsByExam,
  };
} 