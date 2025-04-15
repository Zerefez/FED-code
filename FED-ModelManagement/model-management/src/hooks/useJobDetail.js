import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, jobsAPI, modelsAPI } from '../services/api';

export default function useJobDetail(jobId) {
  const navigate = useNavigate();
  const { isManager, currentUser, isModel, getModelId } = useAuth();
  const [job, setJob] = useState(null);
  const [models, setModels] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customer: '',
    startDate: '',
    days: 1,
    location: '',
    comments: ''
  });

  const [newExpense, setNewExpense] = useState({
    jobId: jobId,
    modelId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    text: ''
  });

  // Initial data loading
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const jobData = await jobsAPI.getJob(jobId);
        setJob(jobData);
        
        // Initialize edit form data
        if (jobData) {
          setEditFormData({
            customer: jobData.customer || '',
            startDate: jobData.startDate ? new Date(jobData.startDate).toISOString().split('T')[0] : '',
            days: jobData.days || 1,
            location: jobData.location || '',
            comments: jobData.comments || ''
          });
        }
        
        if (isManager) {
          const modelsData = await modelsAPI.getAllModels();
          setModels(modelsData);
          
          // Filter out models already assigned to this job
          const jobModelIds = jobData.models.map(model => model.modelId || model.id);
          setAvailableModels(modelsData.filter(model => {
            const modelIdentifier = model.modelId || model.id;
            return !jobModelIds.includes(modelIdentifier);
          }));
        }
        
        // If this is a model's own job, fetch their expenses
        const modelId = getModelId();
        if (!isManager && isModel && modelId) {
          console.log(`useJobDetail: Loading expenses for model ID: ${modelId}`);
          const modelExpenses = await expensesAPI.getModelExpenses(modelId);
          // Filter to only show expenses for this job
          setExpenses(modelExpenses.filter(expense => expense.jobId === parseInt(jobId)));
        }
      } catch (err) {
        setError('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [jobId, isManager, currentUser, isModel, getModelId]);

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit job edits
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Format the data as needed for the API
      const jobData = {
        ...editFormData,
        days: parseInt(editFormData.days),
        startDate: new Date(editFormData.startDate).toISOString()
      };
      
      await jobsAPI.updateJob(jobId, jobData);
      
      // Refresh job data
      const updatedJob = await jobsAPI.getJob(jobId);
      setJob(updatedJob);
      
      // Exit edit mode
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update job');
      console.error(err);
    }
  };

  // Add model to job
  const addModelToJob = async () => {
    if (!selectedModel) return;
    
    try {
      await jobsAPI.addModelToJob(jobId, selectedModel);
      // Refresh job data
      const updatedJob = await jobsAPI.getJob(jobId);
      setJob(updatedJob);
      setSelectedModel('');
      
      // Update available models
      const jobModelIds = updatedJob.models.map(model => model.modelId || model.id);
      setAvailableModels(models.filter(model => {
        const modelIdentifier = model.modelId || model.id;
        return !jobModelIds.includes(modelIdentifier);
      }));
    } catch (err) {
      setError('Failed to add model to job');
      console.error(err);
    }
  };

  // Remove model from job
  const removeModelFromJob = async (modelId) => {
    try {
      await jobsAPI.removeModelFromJob(jobId, modelId);
      // Refresh job data
      const updatedJob = await jobsAPI.getJob(jobId);
      setJob(updatedJob);
      
      // Update available models
      const jobModelIds = updatedJob.models.map(model => model.modelId || model.id);
      setAvailableModels(models.filter(model => {
        const modelIdentifier = model.modelId || model.id;
        return !jobModelIds.includes(modelIdentifier);
      }));
    } catch (err) {
      setError('Failed to remove model from job');
      console.error(err);
    }
  };

  // Handle expense form changes
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if the user can view and manage this job
  const canViewJob = useMemo(() => {
    // Managers can view all jobs
    if (isManager) return true;
    
    // If the job is loaded and the user is a model
    if (job && currentUser && isModel) {
      const modelId = getModelId();
      console.log('useJobDetail: Checking if model can view job', {
        modelId,
        jobModels: job.models
      });
      
      // Check if this model is assigned to this job
      return job.models?.some(model => 
        String(model.id) === String(modelId) || 
        String(model.modelId) === String(modelId) ||
        model.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
    }
    
    return false;
  }, [job, currentUser, isManager, isModel, getModelId]);

  // Add expense - only allow if model is assigned to this job
  const addExpense = async (e) => {
    e.preventDefault();
    
    if (!canViewJob) {
      setError('You are not authorized to add expenses to this job');
      return;
    }
    
    const modelId = getModelId();
    if (!modelId) {
      setError('Could not determine your model ID. Please contact support.');
      return;
    }
    
    try {
      // Set the modelId to the current user's model ID
      const expenseData = {
        ...newExpense,
        modelId: modelId,
        amount: parseFloat(newExpense.amount)
      };
      
      console.log('Adding expense with data:', expenseData);
      await expensesAPI.createExpense(expenseData);
      
      // Refresh expenses
      const refreshedExpenses = await expensesAPI.getModelExpenses(modelId);
      setExpenses(refreshedExpenses.filter(expense => expense.jobId === parseInt(jobId)));
      
      // Reset form
      setNewExpense({
        jobId: jobId,
        modelId: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        text: ''
      });
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
    }
  };

  // Delete expense - only allow if model owns the expense or is a manager
  const deleteExpense = async (expenseId) => {
    const expenseToDelete = expenses.find(e => e.id === expenseId);
    
    // Check if the expense exists and belongs to this model
    if (!expenseToDelete) {
      setError('Expense not found');
      return;
    }
    
    const modelId = getModelId();
    
    // Only managers or the model who created the expense can delete it
    if (!isManager && String(expenseToDelete.modelId) !== String(modelId)) {
      setError('You do not have permission to delete this expense');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expensesAPI.deleteExpense(expenseId);
      // Remove from list
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  // Delete job
  const deleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await jobsAPI.deleteJob(jobId);
      navigate('/jobs');
    } catch (err) {
      setError('Failed to delete job');
      console.error(err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return {
    job,
    models,
    availableModels,
    selectedModel,
    setSelectedModel,
    expenses,
    loading,
    error,
    isEditing,
    setIsEditing,
    editFormData,
    newExpense,
    handleEditChange,
    handleEditSubmit,
    addModelToJob,
    removeModelFromJob,
    handleExpenseChange,
    addExpense,
    deleteExpense,
    deleteJob,
    formatDate
  };
} 