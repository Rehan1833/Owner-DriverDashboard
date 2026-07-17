import React from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Badge } from '../../components/ui/Badge';
import { MapPin, Navigation, Compass, AlertTriangle, Clock, Map, Target } from 'lucide-react';

export const GPS: React.FC = () => {
  const { trips, vehicles } = useOperations();
  const activeTrip = trips.find(t => t.driverId === 'd1' && t.status !== 'Completed') || trips[0];
  const driverVehicle = vehicles[0];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Live GPS Navigation Map</h2>
        <p className="text-xs text-slate-405 dark:text-slate-505 mt-1">Real-time truck tracking coordinates, highway milestones, and traffic diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Info Bar */}
        <div className="bg-slate-950 text-white rounded-3xl p-5 flex items-center gap-4 shadow-md lg:col-span-4 border border-slate-850">
          <div className="p-3 bg-blue-600 rounded-2xl animate-pulse shrink-0">
            <Navigation className="h-5 w-5 rotate-45 text-white" />
          </div>
          <div className="space-y-1.5 flex-1 text-left">
            <h4 className="text-sm font-bold text-white">In 800m, keep left towards Mumbai-Pune Expressway exit</h4>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ETA: {activeTrip?.eta || '16:45 PM'}</span>
              <span className="w-1 h-1 bg-slate-650 rounded-full" />
              <span>Remaining: {activeTrip?.distanceRemaining || 48} km</span>
              <span className="w-1 h-1 bg-slate-650 rounded-full" />
              <span className="text-blue-400">Consignment: {activeTrip?.tripNumber}</span>
            </div>
          </div>
        </div>

        {/* Fullscreen Map container (75%) */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Map className="h-4 w-4 text-slate-500" /> Route Vector Visualization
            </h4>
            <Badge variant="info">Active Tracker</Badge>
          </div>

          <div className="h-140 bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />

            {/* Top Floating details */}
            <div className="relative z-10 flex justify-between items-center">
              <Badge variant="info" className="bg-slate-900/90 text-white border-slate-800/80 px-3.5 py-1.5 font-mono text-xs">
                Speed Indicator: 64 km/h
              </Badge>
              <div className="w-9 h-9 rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center text-slate-400 border border-slate-800/80">
                <Compass className="h-4 w-4 animate-spin-slow" />
              </div>
            </div>

            {/* Simulated Route Vector */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 650 480">
              <path
                d="M 80,420 L 160,350 L 260,250 L 380,200 L 480,110 L 580,50"
                fill="none"
                stroke="#1E293B"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 80,420 L 160,350 L 260,250"
                fill="none"
                stroke="#2563EB"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="80" cy="420" r="5" fill="#64748B" />
              <circle cx="160" cy="350" r="5" fill="#2563EB" />
              <circle cx="260" cy="250" r="6" fill="#EF4444" />
              <circle cx="380" cy="200" r="5" fill="#64748B" />
              <circle cx="480" cy="110" r="5" fill="#64748B" />
              <circle cx="580" cy="50" r="7" fill="#10B981" />
            </svg>

            {/* Pune Label */}
            <div className="absolute bottom-18 left-20 text-[10px] text-slate-400 font-bold">Pune Whse Yard A</div>
            
            {/* Mumbai Label */}
            <div className="absolute top-16 right-20 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Mumbai terminal DC
            </div>

            {/* Truck Pointer */}
            <div className="absolute top-52 left-64 flex flex-col items-center">
              <span className="bg-blue-600 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded shadow border border-blue-400">
                {driverVehicle?.vehicleNumber || 'MH-12-QW-9874'}
              </span>
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                <Navigation className="h-3 w-3 rotate-45" />
              </div>
            </div>

            {/* Bottom Details Overlay */}
            <div className="relative z-10 bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 text-white border border-slate-800 flex items-center justify-between text-left">
              <div className="text-xs space-y-0.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Destination</p>
                <p className="font-bold">{activeTrip?.dropLocation || 'Distribution Center'}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">ETA Clock</p>
                <p className="font-bold font-mono text-blue-400">{activeTrip?.eta || '16:45 PM'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkpoint sidebar (25%) */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5 flex flex-col justify-between text-left">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 border-b border-gray-50 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-blue-500" /> Route Milestones
            </h4>

            <div className="space-y-4">
              {[
                { name: 'Pune Warehouse', status: 'Passed', active: true },
                { name: 'Khed Shivapur Toll', status: 'Passed', active: true },
                { name: 'Lonavala Ghats', status: 'Current', active: true, isCurrent: true },
                { name: 'Panvel Crossing', status: 'Pending', active: false },
                { name: 'Mumbai terminal DC', status: 'Pending', active: false },
              ].map((checkpoint, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div className={`w-3 h-3 rounded-full shrink-0 border-2 ${
                    checkpoint.isCurrent 
                      ? 'bg-blue-600 border-blue-600 animate-pulse' 
                      : checkpoint.active 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${checkpoint.isCurrent ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>{checkpoint.name}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{checkpoint.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-red-50/10 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-xs space-y-2">
            <h5 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Delay Incidents
            </h5>
            <p className="text-[10px] text-red-600 dark:text-red-300 leading-normal">
              Any traffic blockages or servicing delays must be logged using the "Incident Halt" button in My Trips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
