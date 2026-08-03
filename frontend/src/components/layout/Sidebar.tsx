import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Warehouse,
  Truck,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  User
} from 'lucide-react';
import { useOperations } from '../../store/OperationsContext';
import { LogoIcon } from '../common/LogoIcon';

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
            { name: 'Trips & Dispatch', path: '/owner/trips', icon: Truck },
            { name: 'Operations Log', path: '/owner/operations', icon: Activity },
            { name: 'Fleet Tracker', path: '/owner/fleet', icon: Truck },
            { name: 'Attendance Status', path: '/owner/attendance', icon: Users },
            { name: 'Workers Directory', path: '/owner/workers', icon: Users },
            { name: 'Proof of Delivery', path: '/owner/pod', icon: FileText },
          ],
        },
        {
          title: 'Management & Reports',
          items: [
            { name: 'Inventory Logs', path: '/owner/inventory', icon: Warehouse },
            { name: 'Payroll & Salary', path: '/owner/payroll', icon: CreditCard },
            { name: 'Reports Desk', path: '/owner/reports', icon: FileText },
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
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 272 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-[#1E293B] text-[#94A3B8] border-r border-[#334155]/60 z-20 overflow-hidden shrink-0 shadow-lg transition-colors duration-200"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 shrink-0 border-b border-[#334155]/60">
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <LogoIcon size={40} />
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
          className="p-1.5 rounded-lg hover:bg-[#334155]/60 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5 pb-4 border-b border-[#334155]/40 last:border-b-0 last:pb-0">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block px-3 pb-1"
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
                    title={isCollapsed ? item.name : undefined}
                    aria-label={item.name}
                    className={`relative flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#006A6A]/35 to-[#00A3A3]/20 text-[#7DF5F5] font-semibold border border-[#00A3A3]/40 shadow-[0_2px_12px_rgba(0,163,163,0.15)]'
                        : 'text-[#CBD5E1] font-medium hover:text-white hover:bg-[#006A6A]/15'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    {/* Active left glowing vertical indicator bar */}
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#7DF5F5] rounded-r-full shadow-[0_0_8px_rgba(125,245,245,0.6)]" />
                    )}
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                        isActive
                          ? 'text-[#7DF5F5]'
                          : 'text-[#94A3B8] group-hover:text-[#7DF5F5]'
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

      {/* Footer Logout Button Only (No profile card below or above) */}
      <div className="p-3 border-t border-[#334155]/60 shrink-0 bg-[#17202E]">
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          aria-label="Logout"
          className={`flex items-center gap-3 w-full px-3.5 py-2.5 text-xs text-[#CBD5E1] hover:text-rose-400 bg-[#0F172A]/70 hover:bg-rose-500/15 border border-[#334155]/60 hover:border-rose-500/30 rounded-xl transition-all duration-200 font-semibold group cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4 shrink-0 text-[#94A3B8] group-hover:text-rose-400 transition-colors" />
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
