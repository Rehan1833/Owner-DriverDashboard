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
  const [fullName, setFullName] = useState(user?.fullName || 'Rehan Chaudhari');
  const [email, setEmail] = useState(user?.email || 'rehanchaudhari181133@gmail.com');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [companyName, setCompanyName] = useState(user?.companyName || (user?.fullName ? `${user.fullName}'s Enterprise` : 'Enterprise Portal'));
  
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
    <div className="space-y-8 max-w-4xl mx-auto pb-16 text-left animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-5">
        <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-white tracking-tight flex items-center gap-2.5 leading-none">
          <User className="h-7 w-7 text-[#006A6A] dark:text-[#14B8A6]" />
          Executive Corporate Profile
        </h2>
        <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">
          Review credentials, corporate registration bindings, and active API console tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Avatar Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm text-center flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <img
                src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}&backgroundColor=006A6A`}
                alt="Avatar"
                className="w-24 h-24 rounded-full border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] p-1 shadow-sm"
              />
              <div className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white mt-4">{fullName}</h3>
            <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] font-bold uppercase mt-1 tracking-wider">{user?.role || 'Executive Admin'}</p>
            <span className="mt-4 px-3 py-1 rounded-full text-xs font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/15">
              Verified Platform Owner
            </span>

            <div className="w-full border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 mt-6 pt-5 space-y-3.5 text-xs text-[#6D7A79] dark:text-[#94A3B8] font-semibold text-left">
              <div className="flex justify-between items-center">
                <span>Account Status:</span>
                <span className="text-[#0B1C30] dark:text-[#F8FAFC]">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Branch Location:</span>
                <span className="text-[#0B1C30] dark:text-[#F8FAFC]">Pune HQ</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Date Joined:</span>
                <span className="text-[#0B1C30] dark:text-[#F8FAFC]">2026-03-12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Details Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[#006A6A] dark:text-[#14B8A6]" />
                <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white">Profile Particulars</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-[#006A6A] dark:text-[#14B8A6] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="h-3 w-3" /> {isEditing ? 'Cancel Edit' : 'Edit Credentials'}
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Owner Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium disabled:opacity-65"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Admin Registered Email</label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium disabled:opacity-65"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Contact Mobile Number</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium disabled:opacity-65"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Registered Corporate entity</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium disabled:opacity-65"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Secure API Key panel */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3 flex items-center gap-2">
              <Key className="h-5 w-5 text-[#006A6A]" />
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white">API Credentials Console</h3>
            </div>
            <p className="text-[13px] text-[#6D7A79] dark:text-[#6D7A79] font-semibold leading-relaxed">
              Use these live auth keys to bind third-party fleet telemetry webhooks, GPS devices, or ERP software. Keep keys secure.
            </p>

            <div className="flex items-center border border-[#E5EEFF] dark:border-[#334155] rounded-xl bg-[#F8F9FF] dark:bg-[#0F172A] p-4 gap-3 shadow-sm">
              <Shield className="h-5 w-5 text-slate-400 shrink-0" />
              <div className="flex-1 font-mono text-xs break-all whitespace-normal text-[#545F73] dark:text-[#CBD5E1] font-bold">
                {showApiKey ? apiKey : 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢'}
              </div>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1"
                title={showApiKey ? 'Hide Token' : 'Reveal Token'}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-slate-400 hover:text-[#006A6A] cursor-pointer p-1"
                title="Copy Key"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


