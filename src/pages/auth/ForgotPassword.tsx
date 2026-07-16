import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../api/client';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.auth.login(email, 'Owner'); // trigger mock response
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4">
      {/* Platform Title */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center">
          <ShieldCheck className="h-5.5 w-5.5 text-white" />
        </div>
        <span className="font-extrabold text-xl tracking-wide text-white">SmartOps</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl"
      >
        {!success ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-white">Recover Password</h2>
              <p className="text-xs text-slate-400 mt-1.5">Enter your email and we'll dispatch a link to reset your security credentials.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Workspace Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full py-3 rounded-xl font-bold bg-blue-600 text-xs text-white"
              >
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-white">Recovery Dispatched</h3>
            <p className="text-xs text-slate-400 leading-normal">
              A password reset token link has been generated and mock dispatched to <span className="text-slate-200 font-semibold">{email}</span>. Please inspect your inbox.
            </p>
            <Link to="/reset-password" className="block">
              <Button className="w-full py-3 rounded-xl font-bold bg-slate-850 hover:bg-slate-800 text-xs">
                Go to Reset Form
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-slate-800/80 pt-5">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
