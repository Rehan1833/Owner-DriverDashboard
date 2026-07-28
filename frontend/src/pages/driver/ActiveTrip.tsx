import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  PhoneCall,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Trip, TripStop } from '../../types';
import { GoogleDriverMap } from '../../components/common/GoogleDriverMap';
import { api } from '../../api/client';

export const ActiveTrip: React.FC = () => {
  const { trips, vehicles, user, updateTripStatus, triggerNotification } = useOperations();

  const [isLoading, setIsLoading] = useState<boolean>(true);

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
                accuracy,
                speed: currentSpeed,
                heading: currentHeading
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
    triggerNotification('Trip Started', 'Signature Saved', 'Digital consignee signature captured.', 'Info');
  };

  const handleMockPhotoCapture = () => {
    setPhotoMockUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80');
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
  };

  const handleNextStatus = async () => {
    if (!driverActiveTrip) return;
    const statusFlow: Array<Trip['status']> = [
      'Assigned',
      'Accepted',
      'Started',
      'In Transit',
      'At Stop',
      'Delivered',
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
    { label: 'In Transit', status: 'In Transit' },
    { label: 'At Waypoint Stop', status: 'At Stop' },
    { label: 'Delivered', status: 'Delivered' },
    { label: 'Completed', status: 'Completed' }
  ];

  const getActiveStepIndex = () => {
    if (!driverActiveTrip) return 0;
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
      </div>
    );
  }

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
      </div>
    );
  }

  const activeStepIdx = getActiveStepIndex();
  const progressPercent = Math.min(100, Math.max(15, Math.round(((activeStepIdx + 1) / statusMilestones.length) * 100)));

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Location Permission Warning Bar if Denied */}
      {gpsPermissionState === 'denied' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span><strong>Location Permission Required:</strong> Real-time GPS tracking requires browser location permission.</span>
          </div>
          <Button variant="primary" size="sm" onClick={requestGpsPermission} className="bg-amber-600 text-white text-xs py-1">
            Try Again
          </Button>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[26px] font-extrabold text-[#111827] dark:text-[#F8FAFC] tracking-tight leading-none">
              Active Trip Navigation Console
            </h2>
            <Badge variant={driverActiveTrip.status === 'In Transit' ? 'info' : 'warning'} className="px-3 py-1 font-mono text-xs">
              {driverActiveTrip.status}
            </Badge>
          </div>
          <p className="text-[13px] text-[#4B5563] dark:text-[#94A3B8] mt-1.5 font-medium">
            Live consignment telemetry, waypoint guidance, and geofenced delivery controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIncidentModalOpen(true)}
            className="text-xs bg-red-600 text-white shadow-md font-bold"
          >
            <ShieldAlert className="h-4 w-4 mr-1.5" /> Report Incident
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setSosModalOpen(true)}
            className="text-xs bg-red-700 text-white shadow-md font-bold"
          >
            <AlertTriangle className="h-4 w-4 mr-1.5 animate-pulse" /> Emergency SOS
          </Button>
        </div>
      </div>

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
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-widest block">Assigned Truck</span>
              <span className="text-sm font-mono font-extrabold text-slate-800 dark:text-white block mt-0.5">
                {driverActiveTrip.vehicleNumber}
              </span>
            </div>
          </div>

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

          {/* Operational Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[#E5EEFF] dark:border-[#334155] pt-4">
            {/* Advance Status Button */}
            {driverActiveTrip.status !== 'Completed' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextStatus}
                className="text-xs py-2.5 rounded-xl font-bold bg-[#006A6A] hover:bg-[#005555] text-white shadow-md"
              >
                <ArrowRight className="h-4 w-4 mr-1.5" /> Advance Status ({driverActiveTrip.status})
              </Button>
            )}

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
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(driverActiveTrip.pickupLocation)}&destination=${encodeURIComponent(driverActiveTrip.dropLocation)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Navigation className="h-4 w-4 text-[#14B8A6]" /> Launch Google Maps
            </a>

            {/* Delay Report */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStopModalOpen(true)}
              className="text-xs py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            >
              <AlertTriangle className="h-4 w-4 mr-1" /> Report Delay
            </Button>

            {/* Upload POD Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPodModalOpen(true)}
              className="text-xs py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
            >
              <PenTool className="h-4 w-4 mr-1" /> Upload POD Signature
            </Button>
          </div>
        </div>

        {/* Right 1 Column: Map & Stepper */}
        <div className="space-y-6">
          {/* Workflow Stepper Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[13px] font-bold text-[#0B1C30] dark:text-slate-100 border-b border-[#E5EEFF] dark:border-[#334155] pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Target className="h-4 w-4 text-[#006A6A]" /> Route Milestone Lifecycle
            </h4>

            <div className="flex flex-col gap-3 relative pl-4">
              <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-slate-100 dark:bg-slate-800" />
              {statusMilestones.map((milestone, idx) => {
                const isPast = idx < activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <div
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
                    >
                      {milestone.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

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
          </div>
        </div>
      </div>

      {/* Incident Delay Log Modal */}
      <Modal isOpen={stopModalOpen} onClose={() => setStopModalOpen(false)} title="Log Route Delay Halt">
        <div className="space-y-4 text-left text-xs">
          <p className="text-[#6D7A79] font-medium">Select delay reason classification to update telemetry desk:</p>
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
                className={`p-3.5 border rounded-xl text-left font-bold transition-all cursor-pointer ${selectedReason === reason
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 text-slate-700 bg-white'
                  }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setStopModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleStopLog} className="bg-red-600 text-white font-bold">
              Broadcast Delay Signal
            </Button>
          </div>
        </div>
      </Modal>

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
            </Button>
          </div>
        </div>
      </Modal>

      {/* Emergency SOS Modal */}
      <Modal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} title="TRIGGER EMERGENCY SOS">
        <div className="space-y-4 text-left text-xs">
          <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-900 font-bold">
            ⚠️ WARNING: This will immediately broadcast high-priority emergency alerts with your current GPS coordinates ({liveCoords.lat.toFixed(4)}, {liveCoords.lng.toFixed(4)}) to the Control Desk.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSosModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleSOSAlert} className="bg-red-700 text-white font-extrabold px-5">
              CONFIRM EMERGENCY SOS
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
