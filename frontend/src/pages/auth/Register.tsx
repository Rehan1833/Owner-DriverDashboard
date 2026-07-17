import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOperations } from '../../store/OperationsContext';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, KeyRound, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Register: React.FC = () => {
  const { register } = useOperations();
  const navigate = useNavigate();
  const [role, setRole] = useState<'Owner' | 'Driver'>('Owner');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    driverId: '',
    vehicleNumber: '',
    licenseNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        role,
        password: formData.password
      };

      if (role === 'Owner') {
        payload.companyName = formData.companyName || 'SmartOps Enterprise Ltd.';
      } else {
        payload.driverId = formData.driverId || `DRV-${Math.floor(Math.random() * 9000) + 1000}`;
        payload.vehicleNumber = formData.vehicleNumber;
        payload.licenseNumber = formData.licenseNumber;
      }

      await register(payload);
      setLoading(false);
      navigate(role === 'Owner' ? '/owner' : '/driver');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4 py-12">
      {/* Brand Icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="h-5.5 w-5.5 text-white" />
        </div>
        <span className="font-extrabold text-xl tracking-wide text-white">
          Smart<span className="text-blue-500">Ops</span>
        </span>
      </motion.div>

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-white">Create Enterprise Account</h2>
          <p className="text-xs text-slate-400 mt-1.5">Join SmartOps Logistics & Manufacturing Control Network.</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Role toggle */}
        <div className="flex items-center justify-center p-1 bg-slate-950 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('Owner')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              role === 'Owner' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Owner Registration
          </button>
          <button
            type="button"
            onClick={() => setRole('Driver')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              role === 'Driver' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Driver Registration
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Workspace Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. john@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Mobile Contact</label>
              <input
                type="text"
                name="mobileNumber"
                required
                placeholder="+91 99999 99999"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
              />
            </div>

            {/* Role specific field */}
            {role === 'Owner' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="e.g. Tata Logistics"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Driving License (DL)</label>
                <input
                  type="text"
                  name="licenseNumber"
                  required
                  placeholder="e.g. DL-MH12-9988"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Driver specific field additions */}
          {role === 'Driver' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Driver ID Code</label>
                <input
                  type="text"
                  name="driverId"
                  placeholder="e.g. DRV-9041"
                  value={formData.driverId}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Vehicle Number Plate</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  required
                  placeholder="e.g. MH-12-QW-9874"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Secure Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white mt-4 text-xs"
          >
            Create Credentials
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-blue-500 hover:underline font-semibold">
            Log In here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
