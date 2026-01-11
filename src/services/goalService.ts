import { Goal } from '@/types';
import { storage } from './localStorage';

const GOALS_STORAGE_KEY = 'goals';

const getGoals = (): Record<string, Goal> => {
  return storage.get<Record<string, Goal>>(GOALS_STORAGE_KEY) || {};
};

const saveGoals = (goals: Record<string, Goal>): void => {
  storage.set(GOALS_STORAGE_KEY, goals);
};

const generateId = (): string => {
  return 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const goals = getGoals();
    const now = new Date().toISOString();
    const id = generateId();

    const goalData: Goal = {
      ...goal,
      id,
      createdAt: now,
      updatedAt: now,
    };

    goals[id] = goalData;
    saveGoals(goals);
    return id;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw new Error("We couldn't save your goal. Let's try again! 💗");
  }
};

export const updateGoal = async (id: string, updates: Partial<Goal>): Promise<void> => {
  try {
    const goals = getGoals();
    if (!goals[id]) {
      throw new Error('Goal not found');
    }

    goals[id] = {
      ...goals[id],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveGoals(goals);
  } catch (error) {
    console.error('Error updating goal:', error);
    throw new Error("We couldn't update your goal. Let's try again! 💗");
  }
};

export const deleteGoal = async (id: string): Promise<void> => {
  try {
    const goals = getGoals();
    if (!goals[id]) {
      throw new Error('Goal not found');
    }

    delete goals[id];
    saveGoals(goals);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw new Error("We couldn't delete your goal. Let's try again! 💗");
  }
};

export const getGoal = async (id: string): Promise<Goal | null> => {
  try {
    const goals = getGoals();
    return goals[id] || null;
  } catch (error) {
    console.error('Error fetching goal:', error);
    throw new Error("We couldn't fetch your goal. Let's try again! 💗");
  }
};

export const getGoalsByUser = async (userId: string): Promise<Goal[]> => {
  try {
    const goals = getGoals();
    return Object.values(goals).filter((goal) => goal.userId === userId);
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw new Error("We couldn't fetch your goals. Let's try again! 💗");
  }
};
