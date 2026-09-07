import React, { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatsCard } from '../Dashboard/StatsCard';
import { useToast } from '../../hooks/useToast';
import {
  MapPin,
  Plus,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Layers,
  Map,
  X,
  Save,
  Radio,
} from 'lucide-react';

interface Geofence {
  id: string;
  name: string;
  location: string;
  radiusMeters: number;
  status: 'Active' | 'Inactive';
  assigned: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

interface EmployeeLocationStatus {
  id: number;
  name: string;
  role: string;
  status: 'Inside Geofence' | 'Outside Geofence' | 'Location Unknown';
  distanceMeters: number;
  lastChecked: string;
}

const initialGeofences: Geofence[] = [
  {
    id: 'GEO-01',
    name: 'Main Restaurant',
    location: 'Main Dining & Patio Branch',
    radiusMeters: 150,
    status: 'Active',
    assigned: 'All floor staff & servers',
    lat: 40.7128,
    lng: -74.0060,
    updatedAt: 'Today at 08:30 AM',
  },
  {
    id: 'GEO-02',
    name: 'Kitchen Entrance',
    location: 'Back Receiving & Kitchen Gate',
    radiusMeters: 80,
    status: 'Active',
    assigned: 'Chefs & Kitchen staff',
    lat: 40.7130,
    lng: -74.0065,
    updatedAt: 'Yesterday at 05:15 PM',
  },
  {
    id: 'GEO-03',
    name: 'Office / Admin',
    location: 'Executive Administrative Building',
    radiusMeters: 100,
    status: 'Inactive',
    assigned: 'Managers & Accountants',
    lat: 40.7120,
    lng: -74.0050,
    updatedAt: '3 days ago',
  },
];

const initialEmployees: EmployeeLocationStatus[] = [
  { id: 101, name: 'Marco Rossi', role: 'Head Chef', status: 'Inside Geofence', distanceMeters: 32, lastChecked: '1m ago' },
  { id: 102, name: 'Alice Gimmels', role: 'Server', status: 'Inside Geofence', distanceMeters: 45, lastChecked: '3m ago' },
  { id: 103, name: 'Lorenzo Perniciaro', role: 'Cashier', status: 'Outside Geofence', distanceMeters: 280, lastChecked: '12m ago' },
  { id: 104, name: 'Elisa Nells', role: 'Hostess', status: 'Location Unknown', distanceMeters: 0, lastChecked: '35m ago' },
  { id: 105, name: 'Yun Chang', role: 'Sous Chef', status: 'Inside Geofence', distanceMeters: 18, lastChecked: '2m ago' },
];

export const GeofencingScreen: React.FC = () => {
  const toast = useToast();
  const [geofences, setGeofences] = useState<Geofence[]>(initialGeofences);
  const [employees, setEmployees] = useState<EmployeeLocationStatus[]>(initialEmployees);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence>(initialGeofences[0]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gfName, setGfName] = useState('');
  const [gfLocation, setGfLocation] = useState('');
  const [gfRadius, setGfRadius] = useState('120');
  const [gfAssigned, setGfAssigned] = useState('All Staff');
  const [gfStatus, setGfStatus] = useState<'Active' | 'Inactive'>('Active');

  const activeCount = geofences.filter((g) => g.status === 'Active').length;
  const insideCount = employees.filter((e) => e.status === 'Inside Geofence').length;
  const outsideCount = employees.filter((e) => e.status === 'Outside Geofence').length;

  const handleToggleSimulation = () => {
    setEmployees((prev) =>
      prev.map((emp) => {
        const rand = Math.random();
        if (rand > 0.6) return { ...emp, status: 'Inside Geofence', distanceMeters: Math.floor(Math.random() * 80) + 10, lastChecked: 'Just now' };
        if (rand > 0.3) return { ...emp, status: 'Outside Geofence', distanceMeters: Math.floor(Math.random() * 300) + 160, lastChecked: 'Just now' };
        return { ...emp, status: 'Location Unknown', distanceMeters: 0, lastChecked: 'Just now' };
      })
    );
    toast.info('Simulated employee location status check executed.');
  };

  const handleSimulateClockIn = (emp: EmployeeLocationStatus) => {
    if (emp.status === 'Inside Geofence') {
      toast.success(`Clock-In Allowed: ${emp.name} is INSIDE ${selectedGeofence.name} (${emp.distanceMeters}m distance).`);
    } else if (emp.status === 'Outside Geofence') {
      toast.error(`Clock-In Blocked: ${emp.name} is OUTSIDE allowed geofence (${emp.distanceMeters}m away).`);
    } else {
      toast.warning(`Clock-In Flagged: ${emp.name} location is unknown. Verification required.`);
    }
  };

  const handleSaveGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gfName.trim()) return toast.error('Geofence name is required.');

    const newGf: Geofence = {
      id: `GEO-0${geofences.length + 1}`,
      name: gfName.trim(),
      location: gfLocation.trim() || 'Restaurant Branch',
      radiusMeters: Number(gfRadius) || 100,
      status: gfStatus,
      assigned: gfAssigned.trim() || 'All staff',
      lat: 40.7128,
      lng: -74.0060,
      updatedAt: 'Just now',
    };

    setGeofences([...geofences, newGf]);
    setIsModalOpen(false);
    toast.success(`Geofence "${newGf.name}" added successfully.`);
  };

  return (
    <PageWrapper className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-[1600px] mx-auto pb-24 md:pb-8">
        {/* Header */}
        <PageHeader
          title="Geofencing Control"
          subtitle="Control allowed clock-in locations and simulate GPS perimeter checks"
          breadcrumb="People / Geofencing"
          icon={MapPin}
          primaryAction={{
            label: 'Add Geofence',
            icon: Plus,
            onClick: () => {
              setGfName('');
              setGfLocation('');
              setGfRadius('120');
              setGfAssigned('All Staff');
              setGfStatus('Active');
              setIsModalOpen(true);
            },
          }}
          secondaryActions={
            <button
              onClick={handleToggleSimulation}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#FF7A10] bg-[#FFF2E8] border border-[#FF7A10]/20 hover:bg-[#FFE6D5] transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Demo Check
            </button>
          }
        />

        {/* Demo Mode Notification Banner */}
        <div className="bg-[#FFF2E8] border border-[#FF7A10]/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF7A10] text-white flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F221D]">
                Demo Data & Geofence Simulation Mode
              </p>
              <p className="text-[11px] text-[#666A64]">
                In this phase, geofence perimeter validation is simulated for demonstration testing without live device background GPS tracking.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 bg-white text-[#FF7A10] rounded-full text-[10px] font-extrabold uppercase border border-[#FF7A10]/20">
            Interactive Demo
          </span>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Active Geofences"
            value={activeCount}
            icon={Layers}
            accent="#FF7A10"
            trend={`${geofences.length} total rules`}
            trendPositive
          />
          <StatsCard
            title="Employees Inside"
            value={insideCount}
            icon={ShieldCheck}
            accent="#2E7D32"
            trend="Allowed clock-in"
            trendPositive
          />
          <StatsCard
            title="Outside / Flagged"
            value={outsideCount}
            icon={ShieldAlert}
            accent="#C62828"
            trend="Perimeter breach"
            trendPositive={false}
          />
          <StatsCard
            title="Today's Check-ins"
            value={18}
            icon={CheckCircle2}
            accent="#1565C0"
            trend="Verified check-ins"
            trendPositive
          />
        </div>

        {/* Main Grid: Geofence List + Demo Map Preview + Employee Status */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Left Column: Geofences List */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#666A64] uppercase tracking-wider px-1">
              Configured Geofences ({geofences.length})
            </h3>

            {geofences.map((gf) => {
              const isSelected = selectedGeofence.id === gf.id;
              return (
                <div
                  key={gf.id}
                  onClick={() => setSelectedGeofence(gf)}
                  className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FF7A10] shadow-sm bg-[#FFF2E8]/30'
                      : 'border-[#E9E5E1] hover:border-[#FF7A10]/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FFF2E8] text-[#FF7A10] flex items-center justify-center font-bold text-xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1F221D]">{gf.name}</h4>
                        <p className="text-[11px] text-[#666A64]">{gf.location}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        gf.status === 'Active'
                          ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                          : 'bg-[#666A64]/10 text-[#666A64] border border-[#666A64]/20'
                      }`}
                    >
                      {gf.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#E9E5E1] text-xs">
                    <div>
                      <span className="text-[#666A64] text-[10px] block uppercase font-bold">Allowed Radius</span>
                      <span className="font-extrabold text-[#FF7A10]">{gf.radiusMeters} meters</span>
                    </div>
                    <div>
                      <span className="text-[#666A64] text-[10px] block uppercase font-bold">Assigned Roles</span>
                      <span className="font-semibold text-[#1F221D] truncate block">{gf.assigned}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Demo Map Panel & Employee Location Status */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* Demo Visual Map Card */}
            <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-[#FF7A10]" />
                  <h3 className="text-sm font-bold text-[#1F221D]">
                    Geofence Map Preview: {selectedGeofence.name}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#666A64]">
                  {selectedGeofence.lat}, {selectedGeofence.lng}
                </span>
              </div>

              {/* Simulated Map Visual Box */}
              <div className="w-full h-56 bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl relative overflow-hidden flex items-center justify-center">
                {/* Background grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#FF7A10_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

                {/* Outer Radius Circle */}
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-[#FF7A10] bg-[#FF7A10]/10 flex items-center justify-center animate-pulse">
                  <div className="w-24 h-24 rounded-full bg-[#FF7A10]/15 flex items-center justify-center">
                    {/* Location Pin */}
                    <div className="w-9 h-9 rounded-full bg-[#FF7A10] text-white flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Map Overlay Badge */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-[#E9E5E1] px-3 py-1.5 rounded-xl text-xs shadow-xs flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                  <span className="font-bold text-[#1F221D]">Radius: {selectedGeofence.radiusMeters}m</span>
                </div>
              </div>
            </div>

            {/* Employee Geofence Status Table */}
            <div className="bg-white border border-[#E9E5E1] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#1F221D]">Employee Perimeter Status</h3>
                  <p className="text-xs text-[#666A64]">Real-time simulated clock-in location checks</p>
                </div>
                <button
                  onClick={handleToggleSimulation}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#FF7A10] bg-[#FFF2E8] border border-[#FF7A10]/20 hover:bg-[#FFE6D5] transition-all cursor-pointer"
                >
                  Re-evaluate Locations
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F5F2] border-b border-[#E9E5E1] text-[10px] uppercase text-[#666A64] font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Perimeter Status</th>
                      <th className="px-4 py-3">Distance</th>
                      <th className="px-4 py-3 text-right">Simulate Clock In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E5E1]">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#F7F5F2]/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-[#1F221D]">{emp.name}</td>
                        <td className="px-4 py-3 text-[#666A64]">{emp.role}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              emp.status === 'Inside Geofence'
                                ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                                : emp.status === 'Outside Geofence'
                                ? 'bg-[#C62828]/10 text-[#C62828] border border-[#C62828]/20'
                                : 'bg-[#666A64]/10 text-[#666A64] border border-[#666A64]/20'
                            }`}
                          >
                            {emp.status === 'Inside Geofence' && <CheckCircle2 className="w-3 h-3" />}
                            {emp.status === 'Outside Geofence' && <XCircle className="w-3 h-3" />}
                            {emp.status === 'Location Unknown' && <HelpCircle className="w-3 h-3" />}
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#666A64]">
                          {emp.distanceMeters > 0 ? `${emp.distanceMeters}m away` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleSimulateClockIn(emp)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-[#FF7A10] hover:bg-[#E86000] transition-all cursor-pointer shadow-2xs"
                          >
                            Simulate Clock In
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Add Geofence Modal */}
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
                Add New Geofence Perimeter
              </h3>

              <form onSubmit={handleSaveGeofence} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Geofence Name <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    value={gfName}
                    onChange={(e) => setGfName(e.target.value)}
                    placeholder="e.g. Terrace Outdoor Seating"
                    required
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Location / Branch Description
                  </label>
                  <input
                    type="text"
                    value={gfLocation}
                    onChange={(e) => setGfLocation(e.target.value)}
                    placeholder="e.g. West Wing Terrace Gate"
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Allowed Radius (Meters)
                  </label>
                  <input
                    type="number"
                    value={gfRadius}
                    onChange={(e) => setGfRadius(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Assigned Roles / Staff
                  </label>
                  <input
                    type="text"
                    value={gfAssigned}
                    onChange={(e) => setGfAssigned(e.target.value)}
                    placeholder="e.g. Floor Staff & Hostesses"
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Status
                  </label>
                  <select
                    value={gfStatus}
                    onChange={(e) => setGfStatus(e.target.value as any)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#FF7A10] hover:bg-[#E86000]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Geofence
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

export default GeofencingScreen;
