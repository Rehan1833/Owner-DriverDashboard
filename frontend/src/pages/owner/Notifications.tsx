import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Button } from '../../components/ui/Button';
import { soundPlayer } from '../../utils/audio';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { SystemNotification } from '../../types';

export const Notifications: React.FC = () => {
  const { notifications, triggerNotification } = useOperations();
  const [localNotifs, setLocalNotifs] = useState<SystemNotification[]>(notifications);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sound helper based on volume configuration
  const playSound = (severity: 'Success' | 'Warning' | 'Error' | 'Info') => {
    const savedSettings = localStorage.getItem('smartops_owner_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : { soundEnabled: true, soundVolume: 0.5 };
    if (settings.soundEnabled) {
      soundPlayer.play(severity, settings.soundVolume);
    }
  };

  // Actions
  const handleMarkAsRead = (id: string) => {
    setLocalNotifs(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    playSound('Success');
  };

  const handleMarkAllRead = () => {
    setLocalNotifs(prev => prev.map(n => ({ ...n, read: true })));
    playSound('Success');
    triggerNotification('System Alert', 'Notifications Read', 'All critical alerts marked read.', 'Info');
  };

  const handleDeleteNotif = (id: string) => {
    setLocalNotifs(prev => prev.filter(n => n.id !== id));
    playSound('Warning');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your notification history log?')) {
      setLocalNotifs([]);
      playSound('Error');
      triggerNotification('System Alert', 'Log Wiped', 'Cleared system incident history logs.', 'Info');
    }
  };

  // Severity UI details mapping
  const getSeverityStyle = (severity: string | undefined) => {
    switch (severity) {
      case 'Error':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 shadow-sm',
          icon: XCircle
        };
      case 'Warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20 border border-amber-105 dark:border-amber-900/30 text-amber-600 dark:text-amber-450 shadow-sm',
          icon: AlertTriangle
        };
      case 'Success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-450 shadow-sm',
          icon: CheckCircle2
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-450 shadow-sm',
          icon: Info
        };
    }
  };

  // Categorize standard alerts
  const detectCategory = (title: string, message: string): string => {
    const text = (title + ' ' + message).toLowerCase();
    if (text.includes('stock') || text.includes('inventory') || text.includes('safety limit')) return 'Inventory';
    if (text.includes('attendance') || text.includes('duty') || text.includes('break') || text.includes('logged')) return 'Attendance';
    if (text.includes('fleet') || text.includes('trip') || text.includes('vehicle') || text.includes('gps') || text.includes('telemetry')) return 'Fleet';
    if (text.includes('salary') || text.includes('payroll') || text.includes('disbursed')) return 'Salary';
    if (text.includes('report') || text.includes('export')) return 'Reports';
    return 'System';
  };

  // Processing alerts listing
  const filteredNotifs = localNotifs.filter(notif => {
    const cat = detectCategory(notif.title, notif.message);
    const matchesCategory = filterCategory === 'All' || cat === filterCategory;
    const matchesSeverity = filterSeverity === 'All' || notif.severity === filterSeverity;
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const totalPages = Math.ceil(filteredNotifs.length / itemsPerPage);
  const currentNotifs = filteredNotifs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-white tracking-tight flex items-center gap-2.5 leading-none">
            <Bell className="h-7 w-7 text-[#006A6A] dark:text-[#14B8A6] animate-pulse" />
            Notifications Center
          </h2>
          <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">
            Track real-time system alerts, fleet telemetry updates, salary approvals, and stock limits.
          </p>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto shrink-0 self-stretch sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={filteredNotifs.every(n => n.read)}
            className="flex-1 sm:flex-none text-xs font-semibold py-2 border border-[#E5EEFF] dark:border-[#334155] bg-white hover:bg-[#F8F9FF]"
          >
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </Button>
          <Button
            type="button"
            onClick={handleClearAll}
            disabled={filteredNotifs.length === 0}
            variant="danger"
            className="flex-1 sm:flex-none text-xs font-bold py-2 shadow-md shadow-red-900/10"
          >
            <Trash2 className="h-4 w-4" /> Clear Logs
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-[20px] p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="search-icon-glow absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search alerts detail..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="navbar-search-input w-full pl-9 pr-3 h-9 text-xs border border-[#E5E7EB] dark:border-[#334155] rounded-full bg-slate-50/50 dark:bg-slate-800/40 text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#006A6A] focus:border-[#006A6A] transition-all font-medium"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto md:ml-auto">
          {['All', 'Inventory', 'Attendance', 'Fleet', 'Salary', 'Reports', 'System'].map(category => (
            <button
              key={category}
              onClick={() => {
                setFilterCategory(category);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterCategory === category
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#6D7A79] hover:text-slate-800 hover:bg-[#F8F9FF] dark:hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Severity Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterSeverity}
            onChange={e => {
              setFilterSeverity(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-36 px-4 h-11 text-xs border border-[#E5EEFF] dark:border-[#334155] rounded-xl bg-[#F8F9FF] dark:bg-[#0F172A] text-slate-700 focus:outline-none cursor-pointer font-bold"
          >
            <option value="All">All Severities</option>
            <option value="Success">Success</option>
            <option value="Info">Information</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
          </select>
        </div>
      </div>

      {/* Grid Alerts Listing */}
      <div className="space-y-3">
        {currentNotifs.length > 0 ? (
          currentNotifs.map(notif => {
            const cat = detectCategory(notif.title, notif.message);
            const style = getSeverityStyle(notif.severity);
            const SeverityIcon = style.icon;

            return (
              <div
                key={notif.id}
                className={`border rounded-2xl p-5 flex gap-4 items-start transition-all hover:shadow-sm ${
                  notif.read
                    ? 'bg-[#F8F9FF]/40 dark:bg-[#1E293B]/40 border-[rgba(11,28,48,0.04)] opacity-75'
                    : 'bg-white dark:bg-[#1E293B] border-[#E5EEFF] dark:border-[#334155] shadow-sm relative overflow-hidden'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-0 left-0 w-1 h-full bg-[#006A6A] dark:bg-[#14B8A6]" />
                )}

                <div className={`p-2.5 rounded-xl shrink-0 ${style.bg}`}>
                  <SeverityIcon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-[15px] font-bold text-[#0B1C30] dark:text-[#F8FAFC]">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] bg-[#F8F9FF] dark:bg-slate-800 text-[#6D7A79] font-bold px-2 py-0.5 rounded border border-slate-200/40 uppercase tracking-wider">
                        {cat}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-[#6D7A79] font-semibold flex items-center gap-1 shrink-0">
                      <Clock className="h-3.5 w-3.5" /> {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 leading-relaxed font-semibold">
                    {notif.message}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-2 rounded-xl hover:bg-[#F8F9FF] dark:hover:bg-slate-800 text-slate-400 hover:text-[#006A6A] dark:hover:text-[#14B8A6] transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotif(notif.id)}
                    className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-[#EF4444] transition-colors cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-[20px] p-16 text-center shadow-sm">
            <Bell className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto animate-bounce mb-3.5" />
            <h4 className="text-[15px] font-bold text-[#0B1C30] dark:text-[#F8FAFC]">System Log Empty</h4>
            <p className="text-[13px] text-[#6D7A79] dark:text-[#6D7A79] mt-1 font-medium">There are no notifications matching the filtered query criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-xl p-4 shadow-sm text-xs font-bold">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-[#F8F9FF] dark:hover:bg-slate-800 rounded-xl cursor-pointer disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[#6D7A79] dark:text-[#94A3B8] font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-[#F8F9FF] dark:hover:bg-slate-800 rounded-xl cursor-pointer disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};


