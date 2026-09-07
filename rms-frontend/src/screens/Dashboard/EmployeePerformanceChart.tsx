import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MapPin, UserCheck, ShieldCheck } from 'lucide-react';

interface PerformanceData {
  day: string;
  geofenceAccuracy: number;
  shiftEfficiency: number;
  onTimeRate: number;
}

const mockWeeklyData: PerformanceData[] = [
  { day: 'Mon', geofenceAccuracy: 94, shiftEfficiency: 88, onTimeRate: 92 },
  { day: 'Tue', geofenceAccuracy: 98, shiftEfficiency: 92, onTimeRate: 95 },
  { day: 'Wed', geofenceAccuracy: 96, shiftEfficiency: 90, onTimeRate: 94 },
  { day: 'Thu', geofenceAccuracy: 99, shiftEfficiency: 95, onTimeRate: 97 },
  { day: 'Fri', geofenceAccuracy: 100, shiftEfficiency: 97, onTimeRate: 98 },
  { day: 'Sat', geofenceAccuracy: 97, shiftEfficiency: 94, onTimeRate: 96 },
  { day: 'Sun', geofenceAccuracy: 99, shiftEfficiency: 96, onTimeRate: 97 },
];

const mockMonthlyData: PerformanceData[] = [
  { day: 'Week 1', geofenceAccuracy: 93, shiftEfficiency: 87, onTimeRate: 91 },
  { day: 'Week 2', geofenceAccuracy: 96, shiftEfficiency: 91, onTimeRate: 94 },
  { day: 'Week 3', geofenceAccuracy: 98, shiftEfficiency: 95, onTimeRate: 96 },
  { day: 'Week 4', geofenceAccuracy: 99, shiftEfficiency: 97, onTimeRate: 98 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-[#E9E5E1] rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[170px]">
      <p className="font-bold text-[#1F221D] border-b border-[#E9E5E1] pb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[#666A64] font-medium">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}:
          </span>
          <span className="font-bold text-[#1F221D]">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
};

export const EmployeePerformanceChart: React.FC = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const chartData = period === 'weekly' ? mockWeeklyData : mockMonthlyData;

  return (
    <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 shadow-xs flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFF2E8] border border-[#FF7A10]/20 flex items-center justify-center text-[#FF7A10]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#1F221D]">Employee Performance & Geofence Verification</h3>
          </div>
          <p className="text-xs text-[#666A64] mt-0.5 ml-9">
            Geofence clock-in compliance, shift efficiency, and punctuality trend lines
          </p>
        </div>

        {/* Action Pills / Selector */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="hidden md:flex items-center gap-3 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1]">
            <span className="flex items-center gap-1.5 text-[#2E7D32]">
              <MapPin className="w-3.5 h-3.5" /> 98.4% Geofence Accuracy
            </span>
            <span className="text-[#E9E5E1]">|</span>
            <span className="flex items-center gap-1.5 text-[#FF7A10]">
              <UserCheck className="w-3.5 h-3.5" /> 96.2% On-Time
            </span>
          </div>

          <div className="flex items-center bg-[#F7F5F2] border border-[#E9E5E1] p-1 rounded-xl gap-1">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === 'weekly'
                  ? 'bg-white text-[#FF7A10] shadow-xs'
                  : 'text-[#666A64] hover:text-[#1F221D]'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === 'monthly'
                  ? 'bg-white text-[#FF7A10] shadow-xs'
                  : 'text-[#666A64] hover:text-[#1F221D]'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Multi-Line Container */}
      <div className="flex-1 w-full min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9E5E1" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#666A64"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#666A64', fontWeight: 600 }}
            />
            <YAxis
              stroke="#666A64"
              fontSize={10}
              domain={[80, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#666A64' }}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="geofenceAccuracy"
              name="Geofence Accuracy"
              stroke="#FF7A10"
              strokeWidth={3}
              dot={{ r: 4, fill: '#FF7A10', strokeWidth: 2, stroke: '#white' }}
              activeDot={{ r: 6, stroke: '#FF7A10', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="shiftEfficiency"
              name="Shift Efficiency"
              stroke="#2E7D32"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#2E7D32' }}
            />
            <Line
              type="monotone"
              dataKey="onTimeRate"
              name="On-Time Attendance"
              stroke="#1565C0"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#1565C0' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmployeePerformanceChart;
