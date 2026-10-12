import React from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { useTableStore } from '../../store/useTableStore';
import { Users, Clock, Grid, CheckCircle2, AlertCircle } from 'lucide-react';

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  'waiting':     { bg: 'rgba(21,101,192,0.10)', text: '#1565C0', label: 'Waiting' },
  'in-progress': { bg: 'rgba(255,122,16,0.10)', text: '#FF7A10', label: 'In Progress' },
  'ready':       { bg: 'rgba(46,125,50,0.10)', text: '#2E7D32', label: 'Ready' },
  'completed':   { bg: 'rgba(85,87,84,0.10)', text: '#555754', label: 'Completed' },
};

export const RecentOrders: React.FC = () => {
  const storeOrders = useOrderStore((s) => s.orders);
  const tables = useTableStore((s) => s.tables);

  const displayOrders = storeOrders.map(o => ({
        id: `#ORD-${o.id}`,
        tableId: o.tableId,
        items: o.items,
        status: o.status,
        amount: o.amount,
        time: o.time,
      }));
  const displayTables = tables;
  const zones = [...new Set(displayTables.map((table) => table.section))].sort();

  return (
    <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 flex flex-col gap-5 shadow-xs h-full">
      {/* Upper Part: Recent Sales Table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1F221D]">Recent Sales & Live Transactions</h3>
            <p className="text-xs text-[#666A64]">Real-time transaction feed (Scroll to view all)</p>
          </div>
          <span className="text-xs font-extrabold text-[#FF7A10] bg-[#FFF2E8] border border-[#FF7A10]/20 px-3 py-1 rounded-full">
            {displayOrders.length} orders
          </span>
        </div>

        <div className="overflow-y-auto max-h-[415px] border border-[#E9E5E1] rounded-xl custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#F7F5F2] border-b border-[#E9E5E1] z-10">
              <tr>
                <th className="py-2.5 px-3.5 text-[10px] uppercase tracking-wider font-extrabold text-[#666A64]">Order ID</th>
                <th className="py-2.5 px-3.5 text-[10px] uppercase tracking-wider font-extrabold text-[#666A64]">Table</th>
                <th className="py-2.5 px-3.5 text-[10px] uppercase tracking-wider font-extrabold text-[#666A64]">Items</th>
                <th className="py-2.5 px-3.5 text-[10px] uppercase tracking-wider font-extrabold text-[#666A64]">Time</th>
                <th className="py-2.5 px-3.5 text-[10px] uppercase tracking-wider font-extrabold text-[#666A64]">Status</th>
                <th className="py-2.5 px-3.5 text-right text-[10px] uppercase tracking-wider font-extrabold text-[#666A64]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5E1]">
              {displayOrders.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-[#666A64]">No orders yet in this workspace.</td></tr>
              )}
              {displayOrders.map((order, idx) => {
                const s = statusStyle[order.status] ?? statusStyle['completed'];
                return (
                  <tr key={idx} className="hover:bg-[#F7F5F2]/70 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-[#1F221D] font-mono">{order.id}</td>
                    <td className="py-3 px-3.5 text-[#666A64] font-semibold">Table {order.tableId}</td>
                    <td className="py-3 px-3.5 text-[#666A64]">{order.items} items</td>
                    <td className="py-3 px-3.5 text-[#666A64] font-medium">{order.time}</td>
                    <td className="py-3 px-3.5">
                      <span
                        className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block"
                        style={{ background: s.bg, color: s.text }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-extrabold text-[#FF7A10] text-sm">
                      ${order.amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lower Part: Live Floor & Table Status Overview (Scrollable Grid) */}
      <div className="pt-3 border-t border-[#E9E5E1] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#FF7A10]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F221D]">
              Live Floor & Table Status Overview
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-[#666A64]">
            {displayTables.length ? `Zones ${zones.join(', ')} (${displayTables.length} tables)` : 'No tables configured'}
          </span>
        </div>

        <div className="overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {displayTables.length === 0 && <p className="col-span-full py-6 text-center text-sm text-[#666A64]">No tables have been set up yet.</p>}
            {displayTables.map((tbl) => {
              const isOccupied = tbl.status === 'occupied';
              const isReserved = tbl.status === 'reserved';

              return (
                <div
                  key={tbl.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isOccupied
                      ? 'bg-[#FFF2E8]/40 border-[#FF7A10]/30'
                      : isReserved
                      ? 'bg-[#F7F5F2] border-[#E9E5E1]'
                      : 'bg-white border-[#E9E5E1] hover:border-[#2E7D32]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-[#666A64] uppercase">
                      Zone {tbl.section}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOccupied
                          ? 'bg-[#FF7A10] animate-pulse'
                          : isReserved
                          ? 'bg-[#555754]'
                          : 'bg-[#2E7D32]'
                      }`}
                    />
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-black text-[#1F221D]">Table {tbl.id}</span>
                    <span className="text-[10px] font-bold text-[#666A64] flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#666A64]" /> {tbl.seats} Seats
                    </span>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-[#E9E5E1]/60 flex items-center justify-between text-[11px]">
                    {isOccupied ? (
                      <>
                        <span className="text-[#FF7A10] font-bold font-mono">
                          {tbl.amount !== undefined ? `$${tbl.amount.toFixed(2)}` : 'Active'}
                        </span>
                        <span className="text-[10px] text-[#666A64] font-medium flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {tbl.duration !== undefined ? `${tbl.duration}m` : 'In progress'}
                        </span>
                      </>
                    ) : isReserved ? (
                      <span className="text-[10px] font-bold text-[#555754] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-[#555754]" /> Reserved
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-[#2E7D32] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" /> Ready
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
