import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, jobsAPI, modelsAPI } from '../services/api';

export function useJobDetail(jobId) {
  const [job, setJob] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const navigate = useNavigate();
  const { currentUser, isManager, isModel, getModelId } = useAuth();
  
  // Get current model ID for permissions
  const currentModelId = getModelId();

  // Navigate to model expenses page (consolidated expense management)
  const goToModelExpenses = useCallback(() => {
    if (!currentUser) return;
    
    // If this is a model, go to their expenses page
    if (isModel && currentModelId) {
      navigate(`/models/${currentModelId}/expenses?jobId=${jobId}`);
    } else if (isManager && job?.modelId) {
      // If this is a manager, go to the model's expenses page
      navigate(`/models/${job.modelId}/expenses?jobId=${jobId}`);
    } else {
      setExpenseError('Cannot navigate to expenses page - missing required information');
    }
  }, [currentUser, currentModelId, isManager, isModel, navigate, jobId, job]);

  // Fetch all expenses for this job
  const refreshExpenses = useCallback(async () => {
    if (!jobId) return;
    
    try {
      let jobExpenses = await expensesAPI.getJobExpenses(jobId);
      
      // If we're a model (not a manager), only show our own expenses
      if (isModel && !isManager && currentModelId) {
        jobExpenses = jobExpenses.filter(exp => 
          String(exp.modelId) === String(currentModelId)
        );
      }
      
      // Fetch model data for each expense if needed
      if (jobExpenses.length > 0 && !jobExpenses[0].modelName) {
        // Get all unique model IDs from expenses
        const modelIds = [...new Set(jobExpenses.map(exp => exp.modelId))];
        
        // Create a models lookup map
        const modelsMap = {};
        for (const modelId of modelIds) {
          try {
            const modelData = await modelsAPI.getModel(modelId);
            modelsMap[modelId] = modelData;
          } catch (error) {
            console.error(`Failed to fetch model data for ID ${modelId}`, error);
          }
        }
        
        // Enrich expenses with model data
        jobExpenses = jobExpenses.map(expense => {
          const model = modelsMap[expense.modelId];
          return {
            ...expense,
            modelName: model ? `${model.firstName} ${model.lastName}` : `Model #${expense.modelId}`
          };
        });
      }
      
      setExpenses(jobExpenses);
      setExpenseError('');
    } catch (err) {
      console.error('Failed to fetch job expenses', err);
      setExpenseError('Failed to fetch expenses for this job');
    }
  }, [jobId, isModel, isManager, currentModelId]);

  // Initial data fetch
  useEffect(() => {
    async function fetchJobData() {
      try {
        setLoading(true);
        setError('');
        
        if (!jobId) {
          setError('No job ID provided');
          setLoading(false);
          return;
        }
        
        const jobData = await jobsAPI.getJob(jobId);
        setJob(jobData);
        
        // Fetch expenses for this job
        await refreshExpenses();
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch job details', err);
        setError('Failed to fetch job details');
        setLoading(false);
      }
    }
    
    fetchJobData();
  }, [jobId, refreshExpenses]);

  return {
    job,
    expenses,
    loading,
    error,
    expenseError,
    refreshExpenses,
    goToModelExpenses
  };
} 