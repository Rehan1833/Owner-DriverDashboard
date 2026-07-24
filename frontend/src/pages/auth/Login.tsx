import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOperations } from '../../store/OperationsContext';
import { UserRole } from '../../types';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, ShieldAlert, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Login: React.FC = () => {
  const { login, user } = useOperations();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirection when already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'Driver') {
        navigate('/driver');
      } else {
        navigate('/owner');
      }
    }
  }, [user, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, selectedRole, password);
      setLoading(false);
      if (selectedRole === 'Driver') {
        navigate('/driver');
      } else {
        navigate('/owner');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Login failed. Verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1C30] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs for premium glassmorphic depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#006A6A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Platform Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8 relative z-10"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006A6A] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-teal-500/20 border border-white/10">
          <ShieldCheck className="h-6.5 w-6.5 text-white" />
        </div>
        <span className="font-extrabold text-[26px] tracking-tight text-white leading-none">
          Smart<span className="text-[#14B8A6]">Ops</span>
        </span>
      </motion.div>

      {/* Glassmorphism Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10 text-left"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Log In</h2>
          <p className="text-[13px] text-slate-400 mt-1.5 font-medium">Sign in using database-backed JWT profiles.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Workspace Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[13px] font-bold text-slate-300 uppercase tracking-wide">Secret Password</label>
              <Link to="/forgot-password" className="text-xs text-[#14B8A6] hover:underline font-bold">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
            />
          </div>

          {/* Choose Role Switcher */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Select Workspaces Portal</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Owner', 'Driver'] as UserRole[]).map(role => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#006A6A] bg-[#006A6A]/10 text-white font-bold'
                        : 'border-white/10 hover:border-white/20 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs">{role}</span>
                      <span className="text-[10px] text-[#6D7A79] mt-0.5 font-bold uppercase tracking-wider">
                        {role === 'Owner' ? 'Web Console' : 'Mobile App'}
                      </span>
                    </div>
                    {role === 'Driver' ? (
                      <Truck className={`h-4 w-4 ${isSelected ? 'text-[#14B8A6]' : 'text-slate-655'}`} />
                    ) : (
                      <KeyRound className={`h-4 w-4 ${isSelected ? 'text-[#14B8A6]' : 'text-slate-655'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Action Button */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full h-12 rounded-xl font-bold bg-[#006A6A] hover:bg-[#008B8B] text-white mt-4 text-xs shadow-lg shadow-teal-900/20 border-0"
          >
            Authenticate & Login
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400 font-semibold">
          New to SmartOps?{' '}
          <Link to="/register" className="text-[#14B8A6] hover:underline font-bold">
            Register here
          </Link>
        </div>

        {/* Security Disclaimers */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-[#6D7A79] border-t border-white/5 pt-5">
          <ShieldAlert className="h-4 w-4 text-[#545F73] shrink-0" />
          <span className="font-semibold">Restricted to Owner & Driver credentials only.</span>
        </div>
      </motion.div>
    </div>
  );
};


