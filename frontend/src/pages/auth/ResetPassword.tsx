import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0B1C30] flex flex-col items-center justify-center p-4 relative overflow-hidden text-left">
      {/* Background blobs for premium glassmorphic depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#006A6A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Icon */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006A6A] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-teal-500/20 border border-white/10">
          <ShieldCheck className="h-6.5 w-6.5 text-white" />
        </div>
        <span className="font-extrabold text-[26px] tracking-tight text-white leading-none">
          Smart<span className="text-[#14B8A6]">Ops</span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10"
      >
        {!success ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Reset Account Password</h2>
              <p className="text-[13px] text-slate-400 mt-1.5 font-medium">Configure your new secure passphrase code below.</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-[#6D7A79]" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-11 pr-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
                />
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full h-12 rounded-xl font-bold bg-[#006A6A] hover:bg-[#008B8B] text-white mt-4 text-xs shadow-lg shadow-teal-900/20 border-0"
              >
                Reset Password
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-5 py-4">
            <div className="flex justify-center">
              <CheckCircle className="h-14 w-14 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Password Restored</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Your security passcode credentials have been successfully updated.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-12 rounded-xl font-bold bg-[#006A6A] hover:bg-[#008B8B] text-white text-xs border-0 shadow-lg shadow-teal-900/20"
            >
              Sign In Now
            </Button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-white/5 pt-5">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-bold">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};


