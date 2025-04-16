import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import Button from '../common/Button';

function JobExpenses({ expenses, job, isLoading, error }) {
  const { isModel, getModelId } = useAuth();
  const currentModelId = getModelId();

  // Check if current model is assigned to this job
  const isAssignedToJob = useMemo(() => {
    if (!isModel || !job || !currentModelId) return false;
    return job.modelId === currentModelId;
  }, [job, isModel, currentModelId]);

  // Determine if we should show the link to manage expenses
  const shouldShowExpenseLink = isModel && isAssignedToJob;

  if (isLoading) {
    return <div className="text-center py-5">Loading expenses...</div>;
  }

  if (error) {
    return (
      <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
        {error}
      </div>
    );
  }

  const hasExpenses = expenses && expenses.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Expenses</h2>
        
        {/* Link to the ModelExpenses page for expense management */}
        {shouldShowExpenseLink && (
          <Button variant="outline" asChild>
            <Link to={`/models/${currentModelId}/expenses?jobId=${job.id}`}>
              Manage Expenses
            </Link>
          </Button>
        )}
      </div>

      {/* Notice about expense management */}
      <div className="bg-blue-100/20 border border-blue-400 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-md mb-4">
        All expense management has been consolidated to the Model Expenses section.
        {shouldShowExpenseLink && " Use the 'Manage Expenses' button to add, edit, or delete expenses for this job."}
      </div>

      {!hasExpenses ? (
        <div className="text-center py-4 text-muted-foreground bg-secondary/20 rounded-md">
          No expenses have been submitted for this job yet.
          {shouldShowExpenseLink && (
            <div className="mt-2">
              <Link to={`/models/${currentModelId}/expenses?jobId=${job.id}`} className="text-primary hover:underline">
                Add Expenses
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Model
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr 
                  key={expense.id || expense.expenseId} 
                  className={cn(
                    "border-b border-border", 
                    index % 2 === 0 ? "bg-card" : "bg-secondary/10"
                  )}
                >
                  <td className="px-4 py-2 text-sm text-foreground">
                    {expense.modelName || (expense.model ? `${expense.model.firstName} ${expense.model.lastName}` : 'Unknown Model')}
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    ${expense.amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {expense.text || 'No description'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {shouldShowExpenseLink && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/models/${currentModelId}/expenses?jobId=${job.id}`}>
                          Manage
                        </Link>
                      </Button>
                    )}
                    {!shouldShowExpenseLink && expense.modelId && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/models/${expense.modelId}/expenses`}>
                          View Details
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

JobExpenses.propTypes = {
  expenses: PropTypes.array,
  job: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

export default JobExpenses; 