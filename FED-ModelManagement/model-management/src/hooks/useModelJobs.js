import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { modelsAPI } from '../services/api';

export default function useModelJobs(modelId) {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isManager, currentUser } = useAuth();

  // Load model jobs on hook initialization
  useEffect(() => {
    async function fetchModelJobs() {
      try {
        setLoading(true);
        setError('');
        console.log(`useModelJobs hook: Fetching jobs for model with ID: ${modelId}`);
        
        if (!modelId || modelId === 'undefined') {
          setError('Invalid model ID');
          console.error('useModelJobs hook: No valid ID provided:', modelId);
          setLoading(false);
          return;
        }
        
        // Parse the ID to a number before passing to API
        const parsedModelId = parseInt(modelId, 10);
        console.log(`useModelJobs hook: Parsed model ID: ${parsedModelId}`);
        
        if (isNaN(parsedModelId)) {
          setError('Invalid model ID format');
          console.error('useModelJobs hook: ID is not a valid number:', modelId);
          setLoading(false);
          return;
        }
        
        const data = await modelsAPI.getModelJobs(parsedModelId);
        
        // Check if we got valid data back
        if (!data) {
          setError('No data returned from server');
          console.error('useModelJobs hook: No data returned from API');
          setLoading(false);
          return;
        }
        
        // Validate the model data structure based on API schema
        if (!data.firstName || !data.lastName) {
          console.warn('useModelJobs hook: Model data is missing required properties:', data);
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
        } else if (errorMessage.includes('401')) {
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
  }, [modelId]);

  // Check if the user is allowed to view this model's jobs
  const canViewModelJobs = isManager || (
    currentUser?.modelId && (
      currentUser.modelId === parseInt(modelId) || 
      currentUser.modelId.toString() === modelId
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