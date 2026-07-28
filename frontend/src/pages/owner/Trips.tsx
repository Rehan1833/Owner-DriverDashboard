import React, { useState, useMemo } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Table } from '../../components/tables/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CreateTripModal } from '../../components/trips/CreateTripModal';
import { GoogleDriverMap } from '../../components/common/GoogleDriverMap';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Navigation,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Zap,
  Activity,
  ShieldAlert,
  History
} from 'lucide-react';
import { Trip } from '../../types';
import { api } from '../../api/client';

export const OwnerTrips: React.FC = () => {
  const { trips, cancelTrip, triggerNotification } = useOperations();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTrackingTrip, setSelectedTrackingTrip] = useState<Trip | null>(null);
  const [viewDetailsTrip, setViewDetailsTrip] = useState<Trip | null>(null);
  const [historyTrip, setHistoryTrip] = useState<Trip | null>(null);
  const [locationHistoryRecords, setLocationHistoryRecords] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Extract unique drivers for filter dropdown
  const uniqueDrivers = useMemo(() => {
    const drivers = Array.from(new Set(trips.map(t => t.driverName)));
    return drivers;
  }, [trips]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const matchesSearch =
        trip.tripNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.dropLocation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || trip.status === statusFilter;
      const matchesDriver = driverFilter === 'All' || trip.driverName === driverFilter;

      return matchesSearch && matchesStatus && matchesDriver;
    });
  }, [trips, searchQuery, statusFilter, driverFilter]);

  const handleCancel = async (id: string, tripNum: string) => {
    if (window.confirm(`Are you sure you want to cancel trip ${tripNum}?`)) {
      try {
        await cancelTrip(id);
        triggerNotification('Critical', 'Trip Cancelled', `Trip ${tripNum} assignment was cancelled by owner.`, 'Warning');
      } catch (err: any) {
        alert(err.message || 'Failed to cancel trip.');
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return 'success';
      case 'In Transit':
      case 'Started':
      case 'Accepted':
        return 'info';
      case 'Assigned':
      case 'Draft':
        return 'neutral';
      case 'At Stop':
      case 'Delayed':
        return 'warning';
      case 'Cancelled':
      case 'Incident Reported':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const calculateFreshness = (trip: Trip) => {
    if (!trip.lastGpsUpdate && !trip.latitude) return { label: '🔴 GPS OFFLINE', status: 'OFFLINE', color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200' };
    const lastTime = trip.lastGpsUpdate ? new Date(trip.lastGpsUpdate).getTime() : new Date(trip.timestamp).getTime();
    const diffMins = Math.floor((Date.now() - lastTime) / 60000);
    if (diffMins < 2) return { label: '🟢 LIVE', status: 'LIVE', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' };
    if (diffMins < 5) return { label: `🟡 STALE (${diffMins}m ago)`, status: 'STALE', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200' };
    return { label: '🔴 GPS OFFLINE', status: 'OFFLINE', color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200' };
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

  const columns = [
    {
      header: 'Trip Consignment',
      accessor: (t: Trip) => (
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-sm text-[#0B1C30] dark:text-[#F8FAFC]">
              {t.tripNumber}
            </span>
            {t.priority && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                t.priority === 'Urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                t.priority === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {t.priority}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#6D7A79] dark:text-[#94A3B8] font-medium block mt-0.5">
            {t.material} ({t.weight || '1.5 T'})
          </span>
        </div>
      )
    },
    {
      header: 'Assigned Driver & Vehicle',
      accessor: (t: Trip) => (
        <div className="text-left">
          <div className="font-bold text-slate-800 dark:text-white text-xs">{t.driverName}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <Badge variant="neutral" className="text-[10px] font-mono px-1.5 py-0">
              {t.vehicleNumber}
            </Badge>
          </div>
        </div>
      )
    },
    {
      header: 'Route & Waypoints',
      accessor: (t: Trip) => (
        <div className="text-left max-w-xs">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate">
            📍 {t.pickupLocation}
          </div>
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 truncate mt-0.5">
            🏁 {t.dropLocation}
          </div>
          {t.stops && t.stops.length > 0 && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block">
              + {t.stops.length} intermediate waypoint stop(s)
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Lifecycle Status',
      accessor: (t: Trip) => (
        <div className="text-left">
          <Badge variant={getStatusBadgeVariant(t.status)} className="px-2.5 py-1 text-xs font-bold">
            {t.status}
          </Badge>
          <div className="text-[10px] text-[#6D7A79] dark:text-[#94A3B8] mt-1 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" /> ETA: {t.eta || '30 Mins'} ({t.distanceRemaining || 18} km)
          </div>
        </div>
      )
    },
    {
      header: 'GPS Telemetry Status',
      accessor: (t: Trip) => {
        const fresh = calculateFreshness(t);
        return (
          <div className="text-left">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${fresh.color}`}>
              {fresh.label}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1 truncate max-w-[140px]">
              {t.currentAddress || t.currentLocation || 'No signal'}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Operational Actions',
      accessor: (t: Trip) => (
        <div className="flex items-center justify-start gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTrackingTrip(t)}
            className="text-[11px] py-1 px-2 border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Navigation className="w-3.5 h-3.5 mr-1" /> Track
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDetailsTrip(t)}
            className="text-[11px] py-1 px-2"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          {t.status !== 'Completed' && t.status !== 'Cancelled' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleCancel(t.id, t.tripNumber)}
              className="text-[11px] py-1 px-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            >
              <XCircle className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Toolbar */}
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

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Trip #, Driver, Vehicle, Pickup, Destination..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-slate-50 dark:bg-slate-900 font-medium text-slate-800 dark:text-white"
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
              className="p-2 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-slate-900 font-bold"
            >
              <option value="All">All Statuses ({trips.length})</option>
              <option value="Assigned">Assigned</option>
              <option value="Accepted">Accepted</option>
              <option value="Started">Started</option>
              <option value="In Transit">In Transit</option>
              <option value="At Stop">At Stop</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
              <option value="Incident Reported">Incident Reported</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#6D7A79]">Driver:</span>
            <select
              value={driverFilter}
              onChange={e => setDriverFilter(e.target.value)}
              className="p-2 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-slate-900 font-bold"
            >
              <option value="All">All Drivers</option>
              {uniqueDrivers.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Trip Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E5EEFF] dark:border-[#334155] shadow-sm overflow-hidden">
        <Table data={filteredTrips} columns={columns} />
      </div>

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Owner Live Driver Tracking Drawer Modal */}
      {selectedTrackingTrip && (() => {
        const fresh = calculateFreshness(selectedTrackingTrip);
        return (
          <Modal
            isOpen={Boolean(selectedTrackingTrip)}
            onClose={() => setSelectedTrackingTrip(null)}
            title={`Live GPS Control Desk - ${selectedTrackingTrip.tripNumber}`}
          >
            <div className="space-y-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-3.5 rounded-xl border border-slate-700 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold border ${fresh.color}`}>
                    {fresh.label}
                  </span>
                  <span className="font-bold text-white">Driver: {selectedTrackingTrip.driverName} ({selectedTrackingTrip.vehicleNumber})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(selectedTrackingTrip.status)}>
                    {selectedTrackingTrip.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const t = selectedTrackingTrip;
                      setSelectedTrackingTrip(null);
                      handleOpenHistory(t);
                    }}
                    className="text-xs text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/40 bg-slate-800 py-1"
                  >
                    <History className="w-3.5 h-3.5 mr-1" /> Location History
                  </Button>
                </div>
              </div>

              <GoogleDriverMap
                driverLocation={{
                  lat: selectedTrackingTrip.latitude || selectedTrackingTrip.pickupCoordinates?.lat || 18.5204,
                  lng: selectedTrackingTrip.longitude || selectedTrackingTrip.pickupCoordinates?.lng || 73.8567,
                  speed: selectedTrackingTrip.speed || 0,
                  heading: selectedTrackingTrip.heading || 0,
                  address: selectedTrackingTrip.currentAddress || selectedTrackingTrip.pickupLocation
                }}
                pickupLocation={{
                  lat: selectedTrackingTrip.pickupCoordinates?.lat || 18.5204,
                  lng: selectedTrackingTrip.pickupCoordinates?.lng || 73.8567,
                  address: selectedTrackingTrip.pickupLocation
                }}
                dropLocation={{
                  lat: selectedTrackingTrip.dropCoordinates?.lat || 18.7602,
                  lng: selectedTrackingTrip.dropCoordinates?.lng || 73.8612,
                  address: selectedTrackingTrip.dropLocation
                }}
                driverName={selectedTrackingTrip.driverName}
                vehicleNumber={selectedTrackingTrip.vehicleNumber}
                tripNumber={selectedTrackingTrip.tripNumber}
                eta={selectedTrackingTrip.eta}
                distanceRemaining={selectedTrackingTrip.distanceRemaining}
                status={selectedTrackingTrip.status}
                height="340px"
                showControls={true}
              />

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase mb-0.5">Latitude / Longitude</span>
                  <span className="font-semibold text-slate-800 dark:text-white font-mono text-[11px]">
                    {selectedTrackingTrip.latitude ? `${selectedTrackingTrip.latitude.toFixed(4)}, ${selectedTrackingTrip.longitude?.toFixed(4)}` : '18.5204, 73.8567'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase mb-0.5">GPS Accuracy</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    🎯 {selectedTrackingTrip.accuracy ? `${selectedTrackingTrip.accuracy} m` : '8.2 m'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase mb-0.5">Speed / Heading</span>
                  <span className="font-semibold text-slate-800 dark:text-white font-mono text-[11px]">
                    ⚡ {selectedTrackingTrip.speed || 0} km/h ({selectedTrackingTrip.heading || 0}°)
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase mb-0.5">Last Signal Update</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-[11px]">
                    {selectedTrackingTrip.lastGpsUpdate ? new Date(selectedTrackingTrip.lastGpsUpdate).toLocaleTimeString() : 'Active Stream'}
                  </span>
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Location History Trail Modal */}
      {historyTrip && (
        <Modal
          isOpen={Boolean(historyTrip)}
          onClose={() => setHistoryTrip(null)}
          title={`Location History Audit Trail - ${historyTrip.tripNumber}`}
        >
          <div className="space-y-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-3.5 rounded-xl border border-slate-700 text-xs text-white">
              <div>
                <span className="font-bold block">Driver: {historyTrip.driverName} ({historyTrip.driverId})</span>
                <span className="text-slate-400 text-[11px]">Vehicle: {historyTrip.vehicleNumber} · Status: {historyTrip.status}</span>
              </div>
              <div className="text-right">
                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border border-emerald-500/30">
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
              height="300px"
            />

            {/* Recorded Location Breadcrumbs Table */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 p-3 max-h-56 overflow-y-auto space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                MongoDB Location Audit Trail ({locationHistoryRecords.length})
              </span>
              {historyLoading ? (
                <div className="py-6 text-center text-slate-400">Loading location history trail...</div>
              ) : locationHistoryRecords.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No historical GPS breadcrumbs recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700/60">
                  {locationHistoryRecords.map((item, idx) => (
                    <div key={item._id || idx} className="py-2 flex items-center justify-between gap-3 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          📍 {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] truncate max-w-xs">
                          {item.address || 'In Transit Area'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-slate-600 dark:text-slate-300 block">
                          ⚡ {item.speed || 0} km/h · 🎯 {item.accuracy || 10}m
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5 font-bold">Assigned Driver</span>
                <span className="font-bold text-slate-800 dark:text-white">{viewDetailsTrip.driverName} ({viewDetailsTrip.driverId})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5 font-bold">Assigned Truck</span>
                <span className="font-bold text-slate-800 dark:text-white">{viewDetailsTrip.vehicleNumber}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 block border-b border-slate-200 dark:border-slate-700 pb-1 uppercase tracking-wide text-[10px]">
                Cargo & Invoice Specification
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div>Material: <strong className="text-slate-900 dark:text-white">{viewDetailsTrip.material}</strong></div>
                <div>Weight: <strong className="text-slate-900 dark:text-white">{viewDetailsTrip.weight}</strong></div>
                <div>Invoice #: <strong className="text-slate-900 dark:text-white">{viewDetailsTrip.invoiceNumber}</strong></div>
                <div>Priority: <strong className="text-slate-900 dark:text-white">{viewDetailsTrip.priority || 'Normal'}</strong></div>
              </div>
            </div>

            {viewDetailsTrip.notes && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                <strong className="block mb-0.5">Driver Dispatch Notes:</strong>
                {viewDetailsTrip.notes}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
