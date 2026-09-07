import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PageHeader } from '../../components/shared/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  Users,
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const fetchedRoles = await api.getRoles();
      setRoles(fetchedRoles);
      if (fetchedRoles.length > 0 && !editingRole) {
        setEditingRole(fetchedRoles[0]);
      }
    } catch {
      toast.error('Failed to load roles list.');
    } finally {
      setIsLoading(false);
    }
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
    setIsDeleting(true);
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
      setIsDeleting(false);
    }
  };

  const togglePermission = (permKey: string) => {
    if (!editingRole) return;
    const current = editingRole.permissions || [];
    const updated = current.includes(permKey)
      ? current.filter((p) => p !== permKey)
      : [...current, permKey];

    setEditingRole({ ...editingRole, permissions: updated });
  };

  return (
    <PageWrapper className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-[1600px] mx-auto pb-24 md:pb-8">
        <PageHeader
          title="Roles & Access Control"
          subtitle="Configure system permissions and module access per staff role"
          breadcrumb="Administration / Roles & Access"
          icon={ShieldAlert}
          primaryAction={{
            label: 'Create New Role',
            icon: Plus,
            onClick: () => setEditingRole({ name: '', permissions: [] }),
          }}
        />

        {isLoading ? (
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
                        {editingRole.id ? `Edit Permissions: ${editingRole.name}` : 'Create New Role'}
                      </h3>
                      <p className="text-xs text-[#666A64] mt-0.5">
                        Select business sections and module permissions allowed for this role.
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
                      placeholder="e.g. Senior Waiter / Shift Lead"
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
                                  onClick={() => togglePermission(route.permission)}
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
                    Select a role from the left column to view or modify its permission matrix.
                  </p>
                </div>
              )}
            </div>
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
          isLoading={isDeleting}
        />
      </div>
    </PageWrapper>
  );
};

export default RolesAccessScreen;
