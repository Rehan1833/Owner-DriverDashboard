import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OperationsProvider } from './store/OperationsContext';
import { ThemeProvider } from './store/ThemeContext';

// Loading Spinner Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing System Nodes...</span>
    </div>
  </div>
);

// Layout Wrappers
import { OwnerLayout } from './layouts/OwnerLayout';
import { DriverLayout } from './layouts/DriverLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth Pages (Lazy Loaded)
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));

// Owner Pages (Lazy Loaded)
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard').then(m => ({ default: m.Dashboard })));
const OwnerOperations = lazy(() => import('./pages/owner/Operations').then(m => ({ default: m.Operations })));
const OwnerInventory = lazy(() => import('./pages/owner/Inventory').then(m => ({ default: m.Inventory })));
const OwnerAttendance = lazy(() => import('./pages/owner/Attendance').then(m => ({ default: m.Attendance })));
const OwnerFleet = lazy(() => import('./pages/owner/Fleet').then(m => ({ default: m.Fleet })));
const OwnerTasks = lazy(() => import('./pages/owner/Tasks').then(m => ({ default: m.Tasks })));
const OwnerPayroll = lazy(() => import('./pages/owner/Payroll').then(m => ({ default: m.Payroll })));
const OwnerReports = lazy(() => import('./pages/owner/Reports').then(m => ({ default: m.Reports })));
const OwnerSettings = lazy(() => import('./pages/owner/Settings').then(m => ({ default: m.Settings })));
const OwnerNotifications = lazy(() => import('./pages/owner/Notifications').then(m => ({ default: m.Notifications })));
const OwnerWorkers = lazy(() => import('./pages/owner/Workers').then(m => ({ default: m.Workers })));
const OwnerAnalytics = lazy(() => import('./pages/owner/Analytics').then(m => ({ default: m.Analytics })));
const OwnerProfile = lazy(() => import('./pages/owner/Profile').then(m => ({ default: m.Profile })));
const OwnerPOD = lazy(() => import('./pages/owner/POD').then(m => ({ default: m.POD })));
const OwnerTrips = lazy(() => import('./pages/owner/Trips').then(m => ({ default: m.OwnerTrips })));

// Driver Pages (Lazy Loaded)
const DriverDashboard = lazy(() => import('./pages/driver/Dashboard').then(m => ({ default: m.Home })));
const DriverAttendance = lazy(() => import('./pages/driver/Attendance').then(m => ({ default: m.GPS })));
const DriverTrips = lazy(() => import('./pages/driver/Trips').then(m => ({ default: m.Trips })));
const DriverActiveTrip = lazy(() => import('./pages/driver/ActiveTrip').then(m => ({ default: m.ActiveTrip })));
const DriverPOD = lazy(() => import('./pages/driver/POD').then(m => ({ default: m.POD })));
const DriverVehicle = lazy(() => import('./pages/driver/Vehicle').then(m => ({ default: m.VehicleInfo })));
const DriverNotifications = lazy(() => import('./pages/driver/Notifications').then(m => ({ default: m.Notifications })));
const DriverProfile = lazy(() => import('./pages/driver/Profile').then(m => ({ default: m.Profile })));
const DriverSettings = lazy(() => import('./pages/driver/Settings').then(m => ({ default: m.Settings })));

// Error Boundaries (Lazy Loaded)
const NotFound = lazy(() => import('./pages/errors/NotFound').then(m => ({ default: m.NotFound })));
const Unauthorized = lazy(() => import('./pages/errors/Unauthorized').then(m => ({ default: m.Unauthorized })));
const ServerError = lazy(() => import('./pages/errors/ServerError').then(m => ({ default: m.ServerError })));

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <OperationsProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Auth Layout Wrapper */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Owner Portal (Decoupled Dashboard Wrapper) */}
              <Route path="/owner" element={<OwnerLayout />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<OwnerDashboard />} />
                  <Route path="operations" element={<OwnerOperations />} />
                  <Route path="trips" element={<OwnerTrips />} />
                  <Route path="inventory" element={<OwnerInventory />} />
                  <Route path="attendance" element={<OwnerAttendance />} />
                  <Route path="fleet" element={<OwnerFleet />} />
                  <Route path="tasks" element={<OwnerTasks />} />
                  <Route path="payroll" element={<OwnerPayroll />} />
                  <Route path="reports" element={<OwnerReports />} />
                  <Route path="settings" element={<OwnerSettings />} />
                  <Route path="notifications" element={<OwnerNotifications />} />
                  <Route path="workers" element={<OwnerWorkers />} />
                  <Route path="analytics" element={<OwnerAnalytics />} />
                  <Route path="profile" element={<OwnerProfile />} />
                  <Route path="pod" element={<OwnerPOD />} />
                </Route>
              </Route>


              {/* Driver Portal (Decoupled Dashboard Wrapper) */}
              <Route path="/driver" element={<DriverLayout />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<DriverDashboard />} />
                  <Route path="attendance" element={<DriverAttendance />} />
                  <Route path="trips" element={<DriverTrips />} />
                  <Route path="active-trip" element={<DriverActiveTrip />} />
                  <Route path="gps" element={<Navigate to="/driver/active-trip" replace />} />
                  <Route path="pod" element={<DriverPOD />} />
                  <Route path="fleet" element={<DriverVehicle />} />
                  <Route path="notifications" element={<DriverNotifications />} />
                  <Route path="profile" element={<DriverProfile />} />
                  <Route path="settings" element={<DriverSettings />} />
                </Route>
              </Route>

              {/* Error Boundaries */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/server-error" element={<ServerError />} />
              <Route path="/404" element={<NotFound />} />

              {/* Fallback Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </OperationsProvider>
    </ThemeProvider>
  );
};

export default App;
