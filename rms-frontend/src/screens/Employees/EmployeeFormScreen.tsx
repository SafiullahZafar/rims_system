import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PageHeader } from '../../components/shared/PageHeader';
import { api } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { UserPlus, ArrowLeft, RefreshCw, Save, ShieldCheck, Info } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  permissions?: string[];
}

// All possible permission paths in the system
const ALL_PERMISSIONS = [
  { path: '/dashboard',      label: 'Dashboard',        description: 'View overview & analytics dashboard' },
  { path: '/tables',         label: 'Floor & Tables',   description: 'View and manage restaurant floor map' },
  { path: '/order',          label: 'New Order',        description: 'Create and manage customer orders' },
  { path: '/kitchen',        label: 'Kitchen Board',    description: 'View and update kitchen order queue' },
  { path: '/payment',        label: 'Payments',         description: 'Process bills and collect payments' },
  { path: '/reservations',   label: 'Reservations',     description: 'Manage table reservations' },
  { path: '/services',       label: 'Menu / Services',  description: 'Edit and manage menu items' },
  { path: '/customers',      label: 'Customers',        description: 'View and manage customer records' },
  { path: '/supplies',       label: 'Supplies',         description: 'View and manage stock inventory' },
  { path: '/employees',      label: 'Employees',        description: 'View and manage employee directory' },
  { path: '/attendance',     label: 'Attendance',       description: 'View and log employee attendance' },
  { path: '/geofencing',     label: 'Geofencing',       description: 'Manage geofence and location tracking' },
  { path: '/reports',        label: 'Reports',          description: 'View business analytics reports' },
  { path: '/history',        label: 'History',          description: 'View audit logs and order history' },
  { path: '/roles-access',   label: 'Roles & Access',   description: 'Manage roles and system permissions' },
  { path: '/settings',       label: 'Settings',         description: 'Manage business and system settings' },
];

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
  const [extraPermissions, setExtraPermissions] = useState<string[]>([]);

  // What the selected role already grants
  const selectedRole = roles.find((r) => r.id === Number(roleId));
  const rolePermissions: string[] = selectedRole?.permissions ?? [];

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const fetchedRoles = await api.getRoles();
      setRoles(fetchedRoles.map((r: any) => ({ id: r.id, name: r.name, permissions: r.permissions ?? [] })));

      if (id) {
        const fetchedEmployees = await api.getEmployees();
        const emp = fetchedEmployees.find((e) => e.id === Number(id));
        if (emp) {
          setName(emp.name);
          setEmail(emp.email || '');
          setPhone(emp.phone || '');
          setRoleId(emp.role_id ? String(emp.role_id) : '');
          setIsActive(emp.is_active);
          setExtraPermissions(emp.extra_permissions ?? []);
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

  const toggleExtraPermission = (path: string) => {
    // Cannot remove role-granted permissions here (they are not extras)
    setExtraPermissions((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
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
      extra_permissions: extraPermissions.length > 0 ? extraPermissions : null,
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
          subtitle={isEdit ? 'Update employee personal details, access settings, and permission overrides' : 'Add a new team member to your restaurant system'}
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
                1. Personal &amp; Contact Details
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
                2. Role &amp; System Security
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
                  {selectedRole && (
                    <p className="text-[10px] text-[#666A64] mt-1">
                      Role grants: {(selectedRole.permissions ?? []).join(', ') || 'No permissions set'}
                    </p>
                  )}
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

            {/* Section 3: Per-Employee Permission Overrides */}
            <div className="bg-white border border-[#E9E5E1] rounded-2xl p-6 shadow-xs">
              <div className="flex items-start gap-3 mb-4 pb-2 border-b border-[#E9E5E1]">
                <ShieldCheck className="w-4 h-4 text-[#FF7A10] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#1F221D] uppercase tracking-wider">
                    3. Individual Permission Overrides
                  </h3>
                  <p className="text-[11px] text-[#666A64] mt-0.5">
                    Grant this employee access to specific features <strong>beyond</strong> their role. Role-granted permissions (shown in green) cannot be removed here — update the role instead.
                  </p>
                </div>
              </div>

              {/* Info banner */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFF2E8] border border-[#FF7A10]/20 mb-4">
                <Info className="w-3.5 h-3.5 text-[#FF7A10] flex-shrink-0" />
                <p className="text-[11px] text-[#FF7A10] font-semibold">
                  {extraPermissions.length === 0
                    ? 'No extra permissions granted — this employee uses their role permissions only.'
                    : `${extraPermissions.length} extra permission${extraPermissions.length > 1 ? 's' : ''} granted on top of role.`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const grantedByRole = rolePermissions.includes(perm.path);
                  const grantedAsExtra = extraPermissions.includes(perm.path);
                  const isGranted = grantedByRole || grantedAsExtra;

                  return (
                    <button
                      key={perm.path}
                      type="button"
                      disabled={grantedByRole}
                      onClick={() => !grantedByRole && toggleExtraPermission(perm.path)}
                      title={grantedByRole ? 'Granted by role — edit role to change' : perm.description}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        grantedByRole
                          ? 'bg-[#2E7D32]/8 border-[#2E7D32]/25 cursor-not-allowed'
                          : grantedAsExtra
                          ? 'bg-[#FF7A10]/10 border-[#FF7A10]/30 cursor-pointer hover:bg-[#FF7A10]/15'
                          : 'bg-[#F7F5F2] border-[#E9E5E1] cursor-pointer hover:border-[#FF7A10]/40 hover:bg-[#FFF2E8]'
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <span
                        className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                          grantedByRole
                            ? 'bg-[#2E7D32] border-[#2E7D32]'
                            : grantedAsExtra
                            ? 'bg-[#FF7A10] border-[#FF7A10]'
                            : 'bg-white border-[#D0CEC9]'
                        }`}
                      >
                        {isGranted && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1F221D]">{perm.label}</span>
                          {grantedByRole && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#2E7D32] bg-[#2E7D32]/10 px-1.5 py-0.5 rounded-full">
                              Role
                            </span>
                          )}
                          {grantedAsExtra && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#FF7A10] bg-[#FF7A10]/10 px-1.5 py-0.5 rounded-full">
                              Extra
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#666A64] truncate">{perm.description}</p>
                      </div>
                    </button>
                  );
                })}
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
