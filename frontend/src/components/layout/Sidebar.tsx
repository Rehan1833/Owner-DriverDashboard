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
      animate={{ width: isCollapsed ? 72 : 272 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-[#0F172A] text-[#94A3B8] border-r border-[#1E293B] z-20 overflow-hidden shrink-0 shadow-md"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 shrink-0 border-b border-[#1E293B]">
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006A6A] to-[#00A3A3] flex items-center justify-center shadow-md shadow-teal-500/10 shrink-0">
            <ShieldCheck className="h-4.5 w-4.5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="font-black text-[17px] text-[#F8FAFC] tracking-tight whitespace-nowrap"
            >
              Smart<span className="text-[#7DF5F5]">Ops</span>
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition-colors cursor-pointer shrink-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto overflow-x-hidden">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest block px-3 pb-1"
              >
                {section.title}
              </motion.span>
            )}
            <div className="space-y-0.5">
              {section.items.map((item, idx) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={idx}
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    aria-label={item.name}
                    className={`relative flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? 'text-white bg-[#006A6A] shadow-sm font-bold'
                        : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E293B]'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    {/* Active left bar indicator */}
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-white/70 rounded-r-full" />
                    )}
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : 'text-[#94A3B8] group-hover:text-[#F8FAFC] transition-colors'
                      }`}
                    />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.12 }}
                        className="whitespace-nowrap"
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

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#1E293B] shrink-0 space-y-1">
        <div className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1E293B] transition-colors overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || 'SmartOps'}&backgroundColor=006A6A`}
            alt="Avatar"
            className="w-8 h-8 rounded-full bg-[#1E293B] shrink-0 border border-[#334155]"
          />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.12 }}
              className="flex-1 min-w-0"
            >
              <p className="text-xs font-bold text-[#F8FAFC] truncate leading-tight">{user?.fullName || 'User'}</p>
              <p className="text-[10px] font-semibold text-[#94A3B8] truncate leading-tight mt-0.5">{user?.role || 'Driver'}</p>
            </motion.div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          aria-label="Logout"
          className={`flex items-center gap-3 w-full px-3 py-2.5 text-xs text-[#FCA5A5] hover:bg-red-500/10 rounded-xl transition-all font-semibold group cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4 shrink-0 group-hover:opacity-80" />
          {!isCollapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
