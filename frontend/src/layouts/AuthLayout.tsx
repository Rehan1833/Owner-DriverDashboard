import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useOperations } from '../store/OperationsContext';

export const AuthLayout: React.FC = () => {
  const { user } = useOperations();

  // If user is already authenticated, redirect to their home node
  if (user) {
    return <Navigate to={user.role === 'Driver' ? '/driver' : '/owner'} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] dark:bg-[#0F172A] p-6 text-[#0B1C30] dark:text-[#F8FAFC] transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-8 shadow-lg space-y-6 text-center">
        {/* Core Header logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006A6A] to-[#00A3A3] flex items-center justify-center shadow-lg shadow-teal-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-lg text-[#0B1C30] dark:text-white tracking-wide">
            Smart<span className="text-[#006A6A] dark:text-[#7DF5F5]">Ops</span>
          </span>
        </div>
        
        {/* Children views */}
        <Outlet />
        
        <div className="text-[10px] text-[#6D7A79] dark:text-[#94A3B8] font-bold uppercase tracking-wider">
          Enterprise Logistics SaaS Platform
        </div>
      </div>
    </div>
  );
};

