import { APIError } from '../services/api';

/**
 * Formats an error message for display to the user
 * @param {Error|APIError|string} error - The error object or message
 * @param {string} fallbackMessage - Fallback message if no specific error message is available
 * @returns {string} - User-friendly error message
 */
export const formatErrorMessage = (error, fallbackMessage = 'An unexpected error occurred') => {
  // If the error is already a string, just return it
  if (typeof error === 'string') {
    return error;
  }

  // Check if it's our custom APIError
  if (error instanceof APIError) {
    return error.message;
  }

  // Handle axios error responses
  if (error.response && error.response.data) {
    const data = error.response.data;
    
    // Check for common message formats from backend
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
    
    // If we have validation errors, format them
    if (data.errors && typeof data.errors === 'object') {
      try {
        const errorMessages = Object.values(data.errors)
          .flat()
          .join(', ');
        return errorMessages || fallbackMessage;
      } catch (formatError) {
        console.error('Error formatting validation errors:', formatError);
        return fallbackMessage;
      }
    }
  }

  // Use error message or fallback
  return error.message || fallbackMessage;
};

/**
 * Gets an appropriate status message based on HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string} - Status message
 */
export const getStatusMessage = (status) => {
  switch (status) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized - Please log in again';
    case 403:
      return 'Access Denied';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Validation Error';
    case 500:
      return 'Server Error';
    case 503:
      return 'Service Unavailable';
    default:
      return status >= 400 && status < 500 ? 'Request Error' : 
             status >= 500 ? 'Server Error' : 'Unknown Error';
  }
};

/**
 * Handles API errors in a standardized way
 * @param {Error|APIError} error - The error to handle
 * @param {Function} setError - State setter function for error message
 * @param {Function} setLoading - State setter function for loading state (if applicable)
 * @param {string} fallbackMessage - Fallback error message
 */
export const handleApiError = (error, setError, setLoading = null, fallbackMessage = 'An error occurred') => {
  const errorMessage = formatErrorMessage(error, fallbackMessage);
  
  // Log error for debugging
  console.error('API Error:', error);
  
  // Set the error message state
  setError(errorMessage);
  
  // Set loading state to false if provided
  if (setLoading) {
    setLoading(false);
  }
  
  // Return formatted message in case it's needed
  return errorMessage;
};

/**
 * Creates a notification-ready error object
 * @param {Error|APIError} error - The error to format
 * @param {string} fallbackTitle - Fallback title
 * @param {string} fallbackMessage - Fallback message
 * @returns {Object} - Formatted error object for notifications
 */
export const createErrorNotification = (error, fallbackTitle = 'Error', fallbackMessage = 'An unexpected error occurred') => {
  let title = fallbackTitle;
  let message = formatErrorMessage(error, fallbackMessage);
  
  // If we have an API error with status, add a better title
  if (error instanceof APIError && error.status) {
    title = getStatusMessage(error.status);
  }
  
  return {
    title,
    message,
    type: 'error'
  };
};

export default {
  formatErrorMessage,
  getStatusMessage,
  handleApiError,
  createErrorNotification
}; 