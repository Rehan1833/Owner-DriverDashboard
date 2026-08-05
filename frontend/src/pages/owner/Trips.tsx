import React, { useState, useMemo } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { downloadReport } from '../../utils/downloadReport';
import { Table } from '../../components/tables/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CreateTripModal } from '../../components/trips/CreateTripModal';
import { GoogleDriverMap } from '../../components/common/GoogleDriverMap';
import { PODViewerModal } from '../../components/pod/PODViewerModal';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Zap,
  Activity,
  ShieldAlert,
  History,
  PhoneCall,
  ExternalLink,
  Battery,
  Wifi,
  User,
  FileCheck,
  Download,
  Sparkles,
  X
} from 'lucide-react';
import { Trip } from '../../types';
import { api } from '../../api/client';

export const OwnerTrips: React.FC = () => {
  const { trips, cancelTrip, triggerNotification, company } = useOperations();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Side Drawer & Modal States
  const [activeDrawerTrip, setActiveDrawerTrip] = useState<Trip | null>(null);
  const [viewDetailsTrip, setViewDetailsTrip] = useState<Trip | null>(null);
  const [historyTrip, setHistoryTrip] = useState<Trip | null>(null);
  const [podModalTrip, setPodModalTrip] = useState<Trip | null>(null);
  const [locationHistoryRecords, setLocationHistoryRecords] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Extract unique drivers for filter dropdown
  const uniqueDrivers = useMemo(() => {
    const list = trips.map(t => t.driverName).filter(Boolean);
    return Array.from(new Set(list));
  }, [trips]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const matchSearch = 
        t.tripNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.vehicleNumber && t.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.pickupLocation && t.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.dropLocation && t.dropLocation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchDriver = driverFilter === 'All' || t.driverName === driverFilter;

      return matchSearch && matchStatus && matchDriver;
    });
  }, [trips, searchQuery, statusFilter, driverFilter]);

  const handleCancel = async (id: string, tripNum: string) => {
    if (window.confirm(`Are you sure you want to cancel trip ${tripNum}?`)) {
      try {
        await cancelTrip(id);
        triggerNotification('Critical', 'Trip Cancelled', `Trip ${tripNum} was cancelled by owner.`, 'Warning');
      } catch (err: any) {
        alert(err.message || 'Failed to cancel trip.');
      }
    }
  };

  const handleExportCSV = () => {
    if (filteredTrips.length === 0) {
      triggerNotification('System Alert', 'No Data to Export', 'No trip records match the current filters.', 'Warning');
      return;
    }
    const headers = ['Trip Number', 'Driver ID', 'Driver Name', 'Vehicle Number', 'Pickup Location', 'Drop Location', 'Current Location', 'Status', 'Speed (km/h)', 'ETA', 'Distance Remaining (km)', 'Created At'];
    const rows = filteredTrips.map(t => [
      t.tripNumber,
      t.driverId || 'DRV-2026-000001',
      t.driverName,
      t.vehicleNumber,
      t.pickupLocation || '',
      t.dropLocation || '',
      t.currentAddress || t.currentLocation || '',
      t.status,
      t.speed || 0,
      t.eta || 'N/A',
      t.distanceRemaining || 0,
      t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString()
    ]);

    downloadReport({
      fileName: 'smartops_trip_dispatch_ledger',
      title: 'Consignment Dispatch & Trip Control Ledger',
      format: 'CSV',
      headers,
      rows,
      summary: 'Logs of active vehicle assignments, driver routing checkpoints, and consignment status updates.',
      filters: {
        Search: searchQuery || 'All',
        Status: statusFilter,
        Driver: driverFilter
      }
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200';
      case 'Accepted':
        return 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300';
      case 'Started':
        return 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300';
      case 'On Route':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300';
      case 'Reached Pickup':
        return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      case 'Loaded':
        return 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300';
      case 'In Transit':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Near Destination':
        return 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300';
      case 'Delivered':
        return 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300';
      case 'POD Uploaded':
        return 'bg-sky-100 text-sky-800 border-sky-300 font-extrabold dark:bg-sky-950/80 dark:text-sky-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-400 font-extrabold dark:bg-emerald-950 dark:text-emerald-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const calculateTripProgress = (status: string) => {
    switch (status) {
      case 'Draft':
      case 'Assigned':
        return 5;
      case 'Accepted':
        return 15;
      case 'Started':
        return 25;
      case 'Reached Pickup':
        return 38;
      case 'Loaded':
        return 50;
      case 'In Transit':
      case 'On Route':
        return 68;
      case 'Near Destination':
      case 'At Stop':
        return 85;
      case 'Delivered':
        return 92;
      case 'POD Uploaded':
        return 98;
      case 'Completed':
        return 100;
      case 'Cancelled':
        return 0;
      default:
        return 50;
    }
  };

  const calculateFreshness = (trip: Trip) => {
    if (!trip.lastGpsUpdate && !trip.latitude) return { label: '⚫ GPS Disabled', status: 'OFFLINE', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-300' };
    const lastTime = trip.lastGpsUpdate ? new Date(trip.lastGpsUpdate).getTime() : new Date(trip.timestamp || Date.now()).getTime();
    const diffMins = Math.floor((Date.now() - lastTime) / 60000);
    if (diffMins < 2) return { label: '🟢 Driver Online', status: 'ONLINE', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300' };
    if (diffMins < 5) return { label: `🟠 Driver Idle (${diffMins}m)`, status: 'IDLE', color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-300' };
    return { label: '🔴 Offline', status: 'OFFLINE', color: 'text-red-700 bg-red-50 dark:bg-red-950/40 border-red-300' };
  };

  const handleOpenHistory = async (trip: Trip) => {
    setHistoryTrip(trip);
    setHistoryLoading(true);
    try {
      const records = await api.trips.getLocationHistory(trip.id);
      setLocationHistoryRecords(records);
    } catch (err) {
      console.error('Failed to fetch location history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Exact 6 Column Layout matching Screenshot
  const columns = [
    {
      header: 'TRIP CONSIGNMENT',
      accessor: (t: Trip) => (
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-sm text-[#0B1C30] dark:text-[#F8FAFC]">
              {t.tripNumber}
            </span>
            <span
              onClick={() => setActiveDrawerTrip(t)}
              className="font-mono font-bold text-[10px] bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 cursor-pointer hover:bg-teal-100"
            >
              {t.driverId || 'DRV-2026-000001'}
            </span>
            {t.priority && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                t.priority === 'Urgent' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                t.priority === 'High' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                'bg-blue-500/20 text-blue-500 border border-blue-500/30'
              }`}>
                {t.priority}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#6D7A79] dark:text-[#94A3B8] font-medium block mt-0.5">
            {t.material || 'General Freight'} ({t.weight || '1.5 T'})
          </span>
        </div>
      )
    },
    {
      header: 'ASSIGNED DRIVER & VEHICLE',
      accessor: (t: Trip) => (
        <div
          onClick={() => setActiveDrawerTrip(t)}
          className="cursor-pointer group text-left"
        >
          <div className="font-bold text-slate-800 dark:text-white text-xs group-hover:text-teal-600 transition-colors">
            {t.driverName || 'Driver'}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
              {t.vehicleNumber}
            </span>
            {t.customerPhone && (
              <a
                href={`tel:${t.customerPhone}`}
                onClick={e => e.stopPropagation()}
                className="text-[10px] text-teal-600 hover:underline font-mono"
              >
                📞 {t.customerPhone}
              </a>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'ROUTE & WAYPOINTS',
      accessor: (t: Trip) => (
        <div className="text-left max-w-xs">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate" title={t.pickupLocation}>
            📍 {t.pickupLocation}
          </div>
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 truncate mt-0.5" title={t.dropLocation}>
            🏁 {t.dropLocation}
          </div>
          {t.stops && t.stops.length > 0 && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block">
              + {t.stops.length} waypoint stop(s)
            </span>
          )}
        </div>
      )
    },
    {
      header: 'LIFECYCLE STATUS',
      accessor: (t: Trip) => {
        const pct = calculateTripProgress(t.status);
        return (
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadgeStyle(t.status)}`}>
                {t.status}
              </span>
              <span className="font-mono text-[10px] font-extrabold text-teal-700 dark:text-teal-300">
                ⏳ {t.eta || '34 mins'} ({t.distanceRemaining || 18} km)
              </span>
            </div>

            <div className="w-32">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                <span>Progress</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'GPS TELEMETRY STATUS',
      accessor: (t: Trip) => {
        const fresh = calculateFreshness(t);
        return (
          <div className="text-left max-w-[160px]">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${fresh.color}`}>
                {fresh.label}
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">
                ⚡ {t.speed ? `${t.speed} km/h` : '0 km/h'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 truncate" title={t.currentAddress || t.currentLocation || 'In Transit'}>
              {t.currentAddress || t.currentLocation || 'Near Pune Station'}
            </span>
          </div>
        );
      }
    },
    {
      header: 'OPERATIONAL ACTIONS',
      accessor: (t: Trip) => {
        const lat = t.latitude || t.pickupCoordinates?.lat || 18.5204;
        const lng = t.longitude || t.pickupCoordinates?.lng || 73.8567;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        return (
          <div className="flex items-center justify-start gap-1.5">
            {/* Small button for driver live location */}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 dark:text-teal-200 hover:text-teal-950 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 px-2 py-1 rounded border border-teal-200 dark:border-teal-800 transition-all shadow-xs"
              title="Open Driver Live Location on Google Maps"
            >
              📍 Live Map <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDrawerTrip(t)}
              className="text-[10px] py-1 px-2 border-teal-300 text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40"
              title="Open Driver Card Drawer"
            >
              <User className="w-3 h-3 mr-0.5" /> Track
            </Button>

            <button
              onClick={() => setViewDetailsTrip(t)}
              className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              title="View Consignment Specs"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {(t.status === 'POD Uploaded' || t.status === 'Delivered' || t.status === 'Completed') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPodModalTrip(t)}
                className="text-[10px] py-1 px-1.5 bg-blue-50 text-blue-700 border-blue-200 font-bold"
              >
                <FileCheck className="w-3 h-3 mr-0.5 text-blue-600" /> POD
              </Button>
            )}

            {t.status !== 'Completed' && t.status !== 'Cancelled' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleCancel(t.id, t.tripNumber)}
                className="text-[10px] py-1 px-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                title="End Trip"
              >
                <XCircle className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Toolbar matching Screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-slate-100 tracking-tight leading-none">
            Consignment Dispatch & Trip Control Desk
          </h2>
          <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">
            Manage trip allocations, active driver GPS telemetry, waypoint progress, and delivery verification.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#006A6A] hover:bg-[#005555] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-teal-500/10"
        >
          <Plus className="h-4 w-4 mr-2" /> Create & Assign New Trip
        </Button>
      </div>

      {/* Search & Filter Bar matching Screenshot */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <Search className="search-icon-glow absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search by Trip #, Driver, Vehicle, Pickup, Destination..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="navbar-search-input w-full pl-9 pr-3 h-9 text-xs border border-[#E5E7EB] dark:border-[#334155] rounded-full bg-slate-50/50 dark:bg-slate-800/40 text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#006A6A] focus:border-[#006A6A] transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#6D7A79]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="p-2 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-white"
            >
              <option value="All">All Statuses ({filteredTrips.length})</option>
              <option value="Assigned">Assigned</option>
              <option value="Accepted">Accepted</option>
              <option value="Started">Started</option>
              <option value="On Route">On Route</option>
              <option value="Reached Pickup">Reached Pickup</option>
              <option value="Loaded">Loaded</option>
              <option value="In Transit">In Transit</option>
              <option value="Near Destination">Near Destination</option>
              <option value="Delivered">Delivered</option>
              <option value="POD Uploaded">POD Uploaded</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#6D7A79]">Driver:</span>
            <select
              value={driverFilter}
              onChange={e => setDriverFilter(e.target.value)}
              className="p-2 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-white"
            >
              <option value="All">All Drivers</option>
              {uniqueDrivers.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container matching Screenshot */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E5EEFF] dark:border-[#334155] shadow-sm p-4 space-y-3">
        {/* Export CSV Bar */}
        <div className="flex justify-end">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>
        </div>

        {/* Table or Empty State */}
        {filteredTrips.length === 0 ? (
          <div className="py-16 text-center text-[#6D7A79] dark:text-[#94A3B8] font-medium text-sm">
            No matching records found.
          </div>
        ) : (
          <Table data={filteredTrips} columns={columns} />
        )}
      </div>

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* DRIVER CARD SIDE DRAWER (Enterprise SaaS Logistics Panel) */}
      {activeDrawerTrip && (() => {
        const fresh = calculateFreshness(activeDrawerTrip);
        const lat = activeDrawerTrip.latitude || 18.5204;
        const lng = activeDrawerTrip.longitude || 73.8567;
        const liveMapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const pct = calculateTripProgress(activeDrawerTrip.status);

        return (
          <div
            className="fixed inset-0 z-50 bg-slate-900/20 flex justify-end transition-opacity"
            onClick={() => setActiveDrawerTrip(null)}
          >
            <div
              className="w-full max-w-[480px] md:max-w-[440px] sm:max-w-full bg-white dark:bg-[#0F172A] h-full shadow-2xl overflow-y-auto flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] sticky top-0 z-20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#006A6A] to-teal-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
                    {(activeDrawerTrip.driverName || 'D')[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[20px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-none truncate">
                      {activeDrawerTrip.driverName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[14px] font-medium font-mono text-slate-500 dark:text-slate-400">
                        {activeDrawerTrip.driverId || 'DRV-8106'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${fresh.color}`}>
                        {fresh.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDrawerTrip(null)}
                  aria-label="Close drawer"
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0 ml-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body (8px spacing system, 24px section gaps, 16px card gaps) */}
              <div className="p-6 space-y-6 text-left flex-1 text-xs">
                
                {/* 1. Primary Information Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Assigned Vehicle
                    </span>
                    <span className="text-[16px] font-bold text-[#0F172A] dark:text-[#F8FAFC] font-mono block">
                      {activeDrawerTrip.vehicleNumber}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Company
                    </span>
                    <span className="text-[16px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block truncate" title={company?.companyName || 'Fourise Pvt. Ltd.'}>
                      {company?.companyName || 'Fourise Pvt. Ltd.'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Driver Phone
                    </span>
                    <a
                      href={`tel:${activeDrawerTrip.customerPhone || '9876543210'}`}
                      className="text-[16px] font-bold text-[#006A6A] dark:text-teal-400 hover:underline flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-4 h-4 text-[#006A6A] shrink-0" />
                      <span>{activeDrawerTrip.customerPhone || '9876543210'}</span>
                    </a>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Trip Number
                    </span>
                    <span className="text-[16px] font-bold text-[#0F172A] dark:text-[#F8FAFC] font-mono block">
                      {activeDrawerTrip.tripNumber}
                    </span>
                  </div>
                </div>

                {/* 2. Current Address Location Card */}
                <div className="p-4 bg-teal-50/80 dark:bg-teal-950/40 rounded-2xl border border-teal-200/80 dark:border-teal-800/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#006A6A] dark:text-teal-400" /> Current Address Location
                    </span>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full">
                      Live GPS
                    </span>
                  </div>
                  <p className="text-[16px] font-extrabold text-[#0F172A] dark:text-slate-100 leading-snug break-words mt-1">
                    {activeDrawerTrip.currentAddress || activeDrawerTrip.currentLocation || 'Pune DC Gate 1, Maharashtra'}
                  </p>
                </div>

                {/* 3. Trip Progress & Checkpoint Timeline Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                      Trip Lifecycle Progress
                    </span>
                    <span className="text-[16px] font-bold text-[#006A6A] dark:text-teal-400 font-mono">
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#006A6A] to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Route Waypoints Timeline */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-emerald-300">
                        ✓
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase">Pickup Origin</span>
                        <span className="text-[13px] font-bold text-[#0F172A] dark:text-slate-200 truncate block">
                          📍 {activeDrawerTrip.pickupLocation || 'Pune Central Logistics Hub'}
                        </span>
                      </div>
                    </div>

                    <div className="ml-3 pl-3 border-l-2 border-dashed border-teal-400/40 py-1 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Waypoint / Checkpoint 1</span>
                        <span className="text-emerald-600 font-bold">Passed</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-rose-300">
                        🏁
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase">Destination Dropoff</span>
                        <span className="text-[13px] font-bold text-[#0F172A] dark:text-slate-200 truncate block">
                          🎯 {activeDrawerTrip.dropLocation || 'Chakan Industrial Zone'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Live Telemetry Metric Cards Grid */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Current Speed</span>
                    <span className="text-[16px] font-bold text-[#0F172A] dark:text-white font-mono block">
                      {activeDrawerTrip.speed || 0} km/h
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block mb-1">GPS Accuracy</span>
                    <span className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400 font-mono block">
                      ±{activeDrawerTrip.accuracy || 10} m
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block mb-1">ETA</span>
                    <span className="text-[16px] font-bold text-[#006A6A] dark:text-teal-300 font-mono block">
                      {activeDrawerTrip.eta || '34 Mins'}
                    </span>
                  </div>
                </div>

                {/* 5. Device Telemetry & Signal Bar */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                  <div>
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">Distance Left</span>
                    <span className="text-[16px] font-bold text-[#0F172A] dark:text-white font-mono">
                      {activeDrawerTrip.distanceRemaining || 18.4} km
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono font-bold text-xs">
                    <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                      <Battery className="w-4 h-4 text-emerald-600" /> {(activeDrawerTrip as any).battery || 92}%
                    </span>
                    <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800/50">
                      <Wifi className="w-4 h-4 text-blue-600" /> {(activeDrawerTrip as any).network || '4G'}
                    </span>
                  </div>
                </div>

                {/* 6. Live Telemetry Coordinates Banner */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-2xs">
                  <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                    Raw Telemetry Coordinates
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs text-[#0F172A] dark:text-slate-200">
                    <div>Lat: <strong className="font-bold">{lat.toFixed(5)}° N</strong></div>
                    <div>Lng: <strong className="font-bold">{lng.toFixed(5)}° E</strong></div>
                    <div>Heading: <strong className="font-bold">90° (East)</strong></div>
                    <div>Updated: <strong className="font-bold text-emerald-600">Just now</strong></div>
                  </div>
                </div>

                {/* 7. Google Map Widget Container */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#0F172A] dark:text-slate-200">
                      Live Driver GPS Navigation Map
                    </span>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                    <GoogleDriverMap
                      driverLocation={{
                        lat,
                        lng,
                        speed: activeDrawerTrip.speed || 0,
                        address: activeDrawerTrip.currentAddress
                      }}
                      pickupLocation={{
                        lat: activeDrawerTrip.pickupCoordinates?.lat || 18.5204,
                        lng: activeDrawerTrip.pickupCoordinates?.lng || 73.8567,
                        address: activeDrawerTrip.pickupLocation
                      }}
                      dropLocation={{
                        lat: activeDrawerTrip.dropCoordinates?.lat || 18.7602,
                        lng: activeDrawerTrip.dropCoordinates?.lng || 73.8612,
                        address: activeDrawerTrip.dropLocation
                      }}
                      height="260px"
                      showControls={true}
                    />
                  </div>

                  {/* Full-width Open in Google Maps Button */}
                  <a
                    href={liveMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#006A6A] hover:bg-[#005555] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <span>📍 Open in Google Maps</span>
                    <ExternalLink className="w-4 h-4 text-teal-100" />
                  </a>
                </div>

                {/* 8. Extra Operational Actions (View POD if available) */}
                {(activeDrawerTrip.status === 'POD Uploaded' || activeDrawerTrip.status === 'Delivered' || activeDrawerTrip.status === 'Completed') && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setPodModalTrip(activeDrawerTrip)}
                      className="w-full py-3 border-blue-300 text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 rounded-xl"
                    >
                      <FileCheck className="w-4 h-4 mr-2" /> View Verified Proof of Delivery (POD)
                    </Button>
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}

      {/* POD Viewer Modal */}
      {podModalTrip && (
        <PODViewerModal
          isOpen={Boolean(podModalTrip)}
          onClose={() => setPodModalTrip(null)}
          tripId={podModalTrip.id}
          orderNumber={podModalTrip.invoiceNumber || podModalTrip.tripNumber}
        />
      )}

      {/* Location History Trail Modal */}
      {historyTrip && (
        <Modal
          isOpen={Boolean(historyTrip)}
          onClose={() => setHistoryTrip(null)}
          title={`Location History Audit Trail - ${historyTrip.tripNumber}`}
        >
          <div className="space-y-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
              <div>
                <span className="font-bold block">Driver: {historyTrip.driverName} ({historyTrip.driverId || 'DRV-2026-000001'})</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Vehicle: {historyTrip.vehicleNumber} · Status: {historyTrip.status}</span>
              </div>
              <div className="text-right">
                <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/30">
                  {locationHistoryRecords.length} GPS Trail Records
                </span>
              </div>
            </div>

            <GoogleDriverMap
              driverLocation={{
                lat: historyTrip.latitude || 18.5204,
                lng: historyTrip.longitude || 73.8567,
                address: historyTrip.currentAddress
              }}
              pickupLocation={{
                lat: historyTrip.pickupCoordinates?.lat || 18.5204,
                lng: historyTrip.pickupCoordinates?.lng || 73.8567,
                address: historyTrip.pickupLocation
              }}
              dropLocation={{
                lat: historyTrip.dropCoordinates?.lat || 18.7602,
                lng: historyTrip.dropCoordinates?.lng || 73.8612,
                address: historyTrip.dropLocation
              }}
              locationHistory={locationHistoryRecords.map(r => ({
                lat: r.latitude,
                lng: r.longitude,
                address: r.address,
                timestamp: r.timestamp,
                speed: r.speed
              }))}
              height="280px"
            />
          </div>
        </Modal>
      )}

      {/* Trip Details Modal */}
      {viewDetailsTrip && (
        <Modal
          isOpen={Boolean(viewDetailsTrip)}
          onClose={() => setViewDetailsTrip(null)}
          title={`Trip Consignment Details - ${viewDetailsTrip.tripNumber}`}
        >
          <div className="space-y-4 text-left text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-bold text-[11px] uppercase tracking-wider">Assigned Driver</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs block">{viewDetailsTrip.driverName}</span>
                <span className="font-mono text-[10px] text-teal-700 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 inline-block mt-1">
                  {viewDetailsTrip.driverId || 'DRV-2026-000001'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-bold text-[11px] uppercase tracking-wider">Assigned Truck</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-xs bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block">
                  {viewDetailsTrip.vehicleNumber}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-extrabold text-slate-900 dark:text-white block border-b border-slate-200 dark:border-slate-700 pb-1.5 uppercase tracking-wider text-[11px]">
                Cargo & Invoice Specification
              </span>
              <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-200">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Material</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs">{viewDetailsTrip.material || 'General Freight'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Weight</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs">{viewDetailsTrip.weight || '1.5 Tons'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Invoice #</span>
                  <strong className="font-mono text-slate-900 dark:text-white font-extrabold text-xs">{viewDetailsTrip.invoiceNumber || 'INV-2026-001'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Priority</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase inline-block ${
                    viewDetailsTrip.priority === 'Urgent' ? 'bg-red-500/20 text-red-600 border border-red-500/30' :
                    viewDetailsTrip.priority === 'High' ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                  }`}>
                    {viewDetailsTrip.priority || 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
