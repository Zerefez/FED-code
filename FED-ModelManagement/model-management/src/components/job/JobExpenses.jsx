import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';
import Button from '../common/Button';
import Input from '../common/Input';

export default function JobExpenses({ 
  expenses, 
  newExpense, 
  handleExpenseChange, 
  addExpense, 
  deleteExpense, 
  formatDate 
}) {
  return (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
        <p className="bg-secondary/20 p-4 rounded-md text-muted-foreground mb-6">No expenses submitted for this job yet.</p>
      )}
      
      <div className="bg-secondary/20 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-3 text-foreground">Add New Expense</h3>
        <form onSubmit={addExpense} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1 text-foreground">
                Date
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={newExpense.date}
                onChange={handleExpenseChange}
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
                onChange={handleExpenseChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="text" className="block text-sm font-medium mb-1 text-foreground">
                Description
              </label>
              <Input
                id="text"
                name="text"
                value={newExpense.text}
                onChange={handleExpenseChange}
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
    </div>
  );
}

JobExpenses.propTypes = {
  expenses: PropTypes.array.isRequired,
  newExpense: PropTypes.object.isRequired,
  handleExpenseChange: PropTypes.func.isRequired,
  addExpense: PropTypes.func.isRequired,
  deleteExpense: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired
}; 