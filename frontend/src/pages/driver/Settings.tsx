import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../store/ThemeContext';
import {
  Settings as SettingsIcon, Sun, Moon, Volume2, MapPin, Camera, Database,
  Shield, Info, LogOut, MessageSquare, ToggleLeft, ToggleRight
} from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Settings states
  const [language, setLanguage] = useState('English');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [notifyTrips, setNotifyTrips] = useState(true);
  const [notifyMaintenance, setNotifyMaintenance] = useState(true);
  
  // Permission statuses checked via Web APIs where possible
  const [locPermission, setLocPermission] = useState('granted');
  const [camPermission, setCamPermission] = useState('prompt');

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' as any })
        .then(status => {
          setCamPermission(status.state);
          status.onchange = () => setCamPermission(status.state);
        })
        .catch(() => {});
        
      navigator.permissions.query({ name: 'geolocation' as any })
        .then(status => {
          setLocPermission(status.state);
          status.onchange = () => setLocPermission(status.state);
        })
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleClearCache = () => {
    localStorage.removeItem('smartops_driver_cached_photos');
    alert('Temporary offline map cache cleared successfully (0.0 MB freed).');
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12 text-left animate-fade-in">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-5">
        <div className="text-left">
          <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-slate-100 tracking-tight leading-none">Application Settings</h2>
          <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">Configure telemetry sound preferences, check camera permissions, and view privacy logs.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-xs font-bold py-2 border border-red-200 dark:border-red-950/40 text-[#EF4444] hover:bg-red-50/50 flex items-center gap-1.5 rounded-xl cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Logout Session
        </Button>
      </div>

      <div className="space-y-6">
        {/* 1. Interface Preferences */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4">
          <h4 className="text-[15px] font-bold text-[#0B1C30] dark:text-slate-100 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
            <SettingsIcon className="h-4 w-4 text-[#006A6A]" /> Interface Configurations
          </h4>
          
          <div className="space-y-4 text-xs text-slate-700 dark:text-[#CBD5E1] font-bold">
            {/* Theme Toggle */}
            <div className="flex justify-between items-center text-left">
              <div className="space-y-0.5">
                <span className="block text-slate-800 dark:text-[#F8FAFC]">Console Dark Mode</span>
                <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block font-semibold">Toggles high-contrast night styling for cabin driving.</span>
              </div>
              <button 
                onClick={toggleTheme}
                className="text-[#6D7A79] hover:text-slate-700 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Moon className="h-5 w-5 text-[#006A6A]" /> : <Sun className="h-5 w-5 text-slate-400" />}
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex justify-between items-center pt-3.5 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 text-left">
              <div className="space-y-0.5">
                <span className="block text-slate-800 dark:text-[#F8FAFC]">Operating Language</span>
                <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block font-semibold">Select navigation localization text scripts.</span>
              </div>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="h-9 border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] dark:bg-[#0F172A] rounded-xl px-3.5 text-xs focus:outline-none font-bold cursor-pointer"
              >
                <option>English</option>
                <option>Hindi (à¤¹à¤¿à¤¨à¥à¤¦à¥€)</option>
                <option>Marathi (à¤®à¤°à¤¾à¤ à¥€)</option>
                <option>Punjabi (à¨ªà©°à¨œà¨¾à¨¬à©€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Notifications & Sounds */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4">
          <h4 className="text-[15px] font-bold text-[#0B1C30] dark:text-slate-100 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
            <Volume2 className="h-4 w-4 text-[#006A6A]" /> Sounds & Notifications Alerts
          </h4>
          
          <div className="space-y-4 text-xs text-slate-700 dark:text-[#CBD5E1] font-bold">
            <div className="flex justify-between items-center text-left">
              <div className="space-y-0.5">
                <span className="block text-slate-800 dark:text-[#F8FAFC]">Cabin Sound Warning Alerts</span>
                <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block font-semibold">Plays sound alerts on speed warnings or dispatcher distress SOS.</span>
              </div>
              <button onClick={() => setSoundAlerts(!soundAlerts)} className="text-slate-400 cursor-pointer">
                {soundAlerts ? <ToggleRight className="h-7 w-7 text-[#006A6A]" /> : <ToggleLeft className="h-7 w-7 text-slate-300 dark:text-[#545F73]" />}
              </button>
            </div>

            <div className="flex justify-between items-center pt-3.5 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 text-left">
              <div className="space-y-0.5">
                <span className="block text-slate-800 dark:text-[#F8FAFC]">Consignment Updates Push</span>
                <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block font-semibold">Trigger alerts immediately when new consignments are assigned.</span>
              </div>
              <button onClick={() => setNotifyTrips(!notifyTrips)} className="text-slate-400 cursor-pointer">
                {notifyTrips ? <ToggleRight className="h-7 w-7 text-[#006A6A]" /> : <ToggleLeft className="h-7 w-7 text-slate-300 dark:text-[#545F73]" />}
              </button>
            </div>

            <div className="flex justify-between items-center pt-3.5 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 text-left">
              <div className="space-y-0.5">
                <span className="block text-slate-800 dark:text-[#F8FAFC]">Fleet Maintenance Warnings</span>
                <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block font-semibold">Alert before fitness certs, permits, or insurance expiry dates.</span>
              </div>
              <button onClick={() => setNotifyMaintenance(!notifyMaintenance)} className="text-slate-400 cursor-pointer">
                {notifyMaintenance ? <ToggleRight className="h-7 w-7 text-[#006A6A]" /> : <ToggleLeft className="h-7 w-7 text-slate-300 dark:text-[#545F73]" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Device Permissions & Cache */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4">
          <h4 className="text-[15px] font-bold text-[#0B1C30] dark:text-slate-100 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
            <Shield className="h-4 w-4 text-[#006A6A]" /> Telemetry Permissions & Cache
          </h4>

          <div className="space-y-4 text-xs text-slate-700 dark:text-[#CBD5E1] font-bold">
            {/* GPS check */}
            <div className="flex justify-between items-center text-left">
              <div className="space-y-0.5 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#6D7A79]" />
                <div>
                  <span className="block text-slate-800 dark:text-[#F8FAFC]">Location Access Permission</span>
                  <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block font-semibold">Required for automated yard geofencing check-in.</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                locPermission === 'granted' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-[#10B981]' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
              }`}>
                {locPermission.toUpperCase()}
              </span>
            </div>

            {/* Camera check */}
            <div className="flex justify-between items-center pt-3.5 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 text-left">
              <div className="space-y-0.5 flex items-center gap-2">
                <Camera className="h-4 w-4 text-[#6D7A79]" />
                <div>
                  <span className="block text-slate-800 dark:text-[#F8FAFC]">Camera Snapshot Permission</span>
                  <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block font-semibold">Required to capture Proof of Delivery (POD) cargo snaps.</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                camPermission === 'granted' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-[#10B981]' : 
                camPermission === 'denied' ? 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-[#6D7A79] dark:text-[#94A3B8]'
              }`}>
                {camPermission.toUpperCase()}
              </span>
            </div>

            {/* Local Storage */}
            <div className="flex justify-between items-center pt-3.5 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 text-left">
              <div className="space-y-0.5 flex items-center gap-2">
                <Database className="h-4 w-4 text-[#6D7A79]" />
                <div>
                  <span className="block text-slate-800 dark:text-[#F8FAFC]">Local Cache Storage</span>
                  <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] block font-semibold">Temporary offline map and POD photo bytes storage capacity.</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleClearCache}
                className="text-[10px] font-bold py-1 px-3 border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F8F9FF] dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Clear Cache (0.0 MB)
              </Button>
            </div>
          </div>
        </div>

        {/* 4. Privacy and About */}
        <div className="bg-[#F8F9FF] dark:bg-[#0F172A] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-5 text-xs text-[#6D7A79] dark:text-[#94A3B8] space-y-3 text-left">
          <h5 className="font-bold text-slate-700 dark:text-[#F8FAFC] flex items-center gap-1.5"><Info className="h-4 w-4" /> Application Information</h5>
          <div className="space-y-1 font-semibold text-[11px]">
            <p>App Version: <span className="font-mono text-[#545F73] dark:text-[#94A3B8]">v4.12.8 (Enterprise Stable build)</span></p>
            <p>SmartOps Driver Console (SaaS Protocol)</p>
            <p className="pt-2 border-t border-slate-200/50 dark:border-slate-800 font-bold">
              <a href="#privacy" className="text-[#006A6A] dark:text-[#14B8A6] hover:underline">Privacy Policy</a> â€¢ <a href="#tos" className="text-[#006A6A] dark:text-[#14B8A6] hover:underline">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};



