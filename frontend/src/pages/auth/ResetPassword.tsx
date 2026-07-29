<<<<<<< HEAD
﻿import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
=======
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';

const DS = {
  bg:             '#F8F9FF',
  card:           '#FFFFFF',
  border:         '#E5EEFF',
  primary:        '#006A6A',
  primaryGrad:    'linear-gradient(135deg, #006A6A 0%, #00A3A3 100%)',
  primaryShadow:  'rgba(0, 106, 106, 0.15)',
  primaryFocus:   'rgba(0, 106, 106, 0.12)',
  surfaceLow:     '#EFF4FF',
  textPrimary:    '#0B1C30',
  textSecondary:  '#545F73',
  textMuted:      '#6D7A79',
  textDisabled:   '#BCC9C8',
  danger:         '#BA1A1A',
  dangerBg:       'rgba(186, 26, 26, 0.08)',
  dangerBorder:   'rgba(186, 26, 26, 0.15)',
  shadowCard:     '0 1px 3px 0 rgba(11,28,48,0.03), 0 4px 12px -4px rgba(11,28,48,0.04)',
  radius:         '18px',
  radiusInput:    '12px',
  radiusBtn:      '12px',
};

const FEATURES = [
  { Icon: Activity, label: 'Identity Protection & Audit' },
  { Icon: KeyRound, label: 'Gmail & Mobile 2FA Verification' },
  { Icon: ShieldCheck, label: 'Encrypted Password Reset' },
];
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
<<<<<<< HEAD
=======
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
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
<<<<<<< HEAD
=======
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
<<<<<<< HEAD
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


=======
      setTimeout(() => navigate('/login'), 2000);
    }, 1000);
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    height: 48,
    borderRadius: DS.radiusInput,
    border: `1px solid ${DS.border}`,
    background: DS.card,
    color: DS.textPrimary,
    padding: '0 16px',
    fontSize: 14,
    fontWeight: 500,
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: DS.textSecondary,
    marginBottom: 6,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: DS.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      {/* Background Dot Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, ${DS.border} 1.2px, transparent 1.2px)`,
        backgroundSize: '24px 24px',
        opacity: 0.7,
      }} />

      <div style={{
        maxWidth: 1100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 56,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* LEFT BRANDING PANEL */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="login-left-panel"
          style={{ flex: '1 1 500px', maxWidth: 500 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: DS.primaryGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 8px 0 ${DS.primaryShadow}`,
            }}>
              <ShieldCheck size={18} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: DS.textPrimary }}>
                Smart<span style={{ color: DS.primary }}>Ops</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: DS.textMuted, textTransform: 'uppercase' }}>
                Manufacturing ERP Suite
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 800, color: DS.textPrimary, lineHeight: 1.16 }}>
            Set a <span style={{ color: DS.primary }}>new password</span> for your account.
          </h1>

          <ul style={{ listStyle: 'none', margin: '28px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map(({ Icon, label }) => (
              <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(0,106,106,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={13} color={DS.primary} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: DS.textSecondary }}>{label}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Separator */}
        <div className="login-divider" style={{ width: 1, height: 410, background: DS.border, opacity: 0.8 }} />

        {/* RIGHT CARD */}
        <div style={{ flex: '1 1 450px', maxWidth: 450 }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              width: '100%',
              background: DS.card,
              border: `1px solid ${DS.border}`,
              borderRadius: DS.radius,
              padding: '36px 32px',
              boxShadow: DS.shadowCard,
              boxSizing: 'border-box',
              textAlign: 'left'
            }}
          >
            {!success ? (
              <>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: DS.textPrimary, margin: 0 }}>
                    Reset Account Password
                  </h2>
                  <p style={{ fontSize: 13, color: DS.textMuted, margin: '6px 0 0 0' }}>
                    Choose a strong, secure passphrase for your SmartOps workspace.
                  </p>
                </div>

                {errorMsg && (
                  <div style={{
                    padding: '12px 14px', borderRadius: DS.radiusInput,
                    background: DS.dangerBg, border: `1px solid ${DS.dangerBorder}`,
                    color: DS.danger, fontSize: 13, fontWeight: 600, marginBottom: 20
                  }}>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ ...inputBase, paddingLeft: 42, paddingRight: 42 }}
                      />
                      <Lock size={17} color={DS.textMuted} style={{ position: 'absolute', left: 14, top: 15 }} />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        style={{ position: 'absolute', right: 12, top: 14, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showPwd ? <EyeOff size={18} color={DS.textMuted} /> : <Eye size={18} color={DS.textMuted} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ ...inputBase, paddingLeft: 42, paddingRight: 42 }}
                      />
                      <Lock size={17} color={DS.textMuted} style={{ position: 'absolute', left: 14, top: 15 }} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        style={{ position: 'absolute', right: 12, top: 14, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showConfirmPwd ? <EyeOff size={18} color={DS.textMuted} /> : <Eye size={18} color={DS.textMuted} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      height: 48, borderRadius: DS.radiusBtn, background: DS.primaryGrad,
                      color: '#FFF', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8
                    }}
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Update Password</span>}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle size={36} color="#10B981" style={{ margin: '0 auto 16px auto' }} />
                <h3 style={{ fontSize: 20, fontWeight: 800, color: DS.textPrimary, margin: 0 }}>Password Restored!</h3>
                <p style={{ fontSize: 13, color: DS.textMuted, margin: '8px 0 20px 0' }}>
                  Your password has been updated. Redirecting to sign in...
                </p>
              </div>
            )}

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: DS.primary, textDecoration: 'none' }}>
                <ArrowLeft size={14} style={{ display: 'inline', marginRight: 4 }} />
                Back to Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
