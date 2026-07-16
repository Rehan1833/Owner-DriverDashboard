import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ 
              opacity: 0, 
              y: window.innerWidth < 640 ? '100%' : 15,
              scale: window.innerWidth < 640 ? 1 : 0.98
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              y: window.innerWidth < 640 ? '100%' : 15,
              scale: window.innerWidth < 640 ? 1 : 0.98
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`relative w-full bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden ${sizes[size]} z-10 border border-gray-100/60 dark:border-slate-800/80`}
          >
            {/* Mobile Swipe Bar */}
            <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full" onClick={onClose} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-50 dark:border-slate-800/60 bg-white dark:bg-slate-900">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-405 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-slate-650 dark:text-slate-350">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
