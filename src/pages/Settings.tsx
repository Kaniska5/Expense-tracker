import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useNavigate } from 'react-router-dom';
import { getSettings, updateSettings } from '@/services/settingsService';
import { UserSettings } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { signOut } from '@/services/authService';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const { setCurrency, setMonthlyIncome } = useExpenseStore();

  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (user) fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const data = await getSettings(user.uid);

    const safeSettings: UserSettings = {
      ...data,
      monthlyIncome: data.monthlyIncome ?? 0,
    };

    setSettings(safeSettings);

    setCurrency(safeSettings.currency);
    setMonthlyIncome(safeSettings.monthlyIncome ?? 0);
  };

  const handleUpdate = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;

    await updateSettings(user.uid, updates);
    setSettings((prev) => prev ? { ...prev, ...updates } : prev);
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    navigate('/login');
  };

  if (!settings) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <div className="page-container space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Account */}
      <Card>
        <h2 className="font-semibold mb-4">Account</h2>
        <Input value={user?.email || ''} disabled />
        <div className="mt-4">
          <Button onClick={handleLogout}>Sign Out</Button>
        </div>
      </Card>

      {/* Financial Settings */}
      <Card>
        <h2 className="font-semibold mb-4">Financial Preferences</h2>

        <Select
          label="Currency"
          value={settings.currency}
          onChange={(e) => {
            const newCurrency = e.target.value;
            handleUpdate({ currency: newCurrency });
            setCurrency(newCurrency);
          }}
          options={[
            { value: 'USD', label: 'USD ($)' },
            { value: 'INR', label: 'INR (₹)' },
            { value: 'EUR', label: 'EUR (€)' },
          ]}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Monthly Income
          </label>
          <Input
            type="number"
            value={settings.monthlyIncome ?? 0}
            onChange={(e) => {
              const income = parseFloat(e.target.value) || 0;
              handleUpdate({ monthlyIncome: income });
              setMonthlyIncome(income);
            }}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Month Start Day
          </label>
          <Input
            type="number"
            min="1"
            max="28"
            value={settings.monthStart}
            onChange={(e) =>
              handleUpdate({ monthStart: parseInt(e.target.value) || 1 })
            }
          />
        </div>
      </Card>

      {/* Display Settings */}
      <Card>
        <h2 className="font-semibold mb-4">Display Preferences</h2>

        <Select
          label="Week Start"
          value={settings.weekStart}
          onChange={(e) =>
            handleUpdate({
              weekStart: e.target.value as 'monday' | 'sunday',
            })
          }
          options={[
            { value: 'monday', label: 'Monday' },
            { value: 'sunday', label: 'Sunday' },
          ]}
        />

        <Select
          label="Theme"
          value={settings.theme}
          onChange={(e) =>
            handleUpdate({
              theme: e.target.value as 'light' | 'dark' | 'pastel',
            })
          }
          options={[
            { value: 'pastel', label: 'Pastel' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </Card>

      {/* Notifications */}
      <Card>
        <h2 className="font-semibold mb-4">Notifications</h2>

        {(['budgetAlerts', 'goalMilestones', 'weeklyReport'] as const).map(
          (key) => (
            <label
              key={key}
              className="flex justify-between items-center py-2"
            >
              <span className="capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <input
                type="checkbox"
                checked={settings.notifications[key]}
                onChange={(e) =>
                  handleUpdate({
                    notifications: {
                      ...settings.notifications,
                      [key]: e.target.checked,
                    },
                  })
                }
              />
            </label>
          )
        )}
      </Card>
    </div>
  );
};