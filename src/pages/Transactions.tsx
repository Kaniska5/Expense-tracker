import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { deleteExpense, updateExpense } from '@/services/expenseService';
import { Expense, ExpenseCategory, PaymentMethod } from '@/types';
import { CATEGORIES, getCategory } from '@/config/categories';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Edit2, Trash2, Search, Filter, X } from 'lucide-react';

export const Transactions: React.FC = () => {
  const { user } = useAuthStore();
  const { expenses, loading, fetchExpenses, removeExpense, updateExpense: updateExpenseStore } = useExpenseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...(Object.keys(CATEGORIES) as ExpenseCategory[]).map((cat) => ({
      value: cat,
      label: CATEGORIES[cat].name,
    })),
  ];

  const paymentOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'debit', label: 'Debit Card' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'digital', label: 'Digital Wallet' },
    { value: 'other', label: 'Other' },
  ];

  const filteredExpenses = expenses.filter((expense) => {
    if (searchQuery && !expense.notes?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) {
      return false;
    }
    if (paymentFilter !== 'all' && expense.paymentMethod !== paymentFilter) {
      return false;
    }
    if (dateFilter) {
      const expenseDate = format(parseISO(expense.date), 'yyyy-MM');
      if (expenseDate !== dateFilter) {
        return false;
      }
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      removeExpense(id);
      setIsDeleteModalOpen(false);
      setSelectedExpense(null);
    } catch (error: any) {
      alert(error.message || "We couldn't delete that expense. Let's try again! 💗");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      const idsArray = Array.from(selectedIds);
      await Promise.all(idsArray.map((id) => deleteExpense(id)));
      idsArray.forEach((id) => removeExpense(id));
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
    } catch (error: any) {
      alert(error.message || "We couldn't delete those expenses. Let's try again! 💗");
    }
  };

  const handleEdit = async (updates: Partial<Expense>) => {
    if (!selectedExpense) return;

    try {
      await updateExpense(selectedExpense.id, updates);
      updateExpenseStore(selectedExpense.id, updates);
      setIsEditModalOpen(false);
      setSelectedExpense(null);
    } catch (error: any) {
      alert(error.message || "We couldn't update that expense. Let's try again! 💗");
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setDateFilter('');
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || paymentFilter !== 'all' || dateFilter;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">
          View and manage all your expenses in one place 💗
        </p>
      </div>

      <Card className="mb-6 sticky top-0 z-10 bg-white">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'all')}
              options={categoryOptions}
            />

            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentMethod | 'all')}
              options={paymentOptions}
            />

            <Input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by month"
            />
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <span className="text-sm font-medium text-primary-700">
                {selectedIds.size} expense{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsBulkDeleteOpen(true)}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading transactions...</div>
      ) : filteredExpenses.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {hasActiveFilters ? "No transactions match your filters 💗" : "No transactions yet. Add your first expense! ✨"}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const category = getCategory(expense.category);
            const isSelected = selectedIds.has(expense.id);

            return (
              <Card
                key={expense.id}
                className={isSelected ? 'ring-2 ring-primary-500' : ''}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(expense.id)}
                    className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                    ${category.color}
                  `}>
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-500">{formatDate(expense.date)}</span>
                      <Badge size="sm">{expense.paymentMethod}</Badge>
                      {expense.notes && (
                        <span className="text-sm text-gray-600 truncate">• {expense.notes}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedExpense(expense);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Edit expense"
                    >
                      <Edit2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedExpense(expense);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedExpense(null);
        }}
        title="Edit Expense"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedExpense(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedExpense) {
                  // In a real app, you'd have form inputs here
                  // For now, we'll just close the modal
                  setIsEditModalOpen(false);
                  setSelectedExpense(null);
                }
              }}
            >
              Save Changes
            </Button>
          </>
        }
      >
        {selectedExpense && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Editing expense for {formatCurrency(selectedExpense.amount)} on {formatDate(selectedExpense.date)}
            </p>
            <p className="text-sm text-gray-500">
              Full edit functionality would include form inputs here. This is a placeholder.
            </p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedExpense(null);
        }}
        title="Delete Expense?"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedExpense(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedExpense) {
                  handleDelete(selectedExpense.id);
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        {selectedExpense && (
          <p className="text-gray-600">
            Are you sure you want to delete this expense? This action cannot be undone. 💗
          </p>
        )}
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        title="Delete Selected Expenses?"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsBulkDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleBulkDelete}
            >
              Delete {selectedIds.size} Expense{selectedIds.size !== 1 ? 's' : ''}
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete {selectedIds.size} expense{selectedIds.size !== 1 ? 's' : ''}? 
          This action cannot be undone. 💗
        </p>
      </Modal>
    </div>
  );
};
