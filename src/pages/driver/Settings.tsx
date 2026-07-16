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
    // Check camera permission using modern permission query if supported
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
    <div className="space-y-8 max-w-2xl mx-auto pb-12">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-5">
        <div className="text-left">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Application Settings</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Configure telemetry sound preferences, check camera permissions, and view privacy logs.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-xs font-bold py-2 border border-red-200 dark:border-red-950/40 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1.5 rounded-xl cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Logout Session
        </Button>
      </div>

      <div className="space-y-6">
        {/* 1. Interface Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 border-b border-gray-50 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <SettingsIcon className="h-4.5 w-4.5 text-blue-600" /> Interface Configurations
          </h4>
          
          <div className="space-y-4.5 text-xs text-slate-700 dark:text-slate-305">
            {/* Theme Toggle */}
            <div className="flex justify-between items-center text-left">
              <div className="space-y-0.5">
                <span className="font-bold block text-slate-800 dark:text-slate-200">Console Dark Mode</span>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-semibold">Toggles high-contrast night styling for cabin driving.</span>
              </div>
              <button 
                onClick={toggleTheme}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Moon className="h-5 w-5 text-blue-600" /> : <Sun className="h-5 w-5 text-slate-400" />}
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-slate-850 text-left">
              <div className="space-y-0.5">
                <span className="font-bold block text-slate-800 dark:text-slate-200">Operating Language</span>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-semibold">Select navigation localization text scripts.</span>
              </div>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="px-2.5 py-1 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none font-semibold text-xs cursor-pointer"
              >
                <option>English</option>
                <option>Hindi (हिन्दी)</option>
                <option>Marathi (मराठी)</option>
                <option>Punjabi (ਪੰਜਾਬੀ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Notifications & Sounds */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 border-b border-gray-50 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <Volume2 className="h-4.5 w-4.5 text-blue-600" /> Sounds & Notifications Alerts
          </h4>
          
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between items-center text-left">
              <div className="space-y-0.5">
                <span className="font-bold block text-slate-800 dark:text-slate-205">Cabin Sound Warning alerts</span>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-semibold">Plays sound alerts on speed warnings or dispatcher distress SOS.</span>
              </div>
              <button onClick={() => setSoundAlerts(!soundAlerts)} className="text-slate-450 dark:text-slate-400 cursor-pointer">
                {soundAlerts ? <ToggleRight className="h-7 w-7 text-blue-600 animate-pulse" /> : <ToggleLeft className="h-7 w-7 text-slate-350 dark:text-slate-700" />}
              </button>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-slate-850 text-left">
              <div className="space-y-0.5">
                <span className="font-bold block text-slate-800 dark:text-slate-205">Consignment Updates Push notifications</span>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-semibold">Trigger alerts immediately when new consignments are assigned.</span>
              </div>
              <button onClick={() => setNotifyTrips(!notifyTrips)} className="text-slate-450 dark:text-slate-400 cursor-pointer">
                {notifyTrips ? <ToggleRight className="h-7 w-7 text-blue-600" /> : <ToggleLeft className="h-7 w-7 text-slate-350 dark:text-slate-700" />}
              </button>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-slate-850 text-left">
              <div className="space-y-0.5">
                <span className="font-bold block text-slate-800 dark:text-slate-205">Fleet Maintenance warnings</span>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-semibold">Alert before fitness certs, permits, or insurance expiry dates.</span>
              </div>
              <button onClick={() => setNotifyMaintenance(!notifyMaintenance)} className="text-slate-450 dark:text-slate-400 cursor-pointer">
                {notifyMaintenance ? <ToggleRight className="h-7 w-7 text-blue-600" /> : <ToggleLeft className="h-7 w-7 text-slate-350 dark:text-slate-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Device Permissions & Cache */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 border-b border-gray-50 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <Shield className="h-4.5 w-4.5 text-blue-600" /> Telemetry Permissions & Cache
          </h4>

          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            {/* GPS check */}
            <div className="flex justify-between items-center text-left">
              <div className="space-y-0.5 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-450 dark:text-slate-500" />
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-205">Location Access Permission</span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-semibold">Required for automated yard geofencing check-in.</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                locPermission === 'granted' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-455'
              }`}>
                {locPermission.toUpperCase()}
              </span>
            </div>

            {/* Camera check */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-slate-850 text-left">
              <div className="space-y-0.5 flex items-center gap-2">
                <Camera className="h-4 w-4 text-slate-450 dark:text-slate-500" />
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-205">Camera Snapshot Permission</span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-semibold">Required to capture Proof of Delivery (POD) cargo snaps.</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                camPermission === 'granted' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450' : 
                camPermission === 'denied' ? 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {camPermission.toUpperCase()}
              </span>
            </div>

            {/* Local Storage */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-slate-850 text-left">
              <div className="space-y-0.5 flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-455 dark:text-slate-500" />
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-205">Local Cache Storage</span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-semibold">Temporary offline map and POD photo bytes storage capacity.</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleClearCache}
                className="text-[10px] font-bold py-1 px-3 border border-gray-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Clear Cache (0.0 MB)
              </Button>
            </div>
          </div>
        </div>

        {/* 4. Privacy and About */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-3xl p-5 text-xs text-slate-500 dark:text-slate-400 space-y-3 text-left">
          <h5 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><Info className="h-4 w-4" /> Application Information</h5>
          <div className="space-y-1 font-semibold text-[10px]">
            <p>App Version: <span className="font-mono text-slate-650 dark:text-slate-400">v4.12.8 (Enterprise Stable build)</span></p>
            <p>SmartOps Driver Console (SaaS Protocol)</p>
            <p className="pt-2 border-t border-slate-200/50 dark:border-slate-800">
              <a href="#privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a> • <a href="#tos" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
