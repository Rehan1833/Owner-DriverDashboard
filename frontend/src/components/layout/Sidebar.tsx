import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
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
  LineChart,
  User
} from 'lucide-react';
import { useOperations } from '../../store/OperationsContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useOperations();

  const isDriver = user?.role === 'Driver';

  const sections = isDriver
    ? [
        {
          title: 'Operations',
          items: [
            { name: 'Dashboard', path: '/driver', icon: LayoutDashboard },
            { name: 'My Trips', path: '/driver/trips', icon: Truck },
            { name: 'Active Trip', path: '/driver/active-trip', icon: Activity },
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
            { name: 'Operations Log', path: '/owner/operations', icon: Activity },
            { name: 'Fleet Tracker', path: '/owner/fleet', icon: Truck },
            { name: 'Attendance Status', path: '/owner/attendance', icon: Users },
            { name: 'Workers Directory', path: '/owner/workers', icon: Users },
            { name: 'Proof of Delivery', path: '/owner/pod', icon: FileText },
          ],
        },
        {
          title: 'Management',
          items: [
            { name: 'Inventory Logs', path: '/owner/inventory', icon: Warehouse },
            { name: 'Task Board', path: '/owner/tasks', icon: CheckSquare },
            { name: 'Payroll & Salary', path: '/owner/payroll', icon: CreditCard },
          ],
        },
        {
          title: 'Analytics & Alerts',
          items: [
            { name: 'Reports Desk', path: '/owner/reports', icon: FileText },
            { name: 'Business Analytics', path: '/owner/analytics', icon: LineChart },
            { name: 'Notifications Log', path: '/owner/notifications', icon: Bell },
          ],
        },
        {
          title: 'Account Settings',
          items: [
            { name: 'Profile Settings', path: '/owner/profile', icon: User },
            { name: 'System Settings', path: '/owner/settings', icon: Settings },
          ],
        },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-white dark:bg-[#111827] text-[#545F73] dark:text-[#CBD5E1] border-r border-[#E5EEFF] dark:border-[#334155] z-20 overflow-hidden shrink-0 shadow-sm"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-6 shrink-0 border-b border-[#E5EEFF]/80 dark:border-[#334155]/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006A6A] to-[#00A3A3] flex items-center justify-center shadow-md shadow-teal-500/10">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-black text-lg text-[#0B1C30] dark:text-white tracking-tight"
            >
              Smart<span className="text-[#006A6A] dark:text-[#7DF5F5]">Ops</span>
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-[#EFF4FF] dark:hover:bg-slate-800/40 text-slate-400 dark:text-[#6D7A79] hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-2">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-bold text-[#6D7A79] dark:text-[#94A3B8] uppercase tracking-widest block pl-3"
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
                    className={`relative flex items-center gap-3.5 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? 'text-white bg-[#006A6A] dark:bg-[#006A6A] dark:text-white shadow-md shadow-[#006A6A]/10 pl-5'
                        : 'text-[#545F73] hover:text-[#0B1C30] hover:bg-[#EFF4FF]/60 dark:text-[#CBD5E1] dark:hover:text-white dark:hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#00A3A3] dark:bg-[#7DF5F5] rounded-r-full shadow-[0_0_8px_#00A3A3]" />
                    )}
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#545F73] group-hover:text-[#0B1C30] dark:text-[#CBD5E1] dark:group-hover:text-white transition-colors'}`} />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-normal break-words leading-tight"
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
      <div className="p-4 bg-[#F8F9FF] dark:bg-[#0F172A]/50 border-t border-[#E5EEFF] dark:border-[#334155] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden p-2 rounded-xl hover:bg-[#EFF4FF] dark:hover:bg-slate-800/40 transition-colors">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || 'SmartOps'}&backgroundColor=006A6A`}
            alt="Avatar"
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 border border-[#E5EEFF] dark:border-[#334155]"
          />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-xs font-bold text-[#0B1C30] dark:text-[#F8FAFC] whitespace-normal break-words leading-tight">{user?.fullName || 'Owner User'}</p>
              <p className="text-[10px] font-bold text-[#6D7A79] dark:text-[#94A3B8] whitespace-normal break-words leading-tight">{user?.role || 'Executive'}</p>
            </motion.div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 mt-3 text-xs text-[#BA1A1A] hover:text-[#BA1A1A] hover:bg-[#FFDAD4]/50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 rounded-xl transition-all font-bold group cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0 text-[#BA1A1A] dark:text-red-400 group-hover:opacity-80" />
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


