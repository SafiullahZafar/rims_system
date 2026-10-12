import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Clock3, RefreshCw, Users } from 'lucide-react';
import { api, DemoActivity } from '../../services/api';

const formatDateTime = (value: string) => new Date(value).toLocaleString();

export const DemoActivityScreen: React.FC = () => {
  const [visitors, setVisitors] = useState<DemoActivity[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setVisitors(await api.getDemoActivity());
      setError('');
      setLastUpdated(new Date());
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load demo activity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const totalActions = visitors.reduce((total, visitor) => total + visitor.logs_count, 0);

  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#1F221D]">Demo activity</h1>
          <p className="text-sm text-[#666A64] mt-1">Demo visitors and their actions only. This list refreshes every 10 seconds.</p>
          {lastUpdated && <p className="text-xs text-[#8A8D87] mt-1">Last updated {lastUpdated.toLocaleTimeString()}</p>}
        </div>
        <button onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#E9E5E1] bg-white px-3 py-2 text-xs font-bold text-[#1F221D] disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-[#E9E5E1] bg-white p-4">
          <Users className="h-5 w-5 text-[#FF7A10]" />
          <div><p className="text-xs text-[#666A64]">Demo visitors</p><p className="text-lg font-black text-[#1F221D]">{visitors.length}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#E9E5E1] bg-white p-4">
          <Activity className="h-5 w-5 text-[#FF7A10]" />
          <div><p className="text-xs text-[#666A64]">Recorded actions</p><p className="text-lg font-black text-[#1F221D]">{totalActions}</p></div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E9E5E1] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7F5F2] text-[11px] uppercase tracking-wide text-[#666A64]">
              <tr><th className="p-4">Demo user</th><th className="p-4">IP address</th><th className="p-4">Session started</th><th className="p-4">Last active</th><th className="p-4">Activity logs</th></tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor.id} className="border-t border-[#E9E5E1] align-top">
                  <td className="p-4 font-bold text-[#1F221D]">{visitor.name}</td>
                  <td className="p-4 text-[#666A64]">{visitor.ip_address ?? 'Unavailable'}</td>
                  <td className="p-4 whitespace-nowrap text-[#666A64]">{formatDateTime(visitor.started_at)}</td>
                  <td className="p-4 whitespace-nowrap text-[#666A64]"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{formatDateTime(visitor.last_seen_at)}</span></td>
                  <td className="p-4">
                    <details className="min-w-44">
                      <summary className="cursor-pointer font-bold text-[#FF7A10]">View logs ({visitor.logs_count})</summary>
                      <div className="mt-3 max-h-80 min-w-[32rem] overflow-auto rounded-lg border border-[#E9E5E1]">
                        <table className="w-full text-left text-xs">
                          <thead className="sticky top-0 bg-[#F7F5F2] text-[#666A64]"><tr><th className="p-2">Action</th><th className="p-2">Path</th><th className="p-2">IP address</th><th className="p-2">Time</th></tr></thead>
                          <tbody>
                            {visitor.logs.map((log) => <tr key={log.id} className="border-t border-[#E9E5E1]"><td className="p-2 font-bold">{log.method}</td><td className="p-2 font-mono">{log.path}</td><td className="p-2">{log.ip_address ?? 'Unavailable'}</td><td className="p-2 whitespace-nowrap">{formatDateTime(log.created_at)}</td></tr>)}
                            {visitor.logs.length === 0 && <tr><td colSpan={4} className="p-3 text-center text-[#666A64]">No activity recorded for this visit.</td></tr>}
                          </tbody>
                        </table>
                        {visitor.logs_count > visitor.logs.length && <p className="p-2 text-center text-[11px] text-[#666A64]">Showing the latest {visitor.logs.length} of {visitor.logs_count} actions.</p>}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
              {!loading && visitors.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-[#666A64]">No demo visitors yet. A user appears here after opening the demo.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
