import React from 'react';
import { useTime } from '../../hooks/useTime';
import { useAppStore } from '../../store/useAppStore';
import { Bell, Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumb, onMenuClick }) => {
  const time = useTime();
  const notifications = useAppStore((state) => state.notifications);
  const userName = useAppStore((state) => state.userName);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="bg-white border-b border-[#E9E5E1] px-5 py-3 flex items-center justify-between select-none flex-shrink-0">
      {/* Left: menu toggle + title */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] text-[#666A64] hover:text-[#1F221D] cursor-pointer transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          {breadcrumb && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#666A64]">
              {breadcrumb}
            </span>
          )}
          <h2 className="text-base font-bold text-[#1F221D] leading-tight tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Center: date/time */}
      <div className="hidden sm:flex flex-col items-center">
        <span className="text-xs font-extrabold text-[#FF7A10] tracking-wider font-mono">
          {formatTime(time)}
        </span>
        <span className="text-[10px] text-[#666A64] font-semibold uppercase tracking-wider">
          {formatDate(time)}
        </span>
      </div>

      {/* Right: notifications + avatar */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] text-[#666A64] hover:text-[#1F221D] transition-all cursor-pointer">
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF7A10] rounded-full animate-pulse" />
          )}
        </button>
        <Avatar name={userName || 'User'} size="md" />
      </div>
    </header>
  );
};

export default Header;
