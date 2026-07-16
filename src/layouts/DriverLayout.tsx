import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { Navbar } from '../components/shared/Navbar';
import { useOperations } from '../store/OperationsContext';
import { AttendanceModal } from '../components/shared/AttendanceModal';

export const DriverLayout: React.FC = () => {
  const { user, attendance } = useOperations();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalDismissed, setIsModalDismissed] = useState(false);

  // Route protection
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow Drivers and Owners to access the portal layout
  if (user.role !== 'Driver' && user.role !== 'Owner') {
    return <Navigate to="/login" replace />;
  }

  // Check if today's attendance exists and is present/late
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = user.role === 'Driver'
    ? attendance.find(a => a.driverId === user.driverId && a.date === todayStr)
    : null;

  const isPresent = todayRecord && (todayRecord.attendanceStatus === 'Present' || todayRecord.attendanceStatus === 'Late');

  // Sync isModalDismissed state with present record
  useEffect(() => {
    if (isPresent) {
      setIsModalDismissed(true);
    }
  }, [isPresent]);

  const showAttendanceModal = user.role === 'Driver' && !isModalDismissed;

  return (
    <div className="flex bg-bg min-h-screen text-slate-800 dark:text-slate-100 relative transition-all duration-300">
      {/* Collapsible Sidebar */}
      <div className={`transition-all duration-300 flex ${showAttendanceModal ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showAttendanceModal ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        <Navbar />
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1600px] w-full mx-auto pb-16">
          <Outlet />
        </main>
        
        {/* Footer status bar */}
        <footer className="h-10 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-900 px-6 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
              GPS Core Status: <span className="font-semibold text-slate-600 dark:text-slate-400">Active (Looping)</span>
            </span>
            <span className="w-[1px] h-3 bg-gray-200 dark:bg-slate-800" />
            <span className="flex items-center gap-1">
              Telemetry Server: <span className="font-semibold text-slate-600 dark:text-slate-400">Syncing (MongoDB Connected)</span>
            </span>
          </div>
          <div>
            System Version: <span className="font-semibold text-slate-600 dark:text-slate-400">v4.1.2-DriverSaaS</span>
          </div>
        </footer>
      </div>

      {/* Attendance Check-In Modal overlay */}
      {showAttendanceModal && (
        <AttendanceModal onSuccess={() => setIsModalDismissed(true)} />
      )}
    </div>
  );
};
