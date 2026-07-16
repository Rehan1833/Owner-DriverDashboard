import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OperationsProvider } from './store/OperationsContext';
import { OwnerLayout } from './layouts/OwnerLayout';
import { DriverLayout } from './layouts/DriverLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Owner Pages
import { Dashboard as OwnerDashboard } from './pages/owner/Dashboard';
import { Operations as OwnerOperations } from './pages/owner/Operations';
import { Inventory as OwnerInventory } from './pages/owner/Inventory';
import { Attendance as OwnerAttendance } from './pages/owner/Attendance';
import { Fleet as OwnerFleet } from './pages/owner/Fleet';
import { Tasks as OwnerTasks } from './pages/owner/Tasks';
import { Payroll as OwnerPayroll } from './pages/owner/Payroll';
import { Reports as OwnerReports } from './pages/owner/Reports';

// Driver Pages
import { Home as DriverHome } from './pages/driver/Home';
import { GPS as DriverGPS } from './pages/driver/GPS';
import { Trips as DriverTrips } from './pages/driver/Trips';
import { Profile as DriverProfile } from './pages/driver/Profile';
import { POD as DriverPOD } from './pages/driver/POD';
import { VehicleInfo as DriverVehicleInfo } from './pages/driver/VehicleInfo';
import { Notifications as DriverNotifications } from './pages/driver/Notifications';
import { Settings as DriverSettings } from './pages/driver/Settings';
import { ThemeProvider } from './store/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <OperationsProvider>
        <BrowserRouter>
        <Routes>
          {/* Auth Flow */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Owner Dashboard Workspace (Web Console) */}
          <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<OwnerDashboard />} />
            <Route path="operations" element={<OwnerOperations />} />
            <Route path="inventory" element={<OwnerInventory />} />
            <Route path="attendance" element={<OwnerAttendance />} />
            <Route path="fleet" element={<OwnerFleet />} />
            <Route path="tasks" element={<OwnerTasks />} />
            <Route path="payroll" element={<OwnerPayroll />} />
            <Route path="reports" element={<OwnerReports />} />
            {/* Fallback under owner */}
            <Route path="*" element={<Navigate to="/owner" replace />} />
          </Route>

          {/* Driver Dashboard Console (Enterprise SaaS) */}
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<DriverHome />} />
            <Route path="gps" element={<DriverGPS />} />
            <Route path="trips" element={<DriverTrips />} />
            <Route path="fleet" element={<DriverVehicleInfo />} />
            <Route path="pod" element={<DriverPOD />} />
            <Route path="notifications" element={<DriverNotifications />} />
            <Route path="profile" element={<DriverProfile />} />
            <Route path="settings" element={<DriverSettings />} />
            {/* Fallback under driver */}
            <Route path="*" element={<Navigate to="/driver" replace />} />
          </Route>

          {/* Global Fallback Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </OperationsProvider>
    </ThemeProvider>
  );
};

export default App;
