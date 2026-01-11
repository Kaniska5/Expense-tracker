import { Budget } from '@/types';
import { storage } from './localStorage';

const BUDGETS_STORAGE_KEY = 'budgets';

const getBudgets = (): Record<string, Budget> => {
  return storage.get<Record<string, Budget>>(BUDGETS_STORAGE_KEY) || {};
};

const saveBudgets = (budgets: Record<string, Budget>): void => {
  storage.set(BUDGETS_STORAGE_KEY, budgets);
};

const generateId = (): string => {
  return 'budget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const createBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const budgets = getBudgets();
    const now = new Date().toISOString();
    const id = generateId();

    const budgetData: Budget = {
      ...budget,
      id,
      createdAt: now,
      updatedAt: now,
    };

    budgets[id] = budgetData;
    saveBudgets(budgets);
    return id;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw new Error("We couldn't save your budget. Let's try again! 💗");
  }
};

export const updateBudget = async (id: string, updates: Partial<Budget>): Promise<void> => {
  try {
    const budgets = getBudgets();
    if (!budgets[id]) {
      throw new Error('Budget not found');
    }

    budgets[id] = {
      ...budgets[id],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveBudgets(budgets);
  } catch (error) {
    console.error('Error updating budget:', error);
    throw new Error("We couldn't update your budget. Let's try again! 💗");
  }
};

export const deleteBudget = async (id: string): Promise<void> => {
  try {
    const budgets = getBudgets();
    if (!budgets[id]) {
      throw new Error('Budget not found');
    }

    delete budgets[id];
    saveBudgets(budgets);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw new Error("We couldn't delete your budget. Let's try again! 💗");
  }
};

export const getBudget = async (id: string): Promise<Budget | null> => {
  try {
    const budgets = getBudgets();
    return budgets[id] || null;
  } catch (error) {
    console.error('Error fetching budget:', error);
    throw new Error("We couldn't fetch your budget. Let's try again! 💗");
  }
};

export const getBudgetsByUser = async (userId: string): Promise<Budget[]> => {
  try {
    const budgets = getBudgets();
    return Object.values(budgets).filter(
      (budget) => budget.userId === userId && budget.period === 'monthly'
    );
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw new Error("We couldn't fetch your budgets. Let's try again! 💗");
  }
};
