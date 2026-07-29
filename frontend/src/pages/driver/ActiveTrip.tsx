<<<<<<< HEAD
﻿import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useState, useEffect, useRef } from 'react';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
import { motion, AnimatePresence } from 'framer-motion';
import { useOperations } from '../../store/OperationsContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Navigation,
  Phone,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PenTool,
  RotateCw,
  Compass,
  Map,
  Target,
  ShieldAlert,
  Sparkles,
  Camera,
<<<<<<< HEAD
  UserCheck,
  Package,
  Activity,
  ArrowRight,
  Send,
  PhoneCall,
  CheckCircle
} from 'lucide-react';
import { Trip } from '../../types';
=======
  ArrowRight,
  PhoneCall,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Trip, TripStop } from '../../types';
import { GoogleDriverMap } from '../../components/common/GoogleDriverMap';
import { api } from '../../api/client';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a

export const ActiveTrip: React.FC = () => {
  const { trips, vehicles, user, updateTripStatus, triggerNotification } = useOperations();

  const [isLoading, setIsLoading] = useState<boolean>(true);
<<<<<<< HEAD
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Modals
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Traffic Congestion');
  const [podModalOpen, setPodModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
=======

  // Modals & Permissions
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [gpsPermissionState, setGpsPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Traffic Congestion Blockage');
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentType, setIncidentType] = useState('Vehicle Mechanical Issue');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [podModalOpen, setPodModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [geofenceError, setGeofenceError] = useState<string | null>(null);
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a

  // POD state
  const [photoMockUrl, setPhotoMockUrl] = useState<string | null>(null);
  const [signatureSaved, setSignatureSaved] = useState<string | null>(null);

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Simulate loading state on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
<<<<<<< HEAD
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter active trip for current driver or default first active
  const driverActiveTrip = trips.find(
    t => (t.driverId === user?.driverId || t.driverId === 'd1') &&
         t.status !== 'Completed' &&
         (t.status as any) !== 'Cancelled'
  ) || trips.find(t => t.status !== 'Completed' && (t.status as any) !== 'Cancelled');

  const driverVehicle = vehicles.find(v => v.vehicleNumber === driverActiveTrip?.vehicleNumber) || vehicles[0];

  // Canvas drawing for POD signature
=======
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Filter active trip for current driver
  const driverId = user?.driverId || user?.id || 'DRV-9041';
  const driverActiveTrip = trips.find(
    t => (t.driverId === driverId || t.driverId === 'd1' || t.driverId === 'DRV-9041') &&
      t.status !== 'Completed' &&
      t.status !== 'Cancelled'
  ) || trips.find(t => t.status !== 'Completed' && t.status !== 'Cancelled');

  const [isGpsTracking, setIsGpsTracking] = useState<boolean>(true);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number; speed?: number; heading?: number; accuracy?: number; address?: string }>({
    lat: 18.5204,
    lng: 73.8567,
    speed: 45,
    heading: 90,
    accuracy: 10,
    address: driverActiveTrip?.pickupLocation || 'Pune DC Logistics Hub'
  });

  // Check Geolocation Support & Permission State
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsPermissionState('unsupported');
    }
  }, []);

  // Real-Time Browser Geolocation Watcher with Throttled Transmission
  useEffect(() => {
    if (!isGpsTracking || !driverActiveTrip) return;

    let lastSent = 0;
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          setGpsPermissionState('granted');
          const { latitude, longitude, speed, heading, accuracy } = position.coords;
          const currentSpeed = speed ? Math.round(speed * 3.6) : 42;
          const currentHeading = heading || 90;

          setLiveCoords(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            accuracy: accuracy || 10,
            speed: currentSpeed,
            heading: currentHeading
          }));

          // Send update to backend max once every 10 seconds or when position updates
          const now = Date.now();
          if (now - lastSent > 8000) {
            lastSent = now;
            try {
              const updatedTrip = await api.trips.updateLocation({
                id: driverActiveTrip.id,
                latitude,
                longitude,
                accuracy: accuracy || 10,
                speed: currentSpeed,
                heading: currentHeading,
                timestamp: new Date().toISOString()
              });
              if (updatedTrip && updatedTrip.currentAddress) {
                setLiveCoords(prev => ({ ...prev, address: updatedTrip.currentAddress }));
              }
            } catch (e) {
              console.warn('Location streaming update paused:', e);
            }
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setGpsPermissionState('denied');
          }
          console.warn('Browser geolocation notification:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isGpsTracking, driverActiveTrip]);

  const requestGpsPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsPermissionState('granted');
          setShowPermissionModal(false);
        },
        err => {
          if (err.code === err.PERMISSION_DENIED) {
            setGpsPermissionState('denied');
          }
        }
      );
    } else {
      setGpsPermissionState('unsupported');
    }
  };

  // Canvas drawing setup for POD signature
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  useEffect(() => {
    if (!podModalOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0B1C30';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    const getCoords = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDraw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const coords = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      isDrawingRef.current = true;
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const coords = getCoords(e);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    };

    const stopDraw = () => {
      isDrawingRef.current = false;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseleave', stopDraw);
    };
  }, [podModalOpen]);

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureSaved(null);
    }
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    const base64 = canvasRef.current.toDataURL('image/png');
    setSignatureSaved(base64);
<<<<<<< HEAD
    triggerNotification('Trip Started', 'Signature Saved', 'Customer digital signature recorded successfully.', 'Info');
=======
    triggerNotification('Trip Started', 'Signature Saved', 'Digital consignee signature captured.', 'Info');
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  };

  const handleMockPhotoCapture = () => {
    setPhotoMockUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80');
<<<<<<< HEAD
    triggerNotification('Trip Started', 'Cargo Inspection Uploaded', 'High-res cargo snapshot captured.', 'Info');
  };

  const handleStopLog = () => {
    if (!driverActiveTrip) return;
    updateTripStatus(driverActiveTrip.id, 'Delayed' as any, { stopReason: selectedReason });
    setStopModalOpen(false);
    triggerNotification('Critical', 'Incident Halt Logged', `Trip delayed due to: ${selectedReason}`, 'Warning');
=======
    triggerNotification('Trip Started', 'Cargo Photo Uploaded', 'Consignment inspection snapshot saved.', 'Info');
  };

  const handleStopLog = async () => {
    if (!driverActiveTrip) return;
    try {
      await api.trips.reportDelay(driverActiveTrip.id, selectedReason);
      setStopModalOpen(false);
      triggerNotification('Critical', 'Incident Halt Logged', `Trip delayed due to: ${selectedReason}`, 'Warning');
    } catch (e: any) {
      alert(e.message || 'Failed to log delay.');
    }
  };

  const handleReportIncident = async () => {
    if (!driverActiveTrip) return;
    try {
      await api.trips.reportIncident(driverActiveTrip.id, incidentType, incidentDesc);
      setIncidentModalOpen(false);
      setIncidentDesc('');
      triggerNotification('Critical', 'INCIDENT REPORT DISPATCHED', `Incident type: ${incidentType}`, 'Error');
    } catch (e: any) {
      alert(e.message || 'Failed to dispatch incident report.');
    }
  };

  const handleArriveStopGeofence = async (stopId?: string) => {
    if (!driverActiveTrip) return;
    setGeofenceError(null);

    const targetStopId = stopId || (driverActiveTrip.stops && driverActiveTrip.stops[0] ? driverActiveTrip.stops[0]._id || '1' : '1');
    try {
      await api.trips.arriveStop(driverActiveTrip.id, targetStopId, {
        latitude: liveCoords.lat,
        longitude: liveCoords.lng
      });
      triggerNotification('Trip Started', 'Reached Destination Stop', 'Arrived at stop. Geofence radius verified.', 'Info');
    } catch (err: any) {
      setGeofenceError(err.message || 'Outside delivery location range.');
    }
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  };

  const handleNextStatus = async () => {
    if (!driverActiveTrip) return;
    const statusFlow: Array<Trip['status']> = [
      'Assigned',
      'Accepted',
      'Started',
<<<<<<< HEAD
      'Reached Pickup',
      'Loaded',
      'In Transit',
      'Reached Destination',
=======
      'In Transit',
      'At Stop',
      'Delivered',
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      'Completed'
    ];

    const currentIdx = statusFlow.indexOf(driverActiveTrip.status);
    const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : 'In Transit';

    await updateTripStatus(driverActiveTrip.id, nextStatus);
    triggerNotification('Trip Started', 'Milestone Updated', `Trip status advanced to: ${nextStatus}`, 'Info');
  };

  const handleSubmitPOD = async () => {
    if (!driverActiveTrip) return;
    await updateTripStatus(driverActiveTrip.id, 'Completed', {
      signatureData: signatureSaved || 'Digital Signature Signed',
      photo: photoMockUrl || 'Cargo Verification Photo'
    });
    setPodModalOpen(false);
    triggerNotification('Trip Started', 'POD Transmitted', `Proof of delivery transmitted for trip ${driverActiveTrip.tripNumber}.`, 'Info');
  };

  const handleSOSAlert = () => {
    setSosModalOpen(false);
    triggerNotification('Critical', 'EMERGENCY SOS SENT', 'Emergency alert dispatched to Control Desk and Owner Dashboard.', 'Error');
  };

  const statusMilestones = [
    { label: 'Assigned', status: 'Assigned' },
    { label: 'Accepted', status: 'Accepted' },
<<<<<<< HEAD
    { label: 'Started', status: 'Started' },
    { label: 'Pickup Point', status: 'Reached Pickup' },
    { label: 'Loaded', status: 'Loaded' },
    { label: 'In Transit', status: 'In Transit' },
    { label: 'Reached Dest', status: 'Reached Destination' },
=======
    { label: 'In Transit', status: 'In Transit' },
    { label: 'At Waypoint Stop', status: 'At Stop' },
    { label: 'Delivered', status: 'Delivered' },
    { label: 'Completed', status: 'Completed' }
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  ];

  const getActiveStepIndex = () => {
    if (!driverActiveTrip) return 0;
<<<<<<< HEAD
    const current = driverActiveTrip.status;
    if ((current as any) === 'Delayed') return 4;
    const idx = statusMilestones.findIndex(m => m.status === current);
    return idx >= 0 ? idx : 5;
  };

  // 1. SKELETON LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse text-left p-2">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl lg:col-span-2" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
=======
    const st = driverActiveTrip.status;
    if (st === 'Assigned') return 0;
    if (st === 'Accepted') return 1;
    if (st === 'Started' || st === 'In Transit' || st === 'Reached Pickup' || st === 'Loaded') return 2;
    if (st === 'At Stop') return 3;
    if (st === 'Reached Destination' || st === 'Delivered') return 4;
    if (st === 'Completed') return 5;
    return 2;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-left">
        <div className="w-10 h-10 border-4 border-[#006A6A]/20 border-t-[#006A6A] rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#6D7A79] uppercase tracking-wider">Syncing GPS Telemetry Stream...</span>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      </div>
    );
  }

<<<<<<< HEAD
  // 2. ERROR STATE
  if (hasError) {
    return (
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto mt-12 shadow-md">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-red-900 dark:text-red-200">Failed to Load Active Trip Telemetry</h3>
        <p className="text-xs text-red-700 dark:text-red-300">An API connection issue occurred while syncing telemetry coordinates.</p>
        <Button variant="danger" onClick={() => { setHasError(false); setIsLoading(true); setTimeout(() => setIsLoading(false), 500); }}>
          <RotateCw className="h-4 w-4 mr-2" /> Retry Connection
        </Button>
      </div>
    );
  }

  // 3. EMPTY STATE
  if (!driverActiveTrip) {
    return (
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-12 text-center max-w-2xl mx-auto my-12 shadow-sm space-y-6">
        <div className="w-20 h-20 bg-teal-50 dark:bg-teal-950/40 rounded-full flex items-center justify-center mx-auto border border-teal-200 dark:border-teal-800">
          <Truck className="h-10 w-10 text-[#006A6A] dark:text-[#14B8A6]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-[#0B1C30] dark:text-slate-100">No Active Trip Assignment</h3>
          <p className="text-xs text-[#6D7A79] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            You currently have no ongoing trip assignments or consignments scheduled for active transit. Check back later or contact your Fleet Dispatcher.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 400); }}
          className="px-6 py-2.5 rounded-xl font-bold"
        >
          <RotateCw className="h-4 w-4 mr-2" /> Refresh Manifest Sync
        </Button>
=======
  // Empty state
  if (!driverActiveTrip) {
    return (
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-2xl p-12 text-center max-w-2xl mx-auto my-12 shadow-sm space-y-6">
        <div className="w-20 h-20 bg-[#006A6A]/10 rounded-full flex items-center justify-center mx-auto border border-[#006A6A]/20">
          <Truck className="h-10 w-10 text-[#006A6A] dark:text-[#7DF5F5]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-[#111827] dark:text-[#F8FAFC]">No Active Trip Assignment</h3>
          <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed font-medium">
            You currently have no ongoing trip assignments scheduled for active transit. Check back later or contact your Fleet Dispatcher.
          </p>
        </div>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      </div>
    );
  }

<<<<<<< HEAD
  const activeStepIdx = getActiveStepIndex();
  const progressPercent = Math.min(100, Math.max(10, Math.round(((activeStepIdx + 1) / statusMilestones.length) * 100)));

  return (
    <div className="space-y-8 animate-fade-in text-left">
=======
  const handleStartTrip = async () => {
    if (!driverActiveTrip) return;
    try {
      await updateTripStatus(driverActiveTrip.id, 'In Transit');
      setIsGpsTracking(true);
      requestGpsPermission();
      triggerNotification('Trip Started', 'Delivery In Progress', 'Location tracking is active for this delivery.', 'Info');
    } catch (err: any) {
      alert(err.message || 'Failed to start trip.');
    }
  };

  const handleStopTrip = async () => {
    if (!driverActiveTrip) return;
    try {
      setIsGpsTracking(false);
      setPodModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to stop trip.');
    }
  };

  const activeStepIdx = getActiveStepIndex();
  const progressPercent = Math.min(100, Math.max(15, Math.round(((activeStepIdx + 1) / statusMilestones.length) * 100)));

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Location Permission Warning Bar / Status Bar */}
      {gpsPermissionState === 'denied' ? (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span><strong>Location Permission Required:</strong> Location permission is required to track this active delivery.</span>
          </div>
          <Button variant="primary" size="sm" onClick={requestGpsPermission} className="bg-amber-600 text-white text-xs py-1">
            Try Again
          </Button>
        </div>
      ) : gpsPermissionState === 'unsupported' ? (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 text-red-800 dark:text-red-300 flex items-center gap-2 text-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span><strong>Unsupported Device:</strong> Live GPS tracking is not supported on this device.</span>
        </div>
      ) : isGpsTracking && driverActiveTrip?.status !== 'Completed' && driverActiveTrip?.status !== 'Cancelled' ? (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Location tracking is active for this delivery.</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
            🎯 {liveCoords.accuracy || 10}m Accuracy · ⚡ {liveCoords.speed || 0} km/h
          </span>
        </div>
      ) : null}

>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
<<<<<<< HEAD
            <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-slate-100 tracking-tight leading-none">
              Active Trip Console
=======
            <h2 className="text-[26px] font-extrabold text-[#111827] dark:text-[#F8FAFC] tracking-tight leading-none">
              Active Trip Navigation Console
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            </h2>
            <Badge variant={driverActiveTrip.status === 'In Transit' ? 'info' : 'warning'} className="px-3 py-1 font-mono text-xs">
              {driverActiveTrip.status}
            </Badge>
          </div>
<<<<<<< HEAD
          <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">
            Live consignment telemetry, waypoint guidance, and milestone operational controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 400); }}
            className="text-xs bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] text-slate-700 dark:text-[#F8FAFC]"
          >
            <RotateCw className="h-3.5 w-3.5 mr-1.5" /> Sync Coordinates
=======
          <p className="text-[13px] text-[#4B5563] dark:text-[#94A3B8] mt-1.5 font-medium">
            Live consignment telemetry, waypoint guidance, and geofenced delivery controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {driverActiveTrip.status !== 'In Transit' && driverActiveTrip.status !== 'Completed' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartTrip}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md py-2 px-4"
            >
              <Navigation className="h-4 w-4 mr-1.5" /> START TRIP
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopTrip}
              className="text-xs border-emerald-600 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-sm py-2 px-4"
            >
              <CheckCircle className="h-4 w-4 mr-1.5 text-emerald-600" /> STOP / END TRIP
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIncidentModalOpen(true)}
            className="text-xs bg-red-600 text-white shadow-md font-bold"
          >
            <ShieldAlert className="h-4 w-4 mr-1.5" /> Report Incident
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setSosModalOpen(true)}
<<<<<<< HEAD
            className="text-xs bg-red-600 text-white shadow-md shadow-red-500/20"
          >
            <ShieldAlert className="h-4 w-4 mr-1.5 animate-pulse" /> Emergency SOS
=======
            className="text-xs bg-red-700 text-white shadow-md font-bold"
          >
            <AlertTriangle className="h-4 w-4 mr-1.5 animate-pulse" /> Emergency SOS
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
          </Button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Main Grid: Trip Card & Navigation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Current Trip Card (2 Cols) */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-6 lg:col-span-2 text-left">
          
          {/* Card Top Details Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Consignment Reference</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-mono font-extrabold text-[#0B1C30] dark:text-slate-100">
                  {driverActiveTrip.tripNumber}
                </span>
                <span className="text-xs font-mono font-bold text-[#006A6A] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                  ORD-8841
=======
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Trip Overview Card */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-6 lg:col-span-2 text-left">
          {/* Card Top Details Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-[#334155] pb-4">
            <div>
              <span className="text-[10px] font-extrabold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-widest block">Consignment Reference</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-mono font-extrabold text-[#111827] dark:text-[#F8FAFC]">
                  {driverActiveTrip.tripNumber}
                </span>
                <span className="text-xs font-mono font-bold text-[#006A6A] dark:text-[#7DF5F5] bg-[#006A6A]/10 px-2 py-0.5 rounded-md border border-[#006A6A]/20">
                  {driverActiveTrip.invoiceNumber || 'INV-LOGISTICS'}
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
                </span>
              </div>
            </div>

            <div className="text-right">
<<<<<<< HEAD
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assigned Truck</span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-[#F8FAFC] block mt-0.5">
                {driverActiveTrip.vehicleNumber || driverVehicle?.vehicleNumber || 'MH-12-QW-9874'}
=======
              <span className="text-[10px] font-extrabold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-widest block">Assigned Truck</span>
              <span className="text-sm font-mono font-extrabold text-slate-800 dark:text-white block mt-0.5">
                {driverActiveTrip.vehicleNumber}
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
              </span>
            </div>
          </div>

<<<<<<< HEAD
          {/* Pickup & Drop Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/40 text-xs">
              <div className="flex items-center gap-2 text-[#006A6A] dark:text-[#14B8A6] font-bold uppercase text-[10px] tracking-wider">
                <MapPin className="h-4 w-4" /> Pickup Point Address
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-100 mt-1.5 text-xs">
                {driverActiveTrip.pickupLocation || 'Primary Warehouse Yard, Pune, MH'}
              </p>
              <p className="text-[11px] text-[#6D7A79] mt-1 font-semibold">Scheduled Load: 08:30 AM</p>
            </div>

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                <Navigation className="h-4 w-4 rotate-45" /> Drop Point Address
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-100 mt-1.5 text-xs">
                {driverActiveTrip.dropLocation || 'Distribution Center DC-4, Mumbai, MH'}
              </p>
              <p className="text-[11px] text-[#6D7A79] mt-1 font-semibold">ETA Clock: {driverActiveTrip.eta || '16:45 PM'}</p>
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pt-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Consignee Customer</span>
              <span className="font-bold text-slate-700 dark:text-[#F8FAFC] block mt-0.5">{driverActiveTrip.customerName}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Material Cargo</span>
              <span className="font-bold text-slate-700 dark:text-[#F8FAFC] block mt-0.5">{driverActiveTrip.material} ({driverActiveTrip.weight})</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Distance Left</span>
              <span className="font-bold text-slate-700 dark:text-[#F8FAFC] font-mono block mt-0.5">
                {driverActiveTrip.distanceRemaining} km remaining
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Driver</span>
              <span className="font-bold text-slate-700 dark:text-[#F8FAFC] block mt-0.5">{user?.fullName || 'Rajesh Kumar'}</span>
            </div>
          </div>

          {/* Trip Progress Bar */}
          <div className="space-y-2 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-[#CBD5E1]">Trip Milestone Completion</span>
              <span className="font-mono font-bold text-[#006A6A] dark:text-[#14B8A6]">{progressPercent}%</span>
=======
          {/* Route Pickup & Dropoff Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide block">Pickup Point</span>
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">📍 {driverActiveTrip.pickupLocation}</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 space-y-1">
              <span className="text-[10px] font-extrabold text-red-800 dark:text-red-300 uppercase tracking-wide block">Destination Dropoff</span>
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">🏁 {driverActiveTrip.dropLocation}</p>
            </div>
          </div>

          {/* Geofence Warning if Error Triggered */}
          {geofenceError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{geofenceError}</span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Delivery Progress</span>
              <span className="text-[#006A6A] dark:text-[#7DF5F5]">{progressPercent}% Completed</span>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#006A6A] to-[#14B8A6] rounded-full"
              />
            </div>
          </div>

<<<<<<< HEAD
          {/* Action Bar Buttons */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pt-4">
            
=======
          {/* Operational Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[#E5EEFF] dark:border-[#334155] pt-4">
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            {/* Advance Status Button */}
            {driverActiveTrip.status !== 'Completed' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextStatus}
<<<<<<< HEAD
                className="text-xs py-2.5 rounded-xl font-bold bg-[#006A6A] hover:bg-[#005555] text-white shadow-md shadow-teal-500/10"
=======
                className="text-xs py-2.5 rounded-xl font-bold bg-[#006A6A] hover:bg-[#005555] text-white shadow-md"
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
              >
                <ArrowRight className="h-4 w-4 mr-1.5" /> Advance Status ({driverActiveTrip.status})
              </Button>
            )}

<<<<<<< HEAD
            {/* Google Maps External Navigation */}
=======
            {/* Geofenced Reached Stop */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleArriveStopGeofence()}
              className="text-xs py-2.5 rounded-xl font-bold border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Target className="h-4 w-4 mr-1.5" /> Reached Stop (Geofence Check)
            </Button>

            {/* Google Navigation External */}
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(driverActiveTrip.pickupLocation)}&destination=${encodeURIComponent(driverActiveTrip.dropLocation)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
<<<<<<< HEAD
              <Navigation className="h-4 w-4 text-[#14B8A6]" /> Launch Maps
            </a>

            {/* Direct Call Customer Button */}
            <a
              href={`tel:${driverActiveTrip.customerPhone}`}
              className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <PhoneCall className="h-4 w-4" /> Call Customer ({driverActiveTrip.customerPhone})
            </a>

            {/* Incident Halt Button */}
=======
              <Navigation className="h-4 w-4 text-[#14B8A6]" /> Launch Google Maps
            </a>

            {/* Delay Report */}
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStopModalOpen(true)}
              className="text-xs py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            >
<<<<<<< HEAD
              <AlertTriangle className="h-4 w-4 mr-1" /> Incident Halt
=======
              <AlertTriangle className="h-4 w-4 mr-1" /> Report Delay
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            </Button>

            {/* Upload POD Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPodModalOpen(true)}
              className="text-xs py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
            >
<<<<<<< HEAD
              <PenTool className="h-4 w-4 mr-1" /> Upload / Close POD
=======
              <PenTool className="h-4 w-4 mr-1" /> Upload POD Signature
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            </Button>
          </div>
        </div>

<<<<<<< HEAD
        {/* Right Column: Live Route Stepper & Vector Map (1 Col) */}
        <div className="space-y-6">
          
          {/* Milestone Stepper Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[13px] font-bold text-[#0B1C30] dark:text-slate-100 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Target className="h-4 w-4 text-[#006A6A]" /> Route Milestone Workflow
=======
        {/* Right 1 Column: Map & Stepper */}
        <div className="space-y-6">
          {/* Workflow Stepper Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[13px] font-bold text-[#0B1C30] dark:text-slate-100 border-b border-[#E5EEFF] dark:border-[#334155] pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Target className="h-4 w-4 text-[#006A6A]" /> Route Milestone Lifecycle
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            </h4>

            <div className="flex flex-col gap-3 relative pl-4">
              <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-slate-100 dark:bg-slate-800" />
              {statusMilestones.map((milestone, idx) => {
                const isPast = idx < activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <div
<<<<<<< HEAD
                      className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 z-10 transition-all ${
                        isPast
                          ? 'bg-[#10B981] border-[#10B981]'
                          : isCurrent
                          ? 'bg-[#006A6A] border-[#006A6A] shadow-md shadow-teal-500/30 animate-pulse'
                          : 'bg-white dark:bg-[#0F172A] border-slate-300 dark:border-slate-800'
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        isPast
                          ? 'text-slate-400 dark:text-[#6D7A79] line-through'
                          : isCurrent
                          ? 'text-slate-900 dark:text-slate-100 font-extrabold text-xs'
                          : 'text-slate-400 dark:text-[#545F73]'
                      }`}
=======
                      className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 z-10 transition-all ${isPast
                          ? 'bg-[#10B981] border-[#10B981]'
                          : isCurrent
                            ? 'bg-[#006A6A] border-[#006A6A] shadow-md shadow-teal-500/30 animate-pulse'
                            : 'bg-white dark:bg-[#0F172A] border-slate-300 dark:border-slate-800'
                        }`}
                    />
                    <span
                      className={`font-semibold ${isPast
                          ? 'text-slate-400 dark:text-[#94A3B8] line-through'
                          : isCurrent
                            ? 'text-slate-900 dark:text-slate-100 font-extrabold text-xs'
                            : 'text-slate-400 dark:text-[#64748B]'
                        }`}
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
                    >
                      {milestone.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

<<<<<<< HEAD
          {/* Dynamic Vector GPS Map Container */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-2.5">
              <h4 className="text-[13px] font-bold text-[#0B1C30] dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                <Map className="h-4 w-4 text-[#006A6A]" /> Telemetry GPS Map
              </h4>
              <Badge variant="info" className="text-[10px] font-mono">Live Tracking</Badge>
            </div>

            <div className="h-64 bg-[#0B1C30] rounded-xl relative overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-3.5">
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

              {/* Top floating speed indicator */}
              <div className="relative z-10 flex justify-between items-center">
                <Badge variant="info" className="bg-slate-900/90 text-white border border-slate-800 px-3 py-1 font-mono text-[11px]">
                  Speed: 64 km/h
                </Badge>
                <div className="w-8 h-8 rounded-full bg-slate-950/80 flex items-center justify-center text-slate-400 border border-slate-800">
                  <Compass className="h-4 w-4 animate-spin-slow" />
                </div>
              </div>

              {/* Simulated Vector Map SVG Route */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 240">
                <path
                  d="M 40,200 L 100,160 L 180,120 L 260,80 L 320,40"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 40,200 L 100,160 L 180,120"
                  fill="none"
                  stroke="#006A6A"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle cx="40" cy="200" r="5" fill="#667085" />
                <circle cx="100" cy="160" r="5" fill="#006A6A" />
                <circle cx="180" cy="120" r="6" fill="#14B8A6" />
                <circle cx="260" cy="80" r="5" fill="#64748B" />
                <circle cx="320" cy="40" r="6" fill="#10B981" />
              </svg>

              {/* Animated Vehicle Pointer */}
              <div className="absolute top-24 left-40 flex flex-col items-center">
                <span className="bg-slate-900 text-white font-mono font-bold text-[8px] px-1.5 py-0.5 rounded shadow border border-slate-700">
                  {driverActiveTrip.vehicleNumber || 'MH-12-QW-9874'}
                </span>
                <div className="w-5 h-5 rounded-full bg-[#006A6A] text-white flex items-center justify-center border border-white shadow-lg animate-bounce mt-0.5">
                  <Navigation className="h-3 w-3 rotate-45" />
                </div>
              </div>

              {/* Map Bottom Info Bar */}
              <div className="relative z-10 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 text-white border border-slate-800 flex items-center justify-between text-xs shadow">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Drop Terminal</p>
                  <p className="font-bold text-[11px] truncate max-w-[140px]">{driverActiveTrip.dropLocation}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">ETA Clock</p>
                  <p className="font-bold font-mono text-[#14B8A6] text-[11px]">{driverActiveTrip.eta || '16:45 PM'}</p>
                </div>
              </div>
            </div>
=======
          {/* Google Driver Map Component */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-[#E5EEFF] dark:border-[#334155] pb-2.5">
              <h4 className="text-[13px] font-bold text-[#0B1C30] dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                <Map className="h-4 w-4 text-[#006A6A]" /> Real-time GPS Telemetry
              </h4>
              <button
                onClick={() => setIsGpsTracking(prev => !prev)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${isGpsTracking
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-700 text-slate-300'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${isGpsTracking ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                {isGpsTracking ? 'GPS Active' : 'GPS Paused'}
              </button>
            </div>

            <GoogleDriverMap
              driverLocation={{
                lat: liveCoords.lat,
                lng: liveCoords.lng,
                speed: liveCoords.speed,
                heading: liveCoords.heading,
                address: liveCoords.address || driverActiveTrip.currentAddress || driverActiveTrip.pickupLocation
              }}
              pickupLocation={{
                lat: driverActiveTrip.pickupCoordinates?.lat || 18.5204,
                lng: driverActiveTrip.pickupCoordinates?.lng || 73.8567,
                address: driverActiveTrip.pickupLocation
              }}
              dropLocation={{
                lat: driverActiveTrip.dropCoordinates?.lat || 18.7602,
                lng: driverActiveTrip.dropCoordinates?.lng || 73.8612,
                address: driverActiveTrip.dropLocation
              }}
              driverName={driverActiveTrip.driverName}
              vehicleNumber={driverActiveTrip.vehicleNumber}
              tripNumber={driverActiveTrip.tripNumber}
              eta={driverActiveTrip.eta}
              distanceRemaining={driverActiveTrip.distanceRemaining}
              status={driverActiveTrip.status}
              height="340px"
              showControls={true}
            />
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Incident Halt Modal */}
      <Modal isOpen={stopModalOpen} onClose={() => setStopModalOpen(false)} title="Log Incident Delay Halt">
        <div className="space-y-4 text-left">
          <p className="text-xs text-[#6D7A79] font-medium">Select delay reason classification to broadcast telemetry update:</p>
=======
      {/* Incident Delay Log Modal */}
      <Modal isOpen={stopModalOpen} onClose={() => setStopModalOpen(false)} title="Log Route Delay Halt">
        <div className="space-y-4 text-left text-xs">
          <p className="text-[#6D7A79] font-medium">Select delay reason classification to update telemetry desk:</p>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
          <div className="grid grid-cols-1 gap-2">
            {[
              'Traffic Congestion Blockage',
              'Highway Toll Gate Queue',
              'Fuel Refill Stop',
              'Vehicle Tire / Mechanical Issue',
              'Scheduled Driver Break'
            ].map(reason => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
<<<<<<< HEAD
                className={`p-3.5 border rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                  selectedReason === reason
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
=======
                className={`p-3.5 border rounded-xl text-left font-bold transition-all cursor-pointer ${selectedReason === reason
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 text-slate-700 bg-white'
                  }`}
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
              >
                {reason}
              </button>
            ))}
          </div>
<<<<<<< HEAD
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155]">
            <Button variant="outline" onClick={() => setStopModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleStopLog}>Submit Delay Incident</Button>
=======
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setStopModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleStopLog} className="bg-red-600 text-white font-bold">
              Broadcast Delay Signal
            </Button>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
          </div>
        </div>
      </Modal>

<<<<<<< HEAD
      {/* Upload POD Modal */}
      <Modal isOpen={podModalOpen} onClose={() => setPodModalOpen(false)} title="Transmit Proof of Delivery (POD)">
        <div className="space-y-5 text-left">
          <div className="space-y-2">
            <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wide block">
              Step 1: Cargo Unloading Verification Photo
            </span>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleMockPhotoCapture}
                className="flex items-center gap-2 text-xs bg-white border border-slate-200 text-slate-700"
              >
                <Camera className="h-4 w-4 text-[#006A6A]" /> Capture Photo Mock
              </Button>
              {photoMockUrl && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                  <img src={photoMockUrl} alt="Cargo Inspection" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wide block">
              Step 2: Customer E-Signature Pad
            </span>
            <div className="border border-slate-200 rounded-xl bg-[#F8F9FF] overflow-hidden shadow-sm">
              <canvas
                ref={canvasRef}
                width={380}
                height={160}
                className="bg-white w-full cursor-crosshair h-32"
              />
              <div className="flex items-center justify-between p-2 bg-slate-100 border-t border-slate-200">
                <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-xs text-[#6D7A79]">
                  Clear Pad
                </Button>
                <Button variant="outline" size="sm" onClick={saveSignature} className="text-xs bg-white border border-slate-200">
                  Save Signature
                </Button>
              </div>
            </div>
            {signatureSaved && (
              <div className="p-2.5 border border-teal-200 rounded-xl bg-teal-50 flex items-center justify-between shadow-sm">
                <span className="text-[11px] text-teal-800 font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#006A6A]" /> Digital signature cached
                </span>
                <img src={signatureSaved} alt="Signature Preview" className="h-6 w-20 object-contain shrink-0" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155]">
            <Button variant="outline" onClick={() => setPodModalOpen(false)}>Close</Button>
            <Button
              variant="primary"
              onClick={handleSubmitPOD}
              disabled={!photoMockUrl || !signatureSaved}
              className="bg-[#006A6A] text-white"
            >
              <Send className="h-4 w-4 mr-1.5" /> Transmit POD
=======
      {/* Incident Report Modal */}
      <Modal isOpen={incidentModalOpen} onClose={() => setIncidentModalOpen(false)} title="Report Critical Incident">
        <div className="space-y-4 text-left text-xs">
          <div>
            <label className="block text-[#6D7A79] font-bold mb-1">Incident Type</label>
            <select
              value={incidentType}
              onChange={e => setIncidentType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            >
              <option value="Vehicle Mechanical Breakdown">Vehicle Mechanical Breakdown</option>
              <option value="Tire Puncture / Blowout">Tire Puncture / Blowout</option>
              <option value="Road Accident / Collision">Road Accident / Collision</option>
              <option value="Severe Weather Blockade">Severe Weather Blockade</option>
              <option value="Medical Emergency">Medical Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-[#6D7A79] font-bold mb-1">Description & Location Notes</label>
            <textarea
              rows={3}
              value={incidentDesc}
              onChange={e => setIncidentDesc(e.target.value)}
              placeholder="Provide details about the incident..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIncidentModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReportIncident} className="bg-red-700 text-white font-bold">
              Dispatch Incident Alert
            </Button>
          </div>
        </div>
      </Modal>

      {/* Digital POD Modal */}
      <Modal isOpen={podModalOpen} onClose={() => setPodModalOpen(false)} title="Capture Digital Proof of Delivery (POD)">
        <div className="space-y-5 text-left text-xs">
          <div className="space-y-2">
            <label className="block text-[#6D7A79] font-bold">1. Capture Consignment Photo</label>
            {photoMockUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-emerald-500 max-h-40">
                <img src={photoMockUrl} alt="POD Capture" className="w-full object-cover" />
                <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">Verified</span>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={handleMockPhotoCapture} className="w-full py-3 border-dashed">
                <Camera className="w-4 h-4 mr-2 text-[#006A6A]" /> Snap Cargo Photo (Camera)
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[#6D7A79] font-bold">2. Consignee Digital Signature</label>
              <button type="button" onClick={clearCanvas} className="text-red-500 text-[10px] font-bold hover:underline">
                Clear Pad
              </button>
            </div>
            <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50">
              <canvas ref={canvasRef} width={400} height={140} className="w-full touch-none bg-white cursor-crosshair" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setPodModalOpen(false)}>Close</Button>
            <Button variant="primary" onClick={handleSubmitPOD} className="bg-[#006A6A] text-white font-bold">
              Transmit Completed POD
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            </Button>
          </div>
        </div>
      </Modal>

      {/* Emergency SOS Modal */}
<<<<<<< HEAD
      <Modal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} title="EMERGENCY SOS ALERT">
        <div className="space-y-4 text-left">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs space-y-2">
            <h4 className="font-extrabold text-red-700 flex items-center gap-2 text-sm">
              <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" /> Dispatch Emergency Distress Telemetry?
            </h4>
            <p className="text-red-700 leading-normal font-semibold">
              Triggering this alert will broadcast instant distress notifications to the Fleet Operations Control Room and Fleet Owner Dashboard with your exact live GPS coordinates.
            </p>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155]">
            <Button variant="outline" onClick={() => setSosModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleSOSAlert} className="bg-red-600 font-bold">
              CONFIRM SOS BROADCAST
=======
      <Modal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} title="TRIGGER EMERGENCY SOS">
        <div className="space-y-4 text-left text-xs">
          <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-900 font-bold">
            ⚠️ WARNING: This will immediately broadcast high-priority emergency alerts with your current GPS coordinates ({liveCoords.lat.toFixed(4)}, {liveCoords.lng.toFixed(4)}) to the Control Desk.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSosModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleSOSAlert} className="bg-red-700 text-white font-extrabold px-5">
              CONFIRM EMERGENCY SOS
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
<<<<<<< HEAD


=======
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
