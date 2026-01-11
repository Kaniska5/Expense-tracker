import { CategoryConfig, ExpenseCategory } from '@/types';

export const CATEGORIES: Record<ExpenseCategory, CategoryConfig> = {
  food: {
    id: 'food',
    name: 'Food',
    icon: '🍔',
    color: 'bg-rose-100 text-rose-700',
  },
  transport: {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    color: 'bg-softBlue-100 text-softBlue-700',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: 'bg-primary-100 text-primary-700',
  },
  rent: {
    id: 'rent',
    name: 'Rent',
    icon: '🏠',
    color: 'bg-sage-100 text-sage-700',
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities',
    icon: '⚡',
    color: 'bg-roseGold-100 text-roseGold-700',
  },
  health: {
    id: 'health',
    name: 'Health',
    icon: '🩺',
    color: 'bg-lavender-100 text-lavender-700',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: 'bg-pink-100 text-pink-700',
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: 'bg-beige-100 text-beige-700',
  },
  misc: {
    id: 'misc',
    name: 'Miscellaneous',
    icon: '✨',
    color: 'bg-gray-100 text-gray-700',
  },
};

export const getCategory = (id: ExpenseCategory): CategoryConfig => {
  return CATEGORIES[id];
};

export const getCategoryColor = (id: ExpenseCategory): string => {
  return CATEGORIES[id].color;
};
