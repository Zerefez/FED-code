import { useState } from 'react';

// Interface defining the structure of a validation rule
// This provides a flexible system for field validation
export interface ValidationRule<T> {
  field: keyof T;                                          // Which field this rule applies to
  validator: (value: any, data: T) => string | null;     // Function that returns error message or null
  message?: string;                                       // Optional custom error message
}

// Custom hook for managing form validation state and logic
// This provides a reusable validation system across different forms
export function useValidation<T>() {
  // State to store validation errors for each field
  // Uses field names as keys and error messages as values
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Function to validate data against a set of rules
  // Returns true if all validations pass, false otherwise
  const validate = (data: T, rules: ValidationRule<T>[]): boolean => {
    // Object to collect new errors during validation
    const newErrors: Record<string, string> = {};
    
    // Assume validation will pass unless proven otherwise
    let isValid = true;

    // Iterate through each validation rule
    rules.forEach(rule => {
      // Get the value for the field being validated
      const fieldValue = data[rule.field];
      
      // Run the validator function and get potential error
      const error = rule.validator(fieldValue, data);
      
      // If validator returned an error message
      if (error) {
        // Store the error using field name as key
        newErrors[rule.field as string] = error;
        
        // Mark overall validation as failed
        isValid = false;
      }
    });

    // Update the errors state with all new errors
    setErrors(newErrors);
    
    // Return whether validation passed
    return isValid;
  };

  // Function to clear all validation errors
  // Useful for resetting form state
  const clearErrors = () => setErrors({});

  // Function to clear error for a specific field
  // Useful for clearing errors as user corrects them
  const clearError = (field: keyof T) => {
    setErrors(prev => {
      // Create new object without the specified field
      const { [field as string]: removed, ...rest } = prev;
      return rest;
    });
  };

  // Return validation state and functions
  return { errors, validate, clearErrors, clearError };
}

// Collection of common validator functions
// These can be reused across different forms and fields
export const validators = {
  // Validator for required fields
  // Returns error if field is empty or only whitespace
  required: (value: any) => {
    // Handle different value types appropriately
    if (value === null || value === undefined || 
        (typeof value === 'string' && value.trim() === '')) {
      return 'Dette felt er påkrævet';
    }
    return null; // No error
  },

  // Validator for minimum numeric values
  // Returns error if number is below the specified minimum
  min: (minValue: number) => (value: any) => {
    // Convert to number for comparison
    const numValue = Number(value);
    
    // Check if conversion resulted in valid number and meets minimum
    if (isNaN(numValue) || numValue < minValue) {
      return `Værdien skal være mindst ${minValue}`;
    }
    return null; // No error
  },

  // Validator for maximum numeric values
  // Returns error if number is above the specified maximum
  max: (maxValue: number) => (value: any) => {
    // Convert to number for comparison
    const numValue = Number(value);
    
    // Check if conversion resulted in valid number and doesn't exceed maximum
    if (isNaN(numValue) || numValue > maxValue) {
      return `Værdien må ikke være større end ${maxValue}`;
    }
    return null; // No error
  },

  // Validator for email format
  // Returns error if string doesn't match email pattern
  email: (value: any) => {
    // Only validate string values
    if (typeof value !== 'string') return 'Email skal være tekst';
    
    // Simple email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Test if value matches email pattern
    if (!emailRegex.test(value)) {
      return 'Indtast en gyldig email adresse';
    }
    return null; // No error
  },

  // Validator for minimum string length
  // Returns error if string is shorter than specified length
  minLength: (minLength: number) => (value: any) => {
    // Only validate string values
    if (typeof value !== 'string') return 'Værdien skal være tekst';
    
    // Check if string meets minimum length requirement
    if (value.length < minLength) {
      return `Skal være mindst ${minLength} tegn lang`;
    }
    return null; // No error
  },

  // Validator for maximum string length
  // Returns error if string is longer than specified length
  maxLength: (maxLength: number) => (value: any) => {
    // Only validate string values
    if (typeof value !== 'string') return 'Værdien skal være tekst';
    
    // Check if string exceeds maximum length
    if (value.length > maxLength) {
      return `Må ikke være længere end ${maxLength} tegn`;
    }
    return null; // No error
  }
}; 