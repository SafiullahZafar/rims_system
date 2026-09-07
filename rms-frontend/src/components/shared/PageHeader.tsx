import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  icon?: LucideIcon;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
  };
  secondaryActions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  icon: Icon,
  primaryAction,
  secondaryActions,
  children,
}) => {
  const PrimaryIcon = primaryAction?.icon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E9E5E1]">
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div className="w-11 h-11 rounded-2xl bg-[#FFF2E8] border border-[#FF7A10]/20 flex items-center justify-center text-[#FF7A10] flex-shrink-0 shadow-sm">
            <Icon className="w-5.5 h-5.5" style={{ width: 22, height: 22 }} />
          </div>
        )}
        <div>
          {breadcrumb && (
            <p className="text-[11px] font-semibold text-[#666A64] uppercase tracking-wider mb-0.5">
              {breadcrumb}
            </p>
          )}
          <h1 className="text-xl font-bold text-[#1F221D] tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-[#666A64] font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {secondaryActions}
        {children}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#FF7A10] hover:bg-[#E86000] active:scale-[0.98] transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {PrimaryIcon && <PrimaryIcon className="w-4 h-4" />}
            <span>{primaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
