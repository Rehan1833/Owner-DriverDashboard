import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Mail, ChevronDown, Calendar, Clock, Globe } from 'lucide-react';
import { useOperations } from '../../store/OperationsContext';
import { useTheme } from '../../store/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, notifications, attendance } = useOperations();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Date/Time Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check today's attendance record
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = user?.role === 'Driver'
    ? attendance.find(a => a.driverId === user.driverId && a.date === todayStr)
    : null;
  const isPresent = todayRecord && (todayRecord.attendanceStatus === 'Present' || todayRecord.attendanceStatus === 'Late');

  // Format Pathname to Breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if (paths.length === 0) return 'SmartOps';
    return paths.map((path, index) => {
      const isLast = index === paths.length - 1;
      const formatted = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
      return (
        <span key={index} className="flex items-center gap-1.5">
          <span className="text-gray-400">/</span>
          <span className={isLast ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-gray-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer'}>
            {formatted}
          </span>
        </span>
      );
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 px-6 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-gray-100 dark:border-slate-900 flex items-center justify-between sticky top-0 z-40">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-slate-400 dark:text-slate-550 font-semibold tracking-wide flex items-center gap-1">
          <Globe className="h-4 w-4 text-primary dark:text-blue-500" /> Core System
        </span>
        {getBreadcrumbs()}
      </div>

      {/* Center/Right Controls */}
      <div className="flex items-center gap-6">
        {/* Live Clock Dashboard */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-850 rounded-xl px-4 py-1.5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <span>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="h-3 w-[1px] bg-gray-200 dark:bg-slate-800" />
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Clock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 animate-pulse" />
            <span>
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Company Switcher / Vehicle Number & Online status */}
        {user?.role === 'Driver' ? (
          <div className="hidden sm:flex items-center gap-2">
            {isPresent && (
              <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2 shadow-sm shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div className="text-left">
                  <span className="font-bold text-[9px] block uppercase tracking-wider leading-none">🟢 Attendance Marked</span>
                  <span className="text-[8px] opacity-80 block mt-0.5 leading-none">Check-In: {todayRecord.checkInTime || todayRecord.checkIn || '09:05 AM'}</span>
                </div>
              </div>
            )}
            <div className="px-3 py-1.5 border border-gray-200/80 dark:border-slate-805 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-750 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online</span>
            </div>
            <div className="px-3 py-1.5 border border-gray-200/80 dark:border-slate-805 rounded-xl bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-750 dark:text-slate-300 shadow-sm">
              {user?.vehicleNumber || 'MH-12-QW-9874'}
            </div>
          </div>
        ) : (
          <div className="relative hidden sm:flex items-center gap-2 px-3 py-1.5 border border-gray-200/80 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
            <span>{user?.companyName || 'Main Logistics Corp'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 dark:text-slate-500" />
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-705 dark:hover:text-slate-200 transition-all border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center cursor-pointer shadow-sm"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">☀️ Light Mode</span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">🌙 Dark Mode</span>
          )}
        </button>

        {/* Notification Bell with Menu */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-505 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all border border-transparent hover:border-gray-200/50 dark:hover:border-slate-800 cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-danger text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white dark:border-slate-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2.5 w-90 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100/80 dark:border-slate-800 z-30 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Critical Notifications</span>
                    <span className="text-[10px] bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-extrabold border border-red-100 dark:border-red-900/30">
                      {unreadCount} Alerts
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
                    {notifications.slice(0, 5).map(notif => (
                      <div key={notif.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              notif.severity === 'Error'
                                ? 'bg-danger'
                                : notif.severity === 'Warning'
                                ? 'bg-warning'
                                : 'bg-blue-500'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{notif.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">{notif.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 text-center border-t border-gray-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                    <button className="text-xs font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer">
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Global User Profile Card */}
        <div className="flex items-center gap-3 border-l border-gray-200 dark:border-slate-800 pl-6 shrink-0">
          <img
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Admin'}
            alt="Profile Avatar"
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-850 dark:text-slate-200">{user?.fullName || 'Owner User'}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{user?.role || 'Executive'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
