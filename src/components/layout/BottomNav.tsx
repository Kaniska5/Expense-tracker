import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  TrendingUp,
  Settings,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/add-expense', label: 'Add', icon: <PlusCircle className="w-5 h-5" /> },
  { path: '/transactions', label: 'Transactions', icon: <Receipt className="w-5 h-5" /> },
  { path: '/analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-soft-lg z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                isActive ? 'text-primary-600' : 'text-gray-500'
              )}
            >
              <span className={clsx('mb-1', isActive && 'animate-gentle-bounce')}>
                {item.icon}
              </span>
              <span className={clsx('text-xs font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
