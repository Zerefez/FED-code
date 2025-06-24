import { useState } from 'react';

// Interface defining what the useForm hook returns
// This provides type safety and clear documentation of available functionality
interface UseFormReturn<T> {
  data: T;                                                      // Current form data
  errors: Record<string, string>;                              // Field validation errors
  loading: boolean;                                            // Whether form is being submitted
  
  set: (field: keyof T, value: any) => void;                  // Update single field
  setData: (newData: T) => void;                               // Replace entire form data
  setError: (field: keyof T, error: string) => void;          // Set error for specific field
  clearError: (field: keyof T) => void;                       // Clear error for specific field
  clearErrors: () => void;                                     // Clear all errors
  reset: () => void;                                           // Reset form to initial state
  
  handleSubmit: (onSubmit: (data: T) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>; // Form submission wrapper
}

// Custom hook for managing form state and operations
// This provides a comprehensive solution for form handling with validation support
export function useForm<T>(initialData: T): UseFormReturn<T> {
  // State for the current form data
  const [data, setData] = useState<T>(initialData);
  
  // State for field-level validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for tracking loading/submission status
  const [loading, setLoading] = useState(false);

  // Function to update a single field in the form
  // This provides granular control over form data updates
  const set = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear any existing error for this field when user makes changes
    // This provides immediate feedback when user corrects errors
    clearError(field);
  };

  // Function to replace entire form data object
  // Useful for loading data from external sources
  const setFormData = (newData: T) => {
    setData(newData);
  };

  // Function to set an error message for a specific field
  // This allows external validation systems to report errors
  const setError = (field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }));
  };

  // Function to clear error for a specific field
  // This provides fine-grained error management
  const clearError = (field: keyof T) => {
    setErrors(prev => {
      // Create new object without the specified field error
      const { [field as string]: removed, ...rest } = prev;
      return rest;
    });
  };

  // Function to clear all validation errors
  // Useful for resetting form state
  const clearErrors = () => {
    setErrors({});
  };

  // Function to reset form to initial state
  // This restores the form to its original condition
  const reset = () => {
    setData(initialData);   // Reset data to initial values
    setErrors({});              // Clear all errors
    setLoading(false);          // Reset loading state
  };

  // Higher-order function that wraps form submission with loading state and error handling
  // This provides consistent submission behavior across all forms
  const handleSubmit = (onSubmit: (data: T) => Promise<void> | void) => {
    // Return the actual event handler function
    return async (e: React.FormEvent) => {
      // Prevent default form submission behavior
      // This allows us to handle submission programmatically
      e.preventDefault();
      
      // Set loading state to provide user feedback
      setLoading(true);
      
      // Clear any existing errors before submission
      // This ensures fresh validation state
      clearErrors();
      
      try {
        // Call the provided submission function with current form data
        await onSubmit(data);
      } catch (error) {
        // Log submission errors for debugging
        // In production, this might show user-friendly error messages
        console.error('Form submission error:', error);
      } finally {
        // Always reset loading state, even if submission failed
        // This ensures UI doesn't get stuck in loading state
        setLoading(false);
      }
    };
  };

  // Return all form state and functions for use by components
  return {
    data,             // Current form data
    errors,           // Current validation errors
    loading,          // Current loading state
    set,              // Function to update single field
    setData: setFormData,     // Function to replace all data
    setError,         // Function to set field error
    clearError,       // Function to clear field error
    clearErrors,      // Function to clear all errors
    reset,            // Function to reset form
    handleSubmit,     // Function to handle form submission
  };
} 