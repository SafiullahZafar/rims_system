import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const EmployeePerformanceChart: React.FC = () => {
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
            Attendance and geofence metrics will appear when this workspace has recorded activity.
          </p>
        </div>

      </div>

      <div className="flex-1 min-h-[240px] flex items-center justify-center text-sm text-[#666A64]">
        No attendance performance data yet.
      </div>
    </div>
  );
};

export default EmployeePerformanceChart;
