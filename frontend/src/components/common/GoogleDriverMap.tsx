import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  MapPin,
  Truck,
  Compass,
  Clock,
  ExternalLink,
  Zap,
  LocateFixed,
  Layers,
  Activity,
  Maximize2,
  RefreshCw
} from 'lucide-react';

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
  speed?: number;
  heading?: number;
}

interface GoogleDriverMapProps {
  driverLocation?: MapLocation;
  pickupLocation?: MapLocation;
  dropLocation?: MapLocation;
  driverName?: string;
  vehicleNumber?: string;
  tripNumber?: string;
  eta?: string;
  distanceRemaining?: number;
  status?: string;
  height?: string;
  showControls?: boolean;
}

declare global {
  interface Window {
    google?: any;
    initGoogleMapCallback?: () => void;
  }
}

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#020617' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2563eb' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1d4ed8' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020617' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

export const GoogleDriverMap: React.FC<GoogleDriverMapProps> = ({
  driverLocation = { lat: 18.5204, lng: 73.8567, address: 'Pune Central Depot', speed: 45, heading: 90 },
  pickupLocation = { lat: 18.5204, lng: 73.8567, address: 'Pune Central Logistics Depot' },
  dropLocation = { lat: 18.7602, lng: 73.8612, address: 'Chakan Industrial Zone' },
  driverName = 'Driver',
  vehicleNumber = 'MH-12-QW-9874',
  tripNumber = 'TRP-ACTIVE',
  eta = '25 Mins',
  distanceRemaining = 18.4,
  status = 'In Transit',
  height = '440px',
  showControls = true
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [driverMarker, setDriverMarker] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [trafficLayer, setTrafficLayer] = useState<any>(null);
  const [isTrafficOn, setIsTrafficOn] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'dark' | 'roadmap' | 'satellite'>('dark');
  const [isGoogleLoaded, setIsGoogleLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('your_google'));

  // 1. Load Google Maps JS SDK
  useEffect(() => {
    if (!isKeyConfigured) {
      setIsGoogleLoaded(false);
      return;
    }

    if (window.google?.maps) {
      setIsGoogleLoaded(true);
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,drawing`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsGoogleLoaded(true);
      };

      script.onerror = (err) => {
        console.error('Google Maps JS Script Load Error:', err);
        setLoadError(true);
        setIsGoogleLoaded(false);
      };

      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setIsGoogleLoaded(true));
    }
  }, [apiKey, isKeyConfigured]);

  // 2. Initialize Map & Directions API
  useEffect(() => {
    if (!isGoogleLoaded || !mapRef.current || !window.google?.maps) return;

    try {
      const centerLat = driverLocation.lat || pickupLocation.lat;
      const centerLng = driverLocation.lng || pickupLocation.lng;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 13,
        mapTypeId: mapType === 'satellite' ? window.google.maps.MapTypeId.SATELLITE : window.google.maps.MapTypeId.ROADMAP,
        styles: mapType === 'dark' ? DARK_MAP_STYLE : null,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: false
      });

      setMapInstance(map);

      // Traffic Layer
      const traffic = new window.google.maps.TrafficLayer();
      if (isTrafficOn) {
        traffic.setMap(map);
      }
      setTrafficLayer(traffic);

      // Pickup Marker (Green Dot)
      new window.google.maps.Marker({
        position: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        map,
        title: `Pickup: ${pickupLocation.address || 'Pickup Point'}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3
        }
      });

      // Dropoff Marker (Red Dot)
      new window.google.maps.Marker({
        position: { lat: dropLocation.lat, lng: dropLocation.lng },
        map,
        title: `Destination: ${dropLocation.address || 'Dropoff Point'}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3
        }
      });

      // Driver Vehicle Marker (Blue Arrow)
      const dMarker = new window.google.maps.Marker({
        position: { lat: driverLocation.lat, lng: driverLocation.lng },
        map,
        title: `Driver: ${driverName} (${vehicleNumber})`,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 7,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          rotation: driverLocation.heading || 0
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #0f172a; padding: 6px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1e293b;">🚚 ${driverName} (${vehicleNumber})</div>
            <div style="font-size: 12px; color: #475569;">📍 ${driverLocation.address || 'Live Transit Location'}</div>
            <div style="margin-top: 8px; font-size: 12px; background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 6px; font-weight: 600; display: inline-block;">
              ⚡ Speed: ${driverLocation.speed || 0} km/h | ETA: ${eta}
            </div>
          </div>
        `
      });

      dMarker.addListener('click', () => {
        infoWindow.open(map, dMarker);
      });

      setDriverMarker(dMarker);

      // Directions Service & Renderer for turn-by-turn road route
      const renderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 5,
          strokeOpacity: 0.85
        }
      });
      setDirectionsRenderer(renderer);

      // Calculate driving route on road
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: driverLocation.lat, lng: driverLocation.lng },
          destination: { lat: dropLocation.lat, lng: dropLocation.lng },
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result: any, status: string) => {
          if (status === 'OK' && result) {
            renderer.setDirections(result);
          } else {
            console.warn('Google Directions API fallback to straight geodesic line:', status);
            // Fallback Polyline
            const polyline = new window.google.maps.Polyline({
              path: [
                { lat: pickupLocation.lat, lng: pickupLocation.lng },
                { lat: driverLocation.lat, lng: driverLocation.lng },
                { lat: dropLocation.lat, lng: dropLocation.lng }
              ],
              geodesic: true,
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 5,
              map
            });
          }
        }
      );

      // Fit bounds to cover driver, pickup and dropoff
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: pickupLocation.lat, lng: pickupLocation.lng });
      bounds.extend({ lat: driverLocation.lat, lng: driverLocation.lng });
      bounds.extend({ lat: dropLocation.lat, lng: dropLocation.lng });
      map.fitBounds(bounds, 50);

    } catch (e) {
      console.error('Error rendering Google Map:', e);
    }
  }, [isGoogleLoaded]);

  // 3. Dynamic Map Style / Type Update
  useEffect(() => {
    if (!mapInstance || !window.google?.maps) return;
    if (mapType === 'satellite') {
      mapInstance.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
      mapInstance.setOptions({ styles: null });
    } else if (mapType === 'roadmap') {
      mapInstance.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      mapInstance.setOptions({ styles: null });
    } else {
      mapInstance.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      mapInstance.setOptions({ styles: DARK_MAP_STYLE });
    }
  }, [mapType, mapInstance]);

  // 4. Update Driver position smoothly on GPS changes
  useEffect(() => {
    if (mapInstance && driverMarker && window.google?.maps) {
      const newPos = new window.google.maps.LatLng(driverLocation.lat, driverLocation.lng);
      driverMarker.setPosition(newPos);
      if (driverLocation.heading !== undefined) {
        const icon = driverMarker.getIcon();
        if (icon) {
          icon.rotation = driverLocation.heading;
          driverMarker.setIcon(icon);
        }
      }
    }
  }, [driverLocation.lat, driverLocation.lng, driverLocation.heading]);

  // Controls Handlers
  const handleCenterDriver = () => {
    if (mapInstance && window.google?.maps) {
      mapInstance.panTo({ lat: driverLocation.lat, lng: driverLocation.lng });
      mapInstance.setZoom(15);
    }
  };

  const handleFitRouteBounds = () => {
    if (mapInstance && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: pickupLocation.lat, lng: pickupLocation.lng });
      bounds.extend({ lat: driverLocation.lat, lng: driverLocation.lng });
      bounds.extend({ lat: dropLocation.lat, lng: dropLocation.lng });
      mapInstance.fitBounds(bounds, 50);
    }
  };

  const handleToggleTraffic = () => {
    if (!trafficLayer || !mapInstance) return;
    if (isTrafficOn) {
      trafficLayer.setMap(null);
      setIsTrafficOn(false);
    } else {
      trafficLayer.setMap(mapInstance);
      setIsTrafficOn(true);
    }
  };

  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${driverLocation.lat},${driverLocation.lng}&destination=${dropLocation.lat},${dropLocation.lng}&travelmode=driving`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 text-white">
      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">{driverName}</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                {vehicleNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
              📍 {driverLocation.address || `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block mr-1">
            <p className="text-xs text-slate-400">ETA / Distance</p>
            <p className="text-sm font-semibold text-emerald-400">{eta} ({distanceRemaining} km)</p>
          </div>

          <a
            href={googleNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Google Navigation</span>
            <ExternalLink className="w-3 h-3 text-blue-200" />
          </a>
        </div>
      </div>

      {/* Main Google Maps Render Container */}
      {isKeyConfigured && isGoogleLoaded && !loadError ? (
        <div ref={mapRef} style={{ height, width: '100%' }} className="z-0" />
      ) : (
        /* Fallback Modern Graphic Map when key loading or offline */
        <div
          style={{ height }}
          className="relative w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden"
        >
          {/* Radial Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Interactive Driver Beacon Graphic */}
          <div className="relative my-4 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute w-28 h-28 rounded-full bg-blue-500/20 border border-blue-400/40"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.4, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="absolute w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/40"
            />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-xl border border-white/20">
              <Truck className="w-7 h-7" />
            </div>
          </div>

          {/* Location Status Telemetry */}
          <div className="relative z-10 max-w-lg w-full bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Zap className="w-3.5 h-3.5" /> Live Geolocation Active
              </span>
              <span className="text-slate-400">
                Speed: <strong className="text-white">{driverLocation.speed || 45} km/h</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-xs">
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
                <span className="text-slate-400 block mb-0.5">Pickup Location</span>
                <span className="text-slate-200 font-medium truncate block">{pickupLocation.address}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
                <span className="text-slate-400 block mb-0.5">Destination</span>
                <span className="text-slate-200 font-medium truncate block">{dropLocation.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Heading: {driverLocation.heading || 90}° East</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <Clock className="w-3.5 h-3.5" /> ETA: {eta}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 p-2 px-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-medium text-emerald-400">Status: {status}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Trip: {tripNumber}</span>
          </div>

          {isKeyConfigured && isGoogleLoaded && (
            <div className="flex items-center gap-1.5">
              {/* Traffic Toggle */}
              <button
                onClick={handleToggleTraffic}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors border ${
                  isTrafficOn
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Toggle Live Traffic"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Traffic</span>
              </button>

              {/* Map Type Selector */}
              <button
                onClick={() => setMapType(prev => prev === 'dark' ? 'roadmap' : prev === 'roadmap' ? 'satellite' : 'dark')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 capitalize"
                title="Change Map Style"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>{mapType}</span>
              </button>

              {/* Recenter Route */}
              <button
                onClick={handleFitRouteBounds}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
                title="Fit Route to Screen"
              >
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Fit Route</span>
              </button>

              {/* Center Driver */}
              <button
                onClick={handleCenterDriver}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors border border-blue-500"
                title="Center Driver Position"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Center Driver</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
