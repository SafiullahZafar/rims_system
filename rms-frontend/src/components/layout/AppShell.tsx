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
    <div className="w-full h-screen flex bg-white text-[#1F221D] font-sans overflow-hidden select-none relative">
      {/* Floating Sidebar Container (Desktop & Tablet) */}
      <div className="hidden md:block flex-shrink-0 h-full p-3 z-30">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Full Page Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white overflow-hidden relative">
        {/* Workspace Top Header (Full Page Header) */}
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
