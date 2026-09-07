import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Toast } from '../ui/Toast';
import { useAppStore } from '../../store/useAppStore';

interface AppShellProps {
  children: React.ReactNode;
  headerTitle: string;
  headerBreadcrumb: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, headerTitle, headerBreadcrumb }) => {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <div className="w-full h-screen flex bg-[#F7F5F2] text-[#1F221D] font-sans overflow-hidden select-none p-3 sm:p-4 gap-3 sm:gap-4">
      {/* Detached Floating Sidebar Shell (Desktop & Tablet) */}
      <div className="hidden md:block flex-shrink-0 h-full">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Main Workspace Outer Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white rounded-2xl md:rounded-3xl border border-[#E9E5E1] shadow-[0_4px_20px_rgba(31,34,29,0.04)] overflow-hidden relative">
        {/* Workspace Top Header */}
        <Header title={headerTitle} breadcrumb={headerBreadcrumb} onMenuClick={toggleSidebar} />

        {/* Dynamic Screen View Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-white">
          {children}
        </main>

        {/* Mobile Navigation Drawer & Bottom Bar */}
        <MobileNav />
      </div>

      {/* Toast Notification System */}
      <Toast />
    </div>
  );
};

export default AppShell;
