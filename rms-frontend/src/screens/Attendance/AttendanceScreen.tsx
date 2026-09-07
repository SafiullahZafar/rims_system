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
  CheckSquare,
  ClipboardList,
} from 'lucide-react';

const todayDate = () => new Date().toISOString().slice(0, 10);

type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day';

interface BulkEntry {
  employee_id: number;
  name: string;
  status: AttendanceStatus;
  check_in: string;
  check_out: string;
  notes: string;
}

export const AttendanceScreen: React.FC = () => {
  const addNotification = useAppStore((s) => s.addNotification);

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(todayDate());
  const [filterEmpId, setFilterEmpId] = useState('');

  // Single log modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLog, setEditLog] = useState<AttendanceLog | null>(null);
  const [modalEmpId, setModalEmpId] = useState('');
  const [modalDate, setModalDate] = useState(todayDate());
  const [modalCheckIn, setModalCheckIn] = useState('');
  const [modalCheckOut, setModalCheckOut] = useState('');
  const [modalStatus, setModalStatus] = useState<AttendanceStatus>('present');
  const [modalNotes, setModalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk mark mode
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkDate, setBulkDate] = useState(todayDate());
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

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

  // When bulk mode opens, prefill all active employees
  const openBulkMode = async () => {
    // Fetch fresh employees list
    let emps = employees;
    if (emps.length === 0) {
      try {
        emps = await api.getEmployees();
        setEmployees(emps);
      } catch {
        addNotification('Failed to load employees.', 'error');
        return;
      }
    }
    const activeEmps = emps.filter((e) => e.is_active);
    // Prefill with existing logs for bulkDate
    const existingLogs = await api.getAttendanceLogs({ date: bulkDate });
    const entries: BulkEntry[] = activeEmps.map((emp) => {
      const existing = existingLogs.find((l: AttendanceLog) => l.employee_id === emp.id);
      return {
        employee_id: emp.id,
        name: emp.name,
        status: existing?.status ?? 'present',
        check_in: existing?.check_in ?? '09:00',
        check_out: existing?.check_out ?? '17:00',
        notes: existing?.notes ?? '',
      };
    });
    setBulkEntries(entries);
    setIsBulkMode(true);
  };

  const updateBulkEntry = (idx: number, field: keyof BulkEntry, value: string) => {
    setBulkEntries((prev) => {
      const next = [...prev];
      (next[idx] as any)[field] = value;
      // Auto clear times if absent
      if (field === 'status' && value === 'absent') {
        next[idx].check_in = '';
        next[idx].check_out = '';
      }
      return next;
    });
  };

  const applyStatusToAll = (status: AttendanceStatus) => {
    setBulkEntries((prev) =>
      prev.map((e) => ({
        ...e,
        status,
        check_in: status === 'absent' ? '' : e.check_in || '09:00',
        check_out: status === 'absent' ? '' : e.check_out || '17:00',
      }))
    );
  };

  const handleBulkSave = async () => {
    setIsBulkSubmitting(true);
    try {
      await Promise.all(
        bulkEntries.map((entry) =>
          api.createAttendanceLog({
            employee_id: entry.employee_id,
            date: bulkDate,
            check_in: entry.status !== 'absent' ? entry.check_in || undefined : undefined,
            check_out: entry.status !== 'absent' ? entry.check_out || undefined : undefined,
            status: entry.status,
            notes: entry.notes || undefined,
          })
        )
      );
      addNotification(`Attendance marked for ${bulkEntries.length} employees on ${bulkDate}.`, 'success');
      setIsBulkMode(false);
      setFilterDate(bulkDate);
      fetchAttendanceData();
    } catch {
      addNotification('Some entries failed. Please check and retry.', 'error');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

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

  const quickSetStatus = async (log: AttendanceLog, targetStatus: AttendanceStatus) => {
    try {
      await api.updateAttendanceLog(log.id, {
        employee_id: log.employee_id,
        date: log.date,
        status: targetStatus,
        check_in: targetStatus === 'absent' ? undefined : log.check_in || '09:00',
        check_out: targetStatus === 'absent' ? undefined : log.check_out || '17:00',
      });
      addNotification(`Updated status to ${targetStatus.toUpperCase()} for ${log.employeeName || 'staff member'}.`, 'success');
      fetchAttendanceData();
    } catch {
      addNotification('Failed to update attendance status.', 'error');
    }
  };

  const presentCount = logs.filter((l) => l.status === 'present').length;
  const lateCount = logs.filter((l) => l.status === 'late').length;
  const absentCount = logs.filter((l) => l.status === 'absent').length;
  const halfDayCount = logs.filter((l) => l.status === 'half-day').length;

  const statusColors: Record<AttendanceStatus, string> = {
    present: 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20',
    absent:  'bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20',
    late:    'bg-[#FF7A10]/10 text-[#FF7A10] border-[#FF7A10]/20',
    'half-day': 'bg-[#1565C0]/10 text-[#1565C0] border-[#1565C0]/20',
  };

  // ── Bulk Mark Mode UI ────────────────────────────────────────────────────────
  if (isBulkMode) {
    return (
      <PageWrapper className="h-full overflow-y-auto bg-white">
        <div className="p-6 max-w-[1200px] mx-auto pb-24 md:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-[#1F221D]">Bulk Attendance Mark</h1>
              <p className="text-xs text-[#666A64] mt-0.5">Mark attendance for all active employees at once</p>
            </div>
            <button
              onClick={() => setIsBulkMode(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#666A64] bg-[#F7F5F2] border border-[#E9E5E1] hover:bg-[#E9E5E1] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>

          {/* Controls */}
          <div className="bg-white border border-[#E9E5E1] rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#666A64]" />
              <label className="text-xs font-bold text-[#666A64]">Date:</label>
              <input
                type="date"
                value={bulkDate}
                onChange={(e) => setBulkDate(e.target.value)}
                className="bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-3 py-1.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
              />
            </div>
            <div className="flex-1" />
            <span className="text-xs font-bold text-[#666A64]">Quick Apply All:</span>
            {(['present', 'late', 'absent', 'half-day'] as AttendanceStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => applyStatusToAll(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border transition-all cursor-pointer capitalize ${statusColors[s]}`}
              >
                All {s}
              </button>
            ))}
          </div>

          {/* Employee Grid */}
          <div className="bg-white border border-[#E9E5E1] rounded-2xl overflow-hidden shadow-xs mb-4">
            <div className="bg-[#F7F5F2] border-b border-[#E9E5E1] px-5 py-3 grid grid-cols-[1fr_130px_80px_80px_1fr] gap-3 text-[10px] font-extrabold uppercase tracking-wider text-[#666A64]">
              <span>Employee</span>
              <span>Status</span>
              <span>Check In</span>
              <span>Check Out</span>
              <span>Notes</span>
            </div>

            <div className="divide-y divide-[#E9E5E1]">
              {bulkEntries.map((entry, idx) => (
                <div
                  key={entry.employee_id}
                  className="px-5 py-3 grid grid-cols-[1fr_130px_80px_80px_1fr] gap-3 items-center hover:bg-[#F7F5F2]/40 transition-colors"
                >
                  {/* Name */}
                  <span className="text-xs font-bold text-[#1F221D] truncate">{entry.name}</span>

                  {/* Status */}
                  <select
                    value={entry.status}
                    onChange={(e) => updateBulkEntry(idx, 'status', e.target.value)}
                    className={`text-[10px] font-extrabold rounded-lg px-2 py-1.5 border outline-none cursor-pointer capitalize ${statusColors[entry.status]}`}
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half-Day</option>
                  </select>

                  {/* Check In */}
                  <input
                    type="time"
                    value={entry.check_in}
                    disabled={entry.status === 'absent'}
                    onChange={(e) => updateBulkEntry(idx, 'check_in', e.target.value)}
                    className="bg-[#F7F5F2] border border-[#E9E5E1] rounded-lg px-2 py-1.5 text-[10px] font-mono text-[#1F221D] outline-none focus:border-[#FF7A10] disabled:opacity-40 w-full"
                  />

                  {/* Check Out */}
                  <input
                    type="time"
                    value={entry.check_out}
                    disabled={entry.status === 'absent'}
                    onChange={(e) => updateBulkEntry(idx, 'check_out', e.target.value)}
                    className="bg-[#F7F5F2] border border-[#E9E5E1] rounded-lg px-2 py-1.5 text-[10px] font-mono text-[#1F221D] outline-none focus:border-[#FF7A10] disabled:opacity-40 w-full"
                  />

                  {/* Notes */}
                  <input
                    type="text"
                    value={entry.notes}
                    onChange={(e) => updateBulkEntry(idx, 'notes', e.target.value)}
                    placeholder="Optional note…"
                    className="bg-[#F7F5F2] border border-[#E9E5E1] rounded-lg px-3 py-1.5 text-[10px] text-[#1F221D] outline-none focus:border-[#FF7A10] w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsBulkMode(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#666A64] bg-[#F7F5F2] border border-[#E9E5E1] hover:bg-[#E9E5E1] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkSave}
              disabled={isBulkSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF7A10] hover:bg-[#E86000] transition-all cursor-pointer disabled:opacity-50"
            >
              {isBulkSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save All {bulkEntries.length} Entries
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Normal Attendance View ───────────────────────────────────────────────────
  return (
    <PageWrapper className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-[1600px] mx-auto pb-24 md:pb-8">
        <PageHeader
          title="Attendance &amp; Clock Logs"
          subtitle="Monitor daily employee check-ins, shift hours, and clock-in records"
          breadcrumb="People / Attendance"
          icon={Clock}
          primaryAction={{
            label: 'Log Attendance',
            icon: Plus,
            onClick: () => openLogModal(),
          }}
          secondaryActions={
            <div className="flex items-center gap-2">
              <button
                onClick={openBulkMode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F221D] text-white text-xs font-bold hover:bg-[#333] transition-all cursor-pointer"
                title="Mark attendance for all employees at once"
              >
                <ClipboardList className="w-4 h-4" />
                Bulk Mark All
              </button>
              <button
                onClick={fetchAttendanceData}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] text-[#666A64] hover:text-[#1F221D] transition-all cursor-pointer disabled:opacity-50"
                title="Refresh logs"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          }
        />

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Present Today"  value={presentCount}  icon={UserCheck}    accent="#2E7D32" trend="On duty"             trendPositive />
          <StatsCard title="Late Arrivals"  value={lateCount}     icon={AlertCircle}  accent="#FF7A10" trend="Flagged check-ins"   trendPositive={false} />
          <StatsCard title="Absent Staff"   value={absentCount}   icon={UserX}        accent="#C62828" trend="Unscheduled absence" trendPositive={false} />
          <StatsCard title="Half-Day Shifts" value={halfDayCount} icon={Clock}        accent="#1565C0" trend="Partial shifts"      trendPositive />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 absolute left-3.5 text-[#666A64]" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] transition-all"
              />
            </div>
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
            <button
              onClick={openBulkMode}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7A10] text-white text-xs font-bold hover:bg-[#E86000] transition-all cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              Bulk Mark Attendance for {filterDate}
            </button>
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
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize border ${statusColors[log.status]}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#666A64] max-w-[200px] truncate">
                      {log.notes || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => quickSetStatus(log, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                            log.status === 'present'
                              ? 'bg-[#2E7D32] text-white shadow-2xs'
                              : 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 hover:bg-[#2E7D32]/20'
                          }`}
                          title="Set status to Present"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => quickSetStatus(log, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                            log.status === 'absent'
                              ? 'bg-[#C62828] text-white shadow-2xs'
                              : 'bg-[#C62828]/10 text-[#C62828] border border-[#C62828]/20 hover:bg-[#C62828]/20'
                          }`}
                          title="Set status to Absent"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => openLogModal(log)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#FF7A10] bg-[#FFF2E8] border border-[#FF7A10]/20 hover:bg-[#FFE6D5] transition-all cursor-pointer"
                          title="Edit full log details"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Single Entry Modal */}
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
                      disabled={modalStatus === 'absent'}
                      className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] disabled:opacity-40"
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
                      disabled={modalStatus === 'absent'}
                      className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] disabled:opacity-40"
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
