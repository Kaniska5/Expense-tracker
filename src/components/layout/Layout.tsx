import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-beige-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="min-h-screen pb-20 lg:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};
