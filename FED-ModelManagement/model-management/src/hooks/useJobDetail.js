import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, jobsAPI, modelsAPI } from '../services/api';

export default function useJobDetail(jobId) {
  const navigate = useNavigate();
  const { isManager, currentUser } = useAuth();
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
        if (!isManager && currentUser?.modelId) {
          const modelExpenses = await expensesAPI.getModelExpenses(currentUser.modelId);
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
  }, [jobId, isManager, currentUser]);

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

  // Add expense
  const addExpense = async (e) => {
    e.preventDefault();
    
    try {
      // Set the modelId to the current user's model ID if they're a model
      const expenseData = {
        ...newExpense,
        modelId: currentUser.modelId,
        amount: parseFloat(newExpense.amount)
      };
      
      await expensesAPI.createExpense(expenseData);
      
      // Refresh expenses
      const modelExpenses = await expensesAPI.getModelExpenses(currentUser.modelId);
      setExpenses(modelExpenses.filter(expense => expense.jobId === parseInt(jobId)));
      
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

  // Delete expense
  const deleteExpense = async (expenseId) => {
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