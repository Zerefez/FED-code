import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { modelsAPI } from '../services/api';

export default function useModelsList() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const { isManager } = useAuth();
  const { id } = useParams();

  // Load all models on hook initialization
  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        const data = await modelsAPI.getAllModels();
        setModels(data);

        // If there's an ID in the URL, select that model
        if (id) {
          const modelFromUrl = data.find(model => 
            (model.id && model.id.toString() === id) || 
            (model.modelId && model.modelId.toString() === id)
          );
          
          if (modelFromUrl) {
            setSelectedModel(modelFromUrl);
          } else {
            console.warn(`Model with ID ${id} not found in the list`);
          }
        }
      } catch (err) {
        setError('Failed to fetch models');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (isManager) {
      fetchModels();
    } else {
      setLoading(false);
    }
  }, [isManager, id]);

  // Delete model handler
  const deleteModel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this model?')) return;
    
    try {
      await modelsAPI.deleteModel(id);
      
      // Remove from UI - handle either id or modelId property 
      setModels(models.filter(model => (model.id !== id && model.modelId !== id)));
      
      if (selectedModel && (selectedModel.id === id || selectedModel.modelId === id)) {
        setSelectedModel(null);
      }
    } catch (err) {
      setError('Failed to delete model');
      console.error(err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return {
    models,
    loading, 
    error,
    selectedModel,
    setSelectedModel,
    deleteModel,
    formatDate,
    isManager
  };
} 