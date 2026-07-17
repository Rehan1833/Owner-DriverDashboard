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
            { name: 'Operations Log', path: '/owner/operations', icon: Activity },
            { name: 'Fleet Tracker', path: '/owner/fleet', icon: Truck },
            { name: 'Attendance Status', path: '/owner/attendance', icon: Users },
            { name: 'Workers Directory', path: '/owner/workers', icon: Users },
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
      transition={{ type: 'spring', damping: 24, stiffness: 220 }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-sidebar text-slate-300 dark:text-slate-400 border-r border-white/5 z-20 overflow-hidden shrink-0 shadow-2xl"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-aqua flex items-center justify-center shadow-lg shadow-teal-500/20" style={{ background: 'linear-gradient(135deg, #006A6A 0%, #00A3A3 100%)' }}>
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-black text-base text-white tracking-wide"
            >
              Smart<span className="text-teal-400">Ops</span>
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block pl-3"
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
                    className={`relative flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all duration-150 group cursor-pointer ${
                      isActive
                        ? 'text-white bg-primary shadow-md shadow-primary/10 pl-4'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full shadow-[0_0_8px_#14B8A6]" />
                    )}
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-450 group-hover:text-white'}`} />
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
      <div className="p-4 border-t border-white/5 bg-black/10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden p-1.5 rounded-xl hover:bg-slate-800">
          <img
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Harsh'}
            alt="Avatar"
            className="w-9 h-9 rounded-full bg-slate-800 shrink-0 border border-slate-700"
          />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Owner User'}</p>
              <p className="text-[9px] font-bold text-slate-500 truncate">{user?.role || 'Executive'}</p>
            </motion.div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 mt-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-bold group cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 text-red-400 group-hover:text-red-350" />
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
