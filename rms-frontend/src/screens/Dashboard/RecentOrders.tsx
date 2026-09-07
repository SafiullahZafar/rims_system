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

const defaultMockOrders = [
  { id: '#ORD-9821', tableId: 4, items: 3, status: 'in-progress', amount: 48.50, time: '10 mins ago' },
  { id: '#ORD-9820', tableId: 2, items: 5, status: 'ready', amount: 82.00, time: '14 mins ago' },
  { id: '#ORD-9819', tableId: 8, items: 2, status: 'completed', amount: 34.20, time: '22 mins ago' },
  { id: '#ORD-9818', tableId: 1, items: 4, status: 'waiting', amount: 65.00, time: '28 mins ago' },
  { id: '#ORD-9817', tableId: 6, items: 6, status: 'completed', amount: 110.40, time: '35 mins ago' },
  { id: '#ORD-9816', tableId: 3, items: 2, status: 'completed', amount: 29.80, time: '42 mins ago' },
  { id: '#ORD-9815', tableId: 5, items: 4, status: 'ready', amount: 74.00, time: '50 mins ago' },
  { id: '#ORD-9814', tableId: 7, items: 3, status: 'completed', amount: 56.10, time: '1 hr ago' },
  { id: '#ORD-9813', tableId: 9, items: 5, status: 'completed', amount: 92.30, time: '1 hr 15 mins ago' },
  { id: '#ORD-9812', tableId: 11, items: 1, status: 'completed', amount: 18.50, time: '1 hr 30 mins ago' },
  { id: '#ORD-9811', tableId: 10, items: 4, status: 'completed', amount: 64.00, time: '1 hr 45 mins ago' },
  { id: '#ORD-9810', tableId: 12, items: 2, status: 'completed', amount: 28.50, time: '2 hrs ago' },
];

export const RecentOrders: React.FC = () => {
  const storeOrders = useOrderStore((s) => s.orders);
  const tables = useTableStore((s) => s.tables);

  const displayOrders = storeOrders.length > 0
    ? storeOrders.map(o => ({
        id: `#ORD-${o.id}`,
        tableId: o.tableId,
        items: o.items,
        status: o.status,
        amount: o.amount,
        time: 'Just now',
      }))
    : defaultMockOrders;

  // 12 Tables for floor status widget
  const displayTables = tables.length > 0 ? tables : [
    { id: 1, section: 'A', seats: 4, status: 'occupied', duration: '28', amount: 65.00 },
    { id: 2, section: 'A', seats: 2, status: 'occupied', duration: '14', amount: 82.00 },
    { id: 3, section: 'B', seats: 6, status: 'available', duration: '0', amount: 0 },
    { id: 4, section: 'B', seats: 4, status: 'occupied', duration: '10', amount: 48.50 },
    { id: 5, section: 'C', seats: 2, status: 'reserved', duration: '0', amount: 0 },
    { id: 6, section: 'C', seats: 8, status: 'available', duration: '0', amount: 0 },
    { id: 7, section: 'D', seats: 4, status: 'occupied', duration: '45', amount: 112.00 },
    { id: 8, section: 'D', seats: 2, status: 'available', duration: '0', amount: 0 },
    { id: 9, section: 'A', seats: 6, status: 'reserved', duration: '0', amount: 0 },
    { id: 10, section: 'B', seats: 4, status: 'occupied', duration: '18', amount: 55.40 },
    { id: 11, section: 'C', seats: 2, status: 'available', duration: '0', amount: 0 },
    { id: 12, section: 'D', seats: 8, status: 'occupied', duration: '32', amount: 94.80 },
  ];

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
            Active Zones A - D ({displayTables.length} tables)
          </span>
        </div>

        <div className="overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                          ${tbl.amount ? tbl.amount.toFixed(2) : '45.00'}
                        </span>
                        <span className="text-[10px] text-[#666A64] font-medium flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {tbl.duration || '20'}m
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
