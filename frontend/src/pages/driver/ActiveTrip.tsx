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
  UserCheck,
  Package,
  Activity,
  ArrowRight,
  Send,
  PhoneCall,
  CheckCircle
} from 'lucide-react';
import { Trip } from '../../types';

export const ActiveTrip: React.FC = () => {
  const { trips, vehicles, user, updateTripStatus, triggerNotification } = useOperations();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Modals
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Traffic Congestion');
  const [podModalOpen, setPodModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

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
    triggerNotification('Trip Started', 'Signature Saved', 'Customer digital signature recorded successfully.', 'Info');
  };

  const handleMockPhotoCapture = () => {
    setPhotoMockUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80');
    triggerNotification('Trip Started', 'Cargo Inspection Uploaded', 'High-res cargo snapshot captured.', 'Info');
  };

  const handleStopLog = () => {
    if (!driverActiveTrip) return;
    updateTripStatus(driverActiveTrip.id, 'Delayed' as any, { stopReason: selectedReason });
    setStopModalOpen(false);
    triggerNotification('Critical', 'Incident Halt Logged', `Trip delayed due to: ${selectedReason}`, 'Warning');
  };

  const handleNextStatus = async () => {
    if (!driverActiveTrip) return;
    const statusFlow: Array<Trip['status']> = [
      'Assigned',
      'Accepted',
      'Started',
      'Reached Pickup',
      'Loaded',
      'In Transit',
      'Reached Destination',
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
    { label: 'Started', status: 'Started' },
    { label: 'Pickup Point', status: 'Reached Pickup' },
    { label: 'Loaded', status: 'Loaded' },
    { label: 'In Transit', status: 'In Transit' },
    { label: 'Reached Dest', status: 'Reached Destination' },
  ];

  const getActiveStepIndex = () => {
    if (!driverActiveTrip) return 0;
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
      </div>
    );
  }

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
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-2xl p-12 text-center max-w-2xl mx-auto my-12 shadow-sm space-y-6">
        <div className="w-20 h-20 bg-[#006A6A]/10 rounded-full flex items-center justify-center mx-auto border border-[#006A6A]/20">
          <Truck className="h-10 w-10 text-[#006A6A] dark:text-[#7DF5F5]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-[#111827] dark:text-[#F8FAFC]">No Active Trip Assignment</h3>
          <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed font-medium">
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
      </div>
    );
  }

  const activeStepIdx = getActiveStepIndex();
  const progressPercent = Math.min(100, Math.max(10, Math.round(((activeStepIdx + 1) / statusMilestones.length) * 100)));

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[26px] font-extrabold text-[#111827] dark:text-[#F8FAFC] tracking-tight leading-none">
              Active Trip Console
            </h2>
            <Badge variant={driverActiveTrip.status === 'In Transit' ? 'info' : 'warning'} className="px-3 py-1 font-mono text-xs">
              {driverActiveTrip.status}
            </Badge>
          </div>
          <p className="text-[13px] text-[#4B5563] dark:text-[#94A3B8] mt-1.5 font-medium">
            Live consignment telemetry, waypoint guidance, and milestone operational controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 400); }}
            className="text-xs bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#111827] dark:text-[#F8FAFC] font-bold"
          >
            <RotateCw className="h-3.5 w-3.5 mr-1.5" /> Sync Coordinates
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setSosModalOpen(true)}
            className="text-xs bg-red-600 text-white shadow-md shadow-red-500/20 font-bold"
          >
            <ShieldAlert className="h-4 w-4 mr-1.5 animate-pulse" /> Emergency SOS
          </Button>
        </div>
      </div>

      {/* Main Grid: Trip Card & Navigation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Current Trip Card (2 Cols) */}
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
                  ORD-8841
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-widest block">Assigned Truck</span>
              <span className="text-xs font-mono font-bold text-[#111827] dark:text-[#F8FAFC] block mt-0.5">
                {driverActiveTrip.vehicleNumber || driverVehicle?.vehicleNumber || 'MH-12-QW-9874'}
              </span>
            </div>
          </div>

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

          {/* Action Bar Buttons */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pt-4">
            
            {/* Advance Status Button */}
            {driverActiveTrip.status !== 'Completed' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextStatus}
                className="text-xs py-2.5 rounded-xl font-bold bg-[#006A6A] hover:bg-[#005555] text-white shadow-md shadow-teal-500/10"
              >
                <ArrowRight className="h-4 w-4 mr-1.5" /> Advance Status ({driverActiveTrip.status})
              </Button>
            )}

            {/* Google Maps External Navigation */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(driverActiveTrip.pickupLocation)}&destination=${encodeURIComponent(driverActiveTrip.dropLocation)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStopModalOpen(true)}
              className="text-xs py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            >
              <AlertTriangle className="h-4 w-4 mr-1" /> Incident Halt
            </Button>

            {/* Upload POD Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPodModalOpen(true)}
              className="text-xs py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
            >
              <PenTool className="h-4 w-4 mr-1" /> Upload / Close POD
            </Button>
          </div>
        </div>

        {/* Right Column: Live Route Stepper & Vector Map (1 Col) */}
        <div className="space-y-6">
          
          {/* Milestone Stepper Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[13px] font-bold text-[#0B1C30] dark:text-slate-100 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Target className="h-4 w-4 text-[#006A6A]" /> Route Milestone Workflow
            </h4>

            <div className="flex flex-col gap-3 relative pl-4">
              <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-slate-100 dark:bg-slate-800" />
              {statusMilestones.map((milestone, idx) => {
                const isPast = idx < activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <div
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
          </div>
        </div>
      </div>

      {/* Incident Halt Modal */}
      <Modal isOpen={stopModalOpen} onClose={() => setStopModalOpen(false)} title="Log Incident Delay Halt">
        <div className="space-y-4 text-left">
          <p className="text-xs text-[#6D7A79] font-medium">Select delay reason classification to broadcast telemetry update:</p>
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
                className={`p-3.5 border rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                  selectedReason === reason
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155]">
            <Button variant="outline" onClick={() => setStopModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleStopLog}>Submit Delay Incident</Button>
          </div>
        </div>
      </Modal>

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
            </Button>
          </div>
        </div>
      </Modal>

      {/* Emergency SOS Modal */}
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
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


