import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Map, User, Bell } from 'lucide-react';
import { useOperations } from '../../store/OperationsContext';

export const BottomNav: React.FC = () => {
  const { notifications } = useOperations();
  const unreadNotifCount = notifications.filter(n => !n.read && n.type !== 'Low Stock').length;

  const tabs = [
    { name: 'Home', path: '/driver', icon: Home },
    { name: 'Trips', path: '/driver/trips', icon: Compass },
    { name: 'GPS Navigation', path: '/driver/gps', icon: Map },
    { name: 'Summary', path: '/driver/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-20 px-2 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] sm:max-w-md sm:mx-auto">
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;

        return (
          <NavLink
            key={idx}
            to={tab.path}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1.5 flex-1 h-full text-slate-400 font-medium text-[10px] relative transition-colors ${
                isActive ? 'text-primary' : 'hover:text-slate-600'
              }`
            }
          >
            <div className="relative">
              <Icon className="h-5 w-5 stroke-[2.2]" />
              {tab.name === 'Trips' && unreadNotifCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-danger text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white">
                  {unreadNotifCount}
                </span>
              )}
            </div>
            <span>{tab.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
