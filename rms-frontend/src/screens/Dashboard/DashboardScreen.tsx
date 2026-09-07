import React from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { StatsCard } from './StatsCard';
import { SalesBarChart } from './SalesBarChart';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { RightInsightPanel } from './RightInsightPanel';
import { RecentOrders } from './RecentOrders';
import {
  TrendingUp,
  Receipt,
  Flame,
  Grid,
} from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useTableStore } from '../../store/useTableStore';
import { useKitchenStore } from '../../store/useKitchenStore';

export const DashboardScreen: React.FC = () => {
  const orders = useOrderStore((s) => s.orders);
  const tables = useTableStore((s) => s.tables);
  const kitchenOrders = useKitchenStore((s) => s.orders);

  const todayRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const totalOrders = orders.length;
  const inProgressCount = kitchenOrders.filter((o) => o.status === 'cooking' || o.status === 'new').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const occupancyPct = tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0;

  return (
    <PageWrapper className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-[1700px] mx-auto flex flex-col gap-6 pb-24 md:pb-8">
        {/* Top Row: 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Revenue"
            value={todayRevenue || 6000}
            prefix="$"
            icon={TrendingUp}
            accent="#FF7A10"
            trend="+8.9% vs yesterday"
            trendPositive
          />
          <StatsCard
            title="Total Orders"
            value={totalOrders || 128}
            icon={Receipt}
            accent="#2E7D32"
            trend="+4.9% growth"
            trendPositive
          />
          <StatsCard
            title="Kitchen In Progress"
            value={inProgressCount || 14}
            icon={Flame}
            accent="#FF7A10"
            trend={`${inProgressCount} cooking now`}
            trendPositive
          />
          <StatsCard
            title="Table Occupancy"
            value={occupancyPct || 75}
            suffix="%"
            icon={Grid}
            accent="#1565C0"
            trend={`${occupiedCount}/${tables.length || 12} occupied`}
            trendPositive
          />
        </div>

        {/* Main Section: Left Charts Column + Right Insights Column */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          {/* Main Charts Area (Span 2 Columns) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* Middle Bar Chart */}
            <div className="h-[320px]">
              <SalesBarChart />
            </div>

            {/* Lower Performance Trend Area/Line Chart */}
            <div className="h-[280px]">
              <PerformanceTrendChart />
            </div>
          </div>

          {/* Right Insights Column (Span 1 Column) */}
          <div className="xl:col-span-1">
            <RightInsightPanel />
          </div>
        </div>

        {/* Lower Recent Orders Section */}
        <div className="mt-2">
          <RecentOrders />
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardScreen;
