<<<<<<< HEAD
﻿import React, { useState } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
import { useNavigate, Link } from 'react-router-dom';
import { useOperations } from '../../store/OperationsContext';
import { UserRole } from '../../types';
import { motion } from 'framer-motion';
<<<<<<< HEAD
import { ShieldCheck, Truck, ShieldAlert, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';

=======
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Truck,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  Activity,
  Package,
} from 'lucide-react';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

// ── Design tokens — exact values from SmartOps dashboard design system ────────
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
  // Exact shadow from theme.css
  shadowSm:       '0 1px 3px 0 rgba(11,28,48,0.03), 0 1px 2px -1px rgba(11,28,48,0.02)',
  shadowMd:       '0 4px 12px -2px rgba(11,28,48,0.05), 0 2px 6px -2px rgba(11,28,48,0.03)',
  shadowCard:     '0 1px 3px 0 rgba(11,28,48,0.03), 0 4px 12px -4px rgba(11,28,48,0.04)',
  radius:         '18px',   // --radius-2xl from theme
  radiusInput:    '12px',   // --radius-lg from theme
  radiusBtn:      '12px',
};

// ── Portal options ─────────────────────────────────────────────────────────────
const PORTALS: { role: UserRole; label: string; Icon: React.FC<{ size?: number; strokeWidth?: number }> }[] = [
  { role: 'Owner',  label: 'Owner',  Icon: KeyRound },
  { role: 'Driver', label: 'Driver', Icon: Truck },
];

// ── Features (3 bullets only) ─────────────────────────────────────────────────
const FEATURES = [
  { Icon: Activity, label: 'Production Monitoring' },
  { Icon: Truck,    label: 'Fleet & Driver Management' },
  { Icon: Package,  label: 'Inventory Tracking' },
];

// ─────────────────────────────────────────────────────────────────────────────
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
export const Login: React.FC = () => {
  const { login, user } = useOperations();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Owner');
<<<<<<< HEAD
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
=======
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPwd,      setShowPwd]      = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');

  // Unchanged auth logic ──────────────────────────────────────────────────────
  React.useEffect(() => {
    if (user) navigate(user.role === 'Driver' ? '/driver' : '/owner');
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  }, [user, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
<<<<<<< HEAD
    if (role === 'Owner') {
      setEmail('harsh.v@smartops.com');
    } else {
      setEmail('rajesh.k@smartops.com');
    }
=======
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
<<<<<<< HEAD
      await login(email, selectedRole);
      setLoading(false);
      if (selectedRole === 'Driver') {
        navigate('/driver');
      } else {
        navigate('/owner');
      }
=======
      await login(email, selectedRole, password);
      setLoading(false);
      navigate(selectedRole === 'Driver' ? '/driver' : '/owner');
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Login failed. Verify your credentials.');
    }
  };

<<<<<<< HEAD
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


=======
  const handleGoogleSuccess = (res: any) => {
    if (res.user) {
      navigate(res.user.role === 'Driver' ? '/driver' : '/owner');
    }
  };

  const handleGoogleError = (error: string) => {
    setErrorMsg(error);
  };

  // Input style helpers ───────────────────────────────────────────────────────
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
    fontFamily: 'inherit',
    boxShadow: '0 1px 2px 0 rgba(11,28,48,0.02)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = DS.primary;
    e.currentTarget.style.boxShadow   = `0 0 0 3px ${DS.primaryFocus}, 0 1px 2px 0 rgba(11,28,48,0.02)`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = DS.border;
    e.currentTarget.style.boxShadow   = '0 1px 2px 0 rgba(11,28,48,0.02)';
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

  // ── Render ─────────────────────────────────────────────────────────────────
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
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>

      {/* Dot-grid — background ambient texture ──────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, ${DS.border} 1.2px, transparent 1.2px)`,
        backgroundSize: '24px 24px',
        opacity: 0.7,
      }} />

      {/* Very subtle ambient glows ──────────────────────────── */}
      <div style={{
        position: 'absolute', top: -100, left: -60, pointerEvents: 'none',
        width: 450, height: 450, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(0,106,106,0.07) 0%, transparent 70%)`,
      }} />
      <div style={{
        position: 'absolute', bottom: -60, right: -40, pointerEvents: 'none',
        width: 380, height: 380, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(0,163,163,0.06) 0%, transparent 70%)`,
      }} />

      {/* ══════════════════════════════════════════════
          PRO-UI CENTERED SPLIT CONTAINER (1100px MAX)
      ══════════════════════════════════════════════ */}
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

        {/* LEFT PANEL — BRANDING & VALUE PROP ──────── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="login-left-panel"
          style={{
            flex: '1 1 500px',
            maxWidth: 500,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Content ─────────────────────────────────── */}
          <div style={{ width: '100%' }}>

            {/* Logo — matches dashboard sidebar logo exactly */}
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
                <div style={{
                  fontSize: 20, fontWeight: 900, color: DS.textPrimary,
                  lineHeight: 1, letterSpacing: '-0.4px',
                }}>
                  Smart<span style={{ color: DS.primary }}>Ops</span>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: DS.textMuted,
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2,
                }}>
                  Manufacturing ERP Suite
                </div>
              </div>
            </div>

            {/* Headline — h1 from design system */}
            <h1 style={{
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.16,
              letterSpacing: '-0.03em',
              color: DS.textPrimary,
              margin: 0,
            }}>
              Run your manufacturing business on one{' '}
              <span style={{ color: DS.primary }}>intelligent</span> platform.
            </h1>

            {/* Tagline */}
            <div style={{
              marginTop: 18,
              display: 'flex', alignItems: 'baseline', gap: 10,
              fontSize: 16, fontWeight: 700, letterSpacing: '-0.2px',
            }}>
              <span style={{ color: DS.textPrimary }}>Manage.</span>
              <span style={{ color: DS.textMuted }}>Monitor.</span>
              <span style={{
                background: DS.primaryGrad,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Maximize.</span>
            </div>

            {/* 3 feature bullets */}
            <ul style={{
              listStyle: 'none', margin: '28px 0 0', padding: 0,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {FEATURES.map(({ Icon, label }) => (
                <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(0,106,106,0.08)',
                    border: `1px solid rgba(0,106,106,0.12)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={13} color={DS.primary} strokeWidth={2.2} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: DS.textSecondary }}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Right-panel separator line ───────────────── */}
        <div className="login-divider" style={{
          width: 1,
          height: 410,
          background: DS.border,
          flexShrink: 0,
          opacity: 0.8,
        }} />

        {/* RIGHT PANEL — LOGIN CARD ──────────────────── */}
        <div style={{
          flex: '1 1 450px',
          maxWidth: 450,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
            style={{ width: '100%', maxWidth: 440 }}
          >

          {/* Mobile-only logo */}
          <div className="login-mobile-logo" style={{
            display: 'none', alignItems: 'center', gap: 8,
            marginBottom: 24, justifyContent: 'center',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: DS.primaryGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={15} color="#fff" strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 900, color: DS.textPrimary }}>
              Smart<span style={{ color: DS.primary }}>Ops</span>
            </span>
          </div>

          {/* ── Card — identical style to dashboard cards ───────────── */}
          <div style={{
            background: DS.card,
            borderRadius: DS.radius,
            border: `1px solid ${DS.border}`,
            boxShadow: DS.shadowCard,
            padding: 32,
          }}>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: DS.textPrimary,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                margin: 0,
              }}>
                Welcome Back
              </h2>
              <p style={{
                fontSize: 14,
                fontWeight: 500,
                color: DS.textSecondary,
                margin: '5px 0 0',
                lineHeight: 1.5,
              }}>
                Sign in to your SmartOps workspace.
              </p>
            </div>

            {/* Error message — matches dashboard danger pattern */}
            {errorMsg && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '10px 12px', marginBottom: 20,
                background: DS.dangerBg,
                border: `1px solid ${DS.dangerBorder}`,
                borderRadius: DS.radiusInput,
                color: DS.danger,
                fontSize: 13, fontWeight: 500,
              }}>
                <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Email ─────────────────────────────────────────────────── */}
              <div>
                <label htmlFor="login-email" style={labelStyle}>Email</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rehanchaudhari181133@gmail.com"
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              {/* Password ─────────────────────────────────────────────── */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontSize: 12, fontWeight: 600, color: DS.primary,
                      textDecoration: 'none', letterSpacing: '0.01em',
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ ...inputBase, paddingRight: 44 }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button
                    type="button"
                    id="toggle-password-visibility"
                    tabIndex={-1}
                    onClick={() => setShowPwd(v => !v)}
                    style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, color: DS.textMuted,
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me ─────────────────────────────────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label
                  htmlFor="remember-me"
                  style={{ fontSize: 13, fontWeight: 500, color: DS.textSecondary, cursor: 'pointer' }}
                >
                  Keep me signed in
                </label>
              </div>

              {/* Portal selector — segmented tabs matching dashboard tab style */}
              <div>
                <label style={labelStyle}>Portal</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  background: DS.surfaceLow,
                  borderRadius: DS.radiusInput,
                  border: `1px solid ${DS.border}`,
                  padding: 3,
                  gap: 2,
                  height: 48,
                }}>
                  {PORTALS.map(({ role, label, Icon }) => {
                    const active = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        id={`portal-${role.toLowerCase()}`}
                        onClick={() => handleRoleSelect(role)}
                        style={{
                          borderRadius: 9,
                          border: active ? `1px solid ${DS.border}` : 'none',
                          cursor: 'pointer',
                          background: active ? DS.card : 'transparent',
                          color: active ? DS.primary : DS.textMuted,
                          fontWeight: active ? 700 : 500,
                          fontSize: 13,
                          fontFamily: 'inherit',
                          boxShadow: active ? DS.shadowSm : 'none',
                          transition: 'all 200ms ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        }}
                      >
                        <Icon size={13} strokeWidth={2.1} />
                        {label}
                      </button>
                    );
                  })}
                  {/* Manager — greyed out, coming soon */}
                  <button
                    type="button"
                    id="portal-manager"
                    disabled
                    style={{
                      borderRadius: 9, border: 'none', cursor: 'not-allowed',
                      background: 'transparent',
                      color: DS.textDisabled,
                      fontWeight: 500, fontSize: 13, fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    Manager
                  </button>
                </div>
              </div>

              {/* Sign In — exact dashboard primary button style ─────── */}
              <motion.button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                whileHover={!loading ? { y: -2, boxShadow: `0 6px 20px 0 rgba(0,106,106,0.25)` } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', height: 48,
                  borderRadius: DS.radiusBtn,
                  border: 'none',
                  background: loading ? 'rgba(0,106,106,0.5)' : DS.primaryGrad,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: `0 2px 8px 0 ${DS.primaryShadow}`,
                  transition: 'opacity 200ms ease',
                  marginTop: 4,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'so-spin 1s linear infinite' }} />
                    Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRight size={14} /></>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              margin: '20px 0 16px',
            }}>
              <div style={{ flex: 1, height: 1, background: DS.border }} />
              <span style={{ fontSize: 12, color: DS.textDisabled }}>or</span>
              <div style={{ flex: 1, height: 1, background: DS.border }} />
            </div>

            {/* Google OAuth Button */}
            <div style={{ marginBottom: 20 }}>
              <GoogleAuthButton
                role={selectedRole}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>

            {/* Create account */}
            <p style={{
              textAlign: 'center', margin: 0,
              fontSize: 13, fontWeight: 500, color: DS.textSecondary,
            }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                id="create-account-link"
                style={{ color: DS.primary, fontWeight: 600, textDecoration: 'none' }}
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Below-card version note — matches dashboard footer style */}
          <p style={{
            textAlign: 'center', marginTop: 16,
            fontSize: 12, fontWeight: 500, color: DS.textDisabled,
          }}>
            SmartOps ERP · Enterprise Platform
          </p>

        </motion.div>
      </div>
    </div>

      {/* ── Global animation + responsive ─────────────────────────────────── */}
      <style>{`
        @keyframes so-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .login-left-panel  { display: none !important; }
          .login-divider     { display: none !important; }
          .login-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
};
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
