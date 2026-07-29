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
          <span className="text-slate-400 dark:text-[#6D7A79]">/</span>
          <span
            onClick={() => !isLast && navigate(`/${paths.slice(0, index + 1).join('/')}`)}
            className={isLast ? 'text-slate-800 dark:text-[#F8FAFC] font-bold' : 'text-slate-400 hover:text-[#545F73] dark:hover:text-slate-350 cursor-pointer transition-colors'}
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
    <header className="h-20 px-8 bg-white dark:bg-[#111827] sticky top-0 z-40 transition-all border-b border-[#E5EEFF] dark:border-[#334155] flex items-center justify-between shadow-sm">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="text-[#6D7A79] dark:text-[#94A3B8] font-bold tracking-wide flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-[#006A6A] dark:text-[#7DF5F5]" /> Core System
        </span>
        {getBreadcrumbs()}
      </div>

      {/* Global Dashboard Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex relative max-w-xs w-full mx-4">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6D7A79] dark:text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Telemetry lookup..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          className="w-full pl-10 pr-4 h-11 text-xs border border-[#E5EEFF] dark:border-[#334155] rounded-xl bg-[#EFF4FF] dark:bg-[#1E293B] text-[#0B1C30] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] transition-all placeholder-slate-400 font-medium"
        />
      </form>

      {/* Controls Wrapper */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Clock & Date Ticker */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold text-[#545F73] dark:text-[#CBD5E1] bg-[#F8F9FF] dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-xl px-4 py-2 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#6D7A79] dark:text-[#94A3B8]" />
            <span>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="h-3.5 w-[1px] bg-[#E5EEFF] dark:bg-[#334155]" />
          <div className="flex items-center gap-1.5 font-bold text-[#0B1C30] dark:text-[#F8FAFC]">
            <Clock className="h-3.5 w-3.5 text-[#006A6A] dark:text-[#7DF5F5] animate-pulse" />
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
              <div className="px-3.5 py-1.5 bg-[#DCFCE7] dark:bg-[#064E3B]/40 border border-[#10B981]/25 rounded-xl text-[#10B981] flex items-center gap-2 shadow-sm shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                </span>
                <div className="text-left">
                  <span className="font-bold text-[9px] block uppercase tracking-wider leading-none">ON DUTY</span>
                </div>
              </div>
            )}
            <div className="px-3.5 py-2 border border-[#E5EEFF] dark:border-[#334155] rounded-xl bg-white dark:bg-[#1E293B] text-xs font-mono font-bold text-[#545F73] dark:text-[#CBD5E1] shadow-sm">
              {user?.vehicleNumber || 'MH-12-QW-9874'}
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/owner/profile')}
            className="relative hidden sm:flex items-center gap-2 px-3.5 py-2 border border-[#E5EEFF] dark:border-[#334155] rounded-xl bg-white dark:bg-[#1E293B] hover:bg-[#F8F9FF] dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs font-semibold text-[#545F73] dark:text-[#CBD5E1] shadow-sm"
          >
            <Shield className="h-3.5 w-3.5 text-[#006A6A] dark:text-[#7DF5F5]" />
            <span>{user?.companyName || 'SmartOps Ltd'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 dark:text-[#6D7A79]" />
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="h-10 px-3.5 rounded-xl hover:bg-[#F8F9FF] dark:hover:bg-[#1E293B] text-[#545F73] dark:text-[#CBD5E1] hover:text-[#0B1C30] dark:hover:text-white transition-all border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#111827] flex items-center justify-center cursor-pointer shadow-sm"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#545F73]">â˜€ï¸ Light</span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#CBD5E1]">ðŸŒ™ Dark</span>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-xl hover:bg-[#F8F9FF] dark:hover:bg-[#1E293B] text-[#545F73] dark:text-[#CBD5E1] hover:text-[#0B1C30] dark:hover:text-white transition-all border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#111827] flex items-center justify-center cursor-pointer shadow-sm"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#BA1A1A] text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-white dark:border-[#111827] animate-bounce">
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
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-[#E5EEFF] dark:border-[#334155] z-30 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-[#E5EEFF] dark:border-[#334155] flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0B1C30] dark:text-white">Corporate System Logs</span>
                    <span className="text-[9px] bg-[#FFDAD4] dark:bg-[#7F1D1D]/30 text-[#BA1A1A] dark:text-[#FCA5A5] px-2.5 py-0.5 rounded-full font-bold border border-[#BA1A1A]/10">
                      {unreadCount} Alerts
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E5EEFF] dark:divide-[#334155]">
                    {notifications.slice(0, 5).map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => navigate('/owner/notifications')}
                        className="p-3.5 hover:bg-[#EFF4FF]/60 dark:hover:bg-[#111827]/40 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              notif.severity === 'Error'
                                ? 'bg-[#BA1A1A]'
                                : notif.severity === 'Warning'
                                ? 'bg-[#F59E0B]'
                                : 'bg-[#006A6A]'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                             <p className="text-[11px] font-bold text-[#0B1C30] dark:text-[#CBD5E1] whitespace-normal break-words leading-tight">{notif.title}</p>
                             <p className="text-[10px] text-[#545F73] dark:text-[#94A3B8] whitespace-normal break-words leading-tight mt-0.5">{notif.message}</p>
                             <span className="text-[9px] text-[#6D7A79] dark:text-[#94A3B8] font-bold block mt-1">{notif.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-8 text-center text-xs text-[#6D7A79]">
                        No active warnings recorded today.
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] dark:bg-[#111827] flex justify-between items-center text-[10px] font-bold">
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[#006A6A] dark:text-[#7DF5F5] hover:underline cursor-pointer"
                    >
                      Clear Badge
                    </button>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/owner/notifications');
                      }}
                      className="text-[#545F73] dark:text-[#CBD5E1] hover:text-[#0B1C30] dark:hover:text-white cursor-pointer"
                    >
                      Full Log History â†’
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
          className="flex items-center gap-3 border-l border-[#E5EEFF] dark:border-[#334155] pl-4.5 shrink-0 cursor-pointer group"
        >
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || 'SmartOps'}&backgroundColor=006A6A`}
            alt="Profile Avatar"
            className="w-9 h-9 rounded-full border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="hidden sm:block text-left">
            <p className="text-[11px] font-bold text-[#0B1C30] dark:text-white group-hover:text-[#006A6A] dark:group-hover:text-[#7DF5F5] transition-colors leading-none">
              {user?.fullName || 'Owner User'}
            </p>
            <p className="text-[9px] text-[#006A6A] dark:text-[#7DF5F5] font-bold uppercase mt-1 tracking-wider">
              {user?.role || 'Executive'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};


