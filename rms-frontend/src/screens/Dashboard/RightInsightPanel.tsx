import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Grid, ChefHat, CalendarDays, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const donutData = [
  { name: 'Dish Washer', value: 60, color: '#FF7A10' },
  { name: 'Microwave', value: 15, color: '#E86000' },
  { name: 'Faucet', value: 15, color: '#2E7D32' },
  { name: 'Plate', value: 10, color: '#1565C0' },
];

interface RealTimeSaleItem {
  id: string;
  station: string;
  code: string;
  amount: string;
  time: string;
}

const mockRealTimeSales: RealTimeSaleItem[] = [
  { id: '1', station: 'Kitchen Station A', code: 'ID:HD334465', amount: '$120.00', time: '2m ago' },
  { id: '2', station: 'Main Bar & Drinks', code: 'ID:HD334466', amount: '$85.50', time: '5m ago' },
  { id: '3', station: 'Terrace Dining', code: 'ID:HD334467', amount: '$240.00', time: '12m ago' },
  { id: '4', station: 'Takeaway Counter', code: 'ID:HD334468', amount: '$45.00', time: '18m ago' },
  { id: '5', station: 'VIP Dining Room', code: 'ID:HD334469', amount: '$310.00', time: '25m ago' },
];

export const RightInsightPanel: React.FC = () => {
  const navigate = useNavigate();

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
          <span className="text-[11px] font-semibold text-[#FF7A10] bg-[#FFF2E8] px-2 py-0.5 rounded-full">
            Active Shift
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-28 h-28 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-black text-[#1F221D]">60%</span>
              <span className="text-[9px] text-[#666A64] font-semibold">Eff.</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[#666A64] truncate">{d.name}</span>
              </div>
            ))}
          </div>
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
          {mockRealTimeSales.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5F2] hover:bg-[#FFF2E8] border border-[#E9E5E1]/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF7A10]/15 flex items-center justify-center text-[#FF7A10] font-bold text-xs">
                  {item.station.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1F221D]">{item.station}</p>
                  <p className="text-[10px] text-[#666A64]">{item.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-[#FF7A10]">{item.amount}</p>
                <p className="text-[10px] text-[#666A64]">{item.time}</p>
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
