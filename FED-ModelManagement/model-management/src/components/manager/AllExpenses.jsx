import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { expensesAPI, modelsAPI } from '../../services/api';
import { cn } from '../../utils/cn';
import Button from '../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';

export default function AllExpenses() {
  const { isManager } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAllExpenses() {
      if (!isManager) {
        setError('Only managers can access this page');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Fetch all models first to have their data ready
        const modelsData = await modelsAPI.getAllModels();
        const modelsMap = {};
        modelsData.forEach(model => {
          modelsMap[model.id] = model;
        });
        
        // Now fetch expenses
        const expensesData = await expensesAPI.getAllExpenses();
        
        // Enrich expenses with model data when available
        const enrichedExpenses = expensesData.map(expense => {
          const model = modelsMap[expense.modelId];
          return {
            ...expense,
            modelName: model ? `${model.firstName} ${model.lastName}` : `Model #${expense.modelId}`,
            modelFirstName: model?.firstName || '',
            modelLastName: model?.lastName || ''
          };
        });
        
        setExpenses(enrichedExpenses);
      } catch (err) {
        setError('Failed to fetch expenses data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllExpenses();
  }, [isManager]);

  if (loading) return <div className="text-center py-10 text-foreground">Loading expenses...</div>;
  
  if (error) return <ErrorMessage error={error} />;

  if (!isManager) {
    return (
      <div className="bg-yellow-100/20 border border-yellow-400 text-yellow-400 px-4 py-3 rounded-md mb-4">
        You do not have permission to view all expenses.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Expenses (View Only)</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Note: All expense management has been consolidated to the Model Expenses section. Managers have view-only access.
          </p>
        </div>
        
        {expenses.length === 0 ? (
          <div className="bg-secondary/20 p-6 rounded-lg text-center text-muted-foreground">
            <p>No expenses found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Model
                  </th>
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
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, idx) => (
                  <tr key={expense.id || expense.expenseId} className={cn("border-b border-border", idx % 2 === 0 ? "bg-card" : "bg-secondary/10")}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      <Link 
                        to={`/models/${expense.modelId}/expenses`} 
                        className="text-primary hover:underline"
                      >
                        {expense.modelName || `Model #${expense.modelId}`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      <Link 
                        to={`/jobs/${expense.jobId}`}
                        className="text-primary hover:underline"
                      >
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/models/${expense.modelId}/expenses?jobId=${expense.jobId}`}>
                            View Details
                          </Link>
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