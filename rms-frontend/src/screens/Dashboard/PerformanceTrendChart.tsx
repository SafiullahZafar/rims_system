import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useOrderStore } from '../../store/useOrderStore';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;

  return (
    <div className="bg-white border border-[#E9E5E1] rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-[#1F221D]">{label}</p>
      <p className="text-[#FF7A10] font-extrabold mt-1">Total Sales Index: {val}%</p>
    </div>
  );
};

export const PerformanceTrendChart: React.FC = () => {
  const orders = useOrderStore((state) => state.orders);
  const dailyTotals = new Map<string, { revenue: number; orders: number }>();
  orders.forEach((order) => {
    if (!order.createdAt) return;
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const label = date.toISOString().slice(0, 10);
    const current = dailyTotals.get(label) ?? { revenue: 0, orders: 0 };
    current.revenue += order.amount;
    current.orders += 1;
    dailyTotals.set(label, current);
  });
  const trendData = [...dailyTotals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-10)
    .map(([date, totals]) => ({
      label: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      ...totals,
    }));
  return (
    <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#1F221D]">Sales Trend</h3>
          <p className="text-xs text-[#666A64]">Revenue by order date in this workspace</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF7A10]" />
            <span className="font-medium text-[#1F221D]">Sale growth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FFF2E8] border border-[#FF7A10]" />
            <span className="font-medium text-[#666A64]">Revenue</span>
          </div>
        </div>
      </div>

      {trendData.length === 0 && <p className="text-xs text-[#666A64]">No dated sales data yet for this workspace.</p>}
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="performanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF7A10" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF7A10" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9E5E1" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#666A64"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#666A64' }}
            />
            <YAxis
              stroke="#666A64"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#666A64' }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#FF7A10"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#performanceGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceTrendChart;
