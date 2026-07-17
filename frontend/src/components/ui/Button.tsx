import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-750 shadow-md shadow-blue-500/10 focus:ring-blue-500 border border-transparent',
    secondary: 'bg-secondary text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 shadow-md shadow-sky-500/10 focus:ring-sky-500 border border-transparent',
    success: 'bg-success text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-md shadow-emerald-500/10 focus:ring-emerald-500 border border-transparent',
    warning: 'bg-warning text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 shadow-md shadow-amber-500/10 focus:ring-amber-500 border border-transparent',
    danger: 'bg-danger text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-md shadow-red-500/10 focus:ring-red-500 border border-transparent',
    outline: 'border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 focus:ring-blue-500',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent focus:ring-slate-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    icon: 'p-2',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props as any}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
};
