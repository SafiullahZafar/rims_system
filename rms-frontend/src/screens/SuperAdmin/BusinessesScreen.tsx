import React, { FormEvent, useEffect, useState } from 'react';
import { api, ManagedBusiness } from '../../services/api';
import { ROUTES_CONFIG, ROUTE_SECTIONS } from '../../constants/routesConfig';

const BUSINESS_MODULES = ROUTES_CONFIG
  .filter((route) => route.section !== 'Super Admin')
  .map(({ permission, label }) => ({ permission, label }));
const ALL_MODULES = BUSINESS_MODULES.map(({ permission }) => permission);
const BUSINESS_SECTIONS = ROUTE_SECTIONS.filter((section) => section !== 'Super Admin');

export const BusinessesScreen: React.FC = () => {
  const [businesses, setBusinesses] = useState<ManagedBusiness[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(ALL_MODULES);
  const [moduleDrafts, setModuleDrafts] = useState<Record<number, string[]>>({});
  const [message, setMessage] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const refreshBusinesses = async () => {
    setBusinesses(await api.getManagedBusinesses());
  };

  useEffect(() => {
    void refreshBusinesses().catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load business accounts.');
    });
  }, []);

  const createBusiness = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const result = await api.createManagedBusiness({
        business_name: businessName,
        owner_name: ownerName,
        email,
        password,
        password_confirmation: passwordConfirmation,
        module_permissions: selectedModules,
      });
      setMessage(`Created ${result.business.name}. Share these one-time credentials with the owner.`);
      setCreatedCredentials(result.credentials);
      setBusinessName('');
      setOwnerName('');
      setEmail('');
      setPassword('');
      setPasswordConfirmation('');
      setSelectedModules(ALL_MODULES);
      await refreshBusinesses();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create the business account.');
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (modules: string[], permission: string) => modules.includes(permission)
    ? modules.filter((item) => item !== permission)
    : [...modules, permission];

  const saveBusinessModules = async (business: ManagedBusiness) => {
    setError('');
    try {
      await api.setBusinessModules(business.id, moduleDrafts[business.id] ?? business.module_permissions);
      setMessage(`Module access updated for ${business.name}.`);
      await refreshBusinesses();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update module access.');
    }
  };

  const toggleBusiness = async (business: ManagedBusiness) => {
    setError('');
    try {
      await api.setBusinessActive(business.id, !business.is_active);
      await refreshBusinesses();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Unable to update this account.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
      <header>
        <h1 className="text-xl font-black text-[#1F221D]">Business accounts</h1>
        <p className="text-sm text-[#666A64] mt-1">Create and manage isolated restaurant workspaces and their owner accounts.</p>
        <p className="text-xs text-[#666A64] mt-1">Choose from all {BUSINESS_MODULES.length} restaurant modules. Super-admin tools are managed separately.</p>
        <p className="text-xs text-[#666A64] mt-2">New owners sign in at /login using the email and password shown after account creation.</p>
      </header>

      {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">{message}</p>}
      {createdCredentials && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-900">
          <strong>Owner sign-in credentials</strong>
        <p className="mt-1">Login email: <strong>{createdCredentials.email}</strong></p>
          <p>Login password: <strong>{createdCredentials.password}</strong></p>
          <button onClick={() => setCreatedCredentials(null)} className="mt-2 text-xs font-bold underline">Hide credentials</button>
        </div>
      )}

      <form onSubmit={createBusiness} className="bg-white rounded-2xl border border-[#E9E5E1] p-5 md:p-6 grid gap-4 md:grid-cols-2">
        <h2 className="md:col-span-2 font-bold text-[#1F221D]">Create owner account</h2>
        <label className="text-xs font-bold text-[#666A64] grid gap-1.5">
          Business name
          <input required value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="rounded-lg border border-[#E9E5E1] px-3 py-2.5 text-sm text-[#1F221D]" />
        </label>
        <label className="text-xs font-bold text-[#666A64] grid gap-1.5">
          Owner name
          <input required value={ownerName} onChange={(event) => setOwnerName(event.target.value)} className="rounded-lg border border-[#E9E5E1] px-3 py-2.5 text-sm text-[#1F221D]" />
        </label>
        <label className="text-xs font-bold text-[#666A64] grid gap-1.5">
          Owner email
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-lg border border-[#E9E5E1] px-3 py-2.5 text-sm text-[#1F221D]" />
        </label>
        <label className="text-xs font-bold text-[#666A64] grid gap-1.5">
          Owner password
          <input required minLength={8} type="text" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-lg border border-[#E9E5E1] px-3 py-2.5 text-sm text-[#1F221D]" />
        </label>
        <label className="text-xs font-bold text-[#666A64] grid gap-1.5">
          Confirm password
          <input required minLength={8} type="text" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} className="rounded-lg border border-[#E9E5E1] px-3 py-2.5 text-sm text-[#1F221D]" />
        </label>
        <fieldset className="md:col-span-2 rounded-xl border border-[#E9E5E1] p-4">
          <legend className="px-1 text-xs font-bold text-[#666A64]">Owner module access ({selectedModules.length}/{BUSINESS_MODULES.length})</legend>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {BUSINESS_SECTIONS.map((section) => {
              const modules = BUSINESS_MODULES.filter((module) => ROUTES_CONFIG.find((route) => route.permission === module.permission)?.section === section);
              if (modules.length === 0) return null;
              return <div key={section}>
                <h3 className="mb-2 text-xs font-extrabold text-[#1F221D]">{section}</h3>
                <div className="grid gap-2">
                  {modules.map(({ permission, label }) => (
                    <label key={permission} className="flex items-center gap-2 text-xs text-[#1F221D]">
                      <input type="checkbox" checked={selectedModules.includes(permission)} onChange={() => setSelectedModules((current) => toggleModule(current, permission))} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>;
            })}
          </div>
        </fieldset>
        <div className="md:col-span-2">
          <button disabled={saving} className="rounded-xl bg-[#FF7A10] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? 'Creating…' : 'Create business and owner'}
          </button>
        </div>
      </form>

      <section className="bg-white rounded-2xl border border-[#E9E5E1] overflow-hidden">
        <div className="p-5 border-b border-[#E9E5E1]">
          <h2 className="font-bold text-[#1F221D]">Restaurant workspaces and accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7F5F2] text-[11px] uppercase tracking-wide text-[#666A64]">
              <tr><th className="p-4">Business</th><th className="p-4">Owner</th><th className="p-4">Status</th><th className="p-4">Actions and module access</th></tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr key={business.id} className="border-t border-[#E9E5E1]">
                  <td className="p-4 font-semibold text-[#1F221D]">{business.name}</td>
                  <td className="p-4 text-[#666A64]">
                    {business.users.length > 0 ? (
                      <details className="max-w-sm">
                        <summary className="cursor-pointer font-semibold text-[#1F221D]">View {business.users.length} business accounts</summary>
                        <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto rounded-lg border border-[#E9E5E1] bg-white p-3">
                          {business.users.map((user) => <li key={user.id} className="border-b border-[#F0ECE8] pb-2 last:border-0"><span className="font-semibold text-[#1F221D]">{user.name}</span><br />{user.email ?? 'No email'}</li>)}
                        </ul>
                      </details>
                    ) : 'No business users'}
                  </td>
                  <td className="p-4">{business.is_active ? 'Active' : 'Disabled'}</td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-2">
                      <button onClick={() => void toggleBusiness(business)} className="text-xs font-bold text-[#FF7A10]">
                        {business.is_active ? 'Disable business' : 'Enable business'}
                      </button>
                      <details className="max-w-3xl">
                        <summary className="cursor-pointer text-xs font-bold text-[#1F221D]">Manage module access ({(moduleDrafts[business.id] ?? business.module_permissions).length}/{BUSINESS_MODULES.length})</summary>
                        <div className="mt-3 grid gap-4 rounded-lg border border-[#E9E5E1] bg-white p-3 sm:grid-cols-2 xl:grid-cols-4">
                          {BUSINESS_SECTIONS.map((section) => {
                            const modulesInSection = BUSINESS_MODULES.filter((module) => ROUTES_CONFIG.find((route) => route.permission === module.permission)?.section === section);
                            if (modulesInSection.length === 0) return null;
                            return <div key={section}>
                              <h3 className="mb-2 text-xs font-extrabold text-[#1F221D]">{section}</h3>
                              <div className="grid gap-2">
                                {modulesInSection.map(({ permission, label }) => {
                                  const modules = moduleDrafts[business.id] ?? business.module_permissions;
                                  const isGranted = modules.includes(permission);
                                  return <label key={permission} className="flex items-start gap-2 text-xs text-[#666A64]">
                                    <input type="checkbox" checked={isGranted} onChange={() => setModuleDrafts((current) => ({ ...current, [business.id]: toggleModule(current[business.id] ?? business.module_permissions, permission) }))} />
                                    <span>{label}<span className={`block ${isGranted ? 'text-green-700' : 'text-gray-400'}`}>{isGranted ? 'Access granted' : 'No access'}</span></span>
                                  </label>;
                                })}
                              </div>
                            </div>;
                          })}
                          <button onClick={() => void saveBusinessModules(business)} className="col-span-2 mt-1 rounded-lg bg-[#FF7A10] px-3 py-2 text-xs font-bold text-white sm:col-span-3">Save module access</button>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              ))}
              {businesses.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-[#666A64]">No business accounts created yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
