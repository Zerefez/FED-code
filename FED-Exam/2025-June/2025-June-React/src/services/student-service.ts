// Import the Student type definition to ensure type safety
// This provides compile-time checking and IDE support for student data structures
import type { Student } from '../types/exam';

// Import the generic API client for making HTTP requests
// This abstraction allows us to change HTTP implementation without affecting this service
import { apiClient } from './api-client';

// Export a service object containing all student-related API operations
// This pattern provides a clean, consistent API for student data management
export const studentService = {
  // Create a new student record in the database
  // Uses Omit to exclude 'id' since the server will generate it
  createStudent: async (studentData: Omit<Student, 'id'>): Promise<Student> => {
    // Make POST request to create student, returning the created student with generated ID
    return apiClient.post<Student>('/students', studentData);
  },

  // Retrieve all student records from the database
  // Returns an array of all students across all exams
  getStudents: async (): Promise<Student[]> => {
    // Make GET request to fetch all students
    return apiClient.get<Student[]>('/students');
  },

  // Get all students registered for a specific exam
  // Filters students by exam ID using query parameters
  getStudentsByExam: async (examId: string): Promise<Student[]> => {
    // Make GET request with exam filter parameter
    // The API client handles query parameter encoding
    return apiClient.get<Student[]>('/students', { exam: examId });
  },

  // Retrieve a single student by their unique ID
  // Used for getting detailed information about a specific student
  getStudent: async (id: string): Promise<Student> => {
    // Make GET request to specific student endpoint
    return apiClient.get<Student>(`/students/${id}`);
  },

  // Update an existing student record with partial data
  // Uses PATCH to allow updating only specific fields
  updateStudent: async (id: string, studentData: Partial<Student>): Promise<Student> => {
    // Make PATCH request to update student, returning the updated record
    return apiClient.patch<Student>(`/students/${id}`, studentData);
  },

  // Remove a student record from the database
  // This is a destructive operation that permanently deletes the student
  deleteStudent: async (id: string): Promise<void> => {
    // Make DELETE request to remove student
    // Returns void since successful deletion doesn't need response data
    return apiClient.delete<void>(`/students/${id}`);
  },
}; 