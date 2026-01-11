import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { createExpense } from '@/services/expenseService';
import { ExpenseCategory, PaymentMethod } from '@/types';
import { CATEGORIES, getCategory } from '@/config/categories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';
import { CheckCircle, Plus } from 'lucide-react';

export const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addExpense, expenses } = useExpenseStore();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAddAnother, setShowAddAnother] = useState(false);

  // Get recent categories for suggestions
  const recentCategories = Array.from(
    new Set(expenses.slice(0, 5).map((e) => e.category))
  ).slice(0, 3) as ExpenseCategory[];

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'debit', label: 'Debit Card' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'digital', label: 'Digital Wallet' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();

    if (!user) return;

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      alert("Please enter a valid amount 💗");
      return;
    }

    setIsLoading(true);

    try {
      const expenseId = await createExpense({
        userId: user.uid,
        amount: expenseAmount,
        category,
        date: new Date(date).toISOString(),
        paymentMethod,
        notes: notes.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean) || undefined,
      });

      addExpense({
        id: expenseId,
        userId: user.uid,
        amount: expenseAmount,
        category,
        date: new Date(date).toISOString(),
        paymentMethod,
        notes: notes.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean) || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSuccess(true);
      setShowAddAnother(addAnother);

      if (addAnother) {
        // Reset form but keep category
        setAmount('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setNotes('');
        setTags('');
        setSuccess(false);
        setTimeout(() => setShowAddAnother(false), 2000);
      } else {
        setTimeout(() => {
          navigate('/transactions');
        }, 1500);
      }
    } catch (error: any) {
      alert(error.message || "We couldn't save your expense. Let's try again! 💗");
    } finally {
      setIsLoading(false);
    }
  };

  if (success && !showAddAnother) {
    return (
      <div className="page-container">
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-gentle-bounce" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Expense Added! ✨</h2>
          <p className="text-gray-600 mb-6">Your expense has been saved successfully 💗</p>
          <p className="text-sm text-gray-500">Redirecting to transactions...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Expense</h1>
        <p className="text-gray-600 mb-6">
          Track where your money goes — every expense matters 💗
        </p>

        {success && showAddAnother && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Expense saved! Ready for another? ✨
          </div>
        )}

        <Card>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            <Input
              type="number"
              label="Amount"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
              step="0.01"
              min="0.01"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {(Object.keys(CATEGORIES) as ExpenseCategory[]).map((cat) => {
                  const catData = getCategory(cat);
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 text-center
                        ${isSelected 
                          ? 'border-primary-500 bg-primary-50 shadow-soft' 
                          : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{catData.icon}</div>
                      <div className="text-xs font-medium text-gray-700">{catData.name}</div>
                    </button>
                  );
                })}
              </div>
              {recentCategories.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Recent: {recentCategories.map((c) => CATEGORIES[c].name).join(', ')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={paymentMethods}
                required
              />
            </div>

            <Input
              label="Notes (Optional)"
              placeholder="Add a note about this expense..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />

            <Input
              label="Tags (Optional)"
              placeholder="tag1, tag2, tag3"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              helperText="Separate tags with commas"
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                Save Expense
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isLoading}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save & Add Another
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
