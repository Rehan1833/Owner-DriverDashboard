import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Award, Lock, LogOut, ShieldAlert } from 'lucide-react';

export const Profile: React.FC = () => {
  const { vehicles, user, logout, triggerNotification } = useOperations();
  const navigate = useNavigate();
  const driverVehicle = vehicles[0] || { vehicleNumber: user?.vehicleNumber || 'MH-12-QW-9874' };

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      alert('New passwords do not match.');
      return;
    }
    triggerNotification('System Alert', 'Security Credentials Saved', 'Your driver security passphrase code has been updated successfully.', 'Info');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left animate-fade-in">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-[#E5E7EB] dark:border-[#334155] pb-5">
        <div className="text-left">
          <h2 className="text-[26px] font-extrabold text-[#111827] dark:text-[#F8FAFC] tracking-tight leading-none">Operator Profile</h2>
          <p className="text-[13px] text-[#4B5563] dark:text-[#94A3B8] mt-1.5 font-medium">Manage Class A commercial license credentials and safety configurations.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-xs font-bold py-2 border border-red-200 dark:border-red-950/40 text-[#EF4444] hover:bg-red-50/50 flex items-center gap-1.5 rounded-xl cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Logout Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'Driver')}`}
            alt="Driver Photo"
            className="w-24 h-24 rounded-2xl bg-[#006A6A]/10 border border-[#E5E7EB] dark:border-[#334155] object-cover"
          />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">{user?.fullName || 'Driver'}</h3>
            <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-bold uppercase tracking-wide">Driver ID: {user?.driverId || 'N/A'}</p>
            <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-[#006A6A] dark:text-[#7DF5F5] font-extrabold bg-[#006A6A]/10 px-3 py-1 rounded-full border border-[#006A6A]/15">
              <Award className="h-3.5 w-3.5" />
              <span>Safety Score: 100%</span>
            </div>
          </div>
        </div>

        {/* Profile Details Sheet */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[15px] font-extrabold text-[#111827] dark:text-[#F8FAFC] border-b border-[#E5E7EB] dark:border-[#334155] pb-3 flex items-center gap-1.5 uppercase tracking-wide">
              <User className="h-4 w-4 text-[#006A6A]" /> Operator Registry Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-bold">
              <div>
                <span className="text-[#6B7280] dark:text-[#94A3B8] block font-extrabold text-[10px] uppercase">Registered Phone</span>
                <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block mt-1 font-mono">{user?.mobileNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#94A3B8] block font-extrabold text-[10px] uppercase">Workspace Email</span>
                <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block mt-1">{user?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#94A3B8] block font-extrabold text-[10px] uppercase">Commercial License Number</span>
                <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block mt-1 font-mono">DL-MH-12-2015-0098</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#94A3B8] block font-extrabold text-[10px] uppercase">Assigned Fleet Truck</span>
                <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block mt-1 font-mono">{driverVehicle?.vehicleNumber || 'MH-12-QW-9874'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#94A3B8] block font-extrabold text-[10px] uppercase">Emergency Dispatch Contact</span>
                <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block mt-1 font-mono">+91 99999 88888 (SPOUSE)</span>
              </div>
            </div>
          </div>

          {/* Change Password Block */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[15px] font-extrabold text-[#111827] dark:text-[#F8FAFC] border-b border-[#E5E7EB] dark:border-[#334155] pb-3 flex items-center gap-1.5 uppercase tracking-wide">
              <Lock className="h-4 w-4 text-[#006A6A]" /> Change Security Password
            </h4>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[#374151] dark:text-[#CBD5E1] font-bold block">Current Password</label>
                  <input
                    type="password"
                    required
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handleInputChange}
                    placeholder="••••••"
                    className="w-full px-4 h-11 border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#374151] dark:text-[#CBD5E1] font-bold block">New Password</label>
                  <input
                    type="password"
                    required
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handleInputChange}
                    placeholder="••••••"
                    className="w-full px-4 h-11 border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#374151] dark:text-[#CBD5E1] font-bold block">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handleInputChange}
                    placeholder="••••••"
                    className="w-full px-4 h-11 border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" className="text-xs font-bold py-2.5 rounded-xl border border-transparent shadow-sm cursor-pointer">
                  Save Credentials
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};


