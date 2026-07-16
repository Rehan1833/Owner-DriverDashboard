import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Warehouse,
  Truck,
  CheckSquare,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Bell,
  FileDown
} from 'lucide-react';
import { useOperations } from '../../store/OperationsContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { logout, user } = useOperations();

  const isDriver = user?.role === 'Driver';

  const sections = isDriver
    ? [
        {
          title: 'Operations',
          items: [
            { name: 'Dashboard', path: '/driver', icon: LayoutDashboard },
            { name: 'My Trips', path: '/driver/trips', icon: Truck },
            { name: 'Active Trip', path: '/driver/gps', icon: Activity },
            { name: 'Proof of Delivery', path: '/driver/pod', icon: FileText },
          ],
        },
        {
          title: 'Console & Settings',
          items: [
            { name: 'Vehicle Info', path: '/driver/fleet', icon: Warehouse },
            { name: 'Notifications', path: '/driver/notifications', icon: Bell },
            { name: 'Profile', path: '/driver/profile', icon: Users },
            { name: 'Settings', path: '/driver/settings', icon: Settings },
          ],
        },
      ]
    : [
        {
          title: 'Operations',
          items: [
            { name: 'Dashboard', path: '/owner', icon: LayoutDashboard },
            { name: 'Operations', path: '/owner/operations', icon: Activity },
            { name: 'Fleet Tracker', path: '/owner/fleet', icon: Truck },
            { name: 'Attendance Status', path: '/owner/attendance', icon: Users },
          ],
        },
        {
          title: 'Management',
          items: [
            { name: 'Inventory Logs', path: '/owner/inventory', icon: Warehouse },
            { name: 'Task Board', path: '/owner/tasks', icon: CheckSquare },
            { name: 'Payroll & Payroll', path: '/owner/payroll', icon: CreditCard },
          ],
        },
        {
          title: 'Analytics',
          items: [
            { name: 'Reports Desk', path: '/owner/reports', icon: FileText },
          ],
        },
      ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: 'spring', damping: 24, stiffness: 220 }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-900 z-20 overflow-hidden shrink-0"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-slate-900 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-black text-base text-slate-800 dark:text-white tracking-wide"
            >
              Smart<span className="text-blue-500">Ops</span>
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest block pl-3"
              >
                {section.title}
              </motion.span>
            )}
            <div className="space-y-1">
              {section.items.map((item, idx) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={idx}
                    to={item.path}
                    className={`relative flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 group cursor-pointer ${
                      isActive
                        ? 'text-white bg-blue-600 dark:bg-blue-600 shadow-md shadow-blue-500/10'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile Details */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/40 dark:bg-slate-900/10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/40">
          <img
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Admin'}
            alt="Avatar"
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-850 shrink-0 border border-slate-100 dark:border-slate-800"
          />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.fullName || 'Owner User'}</p>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-650 truncate">{user?.role || 'Executive'}</p>
            </motion.div>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 mt-2.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-semibold group cursor-pointer border border-transparent"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 text-red-550 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" />
          {!isCollapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
