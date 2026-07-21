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
    <div className="min-h-screen bg-[#0B1C30] flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden text-left">
      {/* Background blobs for premium glassmorphic depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#006A6A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6 relative z-10"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006A6A] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-teal-500/20 border border-white/10">
          <ShieldCheck className="h-6.5 w-6.5 text-white" />
        </div>
        <span className="font-extrabold text-[26px] tracking-tight text-white leading-none">
          Smart<span className="text-[#14B8A6]">Ops</span>
        </span>
      </motion.div>

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Create Enterprise Account</h2>
          <p className="text-[13px] text-slate-400 mt-1.5 font-medium">Join SmartOps Logistics & Manufacturing Control Network.</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Role toggle */}
        <div className="flex items-center justify-center p-1 bg-slate-950 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => setRole('Owner')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              role === 'Owner' ? 'bg-[#006A6A] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Owner Registration
          </button>
          <button
            type="button"
            onClick={() => setRole('Driver')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              role === 'Driver' ? 'bg-[#006A6A] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Driver Registration
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Workspace Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. john@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Mobile Contact</label>
              <input
                type="text"
                name="mobileNumber"
                required
                placeholder="+91 99999 99999"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
              />
            </div>

            {/* Role specific field */}
            {role === 'Owner' ? (
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="e.g. Tata Logistics"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Driving License (DL)</label>
                <input
                  type="text"
                  name="licenseNumber"
                  required
                  placeholder="e.g. DL-MH12-9988"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
                />
              </div>
            )}
          </div>

          {/* Driver specific field additions */}
          {role === 'Driver' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Driver ID Code</label>
                <input
                  type="text"
                  name="driverId"
                  placeholder="e.g. DRV-9041"
                  value={formData.driverId}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Vehicle Number Plate</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  required
                  placeholder="e.g. MH-12-QW-9874"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
                />
              </div>
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Secure Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-300 block uppercase tracking-wide">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#006A6A]/50 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full h-12 rounded-xl font-bold bg-[#006A6A] hover:bg-[#008B8B] text-white mt-4 text-xs shadow-lg shadow-teal-900/20 border-0"
          >
            Create Credentials
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400 font-semibold">
          Already registered?{' '}
          <Link to="/login" className="text-[#14B8A6] hover:underline font-bold">
            Log In here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

