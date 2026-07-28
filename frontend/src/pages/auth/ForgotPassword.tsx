import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle, KeyRound, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../api/client';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      setLoading(false);
      setSuccessMsg(res.message || `Password reset OTP dispatched to ${email}.`);
      setStep('reset');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Account not found. Verify email address.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New Password and Confirm Password must match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword({
        email,
        otpCode,
        newPassword
      });
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Invalid OTP code or OTP expired.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1C30] flex flex-col items-center justify-center p-4 relative overflow-hidden text-left">
      {/* Background blobs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#006A6A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Title */}
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
        {/* STEP 1: REQUEST OTP */}
        {step === 'request' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Recover Password</h2>
              <p className="text-[13px] text-slate-400 mt-1.5 font-medium">Enter your workspace email and we will dispatch a reset OTP code.</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Workspace Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#6D7A79]" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-11 pr-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full h-12 rounded-xl font-bold bg-[#006A6A] hover:bg-[#008B8B] text-white mt-4 text-xs shadow-lg shadow-teal-900/20 border-0"
              >
                Send Password Reset OTP
              </Button>
            </form>
          </>
        )}

        {/* STEP 2: ENTER OTP & NEW PASSWORD */}
        {step === 'reset' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Set New Password</h2>
              <p className="text-[13px] text-slate-400 mt-1.5 font-medium">
                Enter the OTP sent to <span className="text-white font-bold">{email}</span> and your new password.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && !errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-bold">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">6-Digit Reset OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 654321"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-[6px] text-base font-bold bg-slate-950/80 border border-white/10 rounded-xl h-12 text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">New Secure Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
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
                Reset Password & Update
              </Button>
            </form>
          </>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 'success' && (
          <div className="text-center space-y-5 py-4">
            <div className="flex justify-center">
              <CheckCircle className="h-14 w-14 text-emerald-500 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Password Reset Complete</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Your security password has been updated successfully. Redirecting to Login...
            </p>
            <Link to="/login" className="block pt-2">
              <Button className="w-full h-12 rounded-xl font-bold bg-[#006A6A] hover:bg-[#008B8B] text-white text-xs border-0 shadow-lg shadow-teal-900/20">
                Proceed to Login
              </Button>
            </Link>
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
