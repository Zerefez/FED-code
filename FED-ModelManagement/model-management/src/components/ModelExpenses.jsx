import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, modelsAPI } from '../services/api';
import { cn } from '../utils/cn';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';

export default function ModelExpenses() {
  const { id } = useParams();
  const { isManager, currentUser, isModel, getModelId } = useAuth();
  const [model, setModel] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        
        // Get the correct model ID
        const currentModelId = getModelId();
        console.log('ModelExpenses: Current model ID:', currentModelId);
        
        // Permission check - only allow if user is a manager or this is their own model ID
        const hasPermission = isManager || 
          (isModel && currentModelId && 
            (String(currentModelId) === String(id) || 
             currentUser?.email?.toLowerCase() === id?.toLowerCase()));
        
        if (!hasPermission) {
          console.log('ModelExpenses: Permission denied', { 
            isManager, 
            isModel,
            currentModelId,
            requestedModelId: id 
          });
          setError('You do not have permission to view these expenses');
          setLoading(false);
          return;
        }
        
        // Get model info first
        let modelData;
        let modelId = id;
        
        if (isModel && !isManager) {
          // If this is a model user, ensure they can only view their own expenses
          modelId = currentModelId;
          console.log(`ModelExpenses: Model viewing own expenses with ID: ${modelId}`);
          modelData = await modelsAPI.getModel(modelId);
        } else {
          // Managers can view any model's expenses
          console.log(`ModelExpenses: Manager viewing expenses for model ID: ${id}`);
          modelData = await modelsAPI.getModel(id);
        }
        
        setModel(modelData);
        
        // Then get expenses
        const expensesData = await expensesAPI.getModelExpenses(modelId);
        setExpenses(expensesData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id, isManager, currentUser, isModel, getModelId]);

  // Check if the user is allowed to view expenses
  const canViewExpenses = isManager || (
    isModel && (
      String(getModelId()) === String(id) || 
      currentUser?.email?.toLowerCase() === id?.toLowerCase()
    )
  );

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

  if (loading) return <div className="text-center py-10 text-foreground">Loading expenses...</div>;
  
  if (error) return <ErrorMessage error={error} />;

  if (!model) return <div className="text-center py-10 text-foreground">Model not found</div>;

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
        <CardTitle>Expenses for {model.firstName} {model.lastName}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/models/${isModel && !isManager ? getModelId() : id}/jobs`}>
              View Jobs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={isManager ? "/models" : "/dashboard"}>
              {isManager ? "Back to Models" : "Back to Dashboard"}
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Model Information</h2>
          <div className="bg-secondary/20 p-4 rounded-md mb-4">
            <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Name:</span> {model.firstName} {model.lastName}</p>
            <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Email:</span> {model.email}</p>
            {model.phoneNo && (
              <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Phone:</span> {model.phoneNo}</p>
            )}
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-3 text-foreground">Expenses</h2>
        
        {expenses.length === 0 ? (
          <p className="bg-secondary/20 p-4 rounded-md text-muted-foreground">No expenses recorded for this model.</p>
        ) : (
          <div className="overflow-x-auto">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, idx) => (
                  <tr key={expense.id} className={cn("border-b border-border", idx % 2 === 0 ? "bg-card" : "bg-secondary/10")}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {expense.jobCustomer || `Job #${expense.jobId}`}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/jobs/${expense.jobId}`}>
                            View Job
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deleteExpense(expense.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 