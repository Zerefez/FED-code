import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, jobsAPI, modelsAPI } from '../services/api';
import { cn } from '../utils/cn';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';
import Input from './common/Input';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, currentUser } = useAuth();
  const [job, setJob] = useState(null);
  const [models, setModels] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form for new expense
  const [newExpense, setNewExpense] = useState({
    jobId: id,
    modelId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    text: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const jobData = await jobsAPI.getJob(id);
        setJob(jobData);
        
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
          setExpenses(modelExpenses.filter(expense => expense.jobId === parseInt(id)));
        }
      } catch (err) {
        setError('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id, isManager, currentUser]);

  const addModelToJob = async () => {
    if (!selectedModel) return;
    
    try {
      await jobsAPI.addModelToJob(id, selectedModel);
      // Refresh job data
      const updatedJob = await jobsAPI.getJob(id);
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

  const removeModelFromJob = async (modelId) => {
    try {
      await jobsAPI.removeModelFromJob(id, modelId);
      // Refresh job data
      const updatedJob = await jobsAPI.getJob(id);
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

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
      setExpenses(modelExpenses.filter(expense => expense.jobId === parseInt(id)));
      
      // Reset form
      setNewExpense({
        jobId: id,
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

  const deleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await jobsAPI.deleteJob(id);
      navigate('/jobs');
    } catch (err) {
      setError('Failed to delete job');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10 text-foreground">Loading job details...</div>;
  
  if (error) return <ErrorMessage error={error} />;
  
  if (!job) return <div className="text-center py-10 text-foreground">Job not found</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Job Details: {job.customer}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/jobs">Back to Jobs</Link>
          </Button>
          {isManager && (
            <Button variant="destructive" onClick={deleteJob}>
              Delete Job
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Job Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-secondary/20 p-4 rounded-md">
              <p className="mb-1 text-muted-foreground">
                <span className="font-medium text-foreground">Customer:</span> {job.customer}
              </p>
              <p className="mb-1 text-muted-foreground">
                <span className="font-medium text-foreground">Start Date:</span> {formatDate(job.startDate)}
              </p>
              <p className="mb-1 text-muted-foreground">
                <span className="font-medium text-foreground">Duration:</span> {job.days} day{job.days !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-secondary/20 p-4 rounded-md">
              <p className="mb-1 text-muted-foreground">
                <span className="font-medium text-foreground">Location:</span> {job.location}
              </p>
              {job.comments && (
                <p className="mb-1 text-muted-foreground">
                  <span className="font-medium text-foreground">Comments:</span> {job.comments}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Models</h2>
          
          {job.models && job.models.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {job.models.map((model, idx) => (
                    <tr key={model.id || model.modelId} className={cn("border-b border-border", idx % 2 === 0 ? "bg-card" : "bg-secondary/10")}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {model.firstName} {model.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {model.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/models/${model.id || model.modelId}`}>
                              View Model
                            </Link>
                          </Button>
                          {isManager && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeModelFromJob(model.id || model.modelId)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="bg-secondary/20 p-4 rounded-md text-muted-foreground">No models assigned to this job yet.</p>
          )}
          
          {isManager && (
            <div className="mt-4 flex space-x-2">
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select model to add</option>
                {availableModels.map(model => (
                  <option key={model.id} value={model.id} className="bg-background text-foreground">
                    {model.firstName} {model.lastName} ({model.email})
                  </option>
                ))}
              </select>
              <Button onClick={addModelToJob} disabled={!selectedModel}>
                Add Model
              </Button>
            </div>
          )}
        </div>
        
        {!isManager && currentUser?.modelId && (
          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Expenses</h2>
            
            {expenses.length > 0 ? (
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense, idx) => (
                      <tr key={expense.id} className={cn("border-b border-border", idx % 2 === 0 ? "bg-card" : "bg-secondary/10")}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          ${expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {expense.text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteExpense(expense.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="bg-secondary/20 p-4 rounded-md mb-6 text-muted-foreground">No expenses recorded for this job.</p>
            )}
            
            <div className="bg-card shadow border border-border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3 text-foreground">Add Expense</h3>
              <form onSubmit={addExpense} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Date
                    </label>
                    <Input
                      type="date"
                      name="date"
                      required
                      value={newExpense.date}
                      onChange={handleExpenseChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Amount ($)
                    </label>
                    <Input
                      type="number"
                      name="amount"
                      required
                      step="0.01"
                      min="0"
                      value={newExpense.amount}
                      onChange={handleExpenseChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    name="text"
                    required
                    value={newExpense.text}
                    onChange={handleExpenseChange}
                    className={cn(
                      "flex w-full rounded-md border border-input bg-background px-3 py-2",
                      "text-sm ring-offset-background",
                      "placeholder:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    rows="2"
                  ></textarea>
                </div>
                <Button type="submit">Add Expense</Button>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 