export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string
  paymentMethod: PaymentMethod;
  notes?: string;
  tags?: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Budget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  period: 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  currency: string;

  // ✅ Optional so old backend data doesn't crash app
  monthlyIncome?: number;

  weekStart: 'monday' | 'sunday';
  monthStart: number; // 1-28
  theme: 'light' | 'dark' | 'pastel';

  notifications: {
    budgetAlerts: boolean;
    goalMilestones: boolean;
    weeklyReport: boolean;
  };

  categories: ExpenseCategory[];
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'rent'
  | 'utilities'
  | 'health'
  | 'entertainment'
  | 'education'
  | 'misc';

export type PaymentMethod =
  | 'cash'
  | 'debit'
  | 'credit'
  | 'digital'
  | 'other';

export interface CategoryConfig {
  id: ExpenseCategory;
  name: string;
  icon: string;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}