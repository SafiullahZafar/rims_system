import {
  LayoutDashboard,
  Grid,
  Plus,
  ChefHat,
  CreditCard,
  CalendarDays,
  UtensilsCrossed,
  UserCircle2,
  Package,
  Users,
  UserPlus,
  Clock,
  MapPin,
  BarChart2,
  History,
  ShieldAlert,
  LayoutGrid,
  Settings,
  Building2,
  Activity,
  LucideIcon,
} from 'lucide-react';

export interface RouteConfig {
  id: string;
  path: string;
  label: string;
  section: 'Overview' | 'POS Operations' | 'Catalog & CRM' | 'Inventory' | 'People' | 'Analytics' | 'Administration' | 'Super Admin';
  icon: LucideIcon;
  permission: string;
  breadcrumb: string;
  title: string;
  isSpecial?: boolean;
  badgeKey?: 'kitchen';
  hideInSidebar?: boolean;
}

export const ROUTE_SECTIONS = [
  'Overview',
  'POS Operations',
  'Catalog & CRM',
  'Inventory',
  'People',
  'Analytics',
  'Administration',
  'Super Admin',
] as const;

export const ROUTES_CONFIG: RouteConfig[] = [
  // Overview
  {
    id: '/dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    section: 'Overview',
    icon: LayoutDashboard,
    permission: 'dashboard.view',
    title: 'Overview Dashboard',
    breadcrumb: 'Home / Overview',
  },

  // POS Operations
  {
    id: '/tables',
    path: '/tables',
    label: 'Floor & Tables',
    section: 'POS Operations',
    icon: Grid,
    permission: 'tables.view',
    title: 'Tables Floor Map',
    breadcrumb: 'POS Operations / Tables Floor Map',
  },
  {
    id: '/order',
    path: '/order',
    label: 'New Order',
    section: 'POS Operations',
    icon: Plus,
    permission: 'orders.create',
    title: 'Order Taking POS',
    breadcrumb: 'POS Operations / New Order',
    isSpecial: true,
  },
  {
    id: '/kitchen',
    path: '/kitchen',
    label: 'Kitchen Board',
    section: 'POS Operations',
    icon: ChefHat,
    permission: 'kitchen.view',
    title: 'Kitchen Board',
    breadcrumb: 'POS Operations / Kitchen Queue',
    badgeKey: 'kitchen',
  },
  {
    id: '/payment',
    path: '/payment',
    label: 'Payments & Bills',
    section: 'POS Operations',
    icon: CreditCard,
    permission: 'payments.process',
    title: 'Checkout & Bills',
    breadcrumb: 'POS Operations / Checkout & Payments',
  },
  {
    id: '/reservations',
    path: '/reservations',
    label: 'Reservations',
    section: 'POS Operations',
    icon: CalendarDays,
    permission: 'reservations.manage',
    title: 'Reservations',
    breadcrumb: 'POS Operations / Reservations',
  },

  // Catalog & CRM
  {
    id: '/services',
    path: '/services',
    label: 'Menu / Services',
    section: 'Catalog & CRM',
    icon: UtensilsCrossed,
    permission: 'menu.manage',
    title: 'Services & Menu Management',
    breadcrumb: 'Catalog & CRM / Menu & Services',
  },
  {
    id: '/customers',
    path: '/customers',
    label: 'Customers',
    section: 'Catalog & CRM',
    icon: UserCircle2,
    permission: 'customers.view',
    title: 'Customers Directory',
    breadcrumb: 'Catalog & CRM / Customers',
  },

  // Inventory
  {
    id: '/supplies',
    path: '/supplies',
    label: 'Supplies',
    section: 'Inventory',
    icon: Package,
    permission: 'supplies.view',
    title: 'Stock & Inventory Supplies',
    breadcrumb: 'Inventory / Supplies',
  },

  // People
  {
    id: '/employees',
    path: '/employees',
    label: 'Employees',
    section: 'People',
    icon: Users,
    permission: 'employees.view',
    title: 'Employees Directory',
    breadcrumb: 'People / Employee Directory',
  },
  {
    id: '/employees/new',
    path: '/employees/new',
    label: 'Create Employee',
    section: 'People',
    icon: UserPlus,
    permission: 'employees.create',
    title: 'Add New Employee',
    breadcrumb: 'People / Employees / Create Employee',
  },
  {
    id: '/attendance',
    path: '/attendance',
    label: 'Attendance',
    section: 'People',
    icon: Clock,
    permission: 'attendance.view',
    title: 'Attendance & Clock Logs',
    breadcrumb: 'People / Attendance Logs',
  },
  {
    id: '/geofencing',
    path: '/geofencing',
    label: 'Geofencing',
    section: 'People',
    icon: MapPin,
    permission: 'geofencing.view',
    title: 'Geofence Control & Status',
    breadcrumb: 'People / Geofence Management',
  },

  // Analytics
  {
    id: '/reports',
    path: '/reports',
    label: 'Reports & Expenses',
    section: 'Analytics',
    icon: BarChart2,
    permission: 'reports.view',
    title: 'Business Analytics & Reports',
    breadcrumb: 'Analytics / Reports',
  },
  {
    id: '/history',
    path: '/history',
    label: 'History / Activity',
    section: 'Analytics',
    icon: History,
    permission: 'history.view',
    title: 'Operational History & Audit',
    breadcrumb: 'Analytics / History',
  },

  // Administration
  {
    id: '/roles-access',
    path: '/roles-access',
    label: 'Roles & Access',
    section: 'Administration',
    icon: ShieldAlert,
    permission: 'roles.manage',
    title: 'Roles & Access Control',
    breadcrumb: 'Administration / Roles & Permissions',
  },
  {
    id: '/table-management',
    path: '/table-management',
    label: 'Table Setup',
    section: 'Administration',
    icon: LayoutGrid,
    permission: 'table_setup.manage',
    title: 'Table Layout & Setup',
    breadcrumb: 'Administration / Table Setup',
  },
  {
    id: '/settings/business',
    path: '/settings/business',
    label: 'Business Settings',
    section: 'Administration',
    icon: Settings,
    permission: 'business_settings.manage',
    title: 'Business Profile & Settings',
    breadcrumb: 'Administration / Business Settings',
  },
  {
    id: '/super-admin/businesses',
    path: '/super-admin/businesses',
    label: 'Business Accounts',
    section: 'Super Admin',
    icon: Building2,
    permission: 'super_admin',
    title: 'Business Accounts',
    breadcrumb: 'Super Admin / Business Accounts',
  },
  {
    id: '/super-admin/demo-activity',
    path: '/super-admin/demo-activity',
    label: 'Demo Activity',
    section: 'Super Admin',
    icon: Activity,
    permission: 'super_admin',
    title: 'Demo Activity',
    breadcrumb: 'Super Admin / Demo Activity',
  },
];

export function hasPermission(userPermissions: string[], reqPermission: string, path: string): boolean {
  if (userPermissions.includes('super_admin')) return true;
  if (!userPermissions || userPermissions.length === 0) return false;
  if (userPermissions.includes('/admin') || userPermissions.includes('admin')) return true;
  if (userPermissions.includes(path)) return true;
  if (userPermissions.includes(reqPermission)) return true;
  
  // Legacy paths mapping
  if (path === '/employees' || path === '/employees/new' || path === '/attendance' || path === '/geofencing') {
    if (userPermissions.includes('/staff') || userPermissions.includes('staff')) return true;
  }
  if (path === '/roles-access' || path === '/settings/business' || path === '/settings') {
    if (userPermissions.includes('/settings') || userPermissions.includes('/admin')) return true;
  }

  return false;
}
