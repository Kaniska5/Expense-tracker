import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { getSettings, updateSettings, resetSettings } from '@/services/settingsService';
import { UserSettings } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { signOut } from '@/services/authService';
import { Settings as SettingsIcon, LogOut, Download, Upload, RefreshCw, User } from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    try {
      const userSettings = await getSettings(user.uid);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;
    try {
      await updateSettings(user.uid, updates);
      setSettings({ ...settings, ...updates });
    } catch (error: any) {
      alert(error.message || "We couldn't update your settings. Let's try again! 💗");
    }
  };

  const handleReset = async () => {
    if (!user) return;
    try {
      await resetSettings(user.uid);
      fetchSettings();
      setIsResetModalOpen(false);
      alert('Settings have been reset to defaults 💗');
    } catch (error: any) {
      alert(error.message || "We couldn't reset your settings. Let's try again! 💗");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      alert(error.message || "We couldn't sign you out. Let's try again! 💗");
    }
  };

  const exportData = () => {
    // In a real app, you'd export all user data
    alert('Data export feature coming soon! 💗');
  };

  const importData = () => {
    // In a real app, you'd allow users to import CSV/JSON data
    alert('Data import feature coming soon! 💗');
  };

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
  ];

  if (loading || !settings) {
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Customize your expense tracker to fit your preferences 💗
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Account</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <Input
                value={user?.displayName || 'Not set'}
                disabled
                className="bg-gray-50"
              />
            </div>
            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
          </div>
          <div className="space-y-4">
            <Select
              label="Currency"
              value={settings.currency}
              onChange={(e) => handleUpdate({ currency: e.target.value })}
              options={currencies}
            />

            <Select
              label="Week Start"
              value={settings.weekStart}
              onChange={(e) => handleUpdate({ weekStart: e.target.value as 'monday' | 'sunday' })}
              options={[
                { value: 'monday', label: 'Monday' },
                { value: 'sunday', label: 'Sunday' },
              ]}
            />

            <Select
              label="Theme"
              value={settings.theme}
              onChange={(e) => handleUpdate({ theme: e.target.value as 'light' | 'dark' | 'pastel' })}
              options={[
                { value: 'pastel', label: 'Pastel (Default)' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Month Start Day</label>
              <Input
                type="number"
                value={settings.monthStart}
                onChange={(e) => handleUpdate({ monthStart: parseInt(e.target.value) || 1 })}
                min="1"
                max="28"
                helperText="Day of month when monthly budgets reset (1-28)"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Budget Alerts</p>
                <p className="text-sm text-gray-500">Get notified when approaching budget limits</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.budgetAlerts}
                onChange={(e) =>
                  handleUpdate({
                    notifications: { ...settings.notifications, budgetAlerts: e.target.checked },
                  })
                }
                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Goal Milestones</p>
                <p className="text-sm text-gray-500">Celebrate when you reach goal milestones</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.goalMilestones}
                onChange={(e) =>
                  handleUpdate({
                    notifications: { ...settings.notifications, goalMilestones: e.target.checked },
                  })
                }
                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Weekly Report</p>
                <p className="text-sm text-gray-500">Receive weekly spending summaries</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.weeklyReport}
                onChange={(e) =>
                  handleUpdate({
                    notifications: { ...settings.notifications, weeklyReport: e.target.checked },
                  })
                }
                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Data Management</h2>
          <div className="space-y-3">
            <Button variant="outline" onClick={exportData} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export Data (CSV/PDF)
            </Button>
            <Button variant="outline" onClick={importData} className="w-full sm:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsResetModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Settings
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Settings?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReset}>
              Reset Settings
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to reset all settings to defaults? This will not delete your expenses, budgets, or goals. 💗
        </p>
      </Modal>
    </div>
  );
};
