import React, { useRef, useState, useEffect } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/tables/Table';
import { CheckCircle, AlertTriangle, PenTool, Image, Clock, ShieldAlert, Sparkles, Navigation, Phone } from 'lucide-react';
import { Trip } from '../../types';

export const Trips: React.FC = () => {
  const { trips, updateTripStatus, triggerNotification } = useOperations();
  
  // Rajesh (d1) active trips
  const driverTrips = trips.filter(t => t.driverId === 'd1');
  const activeTrip = trips.find(t => t.driverId === 'd1' && t.status !== 'Completed') || trips[0];

  // Stop Reason Modal
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Traffic Congestion');
  
  // POD Modal
  const [podModalOpen, setPodModalOpen] = useState(false);
  const [photoMockUrl, setPhotoMockUrl] = useState<string | null>(null);
  const [signatureSaved, setSignatureSaved] = useState<string | null>(null);

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Set up Drawing Canvas inside modal
  useEffect(() => {
    if (!podModalOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1E293B';
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
    triggerNotification('Trip Started', 'Signature Cached', 'Consignee receiver signature recorded.', 'Info');
  };

  const handleStopLog = () => {
    if (!activeTrip) return;
    updateTripStatus(activeTrip.id, 'Delayed' as any, { stopReason: selectedReason });
    setStopModalOpen(false);
    triggerNotification('Trip Started', 'Stop Logged', `Delayed: ${selectedReason}`, 'Warning');
  };

  const handleMockPhotoCapture = () => {
    setPhotoMockUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80');
    triggerNotification('Trip Started', 'Cargo Photo Captured', 'Cargo snapshot recorded.', 'Info');
  };

  const handleSubmitPOD = () => {
    if (!activeTrip) return;
    updateTripStatus(activeTrip.id, 'Completed', {
      signatureData: signatureSaved || 'Simulated Signature',
      photo: photoMockUrl || 'Cargo Photo Mock'
    });
    setPodModalOpen(false);
    triggerNotification('Trip Started', 'POD Transmitted', `Proof of delivery generated for ${activeTrip.tripNumber}.`, 'Info');
  };

  const activeMilestones = [
    { label: 'Assigned', status: 'Assigned' },
    { label: 'Accepted', status: 'Accepted' },
    { label: 'Started', status: 'Started' },
    { label: 'Pickup Load', status: 'Reached Pickup' },
    { label: 'Loaded', status: 'Loaded' },
    { label: 'In Transit', status: 'In Transit' },
    { label: 'Destination', status: 'Reached Destination' },
  ];

  const getActiveStepIndex = () => {
    if (!activeTrip) return 0;
    const current = activeTrip.status;
    if ((current as any) === 'Delayed') return 4;
    const idx = activeMilestones.findIndex(m => m.status === current);
    return idx >= 0 ? idx : 6;
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Title */}
      <div>
        <h2 className="text-[26px] font-extrabold text-[#111827] dark:text-[#F8FAFC] tracking-tight leading-none">My Trips & Consignments</h2>
        <p className="text-[13px] text-[#4B5563] dark:text-[#94A3B8] mt-1.5 font-medium">Track shift schedules, load manifests, routes, and update active milestone progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Trip detail card */}
        {activeTrip ? (
          <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-2xl p-6 shadow-sm space-y-5 lg:col-span-2 text-left">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#334155] pb-3">
              <div>
                <span className="text-[11px] font-extrabold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider block">Active Consignment</span>
                <span className="text-sm font-mono font-bold text-[#111827] dark:text-[#F8FAFC]">{activeTrip.tripNumber}</span>
              </div>
              <Badge variant={activeTrip.status === 'In Transit' ? 'info' : 'warning'}>
                {activeTrip.status}
              </Badge>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2.5 text-xs text-left">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006A6A] mt-1 shrink-0 animate-pulse" />
                <div>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 uppercase font-extrabold block">Pickup Location</span>
                  <span className="font-bold text-[#111827] dark:text-[#CBD5E1] block mt-0.5">{activeTrip.pickupLocation}</span>
                </div>
              </div>

              <div className="flex gap-2.5 text-xs text-left">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] mt-1 shrink-0 animate-pulse" />
                <div>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 uppercase font-extrabold block">Destination Point</span>
                  <span className="font-bold text-[#111827] dark:text-[#CBD5E1] block mt-0.5">{activeTrip.dropLocation}</span>
                </div>
              </div>
            </div>

            {/* details */}
            <div className="grid grid-cols-3 gap-4 border-t border-[#E5E7EB] dark:border-[#334155] pt-4 text-xs">
              <div>
                <span className="text-[#6B7280] dark:text-slate-400 block text-[10px] uppercase font-extrabold">Consignor</span>
                <span className="font-bold text-[#111827] dark:text-[#CBD5E1] block mt-0.5">{activeTrip.customerName}</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-slate-400 block text-[10px] uppercase font-extrabold">Material Specs</span>
                <span className="font-bold text-[#111827] dark:text-[#CBD5E1] block mt-0.5">{activeTrip.material} ({activeTrip.weight})</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-slate-400 block text-[10px] uppercase font-extrabold">Remaining Dist</span>
                <span className="font-bold text-[#111827] dark:text-[#CBD5E1] block mt-0.5 font-mono">{activeTrip.distanceRemaining} km left</span>
              </div>
            </div>

            {/* Customer Call / Info */}
            <div className="bg-[#F9FAFB] dark:bg-[#0F172A]/60 rounded-xl p-4 border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between shadow-sm">
              <div className="text-xs text-left">
                <p className="font-bold text-[#111827] dark:text-[#F8FAFC]">{activeTrip.customerName}</p>
                <p className="text-[11px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5 font-semibold">Consignee Helpline: {activeTrip.customerPhone}</p>
              </div>
              <a
                href={`tel:${activeTrip.customerPhone}`}
                className="p-2.5 bg-white dark:bg-[#1E293B] rounded-xl border border-[#E5E7EB] dark:border-[#334155] text-[#006A6A] dark:text-[#7DF5F5] hover:bg-[#F9FAFB] dark:hover:bg-slate-800 flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-2xl p-8 text-center text-[#6B7280] dark:text-slate-400 lg:col-span-2 flex flex-col items-center justify-center shadow-sm">
            <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
            <p className="text-xs font-bold">No active trip assignments today!</p>
          </div>
        )}

        {/* Stepper Card */}
        {activeTrip && (
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-6 flex flex-col justify-between text-left">
            <div className="space-y-4">
              <h4 className="text-[13px] font-extrabold text-[#111827] dark:text-slate-100 border-b border-[#E5E7EB] dark:border-[#334155] pb-2 uppercase tracking-wide">Trip Milestone Progress</h4>
              
              <div className="flex flex-col gap-4 relative pl-5">
                <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-[#E5E7EB] dark:bg-slate-800" />
                {activeMilestones.map((milestone, idx) => {
                  const activeIdx = getActiveStepIndex();
                  const isPast = idx < activeIdx;
                  const isCurrent = idx === activeIdx;

                  return (
                    <div key={idx} className="flex gap-3 text-xs leading-normal">
                      <div
                        className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 mt-0.5 z-10 transition-all ${
                          isPast 
                            ? 'bg-[#10B981] border-[#10B981]' 
                            : isCurrent 
                            ? 'bg-[#006A6A] border-[#006A6A] shadow-md shadow-teal-500/20' 
                            : 'bg-white dark:bg-[#0F172A] border-slate-300 dark:border-slate-800'
                        }`}
                      />
                      <span className={`font-semibold ${isPast ? 'text-[#6B7280] dark:text-[#94A3B8]' : isCurrent ? 'text-[#111827] dark:text-slate-100 font-bold' : 'text-[#6B7280] dark:text-[#94A3B8]'}`}>
                        {milestone.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-[#E5E7EB] dark:border-[#334155] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStopModalOpen(true)}
                className="text-xs py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#EF4444] hover:bg-red-50/50 font-bold"
              >
                <AlertTriangle className="h-4 w-4 mr-1 text-[#EF4444]" /> Incident Halt
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPodModalOpen(true)}
                className="text-xs py-2.5 rounded-xl font-bold"
              >
                <PenTool className="h-4 w-4 mr-1" /> Close POD
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Trips list table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm text-left">
        <h3 className="text-[15px] font-extrabold text-[#111827] dark:text-slate-100 mb-5 uppercase tracking-wide">Consignment History Ledger</h3>
        <Table
          data={driverTrips}
          columns={[
            {
              header: 'Trip Ref',
              accessor: (row: Trip) => <span className="font-mono text-xs font-bold text-slate-808 dark:text-[#F8FAFC]">{row.tripNumber}</span>,
              sortKey: 'tripNumber',
            },
            {
              header: 'Customer',
              accessor: 'customerName',
              sortKey: 'customerName',
            },
            {
              header: 'Locations Map',
              accessor: (row: Trip) => (
                <div className="text-xs flex flex-col gap-0.5 text-left">
                  <span className="font-semibold text-slate-700">Pick: {row.pickupLocation}</span>
                  <span className="text-[11px] text-slate-400">Drop: {row.dropLocation}</span>
                </div>
              ),
            },
            {
              header: 'Material (Weight)',
              accessor: (row: Trip) => `${row.material} (${row.weight})`,
            },
            {
              header: 'ETA Clock',
              accessor: 'eta',
              sortKey: 'eta',
            },
            {
              header: 'Trip Status',
              accessor: (row: Trip) => (
                <Badge variant={row.status === 'Completed' ? 'success' : row.status === 'In Transit' ? 'info' : 'warning'}>
                  {row.status}
                </Badge>
              ),
              sortKey: 'status',
            }
          ]}
          searchKey="tripNumber"
          searchPlaceholder="Search manifests..."
          exportFileName="driver-trips-complete-log"
        />
      </div>

      {/* Modals */}
      <Modal isOpen={stopModalOpen} onClose={() => setStopModalOpen(false)} title="Log Stop Incident">
        <div className="space-y-4 text-left">
          <p className="text-xs text-[#6D7A79] font-medium">Select delay reason classification below:</p>
          <div className="grid grid-cols-1 gap-2.5">
            {['Heavy Traffic', 'Fuel Refill Station', 'Scheduled Lunch Break', 'Vehicle Mechanical Failure', 'Border Checkpoint Delay'].map(reason => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`p-4 border rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                  selectedReason === reason
                    ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]'
                    : 'border-[#E5EEFF] dark:border-[#334155] hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155]">
            <Button variant="outline" onClick={() => setStopModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleStopLog}>Submit Incident</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={podModalOpen} onClose={() => setPodModalOpen(false)} title="Submit Proof of Delivery (POD)">
        <div className="space-y-5 text-left">
          <div className="space-y-2">
            <span className="text-[13px] font-bold text-[#545F73] dark:text-[#94A3B8] uppercase tracking-wide block">Step 1: Unloading Inspection Photo</span>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleMockPhotoCapture}
                className="flex items-center gap-1.5 text-xs bg-white border border-[#E5EEFF] dark:border-[#334155] text-slate-700"
              >
                <Image className="h-4 w-4" /> Camera Capture Mock
              </Button>
              {photoMockUrl && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#E5EEFF] dark:border-[#334155] shadow-sm shrink-0">
                  <img src={photoMockUrl} alt="Inspection" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <span className="text-[13px] font-bold text-[#545F73] dark:text-[#94A3B8] uppercase tracking-wide block">Step 2: Customer E-Signature</span>
            <div className="border border-[#E5EEFF] dark:border-[#334155] rounded-2xl bg-[#F8F9FF] dark:bg-[#0F172A] overflow-hidden shadow-sm">
              <canvas
                ref={canvasRef}
                width={380}
                height={160}
                className="bg-white dark:bg-[#1E293B] w-full cursor-crosshair h-32"
              />
              <div className="flex items-center justify-between p-2.5 bg-[#F8F9FF] dark:bg-[#0F172A] border-t border-[#E5EEFF]/80 dark:border-[#334155]/60">
                <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-xs text-[#6D7A79] dark:text-[#94A3B8] border border-transparent hover:bg-slate-200 dark:hover:bg-slate-800">
                  Clear Pad
                </Button>
                <Button variant="outline" size="sm" onClick={saveSignature} className="text-xs bg-white border border-[#E5EEFF] dark:border-[#334155] text-slate-700">
                  Save Signature
                </Button>
              </div>
            </div>
            {signatureSaved && (
              <div className="p-3 border border-[#E5EEFF] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A]/60 flex items-center justify-between shadow-sm">
                <span className="text-[11px] text-[#6D7A79] dark:text-[#94A3B8] font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#10B981]" /> Signature saved
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
            >
              Transmit POD
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};



