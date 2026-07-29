<<<<<<< HEAD
﻿import React, { useState } from 'react';
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
    <div className="min-h-screen bg-[#0B1C30] flex flex-col items-center justify-center p-4 relative overflow-hidden text-left">
      {/* Background blobs for premium glassmorphic depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#006A6A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Platform Title */}
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
              <h2 className="text-xl font-bold text-white tracking-tight">Recover Password</h2>
              <p className="text-[13px] text-slate-400 mt-1.5 font-medium">Enter your email and we'll dispatch a link to reset your security credentials.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-5 py-4">
            <div className="flex justify-center">
              <CheckCircle className="h-14 w-14 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recovery Dispatched</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              A password reset token link has been generated and mock dispatched to <span className="text-slate-250 font-bold">{email}</span>. Please inspect your inbox.
            </p>
            <Link to="/reset-password" className="block pt-2">
              <Button className="w-full h-12 rounded-xl font-bold bg-[#006A6A] hover:bg-[#008B8B] text-white text-xs border-0 shadow-lg shadow-teal-900/20">
                Go to Reset Form
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


=======
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Activity,
  Truck,
  Package,
  HelpCircle,
  KeyRound
} from 'lucide-react';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import axios from 'axios';

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
  shadowSm:       '0 1px 3px 0 rgba(11,28,48,0.03), 0 1px 2px -1px rgba(11,28,48,0.02)',
  shadowMd:       '0 4px 12px -2px rgba(11,28,48,0.05), 0 2px 6px -2px rgba(11,28,48,0.03)',
  shadowCard:     '0 1px 3px 0 rgba(11,28,48,0.03), 0 4px 12px -4px rgba(11,28,48,0.04)',
  radius:         '18px',
  radiusInput:    '12px',
  radiusBtn:      '12px',
};

// ── Features ─────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Activity, label: 'Identity Protection & Audit' },
  { Icon: KeyRound, label: 'Security Question Password Recovery' },
  { Icon: ShieldCheck, label: 'Encrypted Account Reset' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');

  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState("What is your best friend's name?");
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRequestQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/security-question`, { email });
      setLoading(false);
      if (res.data.securityQuestion) {
        setSecurityQuestion(res.data.securityQuestion);
      }
      setSuccessMsg('Security verification prompt initialized. Please answer your secret question.');
      setStep('reset');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Account not found. Please verify your email address.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!securityAnswer || securityAnswer.trim() === '') {
      setErrorMsg('Please enter your secret security answer.');
      return;
    }

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
      await axios.post(`${API_URL}/auth/reset-password-security`, {
        email,
        securityAnswer,
        newPassword
      });
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Incorrect security answer or reset error.');
    }
  };

  const handleGoogleSuccess = (res: any) => {
    if (res.user) {
      navigate(res.user.role === 'Driver' ? '/driver' : '/owner');
    }
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
      {/* Background patterns */}
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

        {/* LEFT PANEL */}
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
          <div style={{ width: '100%' }}>
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

            <h1 style={{
              fontSize: 38,
              fontWeight: 900,
              color: DS.textPrimary,
              lineHeight: 1.15,
              margin: '0 0 16px 0',
              letterSpacing: '-0.03em',
            }}>
              Recover Your <br />
              <span style={{
                background: 'linear-gradient(135deg, #006A6A 0%, #00A3A3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Account Instantly.
              </span>
            </h1>

            <p style={{
              fontSize: 15,
              fontWeight: 500,
              color: DS.textSecondary,
              lineHeight: 1.6,
              margin: '0 0 40px 0',
              maxWidth: 440,
            }}>
              Security question validation protects your SmartOps account and enables fast, safe password resets.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {FEATURES.map(({ Icon, label }, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: DS.surfaceLow,
                    border: `1px solid ${DS.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: DS.primary, flexShrink: 0,
                  }}>
                    <Icon size={16} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: DS.textPrimary }}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Separator line */}
        <div className="login-divider" style={{
          width: 1,
          height: 410,
          background: DS.border,
          flexShrink: 0,
          opacity: 0.8,
        }} />

        {/* RIGHT PANEL — FORGOT PASSWORD CARD */}
        <div style={{
          flex: '1 1 450px',
          maxWidth: 450,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
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
            {/* STEP 1: ENTER EMAIL TO LOAD QUESTION */}
            {step === 'request' && (
              <>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: DS.textPrimary,
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}>
                    Forgot Password?
                  </h2>
                  <p style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: DS.textMuted,
                    margin: '6px 0 0 0',
                    lineHeight: 1.5,
                  }}>
                    Enter your registered email address to verify your secret security question.
                  </p>
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 14px',
                      borderRadius: DS.radiusInput,
                      background: DS.dangerBg,
                      border: `1px solid ${DS.dangerBorder}`,
                      color: DS.danger,
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 20,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <form onSubmit={handleRequestQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={labelStyle}>Workspace Email</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        required
                        placeholder="rehanchaudhari181133@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ ...inputBase, paddingLeft: 42 }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                      <Mail
                        size={17}
                        color={DS.textMuted}
                        style={{ position: 'absolute', left: 14, top: 15, pointerEvents: 'none' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      height: 48,
                      width: '100%',
                      borderRadius: DS.radiusBtn,
                      background: DS.primaryGrad,
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: `0 4px 12px -2px ${DS.primaryShadow}`,
                      transition: 'transform 150ms ease, opacity 150ms ease',
                      opacity: loading ? 0.8 : 1,
                      marginTop: 6
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Verifying Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Security Question</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div style={{ marginTop: 28, textAlign: 'center' }}>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: DS.primary,
                      textDecoration: 'none',
                    }}
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </>
            )}

            {/* STEP 2: ANSWER SECURITY QUESTION & SET NEW PASSWORD */}
            {step === 'reset' && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: DS.textPrimary,
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}>
                    Security Verification
                  </h2>
                  <p style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: DS.textMuted,
                    margin: '6px 0 0 0',
                    lineHeight: 1.5,
                  }}>
                    Answer your secret security question to verify your identity for <strong style={{ color: DS.textPrimary }}>{email}</strong>.
                  </p>
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 14px',
                      borderRadius: DS.radiusInput,
                      background: DS.dangerBg,
                      border: `1px solid ${DS.dangerBorder}`,
                      color: DS.danger,
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 20,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Security Question</label>
                    <div style={{
                      padding: '12px 14px',
                      background: DS.surfaceLow,
                      border: `1px solid ${DS.border}`,
                      borderRadius: DS.radiusInput,
                      fontSize: 13,
                      fontWeight: 700,
                      color: DS.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <HelpCircle size={16} />
                      <span>{securityQuestion}</span>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Secret Answer</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter secret answer (e.g. Rahul)"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ ...inputBase, paddingRight: 42 }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        style={{
                          position: 'absolute', right: 12, top: 14,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: DS.textMuted, padding: 2
                        }}
                      >
                        {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
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
                        style={{ ...inputBase, paddingRight: 42 }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        style={{
                          position: 'absolute', right: 12, top: 14,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: DS.textMuted, padding: 2
                        }}
                      >
                        {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      height: 48,
                      width: '100%',
                      borderRadius: DS.radiusBtn,
                      background: DS.primaryGrad,
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: `0 4px 12px -2px ${DS.primaryShadow}`,
                      transition: 'transform 150ms ease, opacity 150ms ease',
                      opacity: loading ? 0.8 : 1,
                      marginTop: 8
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, color: DS.textMuted
                    }}
                  >
                    Change Email Address
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION */}
            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px auto', color: '#10B981'
                }}>
                  <CheckCircle size={32} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: DS.textPrimary, margin: 0 }}>
                  Password Reset Successful!
                </h2>
                <p style={{ fontSize: 13, color: DS.textMuted, margin: '8px 0 24px 0', lineHeight: 1.5 }}>
                  Your account password has been updated securely. Redirecting you to sign in...
                </p>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: DS.radiusBtn,
                    background: DS.primaryGrad, color: '#fff',
                    fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    boxShadow: `0 4px 12px ${DS.primaryShadow}`
                  }}
                >
                  <span>Go to Login</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

          </motion.div>
        </div>

      </div>
    </div>
  );
};
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
