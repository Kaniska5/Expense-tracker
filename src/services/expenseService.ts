import { Expense, ExpenseCategory } from '@/types';
import { storage } from './localStorage';
import { parseISO, isWithinInterval, format } from 'date-fns';

const EXPENSES_STORAGE_KEY = 'expenses';

// Get all expenses from storage
const getExpenses = (): Record<string, Expense> => {
  return storage.get<Record<string, Expense>>(EXPENSES_STORAGE_KEY) || {};
};

// Save expenses to storage
const saveExpenses = (expenses: Record<string, Expense>): void => {
  storage.set(EXPENSES_STORAGE_KEY, expenses);
};

// Generate unique ID
const generateId = (): string => {
  return 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const expenses = getExpenses();
    const now = new Date().toISOString();
    const id = generateId();

    const expenseData: Expense = {
      ...expense,
      id,
      createdAt: now,
      updatedAt: now,
    };

    expenses[id] = expenseData;
    saveExpenses(expenses);
    return id;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw new Error("We couldn't save your expense. Let's try again! 💗");
  }
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<void> => {
  try {
    const expenses = getExpenses();
    if (!expenses[id]) {
      throw new Error('Expense not found');
    }

    expenses[id] = {
      ...expenses[id],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveExpenses(expenses);
  } catch (error) {
    console.error('Error updating expense:', error);
    throw new Error("We couldn't update your expense. Let's try again! 💗");
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const expenses = getExpenses();
    if (!expenses[id]) {
      throw new Error('Expense not found');
    }

    delete expenses[id];
    saveExpenses(expenses);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw new Error("We couldn't delete your expense. Let's try again! 💗");
  }
};

export const getExpense = async (id: string): Promise<Expense | null> => {
  try {
    const expenses = getExpenses();
    return expenses[id] || null;
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw new Error("We couldn't fetch your expense. Let's try again! 💗");
  }
};

export const getExpensesByUser = async (userId: string): Promise<Expense[]> => {
  try {
    const expenses = getExpenses();
    const userExpenses = Object.values(expenses).filter((exp) => exp.userId === userId);
    
    // Sort by date descending, then by createdAt descending
    return userExpenses.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw new Error("We couldn't fetch your expenses. Let's try again! 💗");
  }
};

export const getExpensesByMonth = async (userId: string, year: number, month: number): Promise<Expense[]> => {
  try {
    const allExpenses = await getExpensesByUser(userId);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    return allExpenses.filter((expense) => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, { start, end });
    });
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    throw new Error("We couldn't fetch your monthly expenses. Let's try again! 💗");
  }
};

export const getExpensesByCategory = async (
  userId: string,
  category: ExpenseCategory
): Promise<Expense[]> => {
  try {
    const allExpenses = await getExpensesByUser(userId);
    return allExpenses.filter((expense) => expense.category === category);
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    throw new Error("We couldn't fetch your expenses. Let's try again! 💗");
  }
};

export const deleteExpenses = async (ids: string[]): Promise<void> => {
  try {
    await Promise.all(ids.map((id) => deleteExpense(id)));
  } catch (error) {
    console.error('Error deleting expenses:', error);
    throw new Error("We couldn't delete those expenses. Let's try again! 💗");
  }
};
