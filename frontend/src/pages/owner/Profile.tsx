import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Button } from '../../components/ui/Button';
import { soundPlayer } from '../../utils/audio';
import {
  User,
  Mail,
  Phone,
  Building,
  Key,
  Shield,
  Upload,
  Eye,
  EyeOff,
  Edit2,
  CheckCircle,
  Copy
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, triggerNotification, addActivity } = useOperations();
  
  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || 'Harsh Vardhan');
  const [email, setEmail] = useState(user?.email || 'harsh.vardhan@smartops.com');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '9876543210');
  const [companyName, setCompanyName] = useState(user?.companyName || 'SmartOps Logistics Ltd.');
  
  // API credentials keys state
  const [apiKey, setApiKey] = useState('so_live_pk_51NzW2gSFmP3dE...');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sound play
  const playSound = (severity: 'Success' | 'Warning' | 'Error' | 'Info') => {
    const savedSettings = localStorage.getItem('smartops_owner_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : { soundEnabled: true, soundVolume: 0.5 };
    if (settings.soundEnabled) {
      soundPlayer.play(severity, settings.soundVolume);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    playSound('Success');
    triggerNotification('System Alert', 'Profile Synchronized', 'Admin profile attributes refreshed.', 'Info');
    addActivity('Profile Modified', 'Updated contact details and avatar settings', 'task');
    alert('Profile updated successfully!');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    playSound('Info');
    alert('Secure API Access Key copied to clipboard!');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <h2 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-primary dark:text-blue-500" />
          Executive Corporate Profile
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">
          Review credentials, corporate registration bindings, and active API console tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Avatar Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <img
                src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Harsh&backgroundColor=006A6A'}
                alt="Avatar"
                className="w-24 h-24 rounded-full border border-slate-105 dark:border-slate-800 bg-slate-50 p-1"
              />
              <div className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-4">{fullName}</h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-0.5">{user?.role || 'Executive Admin'}</p>
            <span className="mt-3 px-2.5 py-0.5 text-[9px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 rounded-full border border-emerald-100/30">
              Verified Platform Owner
            </span>

            <div className="w-full border-t border-slate-50 dark:border-slate-850 mt-6 pt-5 space-y-3.5 text-xs text-slate-500 dark:text-slate-400 font-semibold text-left">
              <div className="flex justify-between items-center">
                <span>Account Status:</span>
                <span className="text-slate-800 dark:text-slate-200">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Branch Location:</span>
                <span className="text-slate-800 dark:text-slate-200">Pune HQ</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Date Joined:</span>
                <span className="text-slate-800 dark:text-slate-200">2026-03-12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Details Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-50 dark:border-slate-850 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Profile Particulars</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-primary dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="h-3 w-3" /> {isEditing ? 'Cancel Edit' : 'Edit Credentials'}
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Owner Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all disabled:opacity-75"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Admin Registered Email</label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all disabled:opacity-75"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contact Mobile Number</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all disabled:opacity-75"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Registered Corporate entity</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all disabled:opacity-75"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" variant="primary" className="text-xs py-1.5 px-4 bg-primary text-white hover:bg-primary/95 rounded-xl">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Secure API Key panel */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-50 dark:border-slate-850 pb-3 flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">API Credentials Console</h3>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
              Use these live auth keys to bind third-party fleet telemetry webhooks, GPS devices, or ERP software. Keep keys secure.
            </p>

            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950 p-3.5 gap-3.5">
              <Shield className="h-5 w-5 text-slate-400 shrink-0" />
              <div className="flex-1 font-mono text-xs truncate text-slate-600 dark:text-slate-300">
                {showApiKey ? apiKey : '••••••••••••••••••••••••••••••••••••••••'}
              </div>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                title={showApiKey ? 'Hide Token' : 'Reveal Token'}
              >
                {showApiKey ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-slate-400 hover:text-primary cursor-pointer"
                title="Copy Key"
              >
                <Copy className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
