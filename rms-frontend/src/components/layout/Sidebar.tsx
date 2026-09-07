import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useKitchenStore } from '../../store/useKitchenStore';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  UtensilsCrossed,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ROUTES_CONFIG, ROUTE_SECTIONS, hasPermission } from '../../constants/routesConfig';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const permissions = useAppStore((state) => state.permissions);
  const userName = useAppStore((state) => state.userName);
  const userRoleName = useAppStore((state) => state.userRoleName);
  const logout = useAppStore((state) => state.logout);

  const kitchenOrdersCount = useKitchenStore((state) =>
    state.orders.filter((o) => o.status !== 'ready').length
  );

  // Group accessible routes by section
  const accessibleRoutes = ROUTES_CONFIG.filter((item) =>
    hasPermission(permissions, item.permission, item.path)
  );

  return (
    <aside
      className={twMerge(
        clsx(
          'h-full bg-white border border-[#E9E5E1] rounded-2xl md:rounded-3xl flex flex-col transition-all duration-300 z-30 relative select-none shadow-[0_4px_20px_rgba(31,34,29,0.05)] overflow-hidden',
          { 'w-64': !collapsed, 'w-[76px]': collapsed }
        )
      )}
    >
      {/* Brand Header with Hover Stretch / Compress Toggle */}
      <div className={twMerge(clsx('py-4 flex items-center border-b border-[#E9E5E1] flex-shrink-0 bg-white', { 'px-4 justify-between': !collapsed, 'px-3 justify-center': collapsed }))}>
        {collapsed ? (
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-2xl bg-[#FF7A10] hover:bg-[#E86000] text-white flex items-center justify-center flex-shrink-0 shadow-xs transition-all duration-200 cursor-pointer group relative"
            title="Expand Sidebar (Stretch)"
          >
            <UtensilsCrossed className="w-5 h-5 text-white group-hover:hidden transition-all" />
            <PanelLeftOpen className="w-5 h-5 text-white hidden group-hover:block transition-all" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7A10] to-[#E86000] flex items-center justify-center flex-shrink-0 shadow-xs relative">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-lg text-[#1F221D] tracking-tight whitespace-nowrap">
                  Pixora<span className="text-[#FF7A10]">RIMS</span>
                </span>
                <span className="text-[10px] font-extrabold text-[#666A64] tracking-wider uppercase -mt-1">
                  Enterprise Suite
                </span>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] text-[#666A64] hover:text-[#FF7A10] hover:bg-[#FFF2E8] hover:border-[#FF7A10]/30 transition-all cursor-pointer flex-shrink-0"
              title="Collapse Sidebar (Compress)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Grouped Navigation Links */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {ROUTE_SECTIONS.map((section) => {
          const sectionItems = accessibleRoutes.filter((r) => r.section === section && !r.hideInSidebar);
          if (sectionItems.length === 0) return null;

          return (
            <div key={section} className="flex flex-col gap-0.5 mb-2">
              {!collapsed && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold text-[#666A64] uppercase tracking-wider">
                  {section}
                </div>
              )}

              {sectionItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activePath === item.path ||
                  (activePath === '/' && item.path === '/dashboard') ||
                  (item.path === '/employees' && activePath.startsWith('/employees'));

                const badge = item.badgeKey === 'kitchen' && kitchenOrdersCount > 0 ? kitchenOrdersCount : null;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={twMerge(
                      clsx(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative cursor-pointer',
                        {
                          // Standard Active
                          'bg-[#FF7A10] text-white shadow-sm': isActive && !item.isSpecial,
                          // Standard Inactive
                          'text-[#666A64] hover:text-[#1F221D] hover:bg-[#F7F5F2]': !isActive && !item.isSpecial,
                          // Special Active (e.g. New Order)
                          'bg-[#FF7A10] text-white font-bold shadow-sm': item.isSpecial && isActive,
                          // Special Inactive
                          'bg-[#FFF2E8] text-[#FF7A10] border border-[#FF7A10]/20 hover:bg-[#FFE6D5] font-bold':
                            item.isSpecial && !isActive,
                        }
                      )
                    )}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />

                    {!collapsed && (
                      <span className="flex-1 text-left whitespace-nowrap truncate">{item.label}</span>
                    )}

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-[80px] bg-[#1F221D] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                        {item.label}
                      </div>
                    )}

                    {/* Badge */}
                    {badge ? (
                      <span
                        className={twMerge(
                          clsx(
                            'text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1',
                            isActive ? 'bg-white text-[#FF7A10]' : 'bg-[#FF7A10] text-white',
                            collapsed && 'absolute top-1.5 right-1.5'
                          )
                        )}
                      >
                        {badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Profile & Collapse Toggle */}
      <div className="px-3 py-3 border-t border-[#E9E5E1] flex flex-col gap-2.5 flex-shrink-0 bg-white">
        <div className="flex items-center gap-2.5 px-1 overflow-hidden">
          <Avatar name={userName || 'User'} size="md" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#1F221D] truncate">{userName || 'User'}</span>
              <span className="text-[11px] text-[#666A64] truncate">{userRoleName || 'Staff'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={twMerge(
              clsx(
                'flex items-center justify-center p-2 rounded-xl text-[#C62828] bg-[#C62828]/10 border border-[#C62828]/20 hover:bg-[#C62828]/20 transition-all cursor-pointer',
                { 'flex-1 gap-2 text-xs font-bold uppercase tracking-wider': !collapsed, 'w-full': collapsed }
              )
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {!collapsed && (
            <button
              onClick={onToggle}
              className="p-2 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] text-[#666A64] hover:text-[#1F221D] hover:bg-[#E9E5E1] transition-all cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {collapsed && (
            <button
              onClick={onToggle}
              className="absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#FF7A10] text-white rounded-full flex items-center justify-center hover:scale-110 transition-all cursor-pointer z-50 shadow-md"
              title="Expand sidebar"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
