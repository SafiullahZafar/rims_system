import React from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { StatsCard } from './StatsCard';
import { SalesBarChart } from './SalesBarChart';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { EmployeePerformanceChart } from './EmployeePerformanceChart';
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const todayRevenue = orders.reduce((sum, order) => {
    const createdAt = Date.parse(order.createdAt ?? '');
    return createdAt >= todayStart.getTime() && createdAt < tomorrowStart.getTime()
      ? sum + order.amount
      : sum;
  }, 0);
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
            value={todayRevenue}
            prefix="$"
            icon={TrendingUp}
            accent="#FF7A10"
            trend={orders.length ? `${orders.length} orders recorded` : 'No sales yet'}
          />
          <StatsCard
            title="Total Orders"
            value={totalOrders}
            icon={Receipt}
            accent="#2E7D32"
            trend={totalOrders ? 'Orders in this workspace' : 'No orders yet'}
          />
          <StatsCard
            title="Kitchen In Progress"
            value={inProgressCount}
            icon={Flame}
            accent="#FF7A10"
            trend={inProgressCount ? `${inProgressCount} active` : 'Nothing in progress'}
          />
          <StatsCard
            title="Table Occupancy"
            value={occupancyPct}
            suffix="%"
            icon={Grid}
            accent="#1565C0"
            trend={`${occupiedCount}/${tables.length} occupied`}
          />
        </div>

        {/* Middle Section: Recent Sales & Live Table Status (Span 2) + Right Insights Column (Span 1) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          {/* Middle Left: Recent Sales & Live Table Overview */}
          <div className="xl:col-span-2">
            <RecentOrders />
          </div>

          {/* Middle Right: Right Insights Column (Top Performers & Quick Actions) */}
          <div className="xl:col-span-1">
            <RightInsightPanel />
          </div>
        </div>

        {/* Bottom Section: Analytics Graphs & Charts */}
        <div className="flex flex-col gap-6 mt-2">
          {/* Row 1: Sales Bar Report Chart & Performance Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[340px]">
              <SalesBarChart />
            </div>
            <div className="h-[340px]">
              <PerformanceTrendChart />
            </div>
          </div>

          {/* Row 2: Employee Performance & Geofencing Verification Line Chart */}
          <div className="h-[320px]">
            <EmployeePerformanceChart />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardScreen;
