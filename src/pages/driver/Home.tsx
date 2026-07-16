import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOperations } from '../../store/OperationsContext';
import { Table } from '../../components/ui/Table';
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

  // Recharts mock datasets
  const weeklyDistData = [
    { day: 'Mon', distance: 180 },
    { day: 'Tue', distance: 220 },
    { day: 'Wed', distance: 195 },
    { day: 'Thu', distance: 240 },
    { day: 'Fri', distance: 310 },
    { day: 'Sat', distance: 150 },
    { day: 'Sun', distance: 80 },
  ];

  const monthlyTripsData = [
    { month: 'Jan', runs: 12 },
    { month: 'Feb', runs: 15 },
    { month: 'Mar', runs: 14 },
    { month: 'Apr', runs: 19 },
    { month: 'May', runs: 22 },
    { month: 'Jun', runs: driverTrips.length || 18 },
  ];

  const fuelConsumptionData = [
    { week: 'Wk 1', usage: 140 },
    { week: 'Wk 2', usage: 155 },
    { week: 'Wk 3', usage: 130 },
    { week: 'Wk 4', usage: 172 },
  ];

  const performanceScoreData = [
    { name: 'On Time Delivery', value: 85, color: 'var(--color-primary)' },
    { name: 'Delayed Delivery', value: 10, color: 'var(--color-warning)' },
    { name: 'Failed Delivery', value: 5, color: 'var(--color-danger)' },
  ];

  const isOffDuty = currentDutyStatus === 'Off Duty' && !todayRecord?.checkOut;
  const isDutyEnded = todayRecord && todayRecord.checkOut;

  if (isDutyEnded) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-405 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 animate-fade-in">Check-Out Successful</h3>
            <p className="text-xs text-slate-400">Shift log processed. Metrics synced to Owner Dashboard.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Worked Time</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block mt-1">{todayRecord.workingHours} hrs</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Overtime</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block mt-1">{todayRecord.overtime} hrs</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Break Duration</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block mt-1">{todayRecord.breakDuration} mins</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance covered</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block mt-1">{todayRecord.distanceCovered} km</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuel Consumed</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block mt-1">{todayRecord.fuelUsed} L</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Safety Score</span>
              <span className="text-sm font-bold text-emerald-605 dark:text-emerald-400 block mt-1">{todayRecord.performanceScore}%</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl text-xs flex justify-between items-center text-left border border-gray-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-705 dark:text-slate-200">Calculated Attendance Status</p>
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
    <div className="space-y-8">
      {/* Real-time Duty tracking status strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            currentDutyStatus === 'On Duty' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
            currentDutyStatus === 'On Trip' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' :
            currentDutyStatus === 'On Break' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' : 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400'
          }`}>
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Duty Status</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{currentDutyStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Check-In Time</span>
            <span className="font-bold text-slate-800 text-sm font-mono">{todayRecord?.checkIn || '--'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 shrink-0">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Break Duration</span>
            <span className="font-bold text-slate-800 text-sm font-mono">{todayRecord?.breakDuration || 0} mins</span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {currentDutyStatus === 'On Break' ? (
            <Button
              onClick={handleEndBreak}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Resume Duty
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setBreakModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl border border-transparent"
              >
                Start Break
              </Button>
              <Button
                onClick={handleEndDuty}
                isLoading={isEndingDuty}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl border border-transparent"
              >
                End Duty
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Restructured Banner with Welcome & Attendance Card side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card & Quick Actions (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 p-6 md:p-8 rounded-3xl text-white shadow-xl min-h-[220px]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Operator Shift Active
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight font-sans">Welcome, {user?.fullName || 'Rajesh Kumar'}</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
              You are assigned to container vehicle <span className="text-slate-200 font-semibold">{driverVehicle?.vehicleNumber || 'MH-12-QW-9874'}</span>. 
              GPS tracking loop and automatic checkpoint verification logs are active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 mt-6">
            <Button
              onClick={handleStatusTransition}
              disabled={!activeTrip}
              className="bg-blue-600 hover:bg-blue-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer border border-transparent"
            >
              <Play className="h-4 w-4" /> Start/Next Step
            </Button>
            <Button
              onClick={() => setStopModalOpen(true)}
              disabled={!activeTrip || activeTrip.status !== 'In Transit'}
              className="bg-slate-800 hover:bg-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4" /> Log Delay Stop
            </Button>
            <a href="#pod-section">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer border border-transparent">
                <FileText className="h-4 w-4" /> Upload POD
              </Button>
            </a>
          </div>
        </div>

        {/* Today's Attendance Card (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="space-y-3.5 text-left">
            <div className="flex justify-between items-center pb-2.5 border-b border-gray-50 dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block">Today's Attendance</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 text-[10px] font-extrabold flex items-center gap-1.5 border border-emerald-100/50 dark:border-emerald-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Present
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Status</span>
                <span className="font-extrabold text-slate-805 dark:text-slate-202 flex items-center gap-1 mt-0.5">
                  🟢 Present
                </span>
              </div>
              
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Check-In</span>
                <span className="font-bold text-slate-750 dark:text-slate-300 block mt-0.5 font-mono">
                  {todayRecord?.checkInTime || todayRecord?.checkIn || '09:05 AM'}
                </span>
              </div>
              
              <div className="col-span-2">
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Working Hours</span>
                <span className="font-black text-slate-805 dark:text-slate-202 block mt-0.5 font-mono text-sm tracking-tight text-blue-600 dark:text-blue-400">
                  {liveWorkingTime}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Location</span>
                <span className="font-bold text-slate-750 dark:text-slate-300 block mt-0.5 truncate max-w-[220px]" title={todayRecord?.address || todayRecord?.checkInWarehouse || 'Pune Warehouse'}>
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
                className="w-full bg-red-650 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl border border-transparent flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5" /> End Duty
              </Button>
            ) : (
              <div className="text-center py-2.5 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-805/80 rounded-xl">
                Shift Duty Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: "Today's Assignments", val: driverTrips.length, sub: "Cargo runs", trend: "0% deviation", color: "text-blue-600", bg: "bg-blue-50" },
          { name: "Completed Runs", val: completedTrips.length, sub: "Deliveries closed", trend: "+12% this week", color: "text-emerald-600", bg: "bg-emerald-50" },
          { name: "Active Run Status", val: activeTrip ? activeTrip.status : 'None', sub: activeTrip?.tripNumber || '--', trend: "Real-time updates", color: "text-amber-600", bg: "bg-amber-50" },
          { name: "Distance Covered", val: `${340} km`, sub: "This week's log", trend: "Target: 500km", color: "text-indigo-600", bg: "bg-indigo-50" },
          { name: "Fuel Remaining", val: `${driverVehicle?.fuelLevel || 78}%`, sub: "Diesel yard status", trend: "Good range", color: "text-orange-600", bg: "bg-orange-50" },
          { name: "Duty Hours", val: "7.5 hrs", sub: "Shift time logging", trend: "Under safety limits", color: "text-sky-600", bg: "bg-sky-50" },
          { name: "Deliveries Completed", val: completedTrips.length, sub: "Consignments handed", trend: "100% success", color: "text-violet-600", bg: "bg-violet-50" },
          { name: "Pending Deliveries", val: driverTrips.filter(t => t.status !== 'Completed').length, sub: "Awaiting dispatch", trend: "Action required", color: "text-rose-600", bg: "bg-rose-50" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-3 rounded-xl shrink-0 ${card.bg} ${card.color}`}>
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase block">{card.name}</span>
              <h4 className="text-base font-bold text-slate-808 dark:text-white mt-0.5 truncate max-w-[150px]">{card.val}</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{card.sub} • <span className="text-emerald-600 dark:text-emerald-400">{card.trend}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: GPS Vector Map (70%) + Telemetry Panel (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive GPS map */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-55 dark:border-slate-800 pb-3 text-left">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600 animate-spin-slow" /> Interactive Route Navigation
            </h4>
            <Badge variant="info">Speed: 64 km/h</Badge>
          </div>

          <div className="h-100 bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 flex flex-col justify-between p-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
            
            {/* SVG Path Route Pune to Mumbai */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 350">
              <path
                d="M 50,300 L 150,250 L 250,150 L 350,120 L 450,50"
                fill="none"
                stroke="#334155"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 50,300 L 150,250 L 250,150"
                fill="none"
                stroke="#2563EB"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="50" cy="300" r="5" fill="#64748B" />
              <circle cx="150" cy="250" r="5" fill="#2563EB" />
              <circle cx="250" cy="150" r="5" fill="#EF4444" />
              <circle cx="350" cy="120" r="5" fill="#64748B" />
              <circle cx="450" cy="50" r="6" fill="#10B981" />
            </svg>

            {/* Labels floating */}
            <div className="absolute bottom-16 left-8 text-[9px] text-slate-400 font-bold">Pune Whse A</div>
            <div className="absolute top-16 right-16 text-[9px] text-emerald-400 font-bold flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Mumbai terminal
            </div>

            {/* Live truck pointer */}
            <div className="absolute top-36 left-48 flex flex-col items-center">
              <span className="bg-blue-600 text-white font-mono font-bold text-[8px] px-1.5 py-0.5 rounded border border-blue-400 shadow">
                {driverVehicle?.vehicleNumber || 'MH-12'}
              </span>
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center border border-white shadow-lg animate-bounce">
                <Navigation className="h-2.5 w-2.5 rotate-45" />
              </div>
            </div>

            <div className="relative z-10 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 text-white border border-slate-800 flex justify-between items-center text-left">
              <div className="text-xs">
                <p className="text-[10px] text-slate-400">Destination Point</p>
                <p className="font-bold truncate max-w-[200px]">{activeTrip?.dropLocation || 'Distribution Center'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">ETA Clock</p>
                <p className="font-bold font-mono text-blue-400">{activeTrip?.eta || '16:45 PM'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 pb-3 border-b border-gray-50 dark:border-slate-800 flex items-center gap-2 text-left">
              <Activity className="h-5 w-5 text-blue-600" /> Active Trip Telemetry
            </h4>

            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Consignment Code</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeTrip?.tripNumber || 'None'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Trip Stage Status</span>
                <Badge variant="warning">{activeTrip?.status || 'Idle'}</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Odometer Reading</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{(driverVehicle?.odometer || 48200).toLocaleString()} km</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Fuel Level</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{driverVehicle?.fuelLevel || 78}%</span>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>Trip Progress</span>
                  <span>{activeTrip ? `${Math.max(10, 100 - Math.floor(activeTrip.distanceRemaining / 4.8))}%` : '0%'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${activeTrip ? Math.max(10, 100 - Math.floor(activeTrip.distanceRemaining / 4.8)) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 space-y-2 text-left">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-600" /> Safety Score Card
            </h5>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Weekly Driver Rating</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">98.4% (Class A)</span>
            </div>
          </div>
        </div>
      </div>      {/* Row 3: Today's Dispatch Schedule summary */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Today's Dispatch Schedule</h4>
          <span className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-450 font-bold px-2 py-0.5 rounded-full">
            {driverTrips.length} active assignments
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {driverTrips.slice(0, 3).map((trip, idx) => (
            <div key={idx} className="p-4 border border-gray-100 dark:border-slate-800 rounded-2xl space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">{trip.tripNumber}</span>
                <Badge variant={trip.status === 'Completed' ? 'success' : trip.status === 'In Transit' ? 'info' : 'warning'}>
                  {trip.status}
                </Badge>
              </div>
              <div className="text-xs space-y-1 text-slate-505 dark:text-slate-400">
                <p className="font-semibold text-slate-700 dark:text-slate-300 block">{trip.pickupLocation} → {trip.dropLocation}</p>
                <p className="text-[10px] text-slate-405 dark:text-slate-500 block">Material: {trip.material} ({trip.weight})</p>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-gray-55 dark:border-slate-800 text-[11px]">
                <span className="text-slate-400 dark:text-slate-500">ETA: <span className="font-semibold font-mono text-slate-600 dark:text-slate-350">{trip.eta}</span></span>
                <a
                  href={`tel:${trip.customerPhone}`}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5"
                >
                  <Phone className="h-3 w-3" /> Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 6: Live Shift Activity Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6 text-left">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Operator Shift Checkpoint Logs</h4>
        
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-slate-100 dark:bg-slate-800" />

          {[
            { title: "Trip Started", desc: `Departed from Pune Warehouse yard`, time: "08:12 AM", active: true },
            { title: "Reached Pickup Location", desc: `Arrived at Consignor industrial loading dock`, time: "09:30 AM", active: true },
            { title: "Cargo Loading & Lashing Completed", desc: `Secured container seals and locked RC manifest`, time: "10:45 AM", active: true },
            { title: "Transit Highway Run", desc: `Currently at Mumbai-Pune highway coordinates`, time: "In Transit", active: activeTrip?.status === 'In Transit' },
            { title: "Consignee POD Verification Awaiting", desc: `Signature collection and image uploads pending`, time: "--:--", active: false },
          ].map((mile, index) => (
            <div key={index} className="relative flex justify-between items-start gap-4">
              <span className={`absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                mile.active ? 'bg-blue-600 ring-4 ring-blue-50 dark:ring-blue-950/40' : 'bg-slate-200 dark:bg-slate-800'
              }`} />
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-slate-805 dark:text-slate-200">{mile.title}</h5>
                <p className="text-[11px] text-slate-405 dark:text-slate-500">{mile.desc}</p>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">{mile.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 7: Analytics charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: Area Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm md:col-span-2 space-y-4 text-left">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Weekly Odometer Runs (km)</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyDistData}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} stroke="var(--color-border)" />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} stroke="var(--color-border)" />
                <Tooltip />
                <Area type="monotone" dataKey="distance" stroke="var(--color-primary)" fillOpacity={1} fill="url(#areaColor)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 text-left">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Monthly Completed Trips</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTripsData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} stroke="var(--color-border)" />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} stroke="var(--color-border)" />
                <Tooltip />
                <Bar dataKey="runs" fill="var(--color-fleet)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 text-left">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Performance Delivery Score</h5>
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
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Select the operational block delay reason to log GPS status telemetry.</p>
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-505 dark:text-slate-405 uppercase">Reason for Stop</label>
            <select
              value={selectedReason}
              onChange={e => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option>Traffic Congestion</option>
              <option>Vehicle Servicing / Flat Tyre</option>
              <option>Octroi / Toll Clearance Block</option>
              <option>Driver Meal / Rest Break</option>
              <option>Extreme Weather Halts</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 dark:border-slate-800">
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
        <div className="space-y-4">
          <p className="text-xs text-slate-505 dark:text-slate-400">Select the type of break to capture and log duty tracking telemetry.</p>
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-405 uppercase">Break Category</label>
            <select
              value={breakType}
              onChange={e => setBreakType(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-gray-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
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
            <label className="text-xs font-bold text-slate-505 dark:text-slate-405 uppercase">Remarks / Notes</label>
            <textarea
              value={breakRemarks}
              onChange={e => setBreakRemarks(e.target.value)}
              placeholder="Provide context or comments for break log..."
              rows={2}
              className="w-full px-3 py-2.5 text-xs border border-gray-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 dark:border-slate-800">
            <Button variant="outline" onClick={() => setBreakModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStartBreak}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Authorize Break
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
