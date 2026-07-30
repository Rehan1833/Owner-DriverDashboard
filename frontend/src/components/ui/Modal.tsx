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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1C30]/40 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            role="dialog"
            aria-modal="true"
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
            className={`relative w-full bg-white dark:bg-[#111827] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden ${sizes[size]} z-10 border border-slate-200 dark:border-slate-800 modal-container`}
          >
            {/* Mobile Swipe Bar */}
            <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" onClick={onClose} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tracking-tight modal-title">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 text-[15px] text-[#334155] dark:text-[#CBD5E1] modal-body">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

