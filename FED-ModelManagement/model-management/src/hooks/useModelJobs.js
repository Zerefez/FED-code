import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { modelsAPI } from '../services/api';

export default function useModelJobs(modelId) {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isManager, currentUser, isModel, getModelId } = useAuth();

  useEffect(() => {
    async function fetchModelJobs() {
      try {
        setLoading(true);
        
        // Get the correct model ID
        const currentModelId = getModelId();
        console.log('useModelJobs hook: Current model ID:', currentModelId);
        
        // Permission check - only allow if user is a manager or this is their own model ID
        const hasPermission = isManager || 
          (isModel && currentModelId && 
            (String(currentModelId) === String(modelId) || 
             currentUser?.email?.toLowerCase() === modelId?.toLowerCase()));
        
        if (!hasPermission) {
          console.log('useModelJobs hook: Permission denied', { 
            isManager, 
            isModel,
            currentModelId,
            requestedModelId: modelId 
          });
          setError('You do not have permission to view this model\'s jobs');
          setLoading(false);
          return;
        }
        
        console.log(`useModelJobs hook: Fetching jobs for model ID: ${modelId}`);
        
        let data;
        try {
          // First try to get specific model jobs
          console.log(`useModelJobs hook: Fetching model jobs with /Models/${modelId}/jobs`);
          data = await modelsAPI.getModelJobs(modelId);
        } catch {
          // If that fails, try getting the model data which might include jobs
          console.log(`useModelJobs hook: Failed to get jobs directly, getting model data instead`);
          const modelData = await modelsAPI.getModel(modelId);
          data = modelData;
        }
        
        // Ensure jobs array exists
        if (!data.jobs || !Array.isArray(data.jobs)) {
          console.warn('useModelJobs hook: No valid jobs array in response, creating empty array');
          data.jobs = [];
        } else {
          console.log(`useModelJobs hook: Model has ${data.jobs.length} jobs`);
        }
        
        console.log('useModelJobs hook: Successfully received model data:', data);
        setModel(data);
      } catch (err) {
        console.error('useModelJobs hook: Error fetching model jobs:', err);
        // Provide a more user-friendly error message based on error type
        const errorMessage = err.message || 'Failed to fetch model jobs';
        
        if (errorMessage.includes('404')) {
          setError('Model not found');
        } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
          setError('Unauthorized: You don\'t have permission to view these jobs');
        } else if (errorMessage.includes('400')) {
          setError('Invalid model ID format');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchModelJobs();
  }, [modelId, isManager, currentUser, isModel, getModelId]);

  // Check if the user is allowed to view this model's jobs
  const canViewModelJobs = isManager || (
    isModel && (
      String(getModelId()) === String(modelId) || 
      currentUser?.email?.toLowerCase() === modelId?.toLowerCase()
    )
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return {
    model,
    loading,
    error,
    canViewModelJobs,
    formatDate
  };
} 