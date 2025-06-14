import { useAuth } from '@/hooks/use-auth';
import { useForm, ValidationRules } from '@/hooks/use-form';
import { useState } from 'react';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UseProfileReturn {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formData: ProfileFormData;
  errors: { [key: string]: string };
  isLoading: boolean;
  handleInputChange: (field: keyof ProfileFormData, value: string) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const initialData: ProfileFormData = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  };

  const validationRules: ValidationRules<ProfileFormData> = {
    firstName: (value) => !value.trim() ? 'Fornavn er påkrævet' : undefined,
    lastName: (value) => !value.trim() ? 'Efternavn er påkrævet' : undefined,
    email: (value) => {
      if (!value.trim()) return 'E-mail er påkrævet';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Ugyldig e-mail format';
      return undefined;
    }
  };

  const {
    formData,
    errors,
    isLoading,
    setIsLoading,
    setErrors,
    handleInputChange,
    validateForm,
    resetForm
  } = useForm(initialData);

  const handleSave = async () => {
    if (!validateForm(validationRules)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement profile update functionality
      console.log('Saving profile:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Der opstod en fejl ved opdatering af profil. Prøv igen.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  return {
    isEditing,
    setIsEditing,
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSave,
    handleCancel
  };
} 