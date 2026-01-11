import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  TrendingUp,
  Wallet,
  Target,
  FileText,
  Settings,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/add-expense', label: 'Add Expense', icon: <PlusCircle className="w-5 h-5" /> },
  { path: '/transactions', label: 'Transactions', icon: <Receipt className="w-5 h-5" /> },
  { path: '/analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
  { path: '/budgets', label: 'Budgets', icon: <Wallet className="w-5 h-5" /> },
  { path: '/goals', label: 'Goals', icon: <Target className="w-5 h-5" /> },
  { path: '/reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-gray-100">
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <h1 className="text-2xl font-bold text-gradient">Expense Tracker</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-soft'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                )}
              >
                <span className={clsx('mr-3', isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500')}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
