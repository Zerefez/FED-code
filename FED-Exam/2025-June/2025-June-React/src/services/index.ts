// Services barrel export
// This file provides access to all API services and HTTP client functionality
// Services abstract data access and provide consistent interfaces for different entities

// API client and error handling - core HTTP functionality used by all services
// apiClient provides standardized HTTP methods (GET, POST, PUT, DELETE)
// ApiError provides structured error information for better error handling
export { ApiError, apiClient } from './api-client';

// Exam service - handles all exam-related API operations
// Provides CRUD operations for exam entities with proper typing
export { examService } from './exam-service';

// Student service - handles all student-related API operations
// Provides CRUD operations for student entities plus exam-specific queries
export { studentService } from './student-service';

