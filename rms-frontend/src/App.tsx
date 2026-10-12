import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useTableStore } from './store/useTableStore';
import { useOrderStore } from './store/useOrderStore';
import { useKitchenStore } from './store/useKitchenStore';
import { AppShell } from './components/layout/AppShell';
import { ROUTES_CONFIG } from './constants/routesConfig';

// Screens
import { LoginScreen } from './screens/Login/LoginScreen';
import { DashboardScreen } from './screens/Dashboard/DashboardScreen';
import { TablesScreen } from './screens/Tables/TablesScreen';
import { OrderScreen } from './screens/Order/OrderScreen';
import { KitchenScreen } from './screens/Kitchen/KitchenScreen';
import { PaymentScreen } from './screens/Payment/PaymentScreen';
import { BusinessSettingsScreen } from './screens/Settings/BusinessSettingsScreen';
import { ReservationsScreen } from './screens/Reservations/ReservationsScreen';
import { CustomersScreen } from './screens/Customers/CustomersScreen';
import { ServicesScreen } from './screens/Services/ServicesScreen';
import { TableManagementScreen } from './screens/TableManagement/TableManagementScreen';
import { ReportsScreen } from './screens/Reports/ReportsScreen';
import { HistoryScreen } from './screens/History/HistoryScreen';
import { SuppliesScreen } from './screens/Supplies/SuppliesScreen';
import { EmployeesScreen } from './screens/Employees/EmployeesScreen';
import { EmployeeFormScreen } from './screens/Employees/EmployeeFormScreen';
import { RolesAccessScreen } from './screens/RolesAccess/RolesAccessScreen';
import { AttendanceScreen } from './screens/Attendance/AttendanceScreen';
import { GeofencingScreen } from './screens/Geofencing/GeofencingScreen';
import { BusinessesScreen } from './screens/SuperAdmin/BusinessesScreen';
import { DemoActivityScreen } from './screens/SuperAdmin/DemoActivityScreen';
import { useAppStore } from './store/useAppStore';
import { api } from './services/api';
import { resetTenantStores, setTenantStorageScope } from './store/resetTenantStores';
import { useCustomerStore } from './store/useCustomerStore';

const DemoEntry: React.FC = () => {
  const navigate = useNavigate();
  const setUserRole = useAppStore((state) => state.setUserRole);
  const [error, setError] = React.useState('');

  useEffect(() => {
    api.loginDemo()
      .then((response) => {
        resetTenantStores();
        setTenantStorageScope(`demo:${response.name}`);
        setUserRole(response.account_type, response.permissions, response.token, response.name, response.role_name, false, true);
        navigate('/dashboard', { replace: true });
      })
      .catch((loginError: unknown) => {
        setError(loginError instanceof Error ? loginError.message : 'Unable to start the demo.');
      });
  }, [navigate, setUserRole]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F7F5F2] text-[#1F221D]">
      <p className="font-bold">{error || 'Starting your demo workspace…'}</p>
      {error && <button onClick={() => navigate('/login')} className="text-sm font-bold text-[#FF7A10]">Return to login</button>}
    </div>
  );
};

export const App: React.FC = () => {
  const fetchTables = useTableStore((state) => state.fetchTables);
  const fetchMenuItems = useOrderStore((state) => state.fetchMenuItems);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const fetchKitchenOrders = useKitchenStore((state) => state.fetchKitchenOrders);
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const userRole = useAppStore((state) => state.userRole);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);
  const isDemo = useAppStore((state) => state.isDemo);
  const userName = useAppStore((state) => state.userName);
  const selectedBusinessId = useAppStore((state) => state.selectedBusinessId);
  const permissions = useAppStore((state) => state.permissions);

  const location = useLocation();

  useEffect(() => {
    if (!userRole || location.pathname === '/login' || location.pathname === '/demo') return;
    if (isSuperAdmin && (!selectedBusinessId || location.pathname.startsWith('/super-admin'))) return;

    const storageScope = isSuperAdmin
      ? `business:${selectedBusinessId}`
      : isDemo
        ? `demo:${userName ?? 'anonymous'}`
        : 'business:owner';
    setTenantStorageScope(storageScope);
    if (isSuperAdmin || isDemo || permissions.includes('tables.view')) fetchTables();
    if (isSuperAdmin || isDemo || permissions.includes('menu.manage')) fetchMenuItems();
    if (isSuperAdmin || isDemo || permissions.includes('orders.create')) fetchOrders();
    if (isSuperAdmin || isDemo || permissions.includes('kitchen.view')) fetchKitchenOrders();
    if (isDemo && location.pathname === '/dashboard') fetchCustomers();
  }, [location.pathname, fetchCustomers, fetchKitchenOrders, fetchMenuItems, fetchOrders, fetchTables, isDemo, isSuperAdmin, permissions, selectedBusinessId, userName, userRole]);

  const isLogin = location.pathname === '/login';

  if (location.pathname === '/demo') return <DemoEntry />;

  if (isLogin) {
    return (
      <div className="w-full min-h-screen bg-[#F7F5F2] text-[#1F221D] font-sans select-none">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
        </Routes>
      </div>
    );
  }

  if (!userRole) return <Navigate to="/login" replace />;
  if (isSuperAdmin && !location.pathname.startsWith('/super-admin') && !selectedBusinessId) {
    return <Navigate to="/super-admin/businesses" replace />;
  }
  if (!isSuperAdmin && location.pathname.startsWith('/super-admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Find route metadata for title & breadcrumb
  const currentRouteConfig = ROUTES_CONFIG.find(
    (r) => r.path === location.pathname || (r.path === '/employees' && location.pathname.startsWith('/employees/'))
  );

  const title = currentRouteConfig?.title || 'Pixora RIMS Enterprise';
  const breadcrumb = currentRouteConfig?.breadcrumb || 'Home';

  return (
    <AppShell key={isSuperAdmin ? selectedBusinessId ?? 'no-business' : 'business'} headerTitle={title} headerBreadcrumb={breadcrumb}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/tables" element={<TablesScreen />} />
        <Route path="/order" element={<OrderScreen />} />
        <Route path="/kitchen" element={<KitchenScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
        <Route path="/reservations" element={<ReservationsScreen />} />
        <Route path="/customers" element={<CustomersScreen />} />
        <Route path="/services" element={<ServicesScreen />} />
        <Route path="/supplies" element={<SuppliesScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="/table-management" element={<TableManagementScreen />} />

        {/* People Module */}
        <Route path="/employees" element={<EmployeesScreen />} />
        <Route path="/employees/new" element={<EmployeeFormScreen />} />
        <Route path="/employees/:id/edit" element={<EmployeeFormScreen />} />
        <Route path="/staff" element={<Navigate to="/employees" replace />} />
        <Route path="/attendance" element={<AttendanceScreen />} />
        <Route path="/geofencing" element={<GeofencingScreen />} />

        {/* Administration Module */}
        <Route path="/roles-access" element={<RolesAccessScreen />} />
        <Route path="/settings/business" element={<BusinessSettingsScreen />} />
        <Route path="/settings" element={<Navigate to="/settings/business" replace />} />
        <Route path="/super-admin/businesses" element={<BusinessesScreen />} />
        <Route path="/super-admin/demo-activity" element={<DemoActivityScreen />} />
      </Routes>
    </AppShell>
  );
};

export default App;
