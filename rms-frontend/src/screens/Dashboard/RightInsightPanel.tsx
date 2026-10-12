import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Grid, ChefHat, CalendarDays, MapPin } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';

export const RightInsightPanel: React.FC = () => {
  const navigate = useNavigate();
  const orders = useOrderStore((state) => state.orders);

  const quickActions = [
    { label: 'New Order', icon: PlusCircle, path: '/order', accent: '#FF7A10', primary: true },
    { label: 'Tables Map', icon: Grid, path: '/tables', accent: '#1565C0' },
    { label: 'Kitchen', icon: ChefHat, path: '/kitchen', accent: '#2E7D32' },
    { label: 'Reserve', icon: CalendarDays, path: '/reservations', accent: '#FF7A10' },
    { label: 'Geofence', icon: MapPin, path: '/geofencing', accent: '#E86000' },
  ];

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Top Performers Widget */}
      <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#1F221D]">Top Performers</h3>
          <span className="text-[11px] font-semibold text-[#666A64] bg-[#F7F5F2] px-2 py-0.5 rounded-full">Workspace data</span>
        </div>
        <div className="py-7 text-center text-sm text-[#666A64]">
          Performance metrics will appear when this workspace has employee activity.
        </div>
      </div>

      {/* Real Time Sales Feed */}
      <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 shadow-sm flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#1F221D]">Real Time Sales</h3>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-semibold text-[#FF7A10] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[260px] custom-scrollbar">
          {orders.length === 0 && <p className="py-8 text-center text-sm text-[#666A64]">No sales yet in this workspace.</p>}
          {orders.slice(0, 8).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5F2] hover:bg-[#FFF2E8] border border-[#E9E5E1]/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF7A10]/15 flex items-center justify-center text-[#FF7A10] font-bold text-xs">
                  {order.tableId ? `T${order.tableId}` : 'OR'}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1F221D]">{order.tableId ? `Table ${order.tableId}` : 'Restaurant order'}</p>
                  <p className="text-[10px] text-[#666A64]">Order #{order.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-[#FF7A10]">${order.amount.toFixed(2)}</p>
                <p className="text-[10px] text-[#666A64]">{order.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-[#E9E5E1] rounded-2xl p-4 shadow-sm">
        <h4 className="text-xs font-bold text-[#1F221D] uppercase tracking-wider mb-2.5">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  action.primary
                    ? 'col-span-2 bg-[#FF7A10] text-white hover:bg-[#E86000] justify-center shadow-xs'
                    : 'bg-[#F7F5F2] text-[#1F221D] hover:bg-[#FFF2E8] hover:text-[#FF7A10] border border-[#E9E5E1]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: action.primary ? '#fff' : action.accent }} />
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RightInsightPanel;
