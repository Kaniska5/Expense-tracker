import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { formatCurrency, calculateMonthlyExpenses, getCategoryPercentages, getTopSpendingCategories } from '@/utils/helpers';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { CATEGORIES } from '@/config/categories';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { Download, FileText, TrendingUp, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const { expenses, loading, fetchExpenses } = useExpenseStore();
  const [reportType, setReportType] = useState<'monthly' | 'category' | 'annual'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const currentDate = new Date();
  const [year, month] = selectedMonth.split('-').map(Number);

  const monthlyExpenses = expenses.filter((e) => {
    const expenseDate = parseISO(e.date);
    return format(expenseDate, 'yyyy-MM') === selectedMonth;
  });

  const categoryExpenses = expenses.filter((e) => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  const annualExpenses = expenses.filter((e) => {
    const expenseDate = parseISO(e.date);
    return expenseDate.getFullYear() === parseInt(selectedYear);
  });

  const generateMonthlyReport = () => {
    const total = calculateMonthlyExpenses(expenses, year, month);
    const categoryPercentages = getCategoryPercentages(monthlyExpenses);
    const topCategories = getTopSpendingCategories(monthlyExpenses, 5);

    return {
      title: `Monthly Report - ${format(new Date(year, month - 1), 'MMMM yyyy')}`,
      total,
      transactions: monthlyExpenses.length,
      categoryBreakdown: categoryPercentages,
      topCategories,
    };
  };

  const generateCategoryReport = () => {
    const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const selectedCat = selectedCategory === 'all' ? null : CATEGORIES[selectedCategory as keyof typeof CATEGORIES];

    return {
      title: selectedCategory === 'all' 
        ? 'All Categories Report' 
        : `${selectedCat?.name} Report`,
      total: categoryTotal,
      transactions: categoryExpenses.length,
      expenses: categoryExpenses,
    };
  };

  const generateAnnualReport = () => {
    const yearNum = parseInt(selectedYear);
    const months = eachMonthOfInterval({
      start: new Date(yearNum, 0, 1),
      end: new Date(yearNum, 11, 31),
    });

    const monthlyTotals = months.map((monthDate) => {
      const monthStr = format(monthDate, 'yyyy-MM');
      const monthExpenses = expenses.filter((e) => {
        const expenseDate = parseISO(e.date);
        return format(expenseDate, 'yyyy-MM') === monthStr;
      });
      return {
        month: format(monthDate, 'MMM yyyy'),
        total: calculateMonthlyExpenses(expenses, monthDate.getFullYear(), monthDate.getMonth() + 1),
        transactions: monthExpenses.length,
      };
    });

    const annualTotal = annualExpenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryPercentages = getCategoryPercentages(annualExpenses);
    const topCategories = getTopSpendingCategories(annualExpenses, 5);

    return {
      title: `Annual Report - ${selectedYear}`,
      total: annualTotal,
      transactions: annualExpenses.length,
      monthlyTotals,
      categoryBreakdown: categoryPercentages,
      topCategories,
    };
  };

  const exportToPDF = () => {
    // In a real app, you'd use a library like jsPDF or html2pdf
    alert('PDF export feature coming soon! 💗');
  };

  const exportToCSV = () => {
    let data: any[] = [];
    let filename = '';

    if (reportType === 'monthly') {
      const report = generateMonthlyReport();
      data = monthlyExpenses.map((e) => ({
        Date: format(parseISO(e.date), 'yyyy-MM-dd'),
        Category: CATEGORIES[e.category].name,
        Amount: e.amount,
        Payment: e.paymentMethod,
        Notes: e.notes || '',
      }));
      filename = `monthly-report-${selectedMonth}.csv`;
    } else if (reportType === 'category') {
      const report = generateCategoryReport();
      data = categoryExpenses.map((e) => ({
        Date: format(parseISO(e.date), 'yyyy-MM-dd'),
        Category: CATEGORIES[e.category].name,
        Amount: e.amount,
        Payment: e.paymentMethod,
        Notes: e.notes || '',
      }));
      filename = `category-report-${selectedCategory}-${format(new Date(), 'yyyy-MM')}.csv`;
    } else {
      const report = generateAnnualReport();
      data = annualExpenses.map((e) => ({
        Date: format(parseISO(e.date), 'yyyy-MM-dd'),
        Category: CATEGORIES[e.category].name,
        Amount: e.amount,
        Payment: e.paymentMethod,
        Notes: e.notes || '',
      }));
      filename = `annual-report-${selectedYear}.csv`;
    }

    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => row[header]).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((cat) => ({
      value: cat,
      label: `${CATEGORIES[cat].icon} ${CATEGORIES[cat].name}`,
    })),
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const renderReport = () => {
    if (reportType === 'monthly') {
      const report = generateMonthlyReport();
      return (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h2>
              <p className="text-gray-600">Your spending overview for this month</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF}>
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.total)}</p>
            </div>
            <div className="p-4 bg-lavender-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{report.transactions}</p>
            </div>
            <div className="p-4 bg-sage-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Average per Transaction</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.transactions > 0 
                  ? formatCurrency(report.total / report.transactions)
                  : formatCurrency(0)
                }
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Category Breakdown</h3>
            <div className="space-y-2">
              {report.categoryBreakdown.map((item) => {
                const category = CATEGORIES[item.category];
                return (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Spending Categories</h3>
            <div className="space-y-2">
              {report.topCategories.map((item, index) => {
                const category = CATEGORIES[item.category];
                return (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary-600 w-6">#{index + 1}</span>
                      <span className="text-xl">{category.icon}</span>
                      <p className="font-medium text-gray-900">{category.name}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      );
    }

    if (reportType === 'category') {
      const report = generateCategoryReport();
      return (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h2>
              <p className="text-gray-600">Detailed category spending analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF}>
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.total)}</p>
            </div>
            <div className="p-4 bg-lavender-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{report.transactions}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Transactions</h3>
            {report.expenses.length > 0 ? (
              <div className="space-y-2">
                {report.expenses.slice(0, 20).map((expense) => {
                  const category = CATEGORIES[expense.category];
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-500">{format(parseISO(expense.date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                    </div>
                  );
                })}
                {report.expenses.length > 20 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Showing first 20 of {report.expenses.length} transactions
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No expenses in this category 💗</p>
            )}
          </div>
        </Card>
      );
    }

    const report = generateAnnualReport();
    return (
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h2>
            <p className="text-gray-600">Your annual financial summary</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Annual Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.total)}</p>
          </div>
          <div className="p-4 bg-lavender-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{report.transactions}</p>
          </div>
          <div className="p-4 bg-sage-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Monthly Average</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(report.total / 12)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Monthly Breakdown</h3>
          <div className="space-y-2">
            {report.monthlyTotals.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p className="font-medium text-gray-900">{month.month}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(month.total)}</p>
                  <p className="text-sm text-gray-500">{month.transactions} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Categories</h3>
          <div className="space-y-2">
            {report.topCategories.map((item, index) => {
              const category = CATEGORIES[item.category];
              return (
                <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary-600 w-6">#{index + 1}</span>
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">
          Generate detailed reports and export your financial data 💗
        </p>
      </div>

      <Card className="mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Report Type</label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'monthly' | 'category' | 'annual')}
              options={[
                { value: 'monthly', label: 'Monthly Report' },
                { value: 'category', label: 'Category Report' },
                { value: 'annual', label: 'Annual Report' },
              ]}
            />
          </div>

          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Month</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          )}

          {reportType === 'category' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Category</label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categoryOptions}
              />
            </div>
          )}

          {reportType === 'annual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Year</label>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={yearOptions}
              />
            </div>
          )}
        </div>
      </Card>

      {renderReport()}
    </div>
  );
};
