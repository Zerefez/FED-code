import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, jobsAPI, modelsAPI } from '../services/api';

export default function useModelExpenses() {
  const { id } = useParams();
  const location = useLocation();
  const { isManager, isModel, getModelId, currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingExpense, setIsEditingExpense] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [filter, setFilter] = useState('');
  const [editFormData, setEditFormData] = useState({
    date: '',
    amount: '',
    text: '',
    jobId: ''
  });
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    text: '',
    modelId: '',
    jobId: ''
  });
  const [modelDetails, setModelDetails] = useState(null);
  const [modelJobs, setModelJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  
  // Get the current model's ID (for models viewing their own expenses)
  const currentModelId = getModelId();
  
  // Check if the user is allowed to view/edit these expenses
  const canViewExpenses = isManager || 
    (isModel && currentModelId && (
      String(currentModelId) === String(id) || 
      (currentUser?.email && currentUser.email === id)
    ));
    
  // Check if the user is allowed to modify these expenses (only the model itself)
  const canModifyExpenses = isModel && (
    (currentModelId && String(currentModelId) === String(id)) || 
    (currentUser?.email && currentUser.email === id)
  );

  // Parse job ID from query parameter if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobId = params.get('jobId');
    if (jobId) {
      setSelectedJobId(jobId);
      
      // Set the job ID in the new expense form
      setNewExpense(prev => ({
        ...prev,
        jobId: jobId,
        modelId: id || currentModelId
      }));
    }
  }, [location, id, currentModelId]);

  // Fetch all jobs data once for job name mapping
  useEffect(() => {
    async function fetchAllJobs() {
      try {
        const jobsData = await jobsAPI.getAllJobs();
        console.log('ModelExpenses: Successfully fetched all jobs for mapping:', jobsData);
        setAllJobs(jobsData);
      } catch (err) {
        console.error('ModelExpenses: Error fetching all jobs:', err);
      }
    }
    
    fetchAllJobs();
  }, []);

  // Fetch expense data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');

        console.log('ModelExpenses: Starting data fetch for model ID:', id || currentModelId);

        if (!id && !currentModelId) {
          setError('No model ID available');
          setLoading(false);
          return;
        }
        
        // Determine which model ID to use
        const modelIdToUse = id || currentModelId;
        
        // Set the model ID in the new expense form
        setNewExpense(prev => ({
          ...prev,
          modelId: modelIdToUse
        }));

        // Fetch expenses for the model
        const expensesData = await expensesAPI.getModelExpenses(modelIdToUse);
        console.log('ModelExpenses: Successfully fetched expenses:', expensesData);
        
        // Log expense IDs to debug
        console.log('ModelExpenses: Expense IDs:', expensesData.map(exp => exp.id || exp.expenseId));
        console.log('ModelExpenses: Expense Job IDs:', expensesData.map(exp => exp.jobId));
        
        // Create a job lookup map from all fetched jobs
        const jobLookup = {};
        allJobs.forEach(job => {
          const jobId = job.id || job.jobId;
          jobLookup[jobId] = {
            customer: job.customer || job.name || `Job #${jobId}`
          };
        });
        
        // Normalize expense data and enrich with job information
        const normalizedExpenses = expensesData.map(expense => {
          const jobInfo = jobLookup[expense.jobId] || {};
          return {
            ...expense,
            id: expense.id || expense.expenseId, // Ensure each expense has an id property
            jobCustomer: expense.jobCustomer || jobInfo.customer || `Job #${expense.jobId}`
          };
        });
        
        console.log('ModelExpenses: Normalized expenses with job names:', normalizedExpenses);
        
        // Check if we have actual duplicates with the same ID
        const idCounts = {};
        normalizedExpenses.forEach(exp => {
          idCounts[exp.id] = (idCounts[exp.id] || 0) + 1;
        });
        
        const duplicateIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);
          
        if (duplicateIds.length > 0) {
          console.log('ModelExpenses: Found duplicate IDs:', duplicateIds);
          
          // Only filter actual duplicates if found
          const uniqueExpenses = [];
          const seenIds = new Set();
          
          normalizedExpenses.forEach(expense => {
            if (!seenIds.has(expense.id)) {
              seenIds.add(expense.id);
              uniqueExpenses.push(expense);
            } else {
              console.log('ModelExpenses: Filtering out duplicate expense with ID:', expense.id);
            }
          });
          
          setExpenses(uniqueExpenses);
        } else {
          // No duplicates found, use all expenses
          setExpenses(normalizedExpenses);
        }
      } catch (fetchError) {
        console.error('ModelExpenses: Error fetching expense data:', fetchError);
        setError('Failed to fetch expense data');
      } finally {
        setLoading(false);
      }
    }
    
    if (canViewExpenses && allJobs.length > 0) {
      fetchData();
    } else if (!canViewExpenses) {
      setLoading(false);
      setError('You do not have permission to view these expenses');
    }
  }, [id, canViewExpenses, currentModelId, allJobs]);

  // Fetch model details when viewed by manager
  useEffect(() => {
    async function fetchModelDetails() {
      if (!id || !isManager) return;
      
      try {
        const modelData = await modelsAPI.getModel(id);
        setModelDetails(modelData);
      } catch (err) {
        console.error('Error fetching model details:', err);
      }
    }
    
    fetchModelDetails();
  }, [id, isManager]);

  // Fetch model's jobs for the job dropdown
  useEffect(() => {
    async function fetchModelJobs() {
      if (!canViewExpenses || allJobs.length === 0) return;
      
      try {
        const modelIdToUse = id || currentModelId;
        console.log('ModelExpenses: Fetching jobs for model ID:', modelIdToUse);
        
        // Filter all jobs to only include those where this model is assigned
        const filteredJobs = allJobs.filter(job => {
          if (!job.models || !Array.isArray(job.models)) return false;
          
          return job.models.some(model => 
            String(model.id) === String(modelIdToUse) || 
            String(model.modelId) === String(modelIdToUse)
          );
        });
        
        // Properly format the jobs with consistent property names
        const formattedJobs = filteredJobs.map(job => ({
          id: job.id || job.jobId,
          jobId: job.id || job.jobId,
          customer: job.customer || job.name || `Job #${job.id || job.jobId}`
        }));
        
        console.log('ModelExpenses: Formatted jobs for model:', formattedJobs);
        setModelJobs(formattedJobs);
      } catch (err) {
        console.error('ModelExpenses: Error fetching jobs:', err);
      }
    }
    
    fetchModelJobs();
  }, [id, canViewExpenses, currentModelId, allJobs]);

  // Filter expenses based on selected job and text filter
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        const jobMatch = !selectedJobId || String(expense.jobId) === String(selectedJobId);
        return jobMatch;
      })
      .filter(expense => {
        if (!filter) return true;
        const searchTerm = filter.toLowerCase();
        return (
          (expense.text && expense.text.toLowerCase().includes(searchTerm)) ||
          (expense.jobCustomer && expense.jobCustomer.toLowerCase().includes(searchTerm))
        );
      });
  }, [expenses, selectedJobId, filter]);

  // Get unique jobs from expenses and model jobs for the job selector
  const expenseJobs = useMemo(() => {
    const uniqueJobs = [];
    const jobIds = new Set();
    
    // First add jobs from expenses
    expenses.forEach(expense => {
      if (!jobIds.has(expense.jobId)) {
        jobIds.add(expense.jobId);
        uniqueJobs.push({
          id: expense.jobId,
          customer: expense.jobCustomer || (expense.job?.customer || expense.job?.name) || `Job #${expense.jobId}`
        });
      }
    });
    
    // Then add model's jobs that don't already exist in the list
    modelJobs.forEach(job => {
      if (!jobIds.has(job.id) && !jobIds.has(job.jobId)) {
        const jobId = job.id || job.jobId;
        jobIds.add(jobId);
        uniqueJobs.push({
          id: jobId,
          customer: job.customer || `Job #${jobId}`
        });
      }
    });
    
    console.log('ModelExpenses: Combined jobs for dropdown:', uniqueJobs);
    return uniqueJobs;
  }, [expenses, modelJobs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    // Only models can add their own expenses
    if (!canModifyExpenses) {
      setError('You do not have permission to add expenses');
      return;
    }
    
    // Get the actual model ID to use
    const actualModelId = id || currentModelId;
    
    try {
      const expenseData = {
        ...newExpense,
        modelId: actualModelId,
        amount: parseFloat(newExpense.amount)
      };
      
      console.log('Adding expense with data:', expenseData);
      const createdExpense = await expensesAPI.createExpense(expenseData);
      
      // Add the new expense to the list
      setExpenses([...expenses, createdExpense]);
      
      // Reset form but keep job ID and model ID
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        text: '',
        modelId: actualModelId,
        jobId: newExpense.jobId // Keep the job ID if set
      });
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
    }
  };

  const startEditExpense = (expense) => {
    // Only models can edit their own expenses
    if (!canModifyExpenses) {
      setError('You do not have permission to edit expenses');
      return;
    }
    
    const expenseId = expense.id || expense.expenseId;
    setIsEditingExpense(expenseId);
    setEditFormData({
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      amount: expense.amount,
      text: expense.text,
      jobId: expense.jobId
    });
  };

  const cancelEditExpense = () => {
    setIsEditingExpense(null);
    setEditFormData({
      date: '',
      amount: '',
      text: '',
      jobId: ''
    });
  };

  const saveEditExpense = async (expenseId) => {
    // Only models can edit their own expenses
    if (!canModifyExpenses) {
      setError('You do not have permission to edit expenses');
      return;
    }
    
    try {
      // Find the original expense to get data that might not be in the edit form
      const originalExpense = expenses.find(exp => (exp.id || exp.expenseId) === expenseId);
      if (!originalExpense) {
        setError('Expense not found');
        return;
      }
      
      // Prepare complete update data with all required fields
      const updateData = {
        expenseId: originalExpense.expenseId || originalExpense.id,
        modelId: originalExpense.modelId,
        jobId: editFormData.jobId || originalExpense.jobId,
        date: editFormData.date,
        text: editFormData.text,
        amount: parseFloat(editFormData.amount)
      };
      
      console.log('Updating expense with data:', updateData);
      
      // Use the API's expected expenseId rather than id
      const apiId = originalExpense.expenseId || expenseId;
      const updatedExpense = await expensesAPI.updateExpense(apiId, updateData);
      
      // Make sure the updated expense has an id property
      if (updatedExpense.expenseId && !updatedExpense.id) {
        updatedExpense.id = updatedExpense.expenseId;
      }
      
      // Update the expense in the list
      setExpenses(expenses.map(expense => {
        const currentId = expense.id || expense.expenseId;
        return currentId === expenseId ? updatedExpense : expense;
      }));
      
      // Exit edit mode
      cancelEditExpense();
    } catch (err) {
      setError('Failed to update expense');
      console.error('Error updating expense:', err);
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    // Only models can delete their own expenses
    if (!canModifyExpenses) {
      setError('You do not have permission to delete expenses');
      return;
    }
    
    try {
      await expensesAPI.deleteExpense(expenseId);
      // Remove from list
      setExpenses(expenses.filter(expense => {
        const currentId = expense.id || expense.expenseId;
        return currentId !== expenseId;
      }));
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  // Determine model name from current user if available
  const modelName = isManager 
    ? modelDetails ? `${modelDetails.firstName} ${modelDetails.lastName}` : `Model #${id}`
    : currentUser?.firstName && currentUser?.lastName 
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.email || 'Current Model';

  return {
    loading,
    error,
    canViewExpenses,
    canModifyExpenses,
    modelName,
    filteredExpenses,
    expenseJobs,
    selectedJobId,
    setSelectedJobId,
    filter,
    setFilter,
    isEditingExpense,
    editFormData,
    newExpense,
    handleInputChange,
    handleEditInputChange,
    handleAddExpense,
    startEditExpense,
    cancelEditExpense,
    saveEditExpense,
    deleteExpense
  };
} 