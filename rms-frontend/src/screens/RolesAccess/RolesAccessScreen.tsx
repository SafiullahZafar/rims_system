import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PageHeader } from '../../components/shared/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Employee } from '../../types';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  Users,
  UserCheck,
  Search,
  Sparkles,
  Info,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import { ROUTES_CONFIG, ROUTE_SECTIONS } from '../../constants/routesConfig';

interface Role {
  id: number;
  name: string;
  permissions?: string[];
  employees_count?: number;
}

export const RolesAccessScreen: React.FC = () => {
  const toast = useToast();

  // Active tab: 'roles' | 'employees'
  const [activeTab, setActiveTab] = useState<'roles' | 'employees'>('roles');

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [isDeletingRole, setIsDeletingRole] = useState(false);

  // Employees extra permissions state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [empExtraPerms, setEmpExtraPerms] = useState<string[]>([]);
  const [empSearch, setEmpSearch] = useState('');
  const [isSavingEmp, setIsSavingEmp] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchEmployees();
  }, []);

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const fetchedRoles = await api.getRoles();
      setRoles(fetchedRoles);
      if (fetchedRoles.length > 0 && !editingRole) {
        setEditingRole(fetchedRoles[0]);
      }
    } catch {
      toast.error('Failed to load roles list.');
    } fontally: {
      setIsLoadingRoles(false);
    }
  };

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const fetchedEmps = await api.getEmployees();
      setEmployees(fetchedEmps);
      if (fetchedEmps.length > 0 && !selectedEmp) {
        setSelectedEmp(fetchedEmps[0]);
        setEmpExtraPerms(fetchedEmps[0].extra_permissions || []);
      }
    } catch {
      toast.error('Failed to load employees list.');
    } fontally: {
      setIsLoadingEmployees(false);
    }
  };

  // Select employee for individual permissions
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmp(emp);
    setEmpExtraPerms(emp.extra_permissions || []);
  };

  const saveRole = async () => {
    if (!editingRole?.name?.trim()) return toast.error('Role name is required.');
    try {
      if (editingRole.id) {
        await api.updateRole(editingRole.id, editingRole);
        toast.success('Role updated successfully.');
      } else {
        await api.createRole({
          ...editingRole,
          permissions: editingRole.permissions || [],
        });
        toast.success('Role created successfully.');
      }
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save role.');
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;
    setIsDeletingRole(true);
    try {
      await api.deleteRole(deleteTarget.id);
      toast.success('Role deleted successfully.');
      setDeleteTarget(null);
      if (editingRole?.id === deleteTarget.id) {
        setEditingRole(null);
      }
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role.');
    } finally {
      setIsDeletingRole(false);
    }
  };

  const toggleRolePermission = (permKey: string) => {
    if (!editingRole) return;
    const current = editingRole.permissions || [];
    const updated = current.includes(permKey)
      ? current.filter((p) => p !== permKey)
      : [...current, permKey];

    setEditingRole({ ...editingRole, permissions: updated });
  };

  const toggleEmpPermission = (permKey: string) => {
    if (!selectedEmp) return;
    const current = empExtraPerms;
    const updated = current.includes(permKey)
      ? current.filter((p) => p !== permKey)
      : [...current, permKey];

    setEmpExtraPerms(updated);
  };

  const saveEmployeePermissions = async () => {
    if (!selectedEmp) return;
    setIsSavingEmp(true);
    try {
      await api.updateEmployee(selectedEmp.id, {
        extra_permissions: empExtraPerms,
      });
      toast.success(`Access permissions updated for "${selectedEmp.name}".`);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save employee permissions.');
    } finally {
      setIsSavingEmp(false);
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      (e.role?.name && e.role.name.toLowerCase().includes(empSearch.toLowerCase()))
  );

  return (
    <PageWrapper className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-[1600px] mx-auto pb-24 md:pb-8">
        <PageHeader
          title="Roles & Access Control"
          subtitle="Configure base role permissions or set custom individual access for cashiers & staff members"
          breadcrumb="Administration / Roles & Access"
          icon={ShieldAlert}
          primaryAction={{
            label: 'Create New Role',
            icon: Plus,
            onClick: () => {
              setActiveTab('roles');
              setEditingRole({ name: '', permissions: [] });
            },
          }}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 mb-6 border-b border-[#E9E5E1] pb-3">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-[#FF7A10] text-white shadow-xs'
                : 'bg-[#F7F5F2] text-[#666A64] hover:text-[#1F221D] hover:bg-[#E9E5E1]'
            }`}
          >
            <Shield className="w-4 h-4" />
            Base Role Permissions ({roles.length})
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'employees'
                ? 'bg-[#FF7A10] text-white shadow-xs'
                : 'bg-[#F7F5F2] text-[#666A64] hover:text-[#1F221D] hover:bg-[#E9E5E1]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Individual Staff Access Overrides ({employees.length})
          </button>
        </div>

        {/* TAB 1: Base Role Permissions */}
        {activeTab === 'roles' && (
          <>
            {isLoadingRoles ? (
              <div className="bg-white border border-[#E9E5E1] rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-7 h-7 text-[#FF7A10] animate-spin" />
                <p className="text-xs font-semibold text-[#666A64]">Loading roles & permission matrix…</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Role List */}
                <div className="lg:col-span-1 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-[#666A64] uppercase tracking-wider px-1">
                    Configured Roles ({roles.length})
                  </h3>

                  {roles.map((role) => {
                    const isSelected = editingRole?.id === role.id;
                    return (
                      <div
                        key={role.id}
                        onClick={() => setEditingRole(role)}
                        className={`bg-white border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#FF7A10] shadow-sm bg-[#FFF2E8]/40'
                            : 'border-[#E9E5E1] hover:border-[#FF7A10]/40'
                        }`}
                      >
                        <div>
                          <h4 className="text-sm font-bold text-[#1F221D]">{role.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#666A64]">
                            <Users className="w-3.5 h-3.5" />
                            <span>{role.employees_count || 0} assigned employees</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingRole(role)}
                            className="p-1.5 bg-[#F7F5F2] hover:bg-[#E9E5E1] rounded-lg text-[#666A64] hover:text-[#1F221D] transition-colors"
                            title="Edit role permissions"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(role)}
                            className="p-1.5 bg-[#C62828]/10 hover:bg-[#C62828]/20 rounded-lg text-[#C62828] transition-colors"
                            title="Delete role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Permission Matrix */}
                <div className="lg:col-span-2">
                  {editingRole ? (
                    <div className="bg-white border border-[#E9E5E1] rounded-2xl p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E9E5E1]">
                        <div>
                          <h3 className="text-base font-bold text-[#1F221D]">
                            {editingRole.id ? `Edit Role: ${editingRole.name}` : 'Create New Role'}
                          </h3>
                          <p className="text-xs text-[#666A64] mt-0.5">
                            Select default business sections and module permissions allowed for this role.
                          </p>
                        </div>
                        <button
                          onClick={saveRole}
                          className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#FF7A10] hover:bg-[#E86000] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                        >
                          Save Role Permissions
                        </button>
                      </div>

                      <div className="mb-6">
                        <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                          Role Name <span className="text-[#C62828]">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingRole.name || ''}
                          onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                          placeholder="e.g. Cashier / Floor Lead"
                          className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Section-grouped permissions */}
                      <div className="space-y-6">
                        {ROUTE_SECTIONS.map((section) => {
                          const sectionRoutes = ROUTES_CONFIG.filter((r) => r.section === section);
                          if (sectionRoutes.length === 0) return null;

                          return (
                            <div key={section} className="bg-[#F7F5F2]/50 border border-[#E9E5E1] rounded-2xl p-4">
                              <h4 className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-3">
                                {section} Modules
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {sectionRoutes.map((route) => {
                                  const isSelected =
                                    editingRole.permissions?.includes(route.permission) ||
                                    editingRole.permissions?.includes(route.path);

                                  return (
                                    <div
                                      key={route.path}
                                      onClick={() => toggleRolePermission(route.permission)}
                                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                        isSelected
                                          ? 'bg-white border-[#FF7A10] shadow-2xs'
                                          : 'bg-white border-[#E9E5E1] hover:border-[#FF7A10]/40'
                                      }`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                          isSelected
                                            ? 'bg-[#FF7A10] border-[#FF7A10] text-white'
                                            : 'border-[#E9E5E1] bg-[#F7F5F2]'
                                        }`}
                                      >
                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                      </div>
                                      <div>
                                        <p
                                          className={`text-xs font-bold ${
                                            isSelected ? 'text-[#FF7A10]' : 'text-[#1F221D]'
                                          }`}
                                        >
                                          {route.label}
                                        </p>
                                        <p className="text-[10px] text-[#666A64]">{route.path}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#E9E5E1] rounded-2xl bg-white">
                      <ShieldAlert className="w-10 h-10 text-[#666A64] mb-3" />
                      <p className="text-xs font-semibold text-[#666A64]">
                        Select a role from the left column to view or modify its base permission matrix.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: Individual Staff Access Overrides */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            {/* Informational Guidance Banner */}
            <div className="bg-[#FFF2E8] border border-[#FF7A10]/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF7A10] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs text-[#1F221D]">
                <h4 className="font-bold text-sm text-[#FF7A10]">Individual Staff Access Control (Cashier Overrides)</h4>
                <p className="mt-0.5 text-[#666A64] leading-relaxed">
                  Have multiple Cashiers or Staff members in the same role, but want to grant Cashier #1 extra access to <strong>Attendance &amp; HRMS</strong>, Cashier #2 access to <strong>Reports &amp; Analytics</strong>, and Cashier #3 access to <strong>Inventory Supplies</strong>? Select any employee on the left to set custom individual permission grants without changing the global Cashier role!
                </p>
              </div>
            </div>

            {isLoadingEmployees ? (
              <div className="bg-white border border-[#E9E5E1] rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-7 h-7 text-[#FF7A10] animate-spin" />
                <p className="text-xs font-semibold text-[#666A64]">Loading staff members list…</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Employee List & Search */}
                <div className="lg:col-span-1 flex flex-col gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666A64]" />
                    <input
                      type="text"
                      value={empSearch}
                      onChange={(e) => setEmpSearch(e.target.value)}
                      placeholder="Search cashiers or staff by name…"
                      className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                    />
                  </div>

                  <h3 className="text-xs font-bold text-[#666A64] uppercase tracking-wider px-1">
                    Select Staff Member ({filteredEmployees.length})
                  </h3>

                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {filteredEmployees.map((emp) => {
                      const isSelected = selectedEmp?.id === emp.id;
                      const extraCount = emp.extra_permissions?.length || 0;

                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleSelectEmployee(emp)}
                          className={`bg-white border rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#FF7A10] shadow-sm bg-[#FFF2E8]/40'
                              : 'border-[#E9E5E1] hover:border-[#FF7A10]/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#F7F5F2] border border-[#E9E5E1] flex items-center justify-center font-bold text-xs text-[#FF7A10]">
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#1F221D]">{emp.name}</h4>
                              <p className="text-[10px] text-[#666A64]">
                                Role: <span className="font-semibold text-[#1F221D]">{emp.role?.name || 'Staff'}</span>
                              </p>
                            </div>
                          </div>

                          {extraCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF7A10]/10 text-[#FF7A10] border border-[#FF7A10]/20">
                              +{extraCount} Extra
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Specific Employee Permission Matrix */}
                <div className="lg:col-span-2">
                  {selectedEmp ? (
                    <div className="bg-white border border-[#E9E5E1] rounded-2xl p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E9E5E1]">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-[#1F221D]">
                              Access Overrides: {selectedEmp.name}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F7F5F2] text-[#666A64] border border-[#E9E5E1]">
                              Role: {selectedEmp.role?.name || 'Standard Staff'}
                            </span>
                          </div>
                          <p className="text-xs text-[#666A64] mt-0.5">
                            Green checkboxes are granted by role. Check orange boxes to give extra permissions to this staff member.
                          </p>
                        </div>
                        <button
                          onClick={saveEmployeePermissions}
                          disabled={isSavingEmp}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#FF7A10] hover:bg-[#E86000] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {isSavingEmp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          Save Staff Permissions
                        </button>
                      </div>

                      {/* Permission Modules */}
                      <div className="space-y-6">
                        {ROUTE_SECTIONS.map((section) => {
                          const sectionRoutes = ROUTES_CONFIG.filter((r) => r.section === section);
                          if (sectionRoutes.length === 0) return null;

                          return (
                            <div key={section} className="bg-[#F7F5F2]/50 border border-[#E9E5E1] rounded-2xl p-4">
                              <h4 className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-3">
                                {section} Modules
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {sectionRoutes.map((route) => {
                                  // Granted by base role?
                                  const isRoleGranted =
                                    selectedEmp.role?.permissions?.includes(route.permission) ||
                                    selectedEmp.role?.permissions?.includes(route.path);

                                  // Granted extra directly?
                                  const isExtraGranted = empExtraPerms.includes(route.permission) || empExtraPerms.includes(route.path);

                                  const isChecked = isRoleGranted || isExtraGranted;

                                  return (
                                    <div
                                      key={route.path}
                                      onClick={() => !isRoleGranted && toggleEmpPermission(route.permission)}
                                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                        isRoleGranted
                                          ? 'bg-[#2E7D32]/5 border-[#2E7D32]/30 cursor-not-allowed'
                                          : isExtraGranted
                                          ? 'bg-[#FFF2E8] border-[#FF7A10] cursor-pointer shadow-2xs'
                                          : 'bg-white border-[#E9E5E1] hover:border-[#FF7A10]/40 cursor-pointer'
                                      }`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                          isRoleGranted
                                            ? 'bg-[#2E7D32] border-[#2E7D32] text-white'
                                            : isExtraGranted
                                            ? 'bg-[#FF7A10] border-[#FF7A10] text-white'
                                            : 'border-[#E9E5E1] bg-[#F7F5F2]'
                                        }`}
                                      >
                                        {isChecked && <Check className="w-3.5 h-3.5" />}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <p
                                            className={`text-xs font-bold ${
                                              isRoleGranted
                                                ? 'text-[#2E7D32]'
                                                : isExtraGranted
                                                ? 'text-[#FF7A10]'
                                                : 'text-[#1F221D]'
                                            }`}
                                          >
                                            {route.label}
                                          </p>
                                          {isRoleGranted ? (
                                            <span className="text-[9px] font-extrabold text-[#2E7D32] uppercase">
                                              Role Default
                                            </span>
                                          ) : isExtraGranted ? (
                                            <span className="text-[9px] font-extrabold text-[#FF7A10] uppercase">
                                              Extra Grant
                                            </span>
                                          ) : null}
                                        </div>
                                        <p className="text-[10px] text-[#666A64]">{route.path}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#E9E5E1] rounded-2xl bg-white">
                      <Info className="w-10 h-10 text-[#666A64] mb-3" />
                      <p className="text-xs font-semibold text-[#666A64]">
                        Select a cashier or staff member from the left column to customize their individual permissions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Delete Staff Role"
          message={`Are you sure you want to delete role "${deleteTarget?.name}"? Make sure no active employees are assigned to this role before deleting.`}
          confirmText="Delete Role"
          onConfirm={handleDeleteRole}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeletingRole}
        />
      </div>
    </PageWrapper>
  );
};

export default RolesAccessScreen;
