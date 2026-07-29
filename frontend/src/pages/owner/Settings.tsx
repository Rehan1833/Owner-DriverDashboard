<<<<<<< HEAD
﻿import React, { useState, useEffect } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
import { Button } from '../../components/ui/Button';
import { useOperations } from '../../store/OperationsContext';
import { useTheme } from '../../store/ThemeContext';
import { soundPlayer, SoundSeverity } from '../../utils/audio';
import {
  Settings as SettingsIcon,
  Building2,
  Sliders,
  Bell,
  Volume2,
  Shield,
  Eye,
  EyeOff,
  Database,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Play
} from 'lucide-react';

interface OwnerSettingsState {
  companyName: string;
  gstNumber: string;
  address: string;
  branchDetails: string;
  language: string;
  timeZone: string;
  currency: string;
  dateFormat: string;
  defaultDashboard: string;
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  emailNotif: boolean;
  smsNotif: boolean;
  pushNotif: boolean;
  browserNotif: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  alertAttendance: boolean;
  alertInventory: boolean;
  alertFleet: boolean;
  alertLowStock: boolean;
  alertSalary: boolean;
  twoFactorAuth: boolean;
}

const DEFAULT_SETTINGS: OwnerSettingsState = {
<<<<<<< HEAD
  companyName: 'SmartOps Logistics & Manufacturing Ltd.',
=======
  companyName: 'Enterprise Portal',
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  gstNumber: '27AAAAA1111A1Z1',
  address: 'Corporate Park, Sector V, Phase 2, Pune, MH, India',
  branchDetails: 'Pune Yard (HQ), Mumbai Transit Hub, Bangalore Warehouse',
  language: 'English',
  timeZone: 'IST (UTC+05:30)',
  currency: 'INR (?)',
  dateFormat: 'YYYY-MM-DD',
  defaultDashboard: 'Executive Overview',
  tableDensity: 'comfortable',
  emailNotif: true,
  smsNotif: false,
  pushNotif: true,
  browserNotif: true,
  soundEnabled: true,
  soundVolume: 0.5,
  alertAttendance: true,
  alertInventory: true,
  alertFleet: true,
  alertLowStock: true,
  alertSalary: true,
  twoFactorAuth: false
};

export const Settings: React.FC = () => {
  const { user, triggerNotification, addActivity } = useOperations();
  const { theme, toggleTheme } = useTheme();

  // Settings State loaded from localStorage
  const [settings, setSettings] = useState<OwnerSettingsState>(() => {
    const saved = localStorage.getItem('smartops_owner_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState<string>(
    'https://api.dicebear.com/7.x/identicon/svg?seed=SmartOps'
  );

  useEffect(() => {
<<<<<<< HEAD
=======
    if (user?.companyName) {
      setSettings(prev => ({ ...prev, companyName: user.companyName! }));
    }
  }, [user?.companyName]);

  useEffect(() => {
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
    localStorage.setItem('smartops_owner_settings', JSON.stringify(settings));
  }, [settings]);

  // Handle Input Changes
  const handleChange = (key: keyof OwnerSettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Sound play helper (safeguards check)
  const playPreview = (severity: SoundSeverity) => {
    if (settings.soundEnabled) {
      soundPlayer.play(severity, settings.soundVolume);
    } else {
      // Temporarily play anyway if user is previewing, but at requested volume
      soundPlayer.play(severity, settings.soundVolume);
    }
  };

  // Actions
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('smartops_owner_settings', JSON.stringify(settings));
    
    // Play Success sound
    if (settings.soundEnabled) {
      soundPlayer.play('Success', settings.soundVolume);
    }

    triggerNotification(
      'System Alert',
      'Settings Updated',
      'Corporate configuration and preference rules synchronized successfully.',
      'Info'
    );
    addActivity('Settings Configuration', 'Updated global settings and sound preferences', 'task');
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all configurations to default values?')) {
      setSettings(DEFAULT_SETTINGS);
      if (settings.soundEnabled) {
        soundPlayer.play('Info', 0.5);
      }
      triggerNotification(
        'System Alert',
        'Settings Reset',
        'Settings properties reset to system default variables.',
        'Warning'
      );
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (settings.soundEnabled) {
      soundPlayer.play('Success', settings.soundVolume);
    }
    triggerNotification(
      'System Alert',
      'Security Configuration',
      'Owner password credential updated. Sessions active on other devices invalidated.',
      'Info'
    );
    addActivity('Security Change', 'Changed dashboard account password', 'task');
    setCurrentPassword('');
    setNewPassword('');
    alert('Password updated successfully!');
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings, user }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smartops_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (settings.soundEnabled) {
      soundPlayer.play('Success', settings.soundVolume);
    }
    addActivity('Data Export', 'Downloaded settings backup JSON package', 'task');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-fade-in text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-white tracking-tight flex items-center gap-2.5 leading-none">
            <SettingsIcon className="h-7 w-7 text-[#006A6A] dark:text-[#14B8A6] animate-spin-slow" />
            System Control Panel
          </h2>
          <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">
            Configure system endpoints, telemetry thresholds, notification audio curves, and security session layers.
          </p>
        </div>
        <div className="flex gap-2.5 self-stretch sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="text-xs font-semibold py-2 border border-[#E5EEFF] dark:border-[#334155] bg-white hover:bg-[#F8F9FF] rounded-xl"
          >
            <RotateCcw className="h-4 w-4 text-slate-400" /> Reset All
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            variant="primary"
            className="text-xs font-bold py-2 rounded-xl shadow-md shadow-teal-900/10"
          >
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Navigation Tabs (Anchor Links) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-5 sticky top-24 shadow-sm text-left">
            <h3 className="text-xs font-bold text-slate-400 dark:text-[#6D7A79] uppercase tracking-widest mb-4">
              Dashboard Sections
            </h3>
            <nav className="space-y-1">
              {[
                { label: 'Company Information', id: '#company', icon: Building2 },
                { label: 'System Preferences', id: '#preferences', icon: Sliders },
                { label: 'Notification Triggers', id: '#notifications', icon: Bell },
                { label: 'Audio Synthesizer', id: '#audio', icon: Volume2 },
                { label: 'Security & Access', id: '#security', icon: Shield },
                { label: 'Privacy & Backup', id: '#privacy', icon: Database }
              ].map(tab => (
                <a
                  key={tab.id}
                  href={tab.id}
                  className="flex items-center gap-3 px-3.5 py-3 text-xs font-bold text-[#6D7A79] dark:text-[#94A3B8] hover:text-[#006A6A] dark:hover:text-[#14B8A6] rounded-xl hover:bg-[#F8F9FF] dark:hover:bg-slate-800/50 transition-all font-semibold"
                >
                  <tab.icon className="h-4 w-4 text-slate-400" />
                  {tab.label}
                </a>
              ))}
            </nav>
            <div className="border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 mt-6 pt-4 text-center">
              <span className="text-[10px] text-slate-400 font-bold">SmartOps Admin Module • v4.1.2</span>
            </div>
          </div>
        </div>

        {/* Right Settings Form Container */}
        <div className="lg:col-span-2 space-y-8 text-left">
          {/* SECTION 1: COMPANY INFORMATION */}
          <section id="company" className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3.5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#006A6A]/10 text-[#006A6A] dark:text-[#14B8A6]">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white uppercase tracking-wide">Company Information</h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  className="w-16 h-16 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF]/50 dark:bg-[#0F172A] p-2 shadow-sm"
                />
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-[#CBD5E1]">Corporate Brand Logo</h4>
                  <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] mt-0.5 font-medium">Upload a 200x200 PNG or SVG branding asset.</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setLogoPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="mt-2 text-[11px] font-semibold text-[#6D7A79] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-[#545F73] dark:file:text-slate-300 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Company Registered Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={e => handleChange('companyName', e.target.value)}
                    className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">GST Identification Number</label>
                  <input
                    type="text"
                    value={settings.gstNumber}
                    onChange={e => handleChange('gstNumber', e.target.value)}
                    className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Registered Office Address</label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={e => handleChange('address', e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Branch Locations Directory</label>
                <input
                  type="text"
                  value={settings.branchDetails}
                  onChange={e => handleChange('branchDetails', e.target.value)}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: SYSTEM PREFERENCES */}
          <section id="preferences" className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3.5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#006A6A]/10 text-[#006A6A] dark:text-[#14B8A6]">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white uppercase tracking-wide">System Preferences</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Display Theme Mode</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-[#006A6A] text-white border-transparent shadow-sm'
                        : 'border-[#E5EEFF] dark:border-[#334155] text-[#6D7A79] hover:bg-[#F8F9FF]/50 dark:hover:bg-slate-800'
                    }`}
                  >
                    ?? Light
                  </button>
                  <button
                    type="button"
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-950 text-white border-transparent shadow-md'
                        : 'border-[#E5EEFF] dark:border-[#334155] text-[#6D7A79] hover:bg-slate-100'
                    }`}
                  >
                    ?? Dark
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Operational Language</label>
                <select
                  value={settings.language}
                  onChange={e => handleChange('language', e.target.value)}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                >
                  <option>English</option>
                  <option>Hindi (??????)</option>
                  <option>Spanish (Español)</option>
                  <option>German (Deutsch)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Time Zone Region</label>
                <select
                  value={settings.timeZone}
                  onChange={e => handleChange('timeZone', e.target.value)}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                >
                  <option>IST (UTC+05:30)</option>
                  <option>EST (UTC-05:00)</option>
                  <option>GMT (UTC+00:00)</option>
                  <option>PST (UTC-08:00)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Corporate Currency</label>
                <select
                  value={settings.currency}
                  onChange={e => handleChange('currency', e.target.value)}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                >
                  <option>INR (?)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Default Dashboard Console</label>
                <select
                  value={settings.defaultDashboard}
                  onChange={e => handleChange('defaultDashboard', e.target.value)}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                >
                  <option>Executive Overview</option>
                  <option>Fleet Telemetry Desk</option>
                  <option>Warehouse Inventory Logs</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Table Row Density</label>
                <select
                  value={settings.tableDensity}
                  onChange={e => handleChange('tableDensity', e.target.value)}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                >
                  <option value="compact">Compact Row (32px)</option>
                  <option value="comfortable">Comfortable Row (48px)</option>
                  <option value="spacious">Spacious Row (64px)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 3: NOTIFICATIONS ALERT CHANNELS */}
          <section id="notifications" className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3.5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#006A6A]/10 text-[#006A6A] dark:text-[#14B8A6]">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white uppercase tracking-wide">Notification Channels & Telemetry Triggers</h3>
            </div>

            <div className="space-y-5">
              <div>
                <h4 className="text-[13px] font-bold text-slate-700 dark:text-[#CBD5E1] mb-3 text-left">Alert Dispatch Channels</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Email Alerts', desc: 'Sends daily consolidated digests', key: 'emailNotif' },
                    { label: 'SMS Alerts', desc: 'Critical alerts on dispatcher mobile', key: 'smsNotif' },
                    { label: 'Push Console Alerts', desc: 'Realtime socket popup bubbles', key: 'pushNotif' },
                    { label: 'Browser Notifications', desc: 'Native OS background popups', key: 'browserNotif' }
                  ].map(channel => (
                    <label key={channel.key} className="flex items-start gap-3 p-3.5 border border-[#E5EEFF] dark:border-[#334155] rounded-xl cursor-pointer hover:bg-[#F8F9FF]/40 dark:hover:bg-slate-950/20 shadow-sm">
                      <input
                        type="checkbox"
                        checked={(settings as any)[channel.key]}
                        onChange={e => handleChange(channel.key as any, e.target.checked)}
                        className="mt-1 h-4 w-4 text-[#006A6A] focus:ring-[#006A6A] rounded border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF]"
                      />
                      <div className="text-left">
                        <span className="text-sm font-bold text-[#0B1C30] dark:text-[#CBD5E1] block">{channel.label}</span>
                        <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block mt-0.5 font-medium">{channel.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pt-4">
                <h4 className="text-[13px] font-bold text-slate-700 dark:text-[#CBD5E1] mb-3 text-left">Telemetry Notification Rules</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Attendance Alerts', desc: 'Trigger if staff checks in Late, on breaks or leaves early', key: 'alertAttendance' },
                    { label: 'Inventory Movements', desc: 'Notify on raw/finished storage receipts', key: 'alertInventory' },
                    { label: 'Fleet Telemetry Events', desc: 'Alert on speed limits breach, delay, or trip start/stop', key: 'alertFleet' },
                    { label: 'Low Stock Safety Alerts', desc: 'Emergency warnings when item count drops below safety threshold', key: 'alertLowStock' },
                    { label: 'Salary Disbursement Logs', desc: 'Notify when monthly salaries are calculated and paid', key: 'alertSalary' }
                  ].map(rule => (
                    <div key={rule.key} className="flex justify-between items-center text-left py-2 border-b border-[rgba(11,28,48,0.04)] last:border-0">
                      <div>
                        <span className="font-bold block text-[#0B1C30] dark:text-[#F8FAFC] text-sm leading-tight">{rule.label}</span>
                        <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block mt-0.5 font-medium">{rule.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={(settings as any)[rule.key]}
                        onChange={e => handleChange(rule.key as any, e.target.checked)}
                        className="h-4 w-4 text-[#006A6A] border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] rounded focus:ring-[#006A6A]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: AUDIO SYNTHESIZER CONTROL */}
          <section id="audio" className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3.5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#006A6A]/10 text-[#006A6A] dark:text-[#14B8A6]">
                <Volume2 className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white uppercase tracking-wide">Audio Synthesizer Preferences</h3>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center text-xs">
                <div className="text-left">
                  <span className="font-bold block text-[#0B1C30] dark:text-[#F8FAFC] text-sm">Notification Beeps Sound</span>
                  <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block mt-0.5 font-medium">Trigger real-time synthesized chime tones on telemetry incidents.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={e => handleChange('soundEnabled', e.target.checked)}
                  className="h-4 w-4 text-[#006A6A] rounded border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:ring-[#006A6A]"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-semibold text-[#6D7A79] dark:text-[#94A3B8]">
                  <span>Chime Amplitude (Volume)</span>
                  <span className="text-[#0B1C30] dark:text-[#CBD5E1] font-bold">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={e => handleChange('soundVolume', parseFloat(e.target.value))}
                  disabled={!settings.soundEnabled}
                  className="w-full accent-[#006A6A] bg-[#F8F9FF] dark:bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pt-4">
                <h4 className="text-[13px] font-bold text-slate-700 dark:text-[#CBD5E1] mb-3 text-left">Synthesizer Profile Preview</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Success Ping', severity: 'Success', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20' },
                    { label: 'Warning Tone', severity: 'Warning', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20' },
                    { label: 'Error Buzz', severity: 'Error', color: 'bg-red-500/10 text-red-650 border-red-500/20 hover:bg-red-500/20' },
                    { label: 'Info Ping', severity: 'Info', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20' }
                  ].map(btn => (
                    <button
                      key={btn.severity}
                      type="button"
                      onClick={() => playPreview(btn.severity as SoundSeverity)}
                      className={`py-2 px-3 border rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer hover:-translate-y-0.5 shadow-sm ${btn.color}`}
                    >
                      <Play className="h-3 w-3 fill-current" />
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: SECURITY & SESSIONS */}
          <section id="security" className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3.5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#006A6A]/10 text-[#006A6A] dark:text-[#14B8A6]">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white uppercase tracking-wide">Security & API Access</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h4 className="text-[13px] font-bold text-[#0B1C30] dark:text-[#CBD5E1] text-left mb-3">Change Admin Password</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left relative">
                  <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Current Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5 text-left relative">
                  <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">New Secure Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-xs font-bold text-slate-400 hover:text-[#545F73] flex items-center gap-1.5 cursor-pointer p-1"
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPasswords ? 'Hide Password Text' : 'Show Password Text'}
                </button>
                <Button type="submit" variant="outline" className="text-xs border border-[#006A6A] text-[#006A6A] bg-white hover:bg-[#F8F9FF] font-bold rounded-xl px-4 py-2">
                  Update Password
                </Button>
              </div>
            </form>

            <div className="border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pt-4 space-y-5">
              <div className="flex justify-between items-center text-xs">
                <div className="text-left">
                  <span className="font-bold block text-[#0B1C30] dark:text-[#F8FAFC] text-sm">Two-Factor Authentication (2FA)</span>
                  <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block mt-0.5 font-medium">Require temporary OTP tokens in addition to credentials.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={e => handleChange('twoFactorAuth', e.target.checked)}
                  className="h-4 w-4 text-[#006A6A] rounded border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:ring-[#006A6A]"
                />
              </div>

              <div>
                <h4 className="text-[13px] font-bold text-[#0B1C30] dark:text-[#CBD5E1] mb-3 text-left">Connected Devices & Active Sessions</h4>
                <div className="space-y-2.5">
                  {[
                    { dev: 'Google Chrome (Vite Dev)', location: 'Pune, India (Current Session)', time: 'Active Now', status: 'Online' },
                    { dev: 'Mozilla Firefox (Windows)', location: 'Mumbai, India', time: '2 hours ago', status: 'Inactive' }
                  ].map((session, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3.5 border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] dark:bg-slate-905 rounded-xl text-xs shadow-sm">
                      <div className="text-left">
                        <span className="font-bold text-slate-800 dark:text-[#F8FAFC] block">{session.dev}</span>
                        <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block mt-0.5 font-medium">{session.location} • {session.time}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full tracking-wide uppercase ${session.status === 'Online' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/15' : 'bg-slate-100 text-[#6D7A79] dark:bg-slate-800'}`}>
                        {session.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: PRIVACY & BACKUPS */}
          <section id="privacy" className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3.5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#006A6A]/10 text-[#006A6A] dark:text-[#14B8A6]">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white uppercase tracking-wide">Privacy Controls & Database Backups</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#F8F9FF] dark:bg-[#0F172A]/40 border border-[#E5EEFF]/80 dark:border-[#334155]/60 rounded-xl gap-4 shadow-sm">
                <div className="text-left">
                  <span className="font-bold block text-[#0B1C30] dark:text-[#F8FAFC] text-sm">Local Telemetry Snapshot Backup</span>
                  <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block mt-0.5 font-medium">Export settings configuration, cached vehicles, and warehouse data in JSON.</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackup}
                  className="text-xs font-bold py-2 border border-[#E5EEFF] dark:border-[#334155] bg-white hover:bg-slate-100 rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                >
                  <Database className="h-4 w-4 text-slate-400" /> Download JSON Backup
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-red-500/5 border border-red-500/10 rounded-xl gap-4 shadow-sm">
                <div className="text-left">
                  <span className="font-bold block text-red-650 dark:text-red-400 text-sm">Close Administrator Account</span>
                  <span className="text-[11px] text-slate-400 dark:text-[#6D7A79] block mt-0.5 font-medium">Completely delete settings, invalidate keys, and wipe data from clusters. This is irreversible.</span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (window.confirm('WARNING: THIS IS IRREVERSIBLE. Are you sure you want to completely erase the corporate profile database?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  variant="danger"
                  className="text-xs font-bold py-2 rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-red-900/10"
                >
                  <Trash2 className="h-4 w-4" /> Erase Platform Data
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


