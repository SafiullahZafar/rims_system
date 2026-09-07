import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PageHeader } from '../../components/shared/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { api } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { Employee } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Shield,
  RefreshCw,
} from 'lucide-react';

export const EmployeesScreen: React.FC = () => {
  const navigate = useNavigate();
  const addNotification = useAppStore((s) => s.addNotification);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to load employees.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteEmployee(deleteTarget.id);
      addNotification(`Employee "${deleteTarget.name}" deleted successfully.`, 'success');
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to delete employee.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.phone && emp.phone.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? emp.is_active
        : !emp.is_active;

    return matchesSearch && matchesStatus;
  });

  return (
    <PageWrapper className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-[1600px] mx-auto pb-24 md:pb-8">
        <PageHeader
          title="Employees Directory"
          subtitle="Manage restaurant staff, roles, and employment profiles"
          breadcrumb="People / Employees"
          icon={Users}
          primaryAction={{
            label: 'Create Employee',
            icon: UserPlus,
            onClick: () => navigate('/employees/new'),
          }}
          secondaryActions={
            <button
              onClick={fetchEmployees}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] text-[#666A64] hover:text-[#1F221D] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh employee list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666A64]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-[#F7F5F2] border border-[#E9E5E1] p-1 rounded-xl gap-1 w-full sm:w-auto">
              {(['all', 'active', 'inactive'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-[#FF7A10] shadow-xs'
                      : 'text-[#666A64] hover:text-[#1F221D]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div className="bg-white border border-[#E9E5E1] rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 text-[#FF7A10] animate-spin" />
            <p className="text-xs font-semibold text-[#666A64]">Loading employees directory…</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-white border border-[#E9E5E1] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2E8] text-[#FF7A10] flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1F221D]">No Employees Found</h3>
            <p className="text-xs text-[#666A64] mt-1 max-w-sm">
              No employee matches your filter criteria. Click "Create Employee" to add staff.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E9E5E1] rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F2] border-b border-[#E9E5E1] text-[11px] uppercase text-[#666A64] font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Employee Name</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E5E1]">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#F7F5F2]/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FFF2E8] border border-[#FF7A10]/20 flex items-center justify-center text-[#FF7A10] font-bold text-xs flex-shrink-0">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1F221D]">{emp.name}</p>
                          <p className="text-[10px] text-[#666A64]">ID: EMP-{emp.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#FF7A10]" />
                        <span className="font-semibold text-[#1F221D]">
                          {emp.role?.name || 'Staff Member'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-[#666A64]">
                        {emp.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#666A64]" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                        {emp.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-[#666A64]" />
                            <span>{emp.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          emp.is_active
                            ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                            : 'bg-[#C62828]/10 text-[#C62828] border border-[#C62828]/20'
                        }`}
                      >
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/employees/${emp.id}/edit`)}
                          className="p-2 rounded-xl text-[#FF7A10] bg-[#FFF2E8] border border-[#FF7A10]/20 hover:bg-[#FFE6D5] transition-all cursor-pointer"
                          title="Edit employee details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="p-2 rounded-xl text-[#C62828] bg-[#C62828]/10 border border-[#C62828]/20 hover:bg-[#C62828]/20 transition-all cursor-pointer"
                          title="Delete employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Delete Employee"
          message={`Are you sure you want to delete employee "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmText="Delete Employee"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      </div>
    </PageWrapper>
  );
};

export default EmployeesScreen;
