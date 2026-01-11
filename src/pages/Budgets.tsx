import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getBudgetsByUser, createBudget, updateBudget, deleteBudget } from '@/services/budgetService';
import { getExpensesByMonth } from '@/services/expenseService';
import { Budget, ExpenseCategory } from '@/types';
import { CATEGORIES, getCategory } from '@/config/categories';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/helpers';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export const Budgets: React.FC = () => {
  const { user } = useAuthStore();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Record<ExpenseCategory, number>>({} as Record<ExpenseCategory, number>);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    if (user) {
      fetchBudgets();
      fetchExpenses();
    }
  }, [user]);

  const fetchBudgets = async () => {
    if (!user) return;
    try {
      const userBudgets = await getBudgetsByUser(user.uid);
      setBudgets(userBudgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const monthlyExpenses = await getExpensesByMonth(user.uid, year, month);
      const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<ExpenseCategory, number>);
      setExpenses(categoryTotals);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleSave = async () => {
    if (!user || !amount) return;

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, { amount: parseFloat(amount) });
      } else {
        await createBudget({
          userId: user.uid,
          category,
          amount: parseFloat(amount),
          period: 'monthly',
        });
      }
      setIsModalOpen(false);
      setEditingBudget(null);
      setAmount('');
      setCategory('food');
      fetchBudgets();
    } catch (error: any) {
      alert(error.message || "We couldn't save your budget. Let's try again! 💗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget? 💗')) return;

    try {
      await deleteBudget(id);
      fetchBudgets();
    } catch (error: any) {
      alert(error.message || "We couldn't delete that budget. Let's try again! 💗");
    }
  };

  const getBudgetStatus = (budget: Budget) => {
    const spent = expenses[budget.category] || 0;
    const percentage = (spent / budget.amount) * 100;
    const remaining = budget.amount - spent;

    if (percentage >= 100) {
      return {
        status: 'exceeded',
        message: "You're slightly over — let's adjust together 💗",
        color: 'text-red-600 bg-red-50',
        progressColor: 'bg-red-500',
      };
    } else if (percentage >= 80) {
      return {
        status: 'warning',
        message: 'You\'re close to your limit — you\'ve got this! 💪',
        color: 'text-yellow-600 bg-yellow-50',
        progressColor: 'bg-yellow-500',
      };
    } else {
      return {
        status: 'good',
        message: 'You\'re doing great! Keep it up 🌟',
        color: 'text-green-600 bg-green-50',
        progressColor: 'bg-green-500',
      };
    }
  };

  const categoryOptions = (Object.keys(CATEGORIES) as ExpenseCategory[]).map((cat) => ({
    value: cat,
    label: `${CATEGORIES[cat].icon} ${CATEGORIES[cat].name}`,
  }));

  const budgetCategories = budgets.map((b) => b.category);
  const availableCategories = (Object.keys(CATEGORIES) as ExpenseCategory[]).filter(
    (cat) => !budgetCategories.includes(cat) || (editingBudget && editingBudget.category === cat)
  );

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budgets</h1>
          <p className="text-gray-600">
            Set monthly budgets and track your spending — no judgment, just awareness 💗
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBudget(null);
            setAmount('');
            setCategory('food');
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <CheckCircle className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No budgets yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first budget to start tracking your spending goals! 💗
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const spent = expenses[budget.category] || 0;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const remaining = budget.amount - spent;
            const status = getBudgetStatus(budget);
            const category = getCategory(budget.category);

            return (
              <Card key={budget.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">Monthly budget</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingBudget(budget);
                        setAmount(budget.amount.toString());
                        setCategory(budget.category);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Edit budget"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Delete budget"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {formatCurrency(spent)} of {formatCurrency(budget.amount)}
                    </span>
                    <span className={`text-sm font-medium ${status.color} px-2 py-1 rounded-full`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${status.progressColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${status.color} mb-2`}>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {status.status === 'exceeded' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {status.message}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {remaining >= 0 ? (
                      <>
                        <span className="text-green-600 font-medium">{formatCurrency(remaining)}</span> remaining
                      </>
                    ) : (
                      <>
                        <span className="text-red-600 font-medium">{formatCurrency(Math.abs(remaining))}</span> over
                      </>
                    )}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
          setAmount('');
          setCategory('food');
        }}
        title={editingBudget ? 'Edit Budget' : 'New Budget'}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setEditingBudget(null);
                setAmount('');
                setCategory('food');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!amount || parseFloat(amount) <= 0}>
              {editingBudget ? 'Update' : 'Create'} Budget
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            options={editingBudget 
              ? categoryOptions 
              : categoryOptions.filter((opt) => availableCategories.includes(opt.value as ExpenseCategory))
            }
            disabled={!!editingBudget}
            required
          />

          <Input
            type="number"
            label="Monthly Budget Amount"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            step="0.01"
            min="0.01"
            autoFocus
          />

          {editingBudget && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              💡 You can only change the amount for existing budgets. Create a new budget for a different category.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
