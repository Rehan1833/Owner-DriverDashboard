import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOperations } from '../../store/OperationsContext';
import { Table } from '../../components/tables/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Compass, CheckCircle, Navigation, Phone, Gauge, Sparkles, Award, MapPin,
  Clock, ShieldAlert, FileText, Camera, Edit3, Calendar, Activity, AlertTriangle, Play, RefreshCw, Eye, FileCheck, LogOut
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Trip, Vehicle } from '../../types';

export const Home: React.FC = () => {
  const {
    trips,
    updateTripStatus,
    vehicles,
    notifications,
    triggerNotification,
    user,
    attendance,
    driverStartDuty,
    driverStartBreak,
    driverEndBreak,
    driverEndDuty
  } = useOperations();
  const navigate = useNavigate();

  // Active Trip for Driver Rajesh (DRV-9041)
  const driverId = user?.driverId || 'DRV-9041';
  const driverTrips = trips.filter(t => t.driverId === driverId || t.driverId === 'd1');
  const activeTrip = trips.find(t => (t.driverId === driverId || t.driverId === 'd1') && t.status !== 'Completed') || trips[0];
  const completedTrips = trips.filter(t => (t.driverId === driverId || t.driverId === 'd1') && t.status === 'Completed');
  const driverVehicle = vehicles.find(v => v.driver?.toLowerCase().includes('rajesh') || v.driver?.toLowerCase().includes('d1') || v.driver?.toLowerCase().includes('drv-9041')) || vehicles[0];

  // Shift Duty States
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(a => a.driverId === driverId && a.date === todayStr);
  const currentDutyStatus = todayRecord ? todayRecord.currentStatus : 'Off Duty';

  const [deviceInfo, setDeviceInfo] = useState('Mobile Web Console (Chrome)');
  const [ipAddress, setIpAddress] = useState('192.168.1.115');
  const [gpsCoords, setGpsCoords] = useState('18.5204, 73.8567');
  const [address, setAddress] = useState('Warehouse A (Pune)');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);
  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [breakType, setBreakType] = useState('Lunch Break');
  const [breakRemarks, setBreakRemarks] = useState('');
  const [isEndingDuty, setIsEndingDuty] = useState(false);
  const [showCheckOutSuccess, setShowCheckOutSuccess] = useState(false);
  const [liveWorkingTime, setLiveWorkingTime] = useState('00h 00m 00s');

  // Initialize client telemetry info
  useEffect(() => {
    const ua = navigator.userAgent;
    let dev = 'Desktop Browser';
    if (/android/i.test(ua)) dev = 'Android Mobile';
    else if (/iPad|iPhone|iPod/.test(ua)) dev = 'iOS Mobile';
    else if (/mac/i.test(ua)) dev = 'macOS Desktop';
    else if (/win/i.test(ua)) dev = 'Windows Desktop';
    setDeviceInfo(dev);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          setGpsCoords(`${lat}, ${lng}`);
          if (pos.coords.latitude > 18.9) {
            setAddress('Mumbai DC Gate 2, Port Area');
          } else {
            setAddress('Pune Logistics Hub Terminal A');
          }
        },
        err => {
          console.warn('Geolocation capture failed', err);
        }
      );
    }
  }, []);

  // Live Timer for Working Hours
  useEffect(() => {
    const updateTimer = () => {
      const checkInStr = todayRecord?.checkInTime || todayRecord?.checkIn;
      if (!checkInStr) {
        setLiveWorkingTime('00h 00m 00s');
        return;
      }

      try {
        const today = new Date();
        const [time, modifier] = checkInStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const checkInDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);
        const now = new Date();
        
        let endPoint = now;
        if (todayRecord.checkOut) {
          const [coTime, coMod] = (todayRecord.checkOutTime || todayRecord.checkOut).split(' ');
          let [coHours, coMinutes] = coTime.split(':').map(Number);
          if (coMod === 'PM' && coHours !== 12) coHours += 12;
          if (coMod === 'AM' && coHours === 12) coHours = 0;
          endPoint = new Date(today.getFullYear(), today.getMonth(), today.getDate(), coHours, coMinutes, 0);
        }

        const diffMs = endPoint.getTime() - checkInDate.getTime();
        if (diffMs < 0) {
          setLiveWorkingTime('00h 00m 00s');
          return;
        }

        const diffSecs = Math.floor(diffMs / 1000);
        const h = Math.floor(diffSecs / 3600);
        const m = Math.floor((diffSecs % 3600) / 60);
        const s = diffSecs % 60;
        setLiveWorkingTime(
          `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
        );
      } catch (e) {
        console.error("Live timer calculation error:", e);
        setLiveWorkingTime('00h 00m 00s');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [todayRecord]);

  // Start Duty handler
  const handleStartDuty = async () => {
    setIsCheckingIn(true);
    setTimeout(async () => {
      try {
        const payload = {
          driverId,
          driverName: user?.fullName || 'Rajesh Kumar',
          employeeName: user?.fullName || 'Rajesh Kumar',
          checkInGPS: gpsCoords,
          checkInWarehouse: address,
          checkInDeviceInfo: deviceInfo,
          checkInInternetStatus: `IP: ${ipAddress} (Online)`
        };
        await driverStartDuty(payload);
        setIsCheckingIn(false);
        setShowCheckInSuccess(true);
        setTimeout(() => {
          setShowCheckInSuccess(false);
        }, 2200);
      } catch (err) {
        setIsCheckingIn(false);
        console.error(err);
      }
    }, 1000);
  };

  // Start Break handler
  const handleStartBreak = async () => {
    try {
      await driverStartBreak({
        driverId,
        type: breakType,
        remarks: breakRemarks,
        gps: '18.7502, 73.4501'
      });
      setBreakModalOpen(false);
      setBreakRemarks('');
    } catch (err) {
      console.error(err);
    }
  };

  // End Break handler
  const handleEndBreak = async () => {
    try {
      await driverEndBreak({
        driverId,
        gps: '18.7502, 73.4501'
      });
    } catch (err) {
      console.error(err);
    }
  };

  // End Duty handler (Location Enabled Check-Out)
  const handleEndDuty = async () => {
    setIsEndingDuty(true);

    const performCheckout = async (coords?: { latitude: number; longitude: number; address: string }) => {
      try {
        const checkOutTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        let gps = '19.0760, 72.8777'; // Fallback
        let lat = 19.0760;
        let lng = 72.8777;
        let addr = 'Mumbai DC Gate 2, Port Area';
        
        if (coords) {
          gps = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
          lat = coords.latitude;
          lng = coords.longitude;
          addr = coords.address;
        }

        await driverEndDuty({
          driverId,
          checkOutGPS: gps,
          latitude: lat,
          longitude: lng,
          address: addr,
          checkOutTime,
          tripsCompleted: completedTrips.length || 1,
          distanceCovered: 148,
          fuelUsed: 24
        });
        
        setIsEndingDuty(false);
        setShowCheckOutSuccess(true);
      } catch (err) {
        setIsEndingDuty(false);
        console.error(err);
      }
    };

    const getCheckoutAddr = async (latitude: number, longitude: number): Promise<string> => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
          headers: { 'User-Agent': 'SmartOpsAttendanceApp/1.0' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            return data.display_name;
          }
        }
      } catch (e) {}
      if (latitude > 18.9) return "Mumbai DC Gate 2, Port Area";
      return "Pune Warehouse Yard A";
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const resolvedAddr = await getCheckoutAddr(lat, lng);
          performCheckout({ latitude: lat, longitude: lng, address: resolvedAddr });
        },
        async (err) => {
          console.warn('Geolocation failed during checkout, using fallback', err);
          performCheckout();
        },
        { timeout: 5000 }
      );
    } else {
      performCheckout();
    }
  };

  // Quick action state triggers
  const handleStatusTransition = () => {
    if (!activeTrip) return;
    let nextStatus: any = 'Assigned';
    if (activeTrip.status === 'Assigned') nextStatus = 'Accepted';
    else if (activeTrip.status === 'Accepted') nextStatus = 'Started';
    else if (activeTrip.status === 'Started') nextStatus = 'Reached Pickup';
    else if (activeTrip.status === 'Reached Pickup') nextStatus = 'Loaded';
    else if (activeTrip.status === 'Loaded') nextStatus = 'In Transit';
    else if (activeTrip.status === 'In Transit') nextStatus = 'Reached Destination';
    else if (activeTrip.status === 'Reached Destination' || activeTrip.status === 'Delivered') {
      nextStatus = 'Completed';
    }
    updateTripStatus(activeTrip.id, nextStatus);
    triggerNotification('Trip Started', 'Status Updated', `Trip status for ${activeTrip.tripNumber} changed to ${nextStatus}`, 'Info');
  };

  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Traffic Congestion');

  // Dynamic Recharts datasets
  const driverAttendanceRecords = useMemo(() => {
    return attendance.filter(a => a.driverId === driverId);
  }, [attendance, driverId]);

  const weeklyDistData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dists = [0, 0, 0, 0, 0, 0, 0];
    driverAttendanceRecords.forEach(rec => {
      if (rec.date && rec.distanceCovered) {
        const dayIdx = new Date(rec.date).getDay();
        const targetIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        dists[targetIdx] += rec.distanceCovered;
      }
    });
    return days.map((day, idx) => ({
      day,
      distance: dists[idx] || 0
    }));
  }, [driverAttendanceRecords]);

  const monthlyTripsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const displayMonths: string[] = [];
    for (let i = 5; i >= 0; i--) {
      let mIdx = currentMonthIdx - i;
      if (mIdx < 0) mIdx += 12;
      displayMonths.push(months[mIdx]);
    }

    const runsCount = displayMonths.map(() => 0);
    completedTrips.forEach(t => {
      const date = t.timestamp ? new Date(t.timestamp) : new Date();
      const mName = months[date.getMonth()];
      const idx = displayMonths.indexOf(mName);
      if (idx !== -1) {
        runsCount[idx] += 1;
      }
    });

    return displayMonths.map((month, idx) => ({
      month,
      runs: runsCount[idx] || 0
    }));
  }, [completedTrips]);

  const fuelConsumptionData = useMemo(() => {
    const totalFuel = driverAttendanceRecords.reduce((sum, rec) => sum + (rec.fuelUsed || 0), 0);
    const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
    const factors = [0.22, 0.28, 0.20, 0.30];
    return weeks.map((week, idx) => ({
      week,
      usage: Math.round(totalFuel * factors[idx])
    }));
  }, [driverAttendanceRecords]);

  const performanceScoreData = useMemo(() => {
    const total = driverTrips.length;
    if (total === 0) {
      return [
        { name: 'On Time Delivery', value: 100, color: '#006A6A' },
        { name: 'Delayed Delivery', value: 0, color: '#F59E0B' },
        { name: 'Failed Delivery', value: 0, color: '#EF4444' }
      ];
    }
    const completedCount = driverTrips.filter(t => t.status === 'Completed').length;
    const delayedCount = driverTrips.filter(t => t.status === 'Delayed').length;

    const onTimePercent = Math.round((completedCount / total) * 100);
    const delayedPercent = Math.round((delayedCount / total) * 100);
    const failedPercent = Math.max(0, 100 - onTimePercent - delayedPercent);

    return [
      { name: 'On Time Delivery', value: onTimePercent, color: '#006A6A' },
      { name: 'Delayed Delivery', value: delayedPercent, color: '#F59E0B' },
      { name: 'Failed Delivery', value: failedPercent, color: '#EF4444' }
    ];
  }, [driverTrips]);

  const isOffDuty = currentDutyStatus === 'Off Duty' && !todayRecord?.checkOut;
  const isDutyEnded = todayRecord && todayRecord.checkOut;

  if (isDutyEnded) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 text-left animate-fade-in">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-8 max-w-lg w-full border border-[#E5EEFF] dark:border-[#334155] shadow-xl space-y-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-[#10B981] flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B1C30] dark:text-slate-100 animate-fade-in">Check-Out Successful</h3>
            <p className="text-xs text-[#6D7A79]">Shift log processed. Metrics synced to Owner Dashboard.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="p-3.5 bg-[#F8F9FF] dark:bg-[#0F172A]/40 border border-[#E5EEFF] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] text-[#6D7A79] dark:text-[#94A3B8] uppercase font-bold block">Worked Time</span>
              <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] block mt-1">{todayRecord.workingHours} hrs</span>
            </div>
            <div className="p-3.5 bg-[#F8F9FF] dark:bg-[#0F172A]/40 border border-[#E5EEFF] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] text-[#6D7A79] dark:text-[#94A3B8] uppercase font-bold block">Overtime</span>
              <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] block mt-1">{todayRecord.overtime} hrs</span>
            </div>
            <div className="p-3.5 bg-[#F8F9FF] dark:bg-[#0F172A]/40 border border-[#E5EEFF] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] text-[#6D7A79] dark:text-[#94A3B8] uppercase font-bold block">Break Duration</span>
              <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] block mt-1">{todayRecord.breakDuration} mins</span>
            </div>
            <div className="p-3.5 bg-[#F8F9FF] dark:bg-[#0F172A]/40 border border-[#E5EEFF] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] text-[#6D7A79] dark:text-[#94A3B8] uppercase font-bold block">Distance covered</span>
              <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] block mt-1">{todayRecord.distanceCovered} km</span>
            </div>
            <div className="p-3.5 bg-[#F8F9FF] dark:bg-[#0F172A]/40 border border-[#E5EEFF] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] text-[#6D7A79] dark:text-[#94A3B8] uppercase font-bold block">Fuel Consumed</span>
              <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] block mt-1">{todayRecord.fuelUsed} L</span>
            </div>
            <div className="p-3.5 bg-[#F8F9FF] dark:bg-[#0F172A]/40 border border-[#E5EEFF] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] text-[#6D7A79] dark:text-[#94A3B8] uppercase font-bold block">Safety Score</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-1">{todayRecord.performanceScore}%</span>
            </div>
          </div>

          <div className="bg-[#F8F9FF] dark:bg-[#0F172A]/40 p-4 rounded-xl text-xs flex justify-between items-center text-left border border-[#E5EEFF] dark:border-[#334155]">
            <div>
              <p className="font-bold text-slate-700 dark:text-[#F8FAFC]">Calculated Attendance Status</p>
              <p className="text-[10px] text-slate-400">Determined automatically based on check-in hour.</p>
            </div>
            <Badge variant={todayRecord.attendanceStatus === 'Present' ? 'success' : todayRecord.attendanceStatus === 'Late' ? 'warning' : 'danger'}>
              {todayRecord.attendanceStatus}
            </Badge>
          </div>

          <div className="pt-2 text-slate-400 text-xs">
            Shift is closed. You are logged off from duty telemetry tracking.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">

      {/* ── 1. Prominent Welcome Header (Always Visible) ── */}
      <div className="bg-gradient-to-r from-[#006A6A] via-[#005757] to-[#0B1C30] dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#111827] text-white rounded-2xl p-6 md:p-8 shadow-md border border-teal-800/30 dark:border-[#334155] relative overflow-hidden">
        {/* Subtle truck icon background element */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Truck className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-white/15 dark:bg-teal-500/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider text-teal-100 dark:text-teal-300 border border-white/20">
                Good Afternoon 👋
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 rounded-full text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> {currentDutyStatus}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Welcome back, {user?.fullName || 'Rajesh Kumar'}
            </h1>
            <p className="text-teal-100 dark:text-slate-300 text-sm max-w-2xl font-medium">
              Today's goal: <span className="text-white font-extrabold">Complete deliveries safely.</span>
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 dark:bg-slate-800/80 backdrop-blur-md p-3.5 rounded-xl border border-white/15 dark:border-slate-700/60">
              <span className="text-[10px] text-teal-100 dark:text-slate-400 font-extrabold uppercase block">Vehicle</span>
              <span className="text-xs font-extrabold text-white font-mono block mt-0.5">{driverVehicle?.vehicleNumber || 'MH-12-QW-9874'}</span>
            </div>
            <div className="bg-white/10 dark:bg-slate-800/80 backdrop-blur-md p-3.5 rounded-xl border border-white/15 dark:border-slate-700/60">
              <span className="text-[10px] text-teal-100 dark:text-slate-400 font-extrabold uppercase block">Status</span>
              <span className="text-xs font-extrabold text-emerald-300 block mt-0.5">{currentDutyStatus}</span>
            </div>
            <div className="bg-white/10 dark:bg-slate-800/80 backdrop-blur-md p-3.5 rounded-xl border border-white/15 dark:border-slate-700/60">
              <span className="text-[10px] text-teal-100 dark:text-slate-400 font-extrabold uppercase block">Weather</span>
              <span className="text-xs font-extrabold text-white block mt-0.5">28°C Sunny ☀️</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Real-time Duty Tracking Status Strip ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            currentDutyStatus === 'On Duty' ? 'bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399]' :
            currentDutyStatus === 'On Trip' ? 'bg-[#F0F9FF] dark:bg-blue-950/20 text-[#006A6A] dark:text-[#7DF5F5]' :
            currentDutyStatus === 'On Break' ? 'bg-[#FEF3C7] dark:bg-amber-950/20 text-[#D97706] dark:text-[#FBBF24]' : 'bg-[#FFDAD4] dark:bg-red-950/20 text-[#BA1A1A] dark:text-[#FCA5A5]'
          }`}>
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-[#6B7280] dark:text-[#94A3B8] uppercase block">Duty Status</span>
            <span className="font-extrabold text-[#111827] dark:text-white text-sm">{currentDutyStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F3F4F6] dark:bg-[#111827] text-[#4B5563] dark:text-[#94A3B8] shrink-0 border border-[#E5E7EB] dark:border-[#334155]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-[#6B7280] dark:text-[#94A3B8] uppercase block">Check-In Time</span>
            <span className="font-bold text-[#111827] dark:text-white text-sm font-mono">{todayRecord?.checkIn || '--'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F3F4F6] dark:bg-[#111827] text-[#4B5563] dark:text-[#94A3B8] shrink-0 border border-[#E5E7EB] dark:border-[#334155]">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-[#6B7280] dark:text-[#94A3B8] uppercase block">Break Duration</span>
            <span className="font-bold text-[#111827] dark:text-white text-sm font-mono">{todayRecord?.breakDuration || 0} mins</span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {currentDutyStatus === 'On Break' ? (
            <Button
              onClick={handleEndBreak}
              variant="primary"
              className="text-xs py-2 px-4 rounded-xl font-bold"
            >
              Resume Duty
            </Button>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button
                onClick={() => setBreakModalOpen(true)}
                variant="outline"
                className="text-xs py-2 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#374151] dark:text-[#CBD5E1] hover:bg-[#F3F4F6] dark:hover:bg-[#111827] font-bold"
              >
                Start Break
              </Button>
              <Button
                onClick={handleEndDuty}
                isLoading={isEndingDuty}
                variant="danger"
                className="text-xs py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                End Duty
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Shift Action Card & Today's Attendance Card ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Operational Consignment Card (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-white dark:bg-[#1E293B] p-6 md:p-8 rounded-2xl text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-[#334155] shadow-sm min-h-[220px]">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-teal-50 dark:bg-teal-950/40 text-[#006A6A] dark:text-[#7DF5F5] border border-[#006A6A]/20 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                Operator Shift Active
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight leading-tight text-[#111827] dark:text-white">Assigned Freight Consignment</h2>
            <p className="text-[#4B5563] dark:text-[#CBD5E1] text-[13px] leading-relaxed max-w-2xl font-medium">
              You are assigned to container vehicle <span className="text-[#111827] dark:text-white font-extrabold">{driverVehicle?.vehicleNumber || 'MH-12-QW-9874'}</span>. 
              GPS tracking loop and automatic checkpoint verification logs are active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 mt-6">
            <Button
              onClick={handleStatusTransition}
              disabled={!activeTrip}
              variant="primary"
              className="text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm font-bold"
            >
              <Play className="h-4 w-4" /> Start/Next Step
            </Button>
            <Button
              onClick={() => setStopModalOpen(true)}
              disabled={!activeTrip || activeTrip.status !== 'In Transit'}
              variant="outline"
              className="text-xs py-2.5 px-4 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#374151] dark:text-[#CBD5E1] hover:bg-[#F3F4F6] dark:hover:bg-[#111827] flex items-center gap-1.5 font-bold"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Log Delay Stop
            </Button>
            <a href="#pod-section">
              <Button variant="primary" className="text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm font-bold">
                <FileText className="h-4 w-4" /> Upload POD
              </Button>
            </a>
          </div>
        </div>

        {/* Today's Attendance Card (1/3 width) */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#334155] shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="space-y-3.5 text-left">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#E5E7EB] dark:border-[#334155]">
              <span className="text-[13px] font-extrabold text-[#111827] dark:text-white uppercase tracking-wider block">Today's Attendance</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#059669] dark:text-[#34D399] text-[10px] font-extrabold flex items-center gap-1 border border-[#10B981]/25">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" /> Present
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
              <div>
                <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase font-extrabold block">Status</span>
                <span className="font-extrabold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-1 mt-0.5">
                  Present
                </span>
              </div>
              
              <div>
                <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase font-extrabold block">Check-In</span>
                <span className="font-bold text-[#374151] dark:text-[#CBD5E1] block mt-0.5 font-mono">
                  {todayRecord?.checkInTime || todayRecord?.checkIn || '09:05 AM'}
                </span>
              </div>
              
              <div className="col-span-2">
                <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase font-extrabold block">Working Hours</span>
                <span className="font-black text-[#006A6A] dark:text-[#7DF5F5] block mt-0.5 font-mono text-sm tracking-tight">
                  {liveWorkingTime}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase font-extrabold block">Location</span>
                <span className="font-bold text-[#374151] dark:text-[#CBD5E1] block mt-0.5 whitespace-normal break-words leading-snug" title={todayRecord?.address || todayRecord?.checkInWarehouse || 'Pune Warehouse'}>
                  {todayRecord?.checkInWarehouse || todayRecord?.address || 'Pune Warehouse'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {todayRecord && !todayRecord.checkOut ? (
              <Button
                onClick={handleEndDuty}
                isLoading={isEndingDuty}
                variant="danger"
                className="w-full text-xs py-2.5 rounded-xl shadow-md bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                <LogOut className="h-4 w-4 animate-pulse" /> End Duty
              </Button>
            ) : (
              <div className="text-center py-2.5 text-xs font-bold text-[#6B7280] dark:text-[#94A3B8] bg-[#F9FAFB] dark:bg-slate-800/40 border border-[#E5E7EB] dark:border-[#334155] rounded-xl">
                Shift Duty Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. KPI Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: "Today's Assignments", val: driverTrips.length, sub: "Cargo runs", trend: "Live state", color: "text-[#006A6A] dark:text-[#7DF5F5]", bg: "bg-[#F0F9FF] dark:bg-slate-800" },
          { name: "Completed Runs", val: completedTrips.length, sub: "Deliveries closed", trend: "Live state", color: "text-[#059669] dark:text-[#34D399]", bg: "bg-[#ECFDF5] dark:bg-emerald-950/20" },
          { name: "Active Run Status", val: activeTrip ? activeTrip.status : 'None', sub: activeTrip?.tripNumber || '--', trend: "Real-time updates", color: "text-[#D97706] dark:text-[#FBBF24]", bg: "bg-[#FEF3C7] dark:bg-amber-950/20" },
          { name: "Distance Covered", val: `${todayRecord?.distanceCovered || 0} km`, sub: "Shift distance log", trend: "Live log", color: "text-[#006A6A] dark:text-[#7DF5F5]", bg: "bg-[#006A6A]/10 dark:bg-[#006A6A]/20" },
          { name: "Fuel Remaining", val: `${driverVehicle?.fuelLevel || 100}%`, sub: "Vehicle status", trend: "Live level", color: "text-[#D97706] dark:text-[#FBBF24]", bg: "bg-[#FEF3C7] dark:bg-amber-950/20" },
          { name: "Duty Hours", val: `${todayRecord?.workingHours || 0} hrs`, sub: "Shift time logging", trend: "Duty active", color: "text-[#0284C7] dark:text-[#38BDF8]", bg: "bg-[#E0F2FE] dark:bg-sky-950/20" },
          { name: "Deliveries Completed", val: completedTrips.length, sub: "Consignments handed", trend: "Live state", color: "text-[#059669] dark:text-[#34D399]", bg: "bg-[#ECFDF5] dark:bg-emerald-950/20" },
          { name: "Pending Deliveries", val: driverTrips.filter(t => t.status !== 'Completed').length, sub: "Awaiting dispatch", trend: "Action required", color: "text-[#BA1A1A] dark:text-[#FCA5A5]", bg: "bg-[#FFDAD4] dark:bg-red-950/20" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-[#E5E7EB] dark:border-[#334155] shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
            <div className={`p-3 rounded-xl shrink-0 ${card.bg} ${card.color}`}>
              <Truck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-tight block">{card.name}</span>
              <h4 className="text-[17px] font-black text-[#111827] dark:text-[#F8FAFC] mt-0.5 whitespace-normal break-words leading-tight">{card.val}</h4>
              <p className="text-[11px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5 font-semibold">{card.sub} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{card.trend}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. GPS Vector Map & Telemetry Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPS map container */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E7EB] dark:border-[#334155] pb-3 text-left">
            <h4 className="text-[15px] font-extrabold text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <Compass className="h-5 w-5 text-[#006A6A] animate-spin-slow" /> Interactive Route Navigation
            </h4>
            <Badge variant="info">Speed: 64 km/h</Badge>
          </div>

          <div className="h-72 bg-[#0B1C30] rounded-xl relative overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-inner">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
            
            {/* SVG Path Route Pune to Mumbai */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 350">
              <path
                d="M 50,300 L 150,250 L 250,150 L 350,120 L 450,50"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 50,300 L 150,250 L 250,150"
                fill="none"
                stroke="#006A6A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="50" cy="300" r="5" fill="#667085" />
              <circle cx="150" cy="250" r="5" fill="#006A6A" />
              <circle cx="250" cy="150" r="5" fill="#EF4444" />
              <circle cx="350" cy="120" r="5" fill="#64748B" />
              <circle cx="450" cy="50" r="6" fill="#10B981" />
            </svg>

            {/* Labels floating */}
            <div className="absolute bottom-16 left-8 text-[10px] text-slate-400 font-bold">Pune Whse A</div>
            <div className="absolute top-16 right-16 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Mumbai terminal
            </div>

            {/* Live truck pointer */}
            <div className="absolute top-36 left-48 flex flex-col items-center">
              <span className="bg-slate-900 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border border-slate-700 shadow">
                {driverVehicle?.vehicleNumber || 'MH-12'}
              </span>
              <div className="w-5 h-5 rounded-full bg-[#006A6A] text-white flex items-center justify-center border border-white shadow-lg animate-bounce mt-1">
                <Navigation className="h-3 w-3 rotate-45" />
              </div>
            </div>

            <div className="relative z-10 bg-slate-900/90 backdrop-blur-md rounded-xl p-3.5 text-white border border-slate-800 flex justify-between items-center text-left">
              <div className="text-xs">
                <p className="text-[10px] text-slate-400 font-bold">Destination Point</p>
                <p className="font-extrabold whitespace-normal break-words leading-tight max-w-[220px]">{activeTrip?.dropLocation || 'Distribution Center'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold">ETA Clock</p>
                <p className="font-extrabold font-mono text-[#14B8A6]">{activeTrip?.eta || '16:45 PM'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry panel */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h4 className="text-[15px] font-extrabold text-[#111827] dark:text-slate-100 mb-4 pb-3 border-b border-[#E5E7EB] dark:border-[#334155] flex items-center gap-2 text-left uppercase tracking-wide">
              <Activity className="h-5 w-5 text-[#006A6A]" /> Active Trip Telemetry
            </h4>

            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#4B5563] dark:text-[#94A3B8] font-bold">Consignment Code</span>
                <span className="font-mono font-extrabold text-[#111827] dark:text-[#CBD5E1]">{activeTrip?.tripNumber || 'None'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#4B5563] dark:text-[#94A3B8] font-bold">Trip Stage Status</span>
                <Badge variant="warning">{activeTrip?.status || 'Idle'}</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#4B5563] dark:text-[#94A3B8] font-bold">Odometer Reading</span>
                <span className="font-extrabold text-[#111827] dark:text-[#CBD5E1] font-mono">{(driverVehicle?.odometer || 48200).toLocaleString()} km</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#4B5563] dark:text-[#94A3B8] font-bold">Fuel Level</span>
                <span className="font-extrabold text-[#111827] dark:text-[#CBD5E1] font-mono">{driverVehicle?.fuelLevel || 78}%</span>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-extrabold text-[#4B5563] dark:text-[#94A3B8]">
                  <span>Trip Progress</span>
                  <span>{activeTrip ? `${Math.max(10, 100 - Math.floor(activeTrip.distanceRemaining / 4.8))}%` : '0%'}</span>
                </div>
                <div className="w-full h-2 bg-[#F3F4F6] dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#006A6A] rounded-full transition-all duration-300"
                    style={{ width: `${activeTrip ? Math.max(10, 100 - Math.floor(activeTrip.distanceRemaining / 4.8)) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAFB] dark:bg-[#0F172A]/60 rounded-xl p-4 border border-[#E5E7EB] dark:border-[#334155]/60 space-y-2 text-left shadow-sm">
            <h5 className="text-[11px] font-extrabold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-600" /> Safety Score Card
            </h5>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#4B5563] dark:text-[#94A3B8] font-medium">Weekly Driver Rating</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% (Class A)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. Today's Dispatch Schedule ── */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB] dark:border-[#334155]">
          <h4 className="text-[15px] font-extrabold text-[#111827] dark:text-slate-100 uppercase tracking-wide">Today's Dispatch Schedule</h4>
          <span className="text-[11px] bg-[#F9FAFB] dark:bg-slate-800 border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#94A3B8] font-bold px-3 py-1 rounded-full">
            {driverTrips.length} active assignments
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {driverTrips.slice(0, 3).map((trip, idx) => (
            <div key={idx} className="p-4 border border-[#E5E7EB] dark:border-[#334155] rounded-xl space-y-3.5 hover:bg-[#F9FAFB] dark:hover:bg-slate-800/40 transition-colors text-left shadow-sm bg-white dark:bg-[#1E293B]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#111827] dark:text-[#F8FAFC]">{trip.tripNumber}</span>
                <Badge variant={trip.status === 'Completed' ? 'success' : trip.status === 'In Transit' ? 'info' : 'warning'}>
                  {trip.status}
                </Badge>
              </div>
              <div className="text-xs space-y-1 text-[#4B5563] dark:text-[#94A3B8]">
                <p className="font-bold text-[#111827] dark:text-[#CBD5E1] block">{trip.pickupLocation} → {trip.dropLocation}</p>
                <p className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] font-bold block mt-0.5">Material: {trip.material} ({trip.weight})</p>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-[#E5E7EB] dark:border-[#334155] text-[11px] font-bold">
                <span className="text-[#6B7280] dark:text-[#94A3B8]">ETA: <span className="font-bold font-mono text-[#111827] dark:text-[#CBD5E1]">{trip.eta}</span></span>
                <a
                  href={`tel:${trip.customerPhone}`}
                  className="text-[#006A6A] dark:text-[#7DF5F5] font-extrabold hover:underline flex items-center gap-0.5"
                >
                  <Phone className="h-3 w-3" /> Call Client
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. Shift Checkpoint Timeline ── */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-6 text-left">
        <h4 className="text-[15px] font-extrabold text-[#111827] dark:text-slate-100 uppercase tracking-wide">Operator Shift Checkpoint Logs</h4>
        
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-[#E5E7EB] dark:bg-[#334155]" />

          {[
            { title: "Trip Started", desc: `Departed from Pune Warehouse yard`, time: "08:12 AM", active: true },
            { title: "Reached Pickup Location", desc: `Arrived at Consignor industrial loading dock`, time: "09:30 AM", active: true },
            { title: "Cargo Loading & Lashing Completed", desc: `Secured container seals and locked RC manifest`, time: "10:45 AM", active: true },
            { title: "Transit Highway Run", desc: `Currently at Mumbai-Pune highway coordinates`, time: "In Transit", active: activeTrip?.status === 'In Transit' },
            { title: "Consignee POD Verification Awaiting", desc: `Signature collection and image uploads pending`, time: "--:--", active: false },
          ].map((mile, index) => (
            <div key={index} className="relative flex justify-between items-start gap-4">
              <span className={`absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1E293B] ${
                mile.active ? 'bg-[#006A6A] dark:bg-[#7DF5F5] ring-4 ring-[#006A6A]/10 dark:ring-[#7DF5F5]/10' : 'bg-[#F3F4F6] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#334155]'
              }`} />
              <div className="space-y-1 text-left">
                <h5 className="text-xs font-bold text-[#111827] dark:text-[#F8FAFC]">{mile.title}</h5>
                <p className="text-[11px] text-[#4B5563] dark:text-[#94A3B8] font-medium">{mile.desc}</p>
              </div>
              <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] font-mono shrink-0 font-bold">{mile.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. Analytics Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: Area Chart */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm md:col-span-2 space-y-4 text-left">
          <h5 className="text-[13px] font-extrabold text-[#111827] dark:text-slate-100 uppercase tracking-wide">Weekly Odometer Runs (km)</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyDistData} margin={{ left: -25, top: 10 }}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006A6A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#006A6A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#4B5563" }} stroke="rgba(0,0,0,0.1)" />
                <YAxis tick={{ fontSize: 10, fill: "#4B5563" }} stroke="rgba(0,0,0,0.1)" />
                <Tooltip />
                <Area type="monotone" dataKey="distance" stroke="#006A6A" fillOpacity={1} fill="url(#areaColor)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bar Chart */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-4 text-left">
          <h5 className="text-[13px] font-extrabold text-[#111827] dark:text-slate-100 uppercase tracking-wide">Monthly Completed Trips</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTripsData} margin={{ left: -25, top: 10 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#4B5563" }} stroke="rgba(0,0,0,0.1)" />
                <YAxis tick={{ fontSize: 10, fill: "#4B5563" }} stroke="rgba(0,0,0,0.1)" />
                <Tooltip />
                <Bar dataKey="runs" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Pie Chart */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-4 text-left">
          <h5 className="text-[13px] font-extrabold text-[#111827] dark:text-slate-100 uppercase tracking-wide">Performance Delivery Score</h5>
          <div className="h-48 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceScoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceScoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Delay log stop modal */}
      <Modal isOpen={stopModalOpen} onClose={() => setStopModalOpen(false)} title="Log Transit Delay Stop" size="md">
        <div className="space-y-4 text-left">
          <p className="text-xs text-[#4B5563] dark:text-[#94A3B8]">Select the operational block delay reason to log GPS status telemetry.</p>
          <div className="space-y-1.5 text-left">
            <label className="text-[13px] font-extrabold text-[#111827] dark:text-[#CBD5E1] uppercase">Reason for Stop</label>
            <select
              value={selectedReason}
              onChange={e => setSelectedReason(e.target.value)}
              className="w-full px-4 h-12 text-sm border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
            >
              <option>Traffic Congestion</option>
              <option>Vehicle Servicing / Flat Tyre</option>
              <option>Octroi / Toll Clearance Block</option>
              <option>Driver Meal / Rest Break</option>
              <option>Extreme Weather Halts</option>
            </select>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5E7EB] dark:border-[#334155]">
            <Button variant="outline" onClick={() => setStopModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (activeTrip) {
                  updateTripStatus(activeTrip.id, 'Delayed' as any, { stopReason: selectedReason });
                  triggerNotification('Trip Started', 'Delay Warning logged', `Reason: ${selectedReason}`, 'Warning');
                }
                setStopModalOpen(false);
              }}
            >
              Log Stop Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Break Selection Modal */}
      <Modal isOpen={breakModalOpen} onClose={() => setBreakModalOpen(false)} title="Start Break Authorization" size="md">
        <div className="space-y-4 text-left">
          <p className="text-xs text-[#4B5563] dark:text-[#94A3B8]">Select the type of break to capture and log duty tracking telemetry.</p>
          <div className="space-y-1.5 text-left">
            <label className="text-[13px] font-extrabold text-[#111827] dark:text-[#CBD5E1] uppercase">Break Category</label>
            <select
              value={breakType}
              onChange={e => setBreakType(e.target.value)}
              className="w-full px-4 h-12 text-sm border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
            >
              <option value="Lunch Break">Lunch</option>
              <option value="Fuel Stop">Fuel Stop</option>
              <option value="Traffic Jam">Traffic</option>
              <option value="Vehicle Issue">Vehicle Issue</option>
              <option value="Rest Break">Rest Break</option>
              <option value="Emergency Stop">Emergency</option>
              <option value="Other Stop">Other</option>
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[13px] font-extrabold text-[#111827] dark:text-[#CBD5E1] uppercase">Remarks / Notes</label>
            <textarea
              value={breakRemarks}
              onChange={e => setBreakRemarks(e.target.value)}
              placeholder="Provide context or comments for break log..."
              rows={2}
              className="w-full px-4 py-3 text-sm border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium resize-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5E7EB] dark:border-[#334155]">
            <Button variant="outline" onClick={() => setBreakModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStartBreak}
            >
              Authorize Break
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


