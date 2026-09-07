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

const trendData = [
  { label: 'MW', revenue: 75, orders: 40 },
  { label: 'GC', revenue: 82, orders: 48 },
  { label: 'MK', revenue: 78, orders: 45 },
  { label: 'QD', revenue: 88, orders: 55 },
  { label: 'NK', revenue: 92, orders: 60 },
  { label: 'MB', revenue: 90, orders: 58 },
  { label: 'PD', revenue: 96, orders: 68 },
  { label: 'LI', revenue: 94, orders: 64 },
  { label: 'DL', revenue: 98, orders: 72 },
  { label: 'QD', revenue: 100, orders: 75 },
];

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
  return (
    <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#1F221D]">Product Performance Trend</h3>
          <p className="text-xs text-[#666A64]">Growth and revenue trajectory over operational shifts</p>
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
              domain={[60, 100]}
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
