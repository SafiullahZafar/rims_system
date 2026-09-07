import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PageHeader } from '../../components/shared/PageHeader';
import { api } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { UserPlus, ArrowLeft, RefreshCw, Save } from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

export const EmployeeFormScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const addNotification = useAppStore((s) => s.addNotification);

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [pin, setPin] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const fetchedRoles = await api.getRoles();
      setRoles(fetchedRoles.map((r: any) => ({ id: r.id, name: r.name })));

      if (id) {
        const fetchedEmployees = await api.getEmployees();
        const emp = fetchedEmployees.find((e) => e.id === Number(id));
        if (emp) {
          setName(emp.name);
          setEmail(emp.email || '');
          setPhone(emp.phone || '');
          setRoleId(emp.role_id ? String(emp.role_id) : '');
          setIsActive(emp.is_active);
        } else {
          addNotification('Employee not found.', 'error');
          navigate('/employees');
        }
      }
    } catch {
      addNotification('Failed to load initial form data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return addNotification('Employee name is required.', 'warning');

    const payload: Record<string, unknown> = {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      role_id: roleId ? Number(roleId) : undefined,
      is_active: isActive,
    };
    if (pin.trim()) payload.pin = pin.trim();

    setIsSubmitting(true);
    try {
      if (isEdit && id) {
        await api.updateEmployee(Number(id), payload);
        addNotification(`Employee "${name}" updated successfully.`, 'success');
      } else {
        await api.createEmployee(payload);
        addNotification(`Employee "${name}" created successfully.`, 'success');
      }
      navigate('/employees');
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Operation failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-[1000px] mx-auto pb-24 md:pb-8">
        <PageHeader
          title={isEdit ? 'Edit Employee Profile' : 'Create New Employee'}
          subtitle={isEdit ? 'Update employee personal details and access settings' : 'Add a new team member to your restaurant system'}
          breadcrumb={isEdit ? 'People / Employees / Edit' : 'People / Employees / Create'}
          icon={UserPlus}
          secondaryActions={
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#666A64] bg-[#F7F5F2] hover:bg-[#E9E5E1] transition-all cursor-pointer border border-[#E9E5E1]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Employees
            </button>
          }
        />

        {isLoading ? (
          <div className="bg-white border border-[#E9E5E1] rounded-2xl p-12 flex items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-[#FF7A10] animate-spin" />
            <span className="text-xs font-semibold text-[#666A64]">Loading form data…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Section 1: Personal Info */}
            <div className="bg-white border border-[#E9E5E1] rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#1F221D] uppercase tracking-wider mb-4 pb-2 border-b border-[#E9E5E1]">
                1. Personal & Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Full Name <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    required
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@restaurant.com"
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Role & Authentication */}
            <div className="bg-white border border-[#E9E5E1] rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#1F221D] uppercase tracking-wider mb-4 pb-2 border-b border-[#E9E5E1]">
                2. Role & System Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Assigned Role
                  </label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white cursor-pointer transition-all"
                  >
                    <option value="">Select a Role…</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    POS Login PIN (4 Digits)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={isEdit ? 'Leave blank to keep current PIN' : 'e.g. 1234'}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white font-mono tracking-widest transition-all"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-between p-3.5 bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-[#1F221D]">Employment Status</p>
                    <p className="text-[11px] text-[#666A64]">
                      Inactive employees cannot log into POS or execute terminal actions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isActive ? 'bg-[#FF7A10]' : 'bg-[#666A64]/30'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/employees')}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs text-[#666A64] bg-[#F7F5F2] hover:bg-[#E9E5E1] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#FF7A10] hover:bg-[#E86000] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {isEdit ? 'Update Employee' : 'Save Employee'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
};

export default EmployeeFormScreen;
