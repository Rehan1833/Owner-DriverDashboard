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
  const [email, setEmail] = useState('harsh.v@smartops.com');
  const [password, setPassword] = useState('password123');
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
    if (role === 'Owner') {
      setEmail('harsh.v@smartops.com');
    } else {
      setEmail('rajesh.k@smartops.com');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, selectedRole);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4">
      {/* Platform Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <span className="font-extrabold text-2xl tracking-wide text-white">
          Smart<span className="text-blue-500">Ops</span> Platform
        </span>
      </motion.div>

      {/* Glassmorphism Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Enterprise Log In</h2>
          <p className="text-xs text-slate-400 mt-1.5">Sign in using database-backed JWT profiles.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Workspace Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Secret Password</label>
              <Link to="/forgot-password" className="text-[10px] text-blue-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            />
          </div>

          {/* Choose Role Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Select Workspaces Portal</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Owner', 'Driver'] as UserRole[]).map(role => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-white font-semibold'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs">{role}</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">
                        {role === 'Owner' ? 'Web Console' : 'Mobile App'}
                      </span>
                    </div>
                    {role === 'Driver' ? (
                      <Truck className={`h-4 w-4 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                    ) : (
                      <KeyRound className={`h-4 w-4 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
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
            className="w-full py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white mt-4 text-xs"
          >
            Authenticate & Login
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          New to SmartOps?{' '}
          <Link to="/register" className="text-blue-500 hover:underline font-semibold">
            Register here
          </Link>
        </div>

        {/* Security Disclaimers */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-slate-500 border-t border-slate-800/80 pt-5">
          <ShieldAlert className="h-3.5 w-3.5 text-slate-600" />
          <span>Restricted to Owner & Driver credentials only.</span>
        </div>
      </motion.div>
    </div>
  );
};
