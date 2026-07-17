import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Calendar, Clock, Globe, Shield, Volume2, VolumeX, CheckSquare } from 'lucide-react';
import { useOperations } from '../../store/OperationsContext';
import { useTheme } from '../../store/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { soundPlayer } from '../../utils/audio';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, notifications, attendance, triggerNotification, markAllNotificationsRead } = useOperations();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchVal, setSearchVal] = useState('');

  // Live Date/Time Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio Playback Triggers
  const getSoundSettings = () => {
    const saved = localStorage.getItem('smartops_owner_settings');
    return saved ? JSON.parse(saved) : { soundEnabled: true, soundVolume: 0.5 };
  };

  const prevLengthRef = useRef(notifications.length);

  useEffect(() => {
    if (notifications.length > prevLengthRef.current) {
      const latest = notifications[0];
      if (latest) {
        const settings = getSoundSettings();
        if (settings.soundEnabled) {
          soundPlayer.play(latest.severity || 'Info', settings.soundVolume);
        }
      }
    }
    prevLengthRef.current = notifications.length;
  }, [notifications]);

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
          <span className="text-slate-400 dark:text-slate-650">/</span>
          <span
            onClick={() => !isLast && navigate(`/${paths.slice(0, index + 1).join('/')}`)}
            className={isLast ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer transition-colors'}
          >
            {formatted}
          </span>
        </span>
      );
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    const settings = getSoundSettings();
    if (settings.soundEnabled) {
      soundPlayer.play('Success', settings.soundVolume);
    }
    triggerNotification('System Alert', 'Notifications Clean', 'All unread notifications marked as read.', 'Info');
    setShowNotifications(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      alert(`Global telemetry search requested: "${searchVal}"`);
      setSearchVal('');
    }
  };

  return (
    <header className="h-16 px-6 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-gray-100 dark:border-slate-900 flex items-center justify-between sticky top-0 z-40 transition-all">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="text-slate-400 dark:text-slate-500 font-bold tracking-wide flex items-center gap-1">
          <Globe className="h-3.5 w-3.5 text-primary dark:text-blue-500" /> Core System
        </span>
        {getBreadcrumbs()}
      </div>

      {/* Global Dashboard Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex relative max-w-xs w-full mx-4">
        <Search className="absolute left-3 top-2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Telemetry lookup..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-200/80 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-205 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
        />
      </form>

      {/* Controls Wrapper */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Clock & Date Ticker */}
        <div className="hidden lg:flex items-center gap-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-850 rounded-xl px-4.5 py-1.5 shadow-sm">
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
          <div className="h-3 w-[1px] bg-gray-250 dark:bg-slate-800" />
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-350">
            <Clock className="h-3.5 w-3.5 text-primary dark:text-blue-400 animate-pulse" />
            <span>
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Branch Info / User Role */}
        {user?.role === 'Driver' ? (
          <div className="hidden sm:flex items-center gap-2">
            {isPresent && (
              <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/30 rounded-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2 shadow-sm shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div className="text-left">
                  <span className="font-extrabold text-[9px] block uppercase tracking-wider leading-none">🟢 ON DUTY</span>
                </div>
              </div>
            )}
            <div className="px-3 py-1.5 border border-gray-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">
              {user?.vehicleNumber || 'MH-12-QW-9874'}
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/owner/profile')}
            className="relative hidden sm:flex items-center gap-2 px-3 py-1.5 border border-gray-200/80 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>{user?.companyName || 'SmartOps Ltd'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 dark:text-slate-500" />
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 transition-all border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center cursor-pointer shadow-sm"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">☀️ Light</span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-300">🌙 Dark</span>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-205 transition-all border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center cursor-pointer shadow-sm"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white rounded-full text-[8px] font-bold flex items-center justify-center border border-white dark:border-slate-950 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 z-30 overflow-hidden"
                >
                  <div className="px-4.5 py-3.5 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Corporate System Logs</span>
                    <span className="text-[9px] bg-red-50 dark:bg-red-950/20 text-red-655 dark:text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-100 dark:border-red-900/30">
                      {unreadCount} Alerts
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/80">
                    {notifications.slice(0, 5).map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => navigate('/owner/notifications')}
                        className="p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              notif.severity === 'Error'
                                ? 'bg-danger'
                                : notif.severity === 'Warning'
                                ? 'bg-warning'
                                : 'bg-primary'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-705 dark:text-slate-350 truncate">{notif.title}</p>
                            <p className="text-[10px] text-slate-450 dark:text-slate-550 truncate mt-0.5">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mt-1">{notif.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No active warnings recorded today.
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-50 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex justify-between items-center text-[10px] font-bold">
                    <button
                      onClick={handleMarkAllRead}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      Clear Badge
                    </button>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/owner/notifications');
                      }}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      Full Log History →
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Global User Profile */}
        <div
          onClick={() => navigate('/owner/profile')}
          className="flex items-center gap-2.5 border-l border-gray-150 dark:border-slate-850 pl-4.5 shrink-0 cursor-pointer group"
        >
          <img
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Harsh&backgroundColor=006A6A'}
            alt="Profile Avatar"
            className="w-8 h-8 rounded-full border border-gray-205 dark:border-slate-800 bg-slate-50 shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="hidden sm:block text-left">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors leading-none">
              {user?.fullName || 'Owner User'}
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase mt-0.5">
              {user?.role || 'Executive'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
