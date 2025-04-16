import { Link } from 'react-router-dom';
import useModelExpenses from '../hooks/useModelExpenses';
import { cn } from '../utils/cn';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';
import Input from './common/Input';

export default function ModelExpenses() {
  const {
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
  } = useModelExpenses();

  if (loading) return <div className="text-center py-10 text-foreground">Loading expenses...</div>;
  
  if (error) return <ErrorMessage error={error} />;

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
            <Link to={`/models/${modelName}/jobs`}>
              View Jobs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
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