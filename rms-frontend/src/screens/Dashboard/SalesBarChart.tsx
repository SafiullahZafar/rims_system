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

interface BarData {
  label: string;
  revenue: number;
  orders: number;
}

const mockDataToday: BarData[] = [
  { label: '8 AM', revenue: 1400, orders: 8 },
  { label: '10 AM', revenue: 3200, orders: 16 },
  { label: '12 PM', revenue: 5800, orders: 34 },
  { label: '2 PM', revenue: 4900, orders: 28 },
  { label: '4 PM', revenue: 2600, orders: 14 },
  { label: '6 PM', revenue: 6400, orders: 42 },
  { label: '8 PM', revenue: 7100, orders: 49 },
  { label: '10 PM', revenue: 3800, orders: 22 },
];

const mockData7Days: BarData[] = [
  { label: 'Mon', revenue: 12400, orders: 84 },
  { label: 'Tue', revenue: 15800, orders: 98 },
  { label: 'Wed', revenue: 11200, orders: 76 },
  { label: 'Thu', revenue: 16900, orders: 110 },
  { label: 'Fri', revenue: 22400, orders: 145 },
  { label: 'Sat', revenue: 28500, orders: 190 },
  { label: 'Sun', revenue: 24100, orders: 162 },
];

const mockData30Days: BarData[] = [
  { label: 'Week 1', revenue: 84000, orders: 540 },
  { label: 'Week 2', revenue: 96000, orders: 620 },
  { label: 'Week 3', revenue: 112000, orders: 740 },
  { label: 'Week 4', revenue: 108000, orders: 710 },
];

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

  const getData = () => {
    switch (period) {
      case 'today':
        return mockDataToday;
      case '7days':
        return mockData7Days;
      case '30days':
        return mockData30Days;
    }
  };

  const chartData = getData();

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
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
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
