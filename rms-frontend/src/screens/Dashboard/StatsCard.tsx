import React from 'react';
import { AnimatedNumber } from '../../components/shared/AnimatedNumber';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  accent?: string;
  trend?: string;
  trendPositive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  accent = '#FF7A10',
  trend,
  trendPositive = true,
}) => {
  return (
    <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3 hover:border-[#FF7A10]/30 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#666A64] uppercase tracking-wider">{title}</span>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-black text-[#1F221D] tracking-tight">
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
        </h3>

        {trend && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                trendPositive
                  ? 'bg-[#2E7D32]/10 text-[#2E7D32]'
                  : 'bg-[#C62828]/10 text-[#C62828]'
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
