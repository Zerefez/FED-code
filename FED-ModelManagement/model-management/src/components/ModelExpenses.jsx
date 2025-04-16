import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, modelsAPI } from '../services/api';
import { cn } from '../utils/cn';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';
import Input from './common/Input';

export default function ModelExpenses() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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
  
  // Get the current model's ID (for models viewing their own expenses)
  const currentModelId = getModelId();
  
  // If URL doesn't have an ID but user is a model, redirect to their expenses
  useEffect(() => {
    // Special case for when an email is used as the ID (happens with JWT tokens)
    const isEmailId = id && id.includes('@');
    
    // Redirect managers to the AllExpenses view
    if (isManager && !isModel) {
      console.log('ModelExpenses: Redirecting manager to AllExpenses view');
      navigate('/expenses', { replace: true });
      return;
    }
    
    if (isModel && currentModelId && !id) {
      // Redirect to the current model's expenses page
      navigate(`/models/${currentModelId}/expenses${location.search}`, { replace: true });
    } else if (isModel && currentUser && isEmailId && currentUser.email === id) {
      // We have a model with an email as ID, try to use the numeric ID instead
      if (currentModelId && currentModelId !== id) {
        navigate(`/models/${currentModelId}/expenses${location.search}`, { replace: true });
      }
    }
  }, [id, isModel, isManager, currentModelId, navigate, location.search, currentUser]);
  
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
        console.log('ModelExpenses: Expense data detailed:', expensesData.map(exp => ({
          id: exp.id || exp.expenseId,
          jobId: exp.jobId,
          amount: exp.amount,
          date: exp.date,
          text: exp.text
        })));
        
        // Normalize expense data to ensure consistent property names
        const normalizedExpenses = expensesData.map(expense => ({
          ...expense,
          id: expense.id || expense.expenseId // Ensure each expense has an id property
        }));
        
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
        
        // Get unique job IDs from expenses to create a job filter
        const jobIds = [...new Set(expensesData.map(exp => exp.jobId))];
        console.log('ModelExpenses: Available job IDs from expenses:', jobIds);
      } catch (fetchError) {
        console.error('ModelExpenses: Error fetching expense data:', fetchError);
        setError('Failed to fetch expense data');
      } finally {
        setLoading(false);
      }
    }
    
    if (canViewExpenses) {
      fetchData();
    } else {
      setLoading(false);
      setError('You do not have permission to view these expenses');
    }
  }, [id, canViewExpenses, currentModelId]);

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

  // Filter expenses based on selected job and text filter
  const filteredExpenses = expenses
    .filter(expense => {
      const jobMatch = !selectedJobId || String(expense.jobId) === String(selectedJobId);
      if (selectedJobId && jobMatch) {
        console.log('ModelExpenses: Job filter match for expense:', expense.id, 'with job:', expense.jobId);
      }
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
    
  console.log('ModelExpenses: Selected job ID:', selectedJobId);
  console.log('ModelExpenses: Filtered expenses count:', filteredExpenses.length);
  console.log('ModelExpenses: Total expenses count:', expenses.length);

  // Get unique jobs from expenses for the job selector
  const expenseJobs = useMemo(() => {
    const uniqueJobs = [];
    const jobIds = new Set();
    
    expenses.forEach(expense => {
      if (!jobIds.has(expense.jobId)) {
        jobIds.add(expense.jobId);
        uniqueJobs.push({
          id: expense.jobId,
          customer: expense.jobCustomer || `Job #${expense.jobId}`
        });
      }
    });
    
    return uniqueJobs;
  }, [expenses]);

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

  if (loading) return <div className="text-center py-10 text-foreground">Loading expenses...</div>;
  
  if (error) return <ErrorMessage error={error} />;

  // Determine model name from current user if available
  const modelName = isManager 
    ? modelDetails ? `${modelDetails.firstName} ${modelDetails.lastName}` : `Model #${id}`
    : currentUser?.firstName && currentUser?.lastName 
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.email || 'Current Model';

  if (!canViewExpenses) {
    return (
      <div className="bg-yellow-100/20 border border-yellow-400 text-yellow-400 px-4 py-3 rounded-md mb-4">
        You do not have permission to view these expenses.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Expenses for {modelName}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/models/${id || currentModelId}/jobs`}>
              View Jobs
            </Link>
          </Button>
          {isManager ? (
            <Button variant="outline" asChild>
              <Link to="/models">
                Back to Models
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Display error message if present */}
        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {/* Filtering Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="filter" className="block text-sm font-medium mb-1 text-foreground">
              Filter Expenses
            </label>
            <Input
              id="filter"
              type="text"
              placeholder="Search by description..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="jobFilter" className="block text-sm font-medium mb-1 text-foreground">
              Filter by Job
            </label>
            <select
              id="jobFilter"
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">All Jobs</option>
              {expenseJobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.customer}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="bg-secondary/20 p-6 rounded-lg text-center text-muted-foreground mb-6">
            <p>No expenses found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  {canModifyExpenses && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense, idx) => {
                  const expenseId = expense.id || expense.expenseId;
                  return (
                    <tr key={expenseId} className={cn("border-b border-border", idx % 2 === 0 ? "bg-card" : "bg-secondary/10")}>
                      {isEditingExpense === expenseId ? (
                        <td colSpan={canModifyExpenses ? 5 : 4} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                              <label htmlFor="jobId" className="block text-sm font-medium mb-1 text-foreground">
                                Job
                              </label>
                              <select
                                id="jobId"
                                name="jobId"
                                className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                                value={editFormData.jobId}
                                onChange={handleEditInputChange}
                                required
                              >
                                <option value="">Select a Job</option>
                                {expenseJobs.map(job => (
                                  <option key={job.id} value={job.id}>
                                    {job.customer}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label htmlFor="date" className="block text-sm font-medium mb-1 text-foreground">
                                Date
                              </label>
                              <Input
                                id="date"
                                name="date"
                                type="date"
                                value={editFormData.date}
                                onChange={handleEditInputChange}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="amount" className="block text-sm font-medium mb-1 text-foreground">
                                Amount ($)
                              </label>
                              <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={editFormData.amount}
                                onChange={handleEditInputChange}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="text" className="block text-sm font-medium mb-1 text-foreground">
                                Description
                              </label>
                              <Input
                                id="text"
                                name="text"
                                value={editFormData.text}
                                onChange={handleEditInputChange}
                                required
                              />
                            </div>
                            <div className="md:col-span-4 flex justify-end space-x-2 mt-2">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={cancelEditExpense}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => saveEditExpense(expenseId)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            <Link to={`/jobs/${expense.jobId}`} className="text-primary hover:underline">
                              {expense.jobCustomer || `Job #${expense.jobId}`}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            ${expense.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {expense.text}
                          </td>
                          {canModifyExpenses && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => startEditExpense(expense)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => deleteExpense(expenseId)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Form to add new expense - available for models only */}
        {canModifyExpenses && (
          <div className="bg-secondary/20 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3 text-foreground">Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="jobId" className="block text-sm font-medium mb-1 text-foreground">
                    Job
                  </label>
                  <select
                    id="jobId"
                    name="jobId"
                    className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                    value={newExpense.jobId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a Job</option>
                    {expenseJobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.customer}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-1 text-foreground">
                    Date
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newExpense.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-1 text-foreground">
                    Amount ($)
                  </label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="text" className="block text-sm font-medium mb-1 text-foreground">
                    Description
                  </label>
                  <Input
                    id="text"
                    name="text"
                    value={newExpense.text}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  Add Expense
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 