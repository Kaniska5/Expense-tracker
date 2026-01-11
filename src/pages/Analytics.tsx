import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { formatCurrency, getCategoryPercentages, getDailyExpenses, getAverageDailySpend, calculateMonthlyExpenses } from '@/utils/helpers';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CATEGORIES } from '@/config/categories';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

const COLORS = ['#ec4899', '#8b5cf6', '#708670', '#0ea5e9', '#f97316', '#a78bfa', '#f472b6', '#d5cbb2', '#9ca3af'];

export const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const { expenses, loading, fetchExpenses } = useExpenseStore();
  const [currentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(format(currentDate, 'yyyy-MM'));
  const [year, month] = selectedMonth.split('-').map(Number);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const currentMonthExpenses = expenses.filter((e) => {
    const expenseDate = parseISO(e.date);
    return format(expenseDate, 'yyyy-MM') === selectedMonth;
  });

  const previousMonth = subMonths(new Date(year, month - 1), 1);
  const previousMonthExpenses = expenses.filter((e) => {
    const expenseDate = parseISO(e.date);
    return format(expenseDate, 'yyyy-MM') === format(previousMonth, 'yyyy-MM');
  });

  const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const previousTotal = previousMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  const categoryPercentages = getCategoryPercentages(currentMonthExpenses);
  const pieChartData = categoryPercentages.map((item) => ({
    name: CATEGORIES[item.category].name,
    value: item.amount,
    color: COLORS[categoryPercentages.indexOf(item) % COLORS.length],
  }));

  const dailyExpenses = getDailyExpenses(currentMonthExpenses);
  const barChartData = dailyExpenses.map((item) => ({
    date: format(parseISO(item.date), 'MMM dd'),
    amount: item.amount,
  }));

  const averageDaily = getAverageDailySpend(expenses, year, month);
  const highestDay = dailyExpenses.reduce((max, day) => 
    day.amount > max.amount ? day : max, 
    dailyExpenses[0] || { date: '', amount: 0 }
  );

  const categoryChanges = categoryPercentages.map((current) => {
    const previous = previousMonthExpenses
      .filter((e) => e.category === current.category)
      .reduce((sum, e) => sum + e.amount, 0);
    const change = previous > 0 ? ((current.amount - previous) / previous) * 100 : 0;
    return {
      category: current.category,
      name: CATEGORIES[current.category].name,
      change,
    };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">
            Understand your spending patterns and make better decisions 💗
          </p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Spending</span>
            <DollarSign className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(currentTotal)}</p>
          <div className="flex items-center gap-1">
            {change > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">{Math.abs(change).toFixed(1)}% increase</span>
              </>
            ) : change < 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">{Math.abs(change).toFixed(1)}% decrease</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">No change</span>
            )}
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Average Daily</span>
            <Calendar className="w-5 h-5 text-lavender-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(averageDaily)}</p>
          <p className="text-xs text-gray-500">Per day this month</p>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Highest Day</span>
            <TrendingUp className="w-5 h-5 text-sage-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {highestDay.amount > 0 ? formatCurrency(highestDay.amount) : 'N/A'}
          </p>
          {highestDay.date && (
            <p className="text-xs text-gray-500">{format(parseISO(highestDay.date), 'MMM dd')}</p>
          )}
        </Card>

        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Transactions</span>
            <Badge>{currentMonthExpenses.length}</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{currentMonthExpenses.length}</p>
          <p className="text-xs text-gray-500">This month</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Distribution</h2>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Spending</h2>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>No expenses this month. Start tracking! 💗</p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Insights</h2>
        {categoryChanges.length > 0 ? (
          <div className="space-y-3">
            {categoryChanges.slice(0, 5).map((item) => {
              const isIncrease = item.change > 0;
              return (
                <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CATEGORIES[item.category].icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {isIncrease ? 'Increased' : 'Decreased'} spending this month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isIncrease ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600">
                          +{Math.abs(item.change).toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          {Math.abs(item.change).toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No insights available yet. Add more expenses! 💗</p>
        )}
      </Card>
    </div>
  );
};
