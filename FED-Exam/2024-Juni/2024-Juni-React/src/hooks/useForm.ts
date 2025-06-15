import { useState } from 'react';

export interface UseFormReturn<T> {
  formData: T;
  errors: { [key: string]: string };
  isLoading: boolean;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (field: keyof T, value: string) => void;
  validateForm: (validationRules: ValidationRules<T>) => boolean;
  resetForm: () => void;
}

export type ValidationRule<T> = (value: T[keyof T]) => string | undefined;
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>;
};

export function useForm<T extends Record<string, any>>(
  initialData: T
): UseFormReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof T, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field as string]: ""
      }));
    }
  };

  const validateForm = (validationRules: ValidationRules<T>): boolean => {
    const newErrors: { [key: string]: string } = {};

    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field as keyof T];
      if (rule) {
        const error = rule(formData[field as keyof T]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
    setIsLoading(false);
  };

  return {
    formData,
    errors,
    isLoading,
    setFormData,
    setErrors,
    setIsLoading,
    handleInputChange,
    validateForm,
    resetForm
  };
} 