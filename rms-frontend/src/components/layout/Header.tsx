import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTime } from '../../hooks/useTime';
import { useAppStore } from '../../store/useAppStore';
import { Bell, Menu, Search, ShieldCheck, Compass } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { api, ManagedBusiness } from '../../services/api';
import { resetTenantStores } from '../../store/resetTenantStores';

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuClick?: () => void;
  onTakeTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumb, onMenuClick, onTakeTour }) => {
  const navigate = useNavigate();
  const time = useTime();
  const notifications = useAppStore((state) => state.notifications);
  const userName = useAppStore((state) => state.userName);
  const userRoleName = useAppStore((state) => state.userRoleName);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);
  const selectedBusinessId = useAppStore((state) => state.selectedBusinessId);
  const setSelectedBusinessId = useAppStore((state) => state.setSelectedBusinessId);
  const [businesses, setBusinesses] = useState<ManagedBusiness[]>([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    api.getManagedBusinesses()
      .then((items) => setBusinesses(items.filter((business) => business.is_active)))
      .catch(() => setBusinesses([]));
  }, [isSuperAdmin]);

  const selectBusiness = (value: string) => {
    const businessId = value ? Number(value) : null;
    if (businessId === selectedBusinessId) return;
    resetTenantStores();
    setSelectedBusinessId(businessId);
    if (businessId) navigate('/dashboard');
    else navigate('/super-admin/businesses');
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="h-16 bg-white border-b border-[#E9E5E1] px-6 flex items-center justify-between select-none flex-shrink-0 gap-4">
      {/* Left: Mobile Toggle + Breadcrumb & Title */}
      <div className="flex items-center gap-3.5 flex-shrink-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] text-[#666A64] hover:text-[#1F221D] cursor-pointer transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          {breadcrumb && (
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#666A64]">
              {breadcrumb}
            </span>
          )}
          <h2 className="text-base font-black text-[#1F221D] leading-tight tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden lg:flex items-center gap-3 flex-1 max-w-xl mx-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666A64]" />
          <input
            type="text"
            placeholder="Search orders, tables, menu dishes, staff..."
            className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all placeholder-[#666A64]/60"
          />
        </div>

      </div>

      {/* Right: Live Clock + System Status + Notifications + Avatar */}
      <div className="flex items-center gap-3.5 flex-shrink-0">
        {isSuperAdmin && (
          <label className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#666A64]">
            <span className="sr-only">Selected business workspace</span>
            <select
              value={selectedBusinessId ?? ''}
              onChange={(event) => selectBusiness(event.target.value)}
              className="max-w-48 rounded-xl border border-[#E9E5E1] bg-white px-2.5 py-2 text-xs font-bold text-[#1F221D] outline-none focus:border-[#FF7A10]"
            >
              <option value="">Choose business</option>
              {businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}
            </select>
          </label>
        )}
        <button
          type="button"
          onClick={onTakeTour}
          data-tour="take-tour"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#FF7A10]/25 bg-[#FFF2E8] px-2.5 py-2 text-xs font-bold text-[#E86000] transition-colors hover:bg-[#FFE6D5] sm:px-3"
          title="Start the guided tour"
        >
          <Compass className="h-4 w-4" />
          <span>Take tour</span>
        </button>

        {/* Live System Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[11px] font-extrabold text-[#2E7D32]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>POS Active</span>
        </div>

        {/* Live Clock Badge */}
        <div className="hidden sm:flex flex-col items-end border-l border-[#E9E5E1] pl-3.5">
          <span className="text-xs font-black text-[#FF7A10] tracking-wider font-mono">
            {formatTime(time)}
          </span>
          <span className="text-[9px] text-[#666A64] font-bold uppercase tracking-wider">
            {formatDate(time)}
          </span>
        </div>

        {/* Notifications Bell Button */}
        <button className="relative p-2 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] text-[#666A64] hover:text-[#FF7A10] hover:bg-[#FFF2E8] transition-all cursor-pointer">
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF7A10] rounded-full animate-pulse" />
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-1">
          <Avatar name={userName || 'User'} size="md" />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-extrabold text-[#1F221D] leading-tight">{userName || 'User'}</span>
            <span className="text-[10px] text-[#666A64] font-bold leading-none">{userRoleName || 'Staff'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
