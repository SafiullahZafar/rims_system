import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Toast } from '../ui/Toast';
import { useAppStore } from '../../store/useAppStore';
import { GuidedTour } from './GuidedTour';
import { useLocation } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
  headerTitle: string;
  headerBreadcrumb: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, headerTitle, headerBreadcrumb }) => {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const userRole = useAppStore((state) => state.userRole);
  const userName = useAppStore((state) => state.userName);
  const isDemo = useAppStore((state) => state.isDemo);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);
  const selectedBusinessId = useAppStore((state) => state.selectedBusinessId);
  const location = useLocation();
  const [tourRun, setTourRun] = useState(0);
  const tourSeenKey = `rms_guided_tour_seen:${isSuperAdmin ? 'super-admin' : isDemo ? 'demo' : 'business'}:${encodeURIComponent(userName || userRole || 'user')}${isSuperAdmin && selectedBusinessId ? `:${selectedBusinessId}` : ''}`;

  const startTour = useCallback(() => {
    window.localStorage.setItem(tourSeenKey, '1');
    setTourRun((run) => run + 1);
  }, [tourSeenKey]);

  useEffect(() => {
    if (!userRole || (isSuperAdmin && !selectedBusinessId && location.pathname.startsWith('/super-admin')) || window.localStorage.getItem(tourSeenKey)) return;
    window.localStorage.setItem(tourSeenKey, '1');
    setTourRun((run) => run + 1);
  }, [isSuperAdmin, location.pathname, selectedBusinessId, tourSeenKey, userRole]);

  return (
    <div className="w-full h-screen flex bg-white text-[#1F221D] font-sans overflow-hidden select-none relative">
      {/* Floating Sidebar Container (Desktop & Tablet) */}
      <div className="hidden md:block flex-shrink-0 h-full p-3 z-30">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Full Page Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white overflow-hidden relative">
        {/* Workspace Top Header (Full Page Header) */}
        <Header title={headerTitle} breadcrumb={headerBreadcrumb} onMenuClick={toggleSidebar} onTakeTour={startTour} />

        {/* Dynamic Screen View Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-white">
          {children}
        </main>

        {/* Mobile Navigation Drawer & Bottom Bar */}
        <MobileNav />
      </div>

      {/* Toast Notification System */}
      <Toast />
      {tourRun > 0 && <GuidedTour key={tourRun} onClose={() => setTourRun(0)} />}
    </div>
  );
};

export default AppShell;
