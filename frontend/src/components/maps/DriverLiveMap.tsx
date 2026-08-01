import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '../ui/Badge';
import {
  Navigation, Compass, MapPin, RefreshCw, ZoomIn, ZoomOut, Maximize2, Gauge, ShieldCheck, Layers, Eye
} from 'lucide-react';

export interface DriverLiveMapProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  address?: string;
  vehicleNumber?: string;
  statusBadge?: 'LIVE' | 'SEARCHING' | 'DISABLED' | 'OFFLINE' | 'SYNCING';
  lastUpdatedText?: string;
  onRefreshLocation?: () => void;
}

export const DriverLiveMap: React.FC<DriverLiveMapProps> = ({
  latitude,
  longitude,
  accuracy = 6,
  speed = 0,
  heading = 0,
  address = 'Capturing live GPS coordinates...',
  vehicleNumber = 'MH-12-QW-9874',
  statusBadge = 'LIVE',
  lastUpdatedText = 'Just now',
  onRefreshLocation
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const googleMapRef = useRef<HTMLDivElement | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);

  // Check if Google Maps JS API script is available
  useEffect(() => {
    if ((window as any).google && (window as any).google.maps) {
      setIsGoogleMapsLoaded(true);
      try {
        if (googleMapRef.current) {
          const map = new (window as any).google.maps.Map(googleMapRef.current, {
            center: { lat: latitude, lng: longitude },
            zoom: zoomLevel,
            mapTypeId: mapType,
            disableDefaultUI: true
          });

          new (window as any).google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
            title: `Driver Vehicle: ${vehicleNumber}`
          });
        }
      } catch (e) {
        console.warn('Google Maps rendering error:', e);
      }
    }
  }, [latitude, longitude, zoomLevel, mapType]);

  const getStatusBadge = () => {
    switch (statusBadge) {
      case 'LIVE':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-extrabold uppercase flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> GPS Active ● Live
          </span>
        );
      case 'SEARCHING':
        return (
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> GPS Searching...
          </span>
        );
      case 'DISABLED':
        return (
          <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[11px] font-extrabold uppercase flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> GPS Disabled
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="px-2.5 py-1 bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded-full text-[11px] font-extrabold uppercase flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Offline Mode
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-[11px] font-extrabold uppercase flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /> Syncing...
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#0B1C30] dark:bg-[#0F172A] rounded-2xl border border-slate-800 dark:border-[#334155] overflow-hidden shadow-lg text-white flex flex-col relative transition-all duration-300">
      {/* ── Top Interactive Control Bar ── */}
      <div className="p-4 bg-[#0F243D]/90 dark:bg-[#1E293B]/90 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#006A6A] rounded-xl text-white shadow-md">
            <Navigation className="h-4 w-4 rotate-45 text-teal-200" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
              Real-Time GPS Tracking Map
            </h4>
            <p className="text-[11px] text-slate-300 font-medium">Vehicle: <strong className="text-white">{vehicleNumber}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {onRefreshLocation && (
            <button
              onClick={onRefreshLocation}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Location"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Map Canvas Viewport (Responsive Height: Desktop 500px, Tablet 400px, Mobile 300px) ── */}
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-[#071322] overflow-hidden flex flex-col justify-between p-4">
        {/* Google Maps Container target */}
        <div ref={googleMapRef} className="absolute inset-0 w-full h-full z-0" />

        {/* High-Precision SmartOps Vector Grid Fallback Layer (renders seamlessly behind or if Google Maps script is loading) */}
        {!isGoogleMapsLoaded && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none" />
        )}

        {/* Top Floating Map Controls */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
              className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Layers className="h-3.5 w-3.5 text-teal-400" />
              {mapType === 'roadmap' ? 'Satellite View' : 'Roadmap View'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 1, 20))}
              className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-white flex items-center justify-center cursor-pointer shadow-md transition-all"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 1, 3))}
              className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-white flex items-center justify-center cursor-pointer shadow-md transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Simulated Vector Route & Animated Marker when Google Maps isn't active */}
        {!isGoogleMapsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            {/* Accuracy ring */}
            <div 
              className="rounded-full bg-teal-500/10 border border-teal-500/30 animate-pulse flex items-center justify-center"
              style={{ width: Math.max(120, accuracy * 8), height: Math.max(120, accuracy * 8) }}
            />
            {/* Pulsing Driver Marker */}
            <div className="absolute flex flex-col items-center">
              <div className="px-2.5 py-1 bg-slate-950/90 text-white font-mono font-extrabold text-[10px] rounded-lg shadow-lg border border-teal-500/50 mb-1 backdrop-blur-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {vehicleNumber}
              </div>
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#006A6A] to-[#10B981] text-white flex items-center justify-center border-2 border-white shadow-xl transform transition-transform duration-500"
                style={{ transform: `rotate(${heading}deg)` }}
              >
                <Navigation className="h-5 w-5 fill-white" />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Address & Freshness Banner */}
        <div className="relative z-10 bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-100 truncate" title={address}>
              {address}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-bold whitespace-nowrap shrink-0">
            Updated: {lastUpdatedText}
          </span>
        </div>
      </div>

      {/* ── Bottom Telemetry Diagnostic Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-[#0F243D] dark:bg-[#1E293B] border-t border-slate-800 text-xs text-left">
        <div className="p-3 bg-slate-900/60 dark:bg-slate-900/40 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Latitude</span>
          <span className="font-mono font-bold text-white text-sm block mt-0.5">{latitude.toFixed(5)}° N</span>
        </div>
        <div className="p-3 bg-slate-900/60 dark:bg-slate-900/40 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Longitude</span>
          <span className="font-mono font-bold text-white text-sm block mt-0.5">{longitude.toFixed(5)}° E</span>
        </div>
        <div className="p-3 bg-slate-900/60 dark:bg-slate-900/40 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">GPS Speed</span>
          <span className="font-mono font-bold text-emerald-400 text-sm block mt-0.5">{Math.round(speed)} km/h</span>
        </div>
        <div className="p-3 bg-slate-900/60 dark:bg-slate-900/40 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Heading</span>
          <span className="font-mono font-bold text-white text-sm block mt-0.5">{heading}° ({heading >= 315 || heading < 45 ? 'N' : heading >= 45 && heading < 135 ? 'E' : heading >= 135 && heading < 225 ? 'S' : 'W'})</span>
        </div>
        <div className="p-3 bg-slate-900/60 dark:bg-slate-900/40 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">GPS Accuracy</span>
          <span className="font-mono font-bold text-teal-300 text-sm block mt-0.5">±{Math.round(accuracy)}m</span>
        </div>
      </div>
    </div>
  );
};
