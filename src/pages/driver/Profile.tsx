import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Award, Lock, LogOut, ShieldAlert } from 'lucide-react';

export const Profile: React.FC = () => {
  const { vehicles, user, triggerNotification } = useOperations();
  const navigate = useNavigate();
  const driverVehicle = vehicles[0]; // container MH-12

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
    // Clear any local state/session if necessary and navigate to login
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-5">
        <div className="text-left">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Operator Profile</h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">Manage Class A commercial license credentials and safety configurations.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-xs font-bold py-2 border border-red-200 dark:border-red-950/40 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1.5 rounded-xl cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Logout Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-4">
          <img
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Rajesh'}
            alt="Driver Photo"
            className="w-24 h-24 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 object-cover"
          />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-805 dark:text-slate-100">{user?.fullName || 'Rajesh Kumar'}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Driver ID: DRV-9041</p>
            <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full">
              <Award className="h-3.5 w-3.5" />
              <span>Safety score: 98.4%</span>
            </div>
          </div>
        </div>

        {/* Profile Details Sheet */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 text-left">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 border-b border-gray-50 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <User className="h-4 w-4 text-blue-500" /> Operator Registry Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[10px] uppercase">Registered Phone</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 block mt-1">+91 98765 43210</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[10px] uppercase">Workplace Email</span>
                <span className="font-bold text-slate-700 dark:text-slate-205 block mt-1">{user?.email || 'rajesh@smartops.com'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[10px] uppercase">Commercial License Number</span>
                <span className="font-bold text-slate-750 dark:text-slate-205 block mt-1">DL-MH-12-2015-0098</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[10px] uppercase">Assigned Fleet Truck</span>
                <span className="font-bold text-slate-750 dark:text-slate-205 block mt-1">{driverVehicle?.vehicleNumber || 'MH-12-QW-9874'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[10px] uppercase">Emergency Dispatch Contact</span>
                <span className="font-bold text-slate-750 dark:text-slate-205 block mt-1">+91 99999 88888 (SPOUSE)</span>
              </div>
            </div>
          </div>

          {/* Change Password Block */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 text-left">
            <h4 className="text-sm font-semibold text-slate-805 dark:text-slate-100 border-b border-gray-50 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-blue-500" /> Change Security Password
            </h4>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-slate-500 dark:text-slate-400 font-semibold block">Current Password</label>
                  <input
                    type="password"
                    required
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handleInputChange}
                    placeholder="••••••"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-505 dark:text-slate-400 font-semibold block">New Password</label>
                  <input
                    type="password"
                    required
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handleInputChange}
                    placeholder="••••••"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-505 dark:text-slate-400 font-semibold block">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handleInputChange}
                    placeholder="••••••"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl border border-transparent cursor-pointer">
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
