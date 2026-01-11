import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Expense, ExpenseCategory } from '@/types';

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date, formatStr = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculateMonthlyExpenses = (expenses: Expense[], year: number, month: number): number => {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  
  return expenses
    .filter((expense) => {
      const expenseDate = parseISO(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    })
    .reduce((total, expense) => total + expense.amount, 0);
};

export const calculateMonthlySavings = (income: number, expenses: Expense[], year: number, month: number): number => {
  const monthlyExpenses = calculateMonthlyExpenses(expenses, year, month);
  return Math.max(0, income - monthlyExpenses);
};

export const getExpensesByCategory = (expenses: Expense[], category: ExpenseCategory): Expense[] => {
  return expenses.filter((expense) => expense.category === category);
};

export const getCategoryTotal = (expenses: Expense[], category: ExpenseCategory): number => {
  return getExpensesByCategory(expenses, category).reduce(
    (total, expense) => total + expense.amount,
    0
  );
};

export const getCategoryPercentages = (expenses: Expense[]): Array<{ category: ExpenseCategory; amount: number; percentage: number }> => {
  const total = calculateTotalExpenses(expenses);
  if (total === 0) return [];

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category: category as ExpenseCategory,
    amount,
    percentage: (amount / total) * 100,
  }));
};

export const getDailyExpenses = (expenses: Expense[]): Array<{ date: string; amount: number }> => {
  const dailyTotals = expenses.reduce((acc, expense) => {
    const date = format(parseISO(expense.date), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dailyTotals)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getTopSpendingCategories = (expenses: Expense[], limit = 5): Array<{ category: ExpenseCategory; amount: number; percentage: number }> => {
  const categoryPercentages = getCategoryPercentages(expenses);
  return categoryPercentages
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};

export const getAverageDailySpend = (expenses: Expense[], year: number, month: number): number => {
  const monthlyExpenses = calculateMonthlyExpenses(expenses, year, month);
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(new Date(year, month - 1)),
    end: endOfMonth(new Date(year, month - 1)),
  }).length;
  
  return monthlyExpenses / daysInMonth;
};
