import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Compass, X } from 'lucide-react';
import { hasPermission } from '../../constants/routesConfig';
import { useAppStore } from '../../store/useAppStore';

interface TourStep {
  path: string;
  title: string;
  description: string;
  tip: string;
  permission: string;
}

const BUSINESS_STEPS: TourStep[] = [
  { path: '/dashboard', title: 'Your workspace overview', description: 'Start here for sales, order activity, kitchen progress, and table occupancy for this business.', tip: 'New owner accounts start empty. Demo workspaces show their own sample data.', permission: 'dashboard.view' },
  { path: '/tables', title: 'Choose a table', description: 'Check each table’s section, seats, and live status. Open a free table to begin a dine-in order.', tip: 'Table status updates as orders move through the workflow.', permission: 'tables.view' },
  { path: '/order', title: 'Create an order', description: 'Choose menu items, adjust quantities, review the total, then send the order to the kitchen.', tip: 'Select a table first for dine-in orders. Takeaway and delivery orders do not need a table.', permission: 'orders.create' },
  { path: '/kitchen', title: 'Prepare and serve', description: 'The kitchen board groups tickets into New, Cooking, and Ready. Move each ticket forward as the team works.', tip: 'Mark a ready ticket as served after it reaches the guest.', permission: 'kitchen.view' },
  { path: '/payment', title: 'Take payment', description: 'Select the occupied table, review the bill, choose a payment method, and confirm checkout.', tip: 'Completing checkout frees the table for its next guests.', permission: 'payments.process' },
  { path: '/reservations', title: 'Manage reservations', description: 'Choose a customer and available table, enter the booking time, and track or cancel reservations here.', tip: 'A reservation keeps the selected table visible to the floor team.', permission: 'reservations.manage' },
  { path: '/services', title: 'Manage the menu', description: 'Add and update dishes, categories, prices, descriptions, and availability for order taking.', tip: 'Unavailable items should be turned off so staff cannot add them to new orders.', permission: 'menu.manage' },
  { path: '/customers', title: 'Keep customer records', description: 'Create and maintain customer contact details so reservations and service records stay organized.', tip: 'Customer records belong only to this business workspace.', permission: 'customers.view' },
  { path: '/supplies', title: 'Track inventory', description: 'Record stock levels, suppliers, and stock movements to keep the team informed about supplies.', tip: 'Use stock logs to record purchases and usage over time.', permission: 'supplies.view' },
  { path: '/employees', title: 'Manage your team', description: 'Review staff accounts, roles, and active status. Use Create Employee to add someone to this business.', tip: 'Give each employee only the role access needed for their work.', permission: 'employees.view' },
  { path: '/employees/new', title: 'Create an employee account', description: 'Enter the employee’s details, set their sign-in information, and assign a role for this workspace.', tip: 'Share the new employee’s login details with them securely.', permission: 'employees.create' },
  { path: '/attendance', title: 'Review attendance', description: 'Record and review employee clock-in and clock-out activity for the business.', tip: 'Attendance records are scoped to this business.', permission: 'attendance.view' },
  { path: '/geofencing', title: 'Configure location controls', description: 'Review the geofence settings used to check staff attendance locations.', tip: 'Confirm the location and radius match the business site.', permission: 'geofencing.view' },
  { path: '/reports', title: 'Review reports and expenses', description: 'Record business expenses and review financial summaries for the selected period.', tip: 'Use consistent dates and categories to make reports easier to compare.', permission: 'reports.view' },
  { path: '/history', title: 'Find past activity', description: 'Search historical orders and customer activity when you need to look up a previous transaction.', tip: 'Use the date and status filters to narrow the results.', permission: 'history.view' },
  { path: '/roles-access', title: 'Control staff permissions', description: 'Create roles and choose which operational areas employees assigned to each role can access.', tip: 'The business owner controls business roles. Super-admin controls stay separate.', permission: 'roles.manage' },
  { path: '/table-management', title: 'Set up the floor', description: 'Create or remove tables and organize them by section and seat count.', tip: 'Set up the floor before the team begins taking dine-in orders.', permission: 'table_setup.manage' },
  { path: '/settings/business', title: 'Update business settings', description: 'Review the profile and configuration for this business workspace.', tip: 'Changes here apply to this business only.', permission: 'business_settings.manage' },
];

const SUPER_ADMIN_STEPS: TourStep[] = [
  { path: '/super-admin/businesses', title: 'Manage business accounts', description: 'Create owner accounts, provide their sign-in details, enable or disable a workspace, and control its module access.', tip: 'Each owner’s operational data belongs to their own business.', permission: 'super_admin' },
  { path: '/super-admin/demo-activity', title: 'Review demo activity', description: 'See demo visitors, when they started, their latest activity, and the request log for each visitor.', tip: 'Demo activity is separate from owner business activity.', permission: 'super_admin' },
];

interface GuidedTourProps {
  onClose: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useAppStore((state) => state.permissions);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);
  const selectedBusinessId = useAppStore((state) => state.selectedBusinessId);
  const steps = useMemo(() => (isSuperAdmin
    ? [...(selectedBusinessId ? BUSINESS_STEPS : []), ...SUPER_ADMIN_STEPS]
    : BUSINESS_STEPS).filter((step) => hasPermission(permissions, step.permission, step.path)), [isSuperAdmin, permissions, selectedBusinessId]);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = steps[stepIndex];

  useEffect(() => {
    if (step && location.pathname !== step.path) navigate(step.path);
  }, [location.pathname, navigate, step]);

  useEffect(() => {
    if (!step || location.pathname !== step.path) return;
    let frame = 0;
    const updateTarget = () => {
      const target = document.querySelector('main');
      if (!target) return;
      target.scrollIntoView({ block: 'nearest' });
      setTargetRect(target.getBoundingClientRect());
    };
    frame = window.requestAnimationFrame(updateTarget);
    window.addEventListener('resize', updateTarget);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateTarget);
    };
  }, [location.pathname, step]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setStepIndex((index) => Math.min(index + 1, steps.length - 1));
      if (event.key === 'ArrowLeft') setStepIndex((index) => Math.max(index - 1, 0));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, steps.length]);

  if (!step || steps.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex justify-end"><button onClick={onClose} aria-label="Close tour"><X className="h-5 w-5" /></button></div>
          <p className="font-bold text-[#1F221D]">No tour steps are available for your account.</p>
          <p className="mt-2 text-sm text-[#666A64]">Ask your administrator to grant access to the modules you need.</p>
        </div>
      </div>
    );
  }

  const bounds = targetRect ?? new DOMRect(0, 64, window.innerWidth, window.innerHeight - 64);
  const top = Math.max(64, bounds.top);
  const left = Math.max(0, bounds.left);
  const right = Math.max(0, window.innerWidth - bounds.right);
  const bottom = Math.max(0, window.innerHeight - bounds.bottom);

  return (
    <div className="fixed inset-0 z-[90]" aria-label="Guided product tour">
      <div className="fixed left-0 right-0 top-0 z-[90] bg-slate-950/65" style={{ height: top }} />
      <div className="fixed left-0 z-[90] bg-slate-950/65" style={{ top, width: left, height: Math.max(0, bounds.height) }} />
      <div className="fixed right-0 z-[90] bg-slate-950/65" style={{ top, width: right, height: Math.max(0, bounds.height) }} />
      <div className="fixed left-0 right-0 bottom-0 z-[90] bg-slate-950/65" style={{ height: bottom }} />
      <div
        className="fixed z-[91] rounded-xl border-2 border-orange-400 shadow-[0_0_0_2px_rgba(255,255,255,.9)] pointer-events-none"
        style={{ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }}
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
        className="fixed z-[100] bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 w-[min(92vw,34rem)] max-h-[68vh] overflow-y-auto rounded-2xl border border-[#E9E5E1] bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF2E8] text-[#FF7A10]"><Compass className="h-5 w-5" /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF7A10]">Guided tour · Step {stepIndex + 1} of {steps.length}</p>
              <h2 id="guided-tour-title" className="mt-0.5 text-lg font-black text-[#1F221D]">{step.title}</h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Exit tour" className="rounded-lg p-2 text-[#666A64] hover:bg-[#F7F5F2] hover:text-[#1F221D]"><X className="h-5 w-5" /></button>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#555754]">{step.description}</p>
        <div className="mt-3 rounded-xl bg-[#F7F5F2] px-3.5 py-3 text-xs leading-5 text-[#555754]"><span className="font-bold text-[#1F221D]">Tip: </span>{step.tip}</div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#ECEAE7]"><div className="h-full rounded-full bg-[#FF7A10] transition-all" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={onClose} className="text-sm font-semibold text-[#666A64] hover:text-[#C62828]">Cancel</button>
          <div className="flex items-center gap-2">
            <button onClick={() => setStepIndex((index) => Math.max(0, index - 1))} disabled={stepIndex === 0} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9E5E1] px-3 py-2 text-sm font-bold text-[#555754] hover:bg-[#F7F5F2] disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Back</button>
            {stepIndex < steps.length - 1 ? (
              <button onClick={() => setStepIndex((index) => index + 1)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF7A10] px-4 py-2 text-sm font-bold text-white hover:bg-[#E86000]">Next <ArrowRight className="h-4 w-4" /></button>
            ) : (
              <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF7A10] px-4 py-2 text-sm font-bold text-white hover:bg-[#E86000]">Finish <Check className="h-4 w-4" /></button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuidedTour;
