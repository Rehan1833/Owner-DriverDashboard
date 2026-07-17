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
    <div className="min-h-screen flex items-center justify-center bg-bg p-6 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-lg space-y-6 text-center">
        {/* Core Header logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-lg text-slate-800 dark:text-white tracking-wide">
            Smart<span className="text-teal-500">Ops</span>
          </span>
        </div>
        
        {/* Children views */}
        <Outlet />
        
        <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">
          Enterprise Logistics SaaS Platform
        </div>
      </div>
    </div>
  );
};
