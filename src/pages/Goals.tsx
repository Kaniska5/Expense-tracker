import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getGoalsByUser, createGoal, updateGoal, deleteGoal } from '@/services/goalService';
import { Goal } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils/helpers';
import { Plus, Edit2, Trash2, Target, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const GOAL_TEMPLATES = [
  { name: 'Emergency Fund', target: 5000, description: 'Build a safety net' },
  { name: 'Vacation', target: 2000, description: 'Your dream trip' },
  { name: 'New Gadget', target: 1500, description: 'Latest tech' },
  { name: 'Education', target: 3000, description: 'Invest in yourself' },
  { name: 'Custom Goal', target: 0, description: 'Your personal goal' },
];

export const Goals: React.FC = () => {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const userGoals = await getGoalsByUser(user.uid);
      setGoals(userGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !name || !targetAmount) return;

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          name,
          targetAmount: parseFloat(targetAmount),
          currentAmount: parseFloat(currentAmount || '0'),
          deadline: deadline || undefined,
        });
      } else {
        await createGoal({
          userId: user.uid,
          name,
          targetAmount: parseFloat(targetAmount),
          currentAmount: parseFloat(currentAmount || '0'),
          deadline: deadline || undefined,
        });
      }
      setIsModalOpen(false);
      setEditingGoal(null);
      resetForm();
      fetchGoals();
    } catch (error: any) {
      alert(error.message || "We couldn't save your goal. Let's try again! 💗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal? 💗')) return;

    try {
      await deleteGoal(id);
      fetchGoals();
    } catch (error: any) {
      alert(error.message || "We couldn't delete that goal. Let's try again! 💗");
    }
  };

  const handleUpdateProgress = async (goal: Goal, newAmount: number) => {
    try {
      await updateGoal(goal.id, { currentAmount: newAmount });
      fetchGoals();
    } catch (error: any) {
      alert(error.message || "We couldn't update your goal. Let's try again! 💗");
    }
  };

  const useTemplate = (template: typeof GOAL_TEMPLATES[0]) => {
    setName(template.name === 'Custom Goal' ? '' : template.name);
    setTargetAmount(template.target.toString());
    setCurrentAmount('0');
    setDeadline('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
  };

  const getProgressPercentage = (goal: Goal): number => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getMonthlyContribution = (goal: Goal): number => {
    if (!goal.deadline) return 0;
    const deadlineDate = parseISO(goal.deadline);
    const now = new Date();
    const monthsLeft = Math.max(
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30),
      1
    );
    const remaining = goal.targetAmount - goal.currentAmount;
    return remaining / monthsLeft;
  };

  const getGoalStatus = (goal: Goal): { message: string; color: string } => {
    const percentage = getProgressPercentage(goal);
    if (percentage >= 100) {
      return {
        message: '🎉 Congratulations! You reached your goal!',
        color: 'text-green-600 bg-green-50',
      };
    } else if (percentage >= 75) {
      return {
        message: 'You\'re almost there! Keep going! 💪',
        color: 'text-blue-600 bg-blue-50',
      };
    } else if (percentage >= 50) {
      return {
        message: 'Halfway there — you\'ve got this! 🌟',
        color: 'text-primary-600 bg-primary-50',
      };
    } else {
      return {
        message: 'Every step counts — you\'re doing great! 💗',
        color: 'text-gray-600 bg-gray-50',
      };
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Goals</h1>
          <p className="text-gray-600">
            Set financial goals and track your progress — every milestone matters 💗
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null);
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="text-center py-12 mb-6">
          <Target className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No goals yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first goal and start saving toward your dreams! ✨
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {goals.map((goal) => {
            const percentage = getProgressPercentage(goal);
            const remaining = goal.targetAmount - goal.currentAmount;
            const status = getGoalStatus(goal);
            const monthlyContribution = getMonthlyContribution(goal);

            return (
              <Card key={goal.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{goal.name}</h3>
                    {goal.deadline && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(goal.deadline), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setName(goal.name);
                        setTargetAmount(goal.targetAmount.toString());
                        setCurrentAmount(goal.currentAmount.toString());
                        setDeadline(goal.deadline || '');
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Edit goal"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Delete goal"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-lavender-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-lg mb-3 ${status.color}`}>
                  <p className="text-sm font-medium">{status.message}</p>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600">
                    {remaining > 0 ? (
                      <>
                        <span className="font-medium text-gray-900">{formatCurrency(remaining)}</span> remaining
                      </>
                    ) : (
                      <span className="font-medium text-green-600">Goal achieved! 🎉</span>
                    )}
                  </span>
                </div>

                {monthlyContribution > 0 && remaining > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    💡 Save about <span className="font-medium">{formatCurrency(monthlyContribution)}</span> per month to reach your goal
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Add amount"
                      value=""
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          handleUpdateProgress(goal, goal.currentAmount + value);
                          e.target.value = '';
                        }
                      }}
                      className="flex-1"
                      step="0.01"
                      min="0.01"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const amount = prompt(`Add to "${goal.name}" (enter amount):`);
                        if (amount) {
                          const value = parseFloat(amount);
                          if (!isNaN(value) && value > 0) {
                            handleUpdateProgress(goal, goal.currentAmount + value);
                          }
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Goal Templates</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Start with a template or create your own custom goal ✨
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {GOAL_TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => useTemplate(template)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
              <div className="text-sm text-gray-600 mb-2">{template.description}</div>
              {template.target > 0 && (
                <div className="text-sm font-medium text-primary-600">
                  {formatCurrency(template.target)}
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
          resetForm();
        }}
        title={editingGoal ? 'Edit Goal' : 'New Goal'}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setEditingGoal(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name || !targetAmount || parseFloat(targetAmount) <= 0}>
              {editingGoal ? 'Update' : 'Create'} Goal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Goal Name"
            placeholder="e.g., Emergency Fund, Vacation"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            type="number"
            label="Target Amount"
            placeholder="0.00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
            step="0.01"
            min="0.01"
          />

          <Input
            type="number"
            label="Current Amount (Optional)"
            placeholder="0.00"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            step="0.01"
            min="0"
          />

          <Input
            type="date"
            label="Deadline (Optional)"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
      </Modal>
    </div>
  );
};
