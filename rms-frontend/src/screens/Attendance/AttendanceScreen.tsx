import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatsCard } from '../Dashboard/StatsCard';
import { api } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { AttendanceLog, Employee } from '../../types';
import {
  Clock,
  Calendar,
  Plus,
  RefreshCw,
  UserCheck,
  UserX,
  AlertCircle,
  X,
  Save,
} from 'lucide-react';

const todayDate = () => new Date().toISOString().slice(0, 10);

type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day';

export const AttendanceScreen: React.FC = () => {
  const addNotification = useAppStore((s) => s.addNotification);

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(todayDate());
  const [filterEmpId, setFilterEmpId] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLog, setEditLog] = useState<AttendanceLog | null>(null);
  const [modalEmpId, setModalEmpId] = useState('');
  const [modalDate, setModalDate] = useState(todayDate());
  const [modalCheckIn, setModalCheckIn] = useState('');
  const [modalCheckOut, setModalCheckOut] = useState('');
  const [modalStatus, setModalStatus] = useState<AttendanceStatus>('present');
  const [modalNotes, setModalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedLogs, fetchedEmps] = await Promise.all([
        api.getAttendanceLogs({
          date: filterDate || undefined,
          employee_id: filterEmpId ? Number(filterEmpId) : undefined,
        }),
        api.getEmployees(),
      ]);
      setLogs(fetchedLogs);
      setEmployees(fetchedEmps);
    } catch {
      addNotification('Failed to load attendance records.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filterDate, filterEmpId, addNotification]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const openLogModal = (log?: AttendanceLog) => {
    if (log) {
      setEditLog(log);
      setModalEmpId(String(log.employee_id));
      setModalDate(log.date);
      setModalCheckIn(log.check_in || '');
      setModalCheckOut(log.check_out || '');
      setModalStatus(log.status);
      setModalNotes(log.notes || '');
    } else {
      setEditLog(null);
      setModalEmpId('');
      setModalDate(filterDate || todayDate());
      setModalCheckIn('09:00');
      setModalCheckOut('17:00');
      setModalStatus('present');
      setModalNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmpId) return addNotification('Please select an employee.', 'warning');

    const payload = {
      employee_id: Number(modalEmpId),
      date: modalDate,
      check_in: modalCheckIn.trim() || undefined,
      check_out: modalCheckOut.trim() || undefined,
      status: modalStatus,
      notes: modalNotes.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (editLog) {
        await api.updateAttendanceLog(editLog.id, payload);
        addNotification('Attendance entry updated.', 'success');
      } else {
        await api.createAttendanceLog(payload);
        addNotification('Attendance entry created.', 'success');
      }
      setIsModalOpen(false);
      fetchAttendanceData();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to save attendance.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentCount = logs.filter((l) => l.status === 'present').length;
  const lateCount = logs.filter((l) => l.status === 'late').length;
  const absentCount = logs.filter((l) => l.status === 'absent').length;
  const halfDayCount = logs.filter((l) => l.status === 'half-day').length;

  return (
    <PageWrapper className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-[1600px] mx-auto pb-24 md:pb-8">
        <PageHeader
          title="Attendance & Clock Logs"
          subtitle="Monitor daily employee check-ins, shift hours, and clock-in records"
          breadcrumb="People / Attendance"
          icon={Clock}
          primaryAction={{
            label: 'Log Attendance',
            icon: Plus,
            onClick: () => openLogModal(),
          }}
          secondaryActions={
            <button
              onClick={fetchAttendanceData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] text-[#666A64] hover:text-[#1F221D] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Present Today"
            value={presentCount}
            icon={UserCheck}
            accent="#2E7D32"
            trend="On duty"
            trendPositive
          />
          <StatsCard
            title="Late Arrivals"
            value={lateCount}
            icon={AlertCircle}
            accent="#FF7A10"
            trend="Flagged check-ins"
            trendPositive={false}
          />
          <StatsCard
            title="Absent Staff"
            value={absentCount}
            icon={UserX}
            accent="#C62828"
            trend="Unscheduled absence"
            trendPositive={false}
          />
          <StatsCard
            title="Half-Day Shifts"
            value={halfDayCount}
            icon={Clock}
            accent="#1565C0"
            trend="Partial shifts"
            trendPositive
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Date filter */}
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 absolute left-3.5 text-[#666A64]" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] transition-all"
              />
            </div>

            {/* Employee filter */}
            <div className="relative">
              <select
                value={filterEmpId}
                onChange={(e) => setFilterEmpId(e.target.value)}
                className="bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] cursor-pointer transition-all min-w-[160px]"
              >
                <option value="">All Staff Members</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        {isLoading ? (
          <div className="bg-white border border-[#E9E5E1] rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 text-[#FF7A10] animate-spin" />
            <p className="text-xs font-semibold text-[#666A64]">Loading attendance records…</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-[#E9E5E1] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2E8] text-[#FF7A10] flex items-center justify-center mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1F221D]">No Attendance Logs Found</h3>
            <p className="text-xs text-[#666A64] mt-1 max-w-sm">
              No clock logs match the selected date or employee filter.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E9E5E1] rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F2] border-b border-[#E9E5E1] text-[11px] uppercase text-[#666A64] font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Shift Date</th>
                  <th className="px-5 py-3.5">Check In</th>
                  <th className="px-5 py-3.5">Check Out</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Notes</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E5E1]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F5F2]/60 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#1F221D]">
                      {log.employeeName || `Employee #${log.employee_id}`}
                    </td>
                    <td className="px-5 py-4 text-[#666A64]">{log.date}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-[#1F221D]">
                      {log.check_in || '—'}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-[#1F221D]">
                      {log.check_out || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                          log.status === 'present'
                            ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                            : log.status === 'absent'
                            ? 'bg-[#C62828]/10 text-[#C62828] border border-[#C62828]/20'
                            : log.status === 'late'
                            ? 'bg-[#FF7A10]/10 text-[#FF7A10] border border-[#FF7A10]/20'
                            : 'bg-[#1565C0]/10 text-[#1565C0] border border-[#1565C0]/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#666A64] max-w-[200px] truncate">
                      {log.notes || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openLogModal(log)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#FF7A10] bg-[#FFF2E8] border border-[#FF7A10]/20 hover:bg-[#FFE6D5] transition-all cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white border border-[#E9E5E1] rounded-2xl w-full max-w-md p-6 shadow-xl relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#666A64] hover:text-[#1F221D] hover:bg-[#F7F5F2]"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-[#1F221D] mb-4 pb-2 border-b border-[#E9E5E1]">
                {editLog ? 'Edit Attendance Entry' : 'Log Employee Attendance'}
              </h3>

              <form onSubmit={handleSaveAttendance} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Employee <span className="text-[#C62828]">*</span>
                  </label>
                  <select
                    value={modalEmpId}
                    onChange={(e) => setModalEmpId(e.target.value)}
                    required
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                  >
                    <option value="">Select Employee…</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Shift Date <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    required
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                      Check In Time
                    </label>
                    <input
                      type="time"
                      value={modalCheckIn}
                      onChange={(e) => setModalCheckIn(e.target.value)}
                      className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                      Check Out Time
                    </label>
                    <input
                      type="time"
                      value={modalCheckOut}
                      onChange={(e) => setModalCheckOut(e.target.value)}
                      className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Attendance Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as AttendanceStatus)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] capitalize"
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half-Day</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Shift Notes
                  </label>
                  <textarea
                    rows={2}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Optional notes…"
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl p-3 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E9E5E1]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#666A64] bg-[#F7F5F2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#FF7A10] hover:bg-[#E86000]"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AttendanceScreen;
