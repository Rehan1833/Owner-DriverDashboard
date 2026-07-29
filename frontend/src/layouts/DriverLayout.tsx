<<<<<<< HEAD
﻿import React, { useState, useEffect } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { useOperations } from '../store/OperationsContext';
import { AttendanceModal } from '../components/attendance/AttendanceModal';

export const DriverLayout: React.FC = () => {
  const { user, attendance } = useOperations();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalDismissed, setIsModalDismissed] = useState(false);

<<<<<<< HEAD
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
=======
  // Check if today's attendance exists and is present/late
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = user && user.role === 'Driver'
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
    ? attendance.find(a => a.driverId === user.driverId && a.date === todayStr)
    : null;

  const isPresent = todayRecord && (todayRecord.attendanceStatus === 'Present' || todayRecord.attendanceStatus === 'Late');

  // Sync isModalDismissed state with present record
  useEffect(() => {
    if (isPresent) {
      setIsModalDismissed(true);
    }
  }, [isPresent]);

<<<<<<< HEAD
  const showAttendanceModal = user.role === 'Driver' && !isModalDismissed;

  return (
    <div className="flex bg-[#F8F9FF] dark:bg-[#0F172A] min-h-screen text-[#0B1C30] dark:text-[#F8FAFC] relative transition-all duration-300">
=======
  // Route protection
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow Drivers and Owners to access the portal layout
  if (user.role !== 'Driver' && user.role !== 'Owner') {
    return <Navigate to="/login" replace />;
  }

  const showAttendanceModal = user.role === 'Driver' && !isModalDismissed;

  return (
    <div className="flex bg-white dark:bg-[#0F172A] min-h-screen text-[#111827] dark:text-[#F8FAFC] relative transition-colors duration-200">
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      {/* Collapsible Sidebar */}
      <div className={`transition-all duration-300 flex ${showAttendanceModal ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showAttendanceModal ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        <Navbar />
        {/* Main Content Area */}
<<<<<<< HEAD
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1600px] w-full mx-auto pb-16 bg-[#F8F9FF] dark:bg-[#0F172A]/5">
=======
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto pb-16 bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC]">
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
          <Outlet />
        </main>
        
        {/* Footer status bar */}
<<<<<<< HEAD
        <footer className="h-10 bg-white dark:bg-[#111827] border-t border-[#E5EEFF] dark:border-[#334155] px-6 flex items-center justify-between text-[11px] text-[#6D7A79] dark:text-[#94A3B8] shrink-0 font-semibold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
              GPS Core Status: <span className="text-[#0B1C30] dark:text-[#F8FAFC]">Active (Looping)</span>
            </span>
            <span className="w-[1px] h-3 bg-[#E5EEFF] dark:bg-[#334155]" />
            <span className="flex items-center gap-1">
              Telemetry Server: <span className="text-[#0B1C30] dark:text-[#F8FAFC]">Syncing (MongoDB Connected)</span>
            </span>
          </div>
          <div>
            System Version: <span className="text-[#0B1C30] dark:text-[#F8FAFC]">v4.1.2-DriverSaaS</span>
=======
        <footer className="h-9 bg-white dark:bg-[#111827] border-t border-[#E5E7EB] dark:border-[#334155] px-4 md:px-6 flex items-center justify-between text-[11px] text-[#4B5563] dark:text-[#94A3B8] shrink-0 font-semibold">
          <div className="flex items-center gap-4 min-w-0">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
              GPS: <span className="text-[#111827] dark:text-[#CBD5E1] ml-1 font-bold">Active</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
              Telemetry: <span className="text-[#111827] dark:text-[#CBD5E1] ml-1 font-bold">Syncing</span>
            </span>
          </div>
          <div className="whitespace-nowrap font-mono">
            v<span className="text-[#111827] dark:text-[#CBD5E1] font-bold">4.1.2</span>-DriverSaaS
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
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
