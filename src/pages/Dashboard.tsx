import React, { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import {
  calculateMonthlyExpenses,
  getCategoryPercentages,
  getDailyExpenses,
  getTopSpendingCategories,
  formatCurrency,
} from '@/utils/helpers';
import { Card } from '@/components/ui/Card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CATEGORIES } from '@/config/categories';
import { format, startOfMonth } from 'date-fns';

const COLORS = ['#ec4899', '#8b5cf6', '#0ea5e9', '#f97316', '#10b981', '#a855f7'];

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    expenses,
    fetchExpenses,
    currency,
    monthlyIncome,
  } = useExpenseStore();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const monthlyExpenses = useMemo(
    () => calculateMonthlyExpenses(expenses, year, month),
    [expenses, year, month]
  );

  const balance = monthlyIncome - monthlyExpenses;
  const savings = balance > 0 ? balance : 0;

  const monthlyFiltered = useMemo(
    () =>
      expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      }),
    [expenses, year, month]
  );

  const categoryData = getCategoryPercentages(monthlyFiltered);
  const pieData = categoryData.map((item, index) => ({
    name: CATEGORIES[item.category].name,
    value: item.amount,
    color: COLORS[index % COLORS.length],
  }));

  const dailyData = getDailyExpenses(monthlyFiltered).map((d) => ({
    date: format(new Date(d.date), 'MMM dd'),
    amount: d.amount,
  }));

  const topCategories = getTopSpendingCategories(monthlyFiltered, 5);

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {user?.displayName || 'User'} 👋
        </h1>
        <p className="text-gray-500">
          Overview for {format(startOfMonth(now), 'MMMM yyyy')}
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-500">Monthly Income</p>
          <p className="text-2xl font-bold">
            {formatCurrency(monthlyIncome, currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Monthly Expenses</p>
          <p className="text-2xl font-bold">
            {formatCurrency(monthlyExpenses, currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-2xl font-bold">
            {formatCurrency(balance, currency)}
          </p>
          <p className="text-xs text-gray-400">
            Savings: {formatCurrency(savings, currency)}
          </p>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-4">Category Breakdown</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">
              No expenses this month.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Daily Expenses</h2>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#ec4899"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">
              No daily data available.
            </p>
          )}
        </Card>
      </div>

      {/* TOP CATEGORIES */}
      <Card>
        <h2 className="font-semibold mb-4">Top Spending Categories</h2>
        {topCategories.length > 0 ? (
          <div className="space-y-3">
            {topCategories.map((cat) => (
              <div
                key={cat.category}
                className="flex justify-between bg-gray-50 p-3 rounded-lg"
              >
                <span>{CATEGORIES[cat.category].name}</span>
                <span>
                  {formatCurrency(cat.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-6">
            No categories yet.
          </p>
        )}
      </Card>
    </div>
  );
};