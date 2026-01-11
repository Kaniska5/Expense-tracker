import { UserSettings, ExpenseCategory } from '@/types';
import { storage } from './localStorage';
import { CATEGORIES } from '@/config/categories';

const SETTINGS_STORAGE_KEY = 'settings';

const getSettingsStorage = (): Record<string, UserSettings> => {
  return storage.get<Record<string, UserSettings>>(SETTINGS_STORAGE_KEY) || {};
};

const saveSettingsStorage = (settings: Record<string, UserSettings>): void => {
  storage.set(SETTINGS_STORAGE_KEY, settings);
};

const getDefaultSettings = (userId: string): UserSettings => ({
  userId,
  currency: 'USD',
  weekStart: 'monday',
  monthStart: 1,
  theme: 'pastel',
  notifications: {
    budgetAlerts: true,
    goalMilestones: true,
    weeklyReport: false,
  },
  categories: Object.keys(CATEGORIES) as ExpenseCategory[],
});

export const getSettings = async (userId: string): Promise<UserSettings> => {
  try {
    const allSettings = getSettingsStorage();
    
    if (allSettings[userId]) {
      return allSettings[userId];
    }
    
    // Create default settings if they don't exist
    const defaultSettings = getDefaultSettings(userId);
    allSettings[userId] = defaultSettings;
    saveSettingsStorage(allSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw new Error("We couldn't fetch your settings. Let's try again! 💗");
  }
};

export const updateSettings = async (userId: string, updates: Partial<UserSettings>): Promise<void> => {
  try {
    const allSettings = getSettingsStorage();
    if (!allSettings[userId]) {
      allSettings[userId] = getDefaultSettings(userId);
    }

    allSettings[userId] = {
      ...allSettings[userId],
      ...updates,
    };

    saveSettingsStorage(allSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error("We couldn't update your settings. Let's try again! 💗");
  }
};

export const resetSettings = async (userId: string): Promise<void> => {
  try {
    const allSettings = getSettingsStorage();
    allSettings[userId] = getDefaultSettings(userId);
    saveSettingsStorage(allSettings);
  } catch (error) {
    console.error('Error resetting settings:', error);
    throw new Error("We couldn't reset your settings. Let's try again! 💗");
  }
};
