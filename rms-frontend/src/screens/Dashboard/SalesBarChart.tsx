import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useOrderStore } from '../../store/useOrderStore';

interface BarData {
  label: string;
  revenue: number;
  orders: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data: BarData = payload[0].payload;

  return (
    <div className="bg-white border border-[#E9E5E1] rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-[#1F221D] mb-1">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[#666A64]">Revenue:</span>
        <span className="font-extrabold text-[#FF7A10]">${data.revenue.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between gap-4 mt-0.5">
        <span className="text-[#666A64]">Orders:</span>
        <span className="font-bold text-[#1F221D]">{data.orders}</span>
      </div>
    </div>
  );
};

export const SalesBarChart: React.FC = () => {
  const [period, setPeriod] = useState<'today' | '7days' | '30days'>('7days');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const orders = useOrderStore((state) => state.orders);
  const now = new Date();
  const start = new Date(now);
  if (period === 'today') start.setHours(0, 0, 0, 0);
  else if (period === '7days') start.setDate(now.getDate() - 6);
  else start.setDate(now.getDate() - 29);
  const periodOrders = orders.filter((order) => {
    const timestamp = Date.parse(order.createdAt ?? '');
    return !Number.isNaN(timestamp) && timestamp >= start.getTime() && timestamp <= now.getTime();
  });
  const buckets = period === 'today' ? 8 : period === '7days' ? 7 : 4;
  const chartData: BarData[] = Array.from({ length: buckets }, (_, index) => ({
    label: period === 'today'
      ? `${String(index * 3).padStart(2, '0')}:00`
      : period === '7days'
        ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + index).toLocaleDateString(undefined, { weekday: 'short' })
        : `Week ${index + 1}`,
    revenue: 0,
    orders: 0,
  }));
  periodOrders.forEach((order) => {
    const timestamp = Date.parse(order.createdAt ?? '');
    const date = new Date(timestamp);
    const index = period === 'today'
      ? Math.min(Math.floor(date.getHours() / 3), 7)
      : period === '7days'
        ? Math.min(Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) / 86400000), 6)
        : Math.min(Math.floor((timestamp - start.getTime()) / (7 * 86400000)), 3);
    if (index >= 0) {
      chartData[index].revenue += order.amount;
      chartData[index].orders += 1;
    }
  });

  return (
    <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#1F221D]">Sales Report</h3>
          <p className="text-xs text-[#666A64]">Revenue and order frequency comparison</p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center bg-[#F7F5F2] border border-[#E9E5E1] p-1 rounded-xl gap-1">
          {(['today', '7days', '30days'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === p
                  ? 'bg-white text-[#FF7A10] shadow-xs'
                  : 'text-[#666A64] hover:text-[#1F221D]'
              }`}
            >
              {p === 'today' ? 'Today' : p === '7days' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart Container */}
      {orders.length === 0 && <p className="text-xs text-[#666A64]">No sales data yet for this workspace.</p>}
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive) {
                setActiveIndex(state.activeTooltipIndex ?? null);
              } else {
                setActiveIndex(null);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E9E5E1" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#666A64"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#666A64', fontWeight: 500 }}
            />
            <YAxis
              stroke="#666A64"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#666A64' }}
              tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFF2E8', opacity: 0.6 }} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={26}>
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={activeIndex === index ? '#E86000' : '#FF7A10'}
                  className="transition-all duration-150 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesBarChart;
