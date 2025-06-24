// Import type definitions for exam entities and creation data
import type { CreateExamData, Exam } from '../types/exam';
// Import the generic API client for HTTP operations
import { apiClient } from './api-client';

// Exam service object that provides all exam-related API operations
// This service abstracts HTTP calls and provides a clean interface for exam management
export const examService = {
  // Create a new exam with the provided data
  // Takes CreateExamData (without ID) and returns complete Exam object with generated ID
  createExam: async (examData: CreateExamData): Promise<Exam> => {
    return apiClient.post<Exam>('/exams', examData);
  },

  // Retrieve all exams from the server
  // Returns an array of all exam objects in the system
  getExams: async (): Promise<Exam[]> => {
    return apiClient.get<Exam[]>('/exams');
  },

  // Retrieve a specific exam by its unique identifier
  // Returns the complete exam object or throws error if not found
  getExam: async (id: string): Promise<Exam> => {
    return apiClient.get<Exam>(`/exams/${id}`);
  },

  // Update an existing exam with partial data
  // Uses Partial<Exam> to allow updating only specific fields
  // Returns the complete updated exam object
  updateExam: async (id: string, examData: Partial<Exam>): Promise<Exam> => {
    return apiClient.put<Exam>(`/exams/${id}`, examData);
  },

  // Delete an exam by its unique identifier
  // Returns void as deletion doesn't return data, only success/failure
  deleteExam: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/exams/${id}`);
  },
}; 