import { create } from 'zustand';
import { Expense } from '@/types';
import { getExpensesByUser } from '@/services/expenseService';
import { useAuthStore } from './useAuthStore';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;

  currency: string;
  setCurrency: (currency: string) => void;

  monthlyIncome: number;
  setMonthlyIncome: (amount: number) => void;

  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  clearExpenses: () => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  loading: false,
  error: null,

  currency: 'USD',
  setCurrency: (currency) => set({ currency }),

  monthlyIncome: 0,
  setMonthlyIncome: (amount) => set({ monthlyIncome: amount }),

  fetchExpenses: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ expenses: [], loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      const expenses = await getExpensesByUser(user.uid);
      set({ expenses, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addExpense: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),

  updateExpense: (id, updates) =>
    set((state) => ({
      expenses: state.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    })),

  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((exp) => exp.id !== id),
    })),

  clearExpenses: () => set({ expenses: [] }),
}));