import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid,
  PlusCircle,
  ChefHat,
  CreditCard,
  Users,
  MapPin,
  Settings,
  Building2,
  Activity,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppStore } from '../../store/useAppStore';
import { hasPermission } from '../../constants/routesConfig';

export const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;
  const permissions = useAppStore((state) => state.permissions);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);

  const businessItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard, perm: 'dashboard.view' },
    { path: '/tables', label: 'Tables', icon: Grid, perm: 'tables.view' },
    { path: '/order', label: 'Order', icon: PlusCircle, perm: 'orders.create', isSpecial: true },
    { path: '/kitchen', label: 'Kitchen', icon: ChefHat, perm: 'kitchen.view' },
    { path: '/payment', label: 'Pay', icon: CreditCard, perm: 'payments.process' },
    { path: '/employees', label: 'Staff', icon: Users, perm: 'employees.view' },
    { path: '/geofencing', label: 'Geofence', icon: MapPin, perm: 'geofencing.view' },
    { path: '/settings/business', label: 'Settings', icon: Settings, perm: 'business_settings.manage' },
  ];

  const superAdminItems = [
    { path: '/super-admin/businesses', label: 'Accounts', icon: Building2, perm: 'super_admin', isSpecial: false },
    { path: '/super-admin/demo-activity', label: 'Demo log', icon: Activity, perm: 'super_admin', isSpecial: false },
  ];

  const mobileItems = (isSuperAdmin ? superAdminItems : businessItems)
    .filter((item) => hasPermission(permissions, item.perm, item.path));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E9E5E1] px-2 flex items-center justify-around z-40 select-none shadow-lg">
      {mobileItems.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.path || (activePath === '/' && item.path === '/dashboard');

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center relative w-12 h-12 cursor-pointer"
          >
            {item.isSpecial ? (
              <div
                className={twMerge(
                  clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center -translate-y-2 shadow-md transition-all active:scale-95 border border-[#FF7A10]/20',
                    {
                      'bg-[#FF7A10] text-white': isActive,
                      'bg-[#FFF2E8] text-[#FF7A10]': !isActive,
                    }
                  )
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
            ) : (
              <>
                <Icon
                  className={twMerge(
                    clsx('w-5 h-5 transition-colors', {
                      'text-[#FF7A10]': isActive,
                      'text-[#666A64]': !isActive,
                    })
                  )}
                />
                <span
                  className={twMerge(
                    clsx('text-[9px] font-semibold mt-1 transition-colors', {
                      'text-[#FF7A10]': isActive,
                      'text-[#666A64]': !isActive,
                    })
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0.5 w-1 h-1 bg-[#FF7A10] rounded-full" />
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MobileNav;
