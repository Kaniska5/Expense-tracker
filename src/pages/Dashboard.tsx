import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { getGreeting, formatCurrency, calculateMonthlyExpenses, getCategoryPercentages, getDailyExpenses, getTopSpendingCategories } from '@/utils/helpers';
import { Card } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CATEGORIES } from '@/config/categories';
import { format, startOfMonth } from 'date-fns';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';

const COLORS = ['#ec4899', '#8b5cf6', '#708670', '#0ea5e9', '#f97316', '#a78bfa', '#f472b6', '#d5cbb2', '#9ca3af'];

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { expenses, loading, fetchExpenses } = useExpenseStore();
  const [currentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const greeting = getGreeting();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'there';
  const monthlyExpenses = calculateMonthlyExpenses(expenses, year, month);
  const categoryPercentages = getCategoryPercentages(
    expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
    })
  );

  const pieChartData = categoryPercentages.map((item) => ({
    name: CATEGORIES[item.category].name,
    value: item.amount,
    color: COLORS[categoryPercentages.indexOf(item) % COLORS.length],
  }));

  const dailyExpenses = getDailyExpenses(
    expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
    })
  );

  const lineChartData = dailyExpenses.slice(-30).map((item) => ({
    date: format(new Date(item.date), 'MMM dd'),
    amount: item.amount,
  }));

  const topCategories = getTopSpendingCategories(
    expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
    }),
    5
  );

  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  const previousMonthlyExpenses = calculateMonthlyExpenses(expenses, previousYear, previousMonth);
  const expenseChange = previousMonthlyExpenses > 0 
    ? ((monthlyExpenses - previousMonthlyExpenses) / previousMonthlyExpenses) * 100 
    : 0;

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {greeting}, {userName} ✨
        </h1>
        <p className="text-gray-600">
          Here's your financial overview for {format(startOfMonth(currentDate), 'MMMM yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</p>
              <p className="text-xs text-gray-500 mt-1">Income - Expenses</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyExpenses)}</p>
              <div className="flex items-center gap-1 mt-1">
                {expenseChange > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-red-500" />
                    <p className="text-xs text-red-600">{Math.abs(expenseChange).toFixed(1)}% increase</p>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-green-600">{Math.abs(expenseChange).toFixed(1)}% decrease</p>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 bg-lavender-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-lavender-600" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Savings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</p>
              <p className="text-xs text-gray-500 mt-1">Set income to track</p>
            </div>
            <div className="p-3 bg-sage-50 rounded-lg">
              <PiggyBank className="w-6 h-6 text-sage-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>No expenses this month. Start tracking! 💗</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Expenses</h2>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ fill: '#ec4899', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>No expenses this month. Start tracking! 💗</p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Top Spending Categories</h2>
          <Link
            to="/analytics"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {topCategories.length > 0 ? (
          <div className="space-y-3">
            {topCategories.map((item) => {
              const category = CATEGORIES[item.category];
              return (
                <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No expenses yet. Add your first expense! 💗</p>
        )}
      </Card>
    </div>
  );
};
