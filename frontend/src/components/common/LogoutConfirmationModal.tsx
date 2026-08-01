import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, AlertTriangle, Loader2 } from 'lucide-react';
import { useOperations } from '../../store/OperationsContext';

export const LogoutConfirmationModal: React.FC = () => {
  const { isLogoutModalOpen, isLoggingOut, cancelLogout, performLogout } = useOperations();
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Auto focus Cancel button on open for accessibility & fast keyboard exit
  useEffect(() => {
    if (isLogoutModalOpen) {
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    }
  }, [isLogoutModalOpen]);

  // ESC key listener & Keyboard Trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLogoutModalOpen) return;

      if (e.key === 'Escape' && !isLoggingOut) {
        e.preventDefault();
        cancelLogout();
        return;
      }

      // Keyboard Focus Trap between Cancel & Confirm buttons
      if (e.key === 'Tab') {
        const focusables = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean) as HTMLElement[];
        if (focusables.length < 2) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogoutModalOpen, isLoggingOut, cancelLogout]);

  return (
    <AnimatePresence>
      {isLogoutModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent"
          onClick={() => !isLoggingOut && cancelLogout()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-description"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-[95%] sm:w-[90%] max-w-[440px] bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-5 text-left relative overflow-hidden modal-container"
          >
            {/* Header Icon + Title */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200/60 dark:border-red-800/40 flex items-center justify-center shrink-0 shadow-sm">
                <LogOut className="h-6 w-6 text-[#BA1A1A] dark:text-red-400" />
              </div>
              <div>
                <h2 id="logout-modal-title" className="text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tracking-tight leading-tight modal-title">
                  Confirm Logout
                </h2>
                <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mt-0.5 modal-subtitle">
                  SmartOps Enterprise Control
                </p>
              </div>
            </div>

            {/* Main Description */}
            <p id="logout-modal-description" className="text-[15px] font-medium text-[#334155] dark:text-[#CBD5E1] leading-relaxed modal-description">
              Are you sure you want to log out of SmartOps?
            </p>

            {/* Warning Message Box */}
            <div className="p-4 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/40 border border-[#FDE68A] dark:border-amber-800/60 space-y-1 warning-card">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#92400E] dark:text-[#FCD34D]">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Session Warning</span>
              </div>
              <p className="text-sm font-medium text-[#92400E] dark:text-[#FCD34D] leading-snug pl-6">
                Any unsaved changes or active entries may be lost. You will need to log back in to access your dashboard.
              </p>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={cancelLogout}
                disabled={isLoggingOut}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#334155] dark:text-[#CBD5E1] text-[15px] font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                ref={confirmBtnRef}
                type="button"
                onClick={performLogout}
                disabled={isLoggingOut}
                className="px-5 py-2.5 rounded-xl bg-[#BA1A1A] hover:bg-[#A01616] text-white text-[15px] font-semibold transition-all shadow-md shadow-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span className="text-white">Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 text-white" />
                    <span className="text-white">Log Out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
