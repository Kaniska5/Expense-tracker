import React, { useMemo, useState } from 'react';
import { useExpenseStore } from '@/store/useExpenseStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  calculateTotalExpenses,
  getCategoryPercentages,
  formatCurrency,
} from '@/utils/helpers';
import { CATEGORIES } from '@/config/categories';
import { format } from 'date-fns';

export const Reports: React.FC = () => {
  const { expenses, monthlyIncome, currency } = useExpenseStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<'month' | 'category'>('month');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);

      if (startDate && expenseDate < new Date(startDate)) return false;
      if (endDate && expenseDate > new Date(endDate)) return false;

      return true;
    });
  }, [expenses, startDate, endDate]);

  const totalExpenses = calculateTotalExpenses(filteredExpenses);
  const balance = monthlyIncome - totalExpenses;

  const categoryBreakdown = getCategoryPercentages(filteredExpenses);

  return (
    <div className="page-container space-y-8">
      <h1 className="text-3xl font-bold">Reports</h1>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <Select
            label="Group By"
            value={groupBy}
            onChange={(e) =>
              setGroupBy(e.target.value as 'month' | 'category')
            }
            options={[
              { value: 'month', label: 'Month' },
              { value: 'category', label: 'Category' },
            ]}
          />
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold">
            {formatCurrency(totalExpenses, currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Income</p>
          <p className="text-2xl font-bold">
            {formatCurrency(monthlyIncome, currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Balance</p>
          <p
            className={`text-2xl font-bold ${
              balance < 0 ? 'text-red-500' : 'text-green-600'
            }`}
          >
            {formatCurrency(balance, currency)}
          </p>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <h2 className="font-semibold mb-4">Category Breakdown</h2>

        {categoryBreakdown.length > 0 ? (
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.category}
                className="flex justify-between bg-gray-50 p-3 rounded-lg"
              >
                <span>
                  {CATEGORIES[cat.category]?.name || cat.category}
                </span>
                <span>
                  {formatCurrency(cat.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-6">
            No data available for selected range.
          </p>
        )}
      </Card>

      {/* Transaction List */}
      <Card>
        <h2 className="font-semibold mb-4">Transactions</h2>

        {filteredExpenses.length > 0 ? (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {CATEGORIES[expense.category]?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </p>
                </div>

                <p className="font-semibold">
                  {formatCurrency(expense.amount, currency)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-6">
            No transactions found.
          </p>
        )}
      </Card>
    </div>
  );
};