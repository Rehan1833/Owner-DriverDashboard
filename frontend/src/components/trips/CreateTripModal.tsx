import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MapPin, Plus, Trash2, Truck, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Trip, TripStop } from '../../types';
import { useOperations } from '../../store/OperationsContext';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated?: (trip: Trip) => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({ isOpen, onClose, onTripCreated }) => {
  const { vehicles, attendance, createTrip, triggerNotification } = useOperations();

  const [tripId] = useState<string>(`TRP-${Date.now().toString().slice(-6)}`);
  const [driverId, setDriverId] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [pickupLocation, setPickupLocation] = useState<string>('Pune DC Gate 1, Maharashtra');
  const [pickupLat, setPickupLat] = useState<number>(18.5204);
  const [pickupLng, setPickupLng] = useState<number>(73.8567);
  const [dropLocation, setDropLocation] = useState<string>('Chakan Industrial Estate, Pune');
  const [dropLat, setDropLat] = useState<number>(18.7602);
  const [dropLng, setDropLng] = useState<number>(73.8612);

  // Cargo & Priority
  const [cargoDesc, setCargoDesc] = useState<string>('Automotive Spare Components');
  const [cargoQty, setCargoQty] = useState<number>(120);
  const [cargoWeight, setCargoWeight] = useState<string>('2.4 Tons');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  // Schedule
  const [scheduleDate, setScheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00 AM');
  const [expectedEndTime, setExpectedEndTime] = useState<string>('02:00 PM');
  const [notes, setNotes] = useState<string>('Handle fragile automotive crates with care. Verify customer identity upon arrival.');

  // Stops
  const [stops, setStops] = useState<TripStop[]>([
    {
      sequence: 1,
      address: 'Bhiwandi Hub Gate 4',
      latitude: 19.2968,
      longitude: 73.0631,
      status: 'Pending',
      notes: 'Unload Crate B-12'
    }
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ── Real registered drivers from DB via attendance records ──
  // attendance is populated by the OperationsContext from /api/attendance
  // Only drivers who have checked in (started duty) appear here.
  const activeDrivers = React.useMemo(() => {
    const seen = new Set<string>();
    const list: { driverId: string; name: string; status: string }[] = [];

    attendance.forEach(a => {
      const id = a.driverId;
      const name = a.driverName || a.employeeName || '';
      if (id && name && !seen.has(id)) {
        seen.add(id);
        list.push({
          driverId: id,
          name,
          status: a.currentStatus || 'On Duty',
        });
      }
    });

    return list;
  }, [attendance]);

  // Set default driver selection to first real driver whenever the list loads
  useEffect(() => {
    if (activeDrivers.length > 0 && !driverId) {
      setDriverId(activeDrivers[0].driverId);
      setDriverName(activeDrivers[0].name);
    }
  }, [activeDrivers]);

  // ── Real vehicles from DB via fleet records ──
  const availableVehicles = vehicles.length > 0 ? vehicles : [];

  // Set default vehicle when list loads
  useEffect(() => {
    if (availableVehicles.length > 0 && !vehicleNumber) {
      setVehicleNumber(availableVehicles[0].vehicleNumber);
    }
  }, [availableVehicles]);

  const handleAddStop = () => {
    setStops(prev => [
      ...prev,
      {
        sequence: prev.length + 1,
        address: `Transit Stop ${prev.length + 1}`,
        latitude: 18.6000 + prev.length * 0.05,
        longitude: 73.8000 + prev.length * 0.05,
        status: 'Pending'
      }
    ]);
  };

  const handleRemoveStop = (idx: number) => {
    setStops(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sequence: i + 1 })));
  };

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dId = e.target.value;
    setDriverId(dId);
    const selected = activeDrivers.find(d => d.driverId === dId);
    if (selected) setDriverName(selected.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!driverId) return setErrorMsg('Please assign an active driver.');
    if (!vehicleNumber) return setErrorMsg('Please assign an available vehicle.');
    if (!pickupLocation || isNaN(pickupLat) || isNaN(pickupLng)) return setErrorMsg('Valid pickup location and coordinates required.');
    if (!dropLocation || isNaN(dropLat) || isNaN(dropLng)) return setErrorMsg('Valid destination location and coordinates required.');

    setIsSubmitting(true);
    try {
      const payload: Partial<Trip> = {
        tripNumber: tripId,
        driverId,
        driverName,
        vehicleNumber,
        pickupLocation,
        pickupCoordinates: { lat: pickupLat, lng: pickupLng },
        dropLocation,
        dropCoordinates: { lat: dropLat, lng: dropLng },
        customerName: 'SmartOps Logistics Partner',
        customerPhone: '9876543210',
        material: cargoDesc,
        weight: cargoWeight,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        priority,
        cargo: {
          description: cargoDesc,
          quantity: cargoQty,
          weight: cargoWeight
        },
        stops,
        scheduledStart: (() => {
          try {
            const match = startTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (match) {
              let h = parseInt(match[1], 10);
              const m = parseInt(match[2], 10);
              const mod = match[3] ? match[3].toUpperCase() : null;
              if (mod === 'PM' && h < 12) h += 12;
              if (mod === 'AM' && h === 12) h = 0;
              return new Date(`${scheduleDate}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`).toISOString();
            }
          } catch (e) {}
          return new Date().toISOString();
        })(),
        expectedEnd: (() => {
          try {
            const match = expectedEndTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (match) {
              let h = parseInt(match[1], 10);
              const m = parseInt(match[2], 10);
              const mod = match[3] ? match[3].toUpperCase() : null;
              if (mod === 'PM' && h < 12) h += 12;
              if (mod === 'AM' && h === 12) h = 0;
              return new Date(`${scheduleDate}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`).toISOString();
            }
          } catch (e) {}
          return new Date(Date.now() + 4 * 3600 * 1000).toISOString();
        })(),
        notes,
        status: 'Assigned',
        eta: '45 Mins',
        distanceRemaining: 24.5
      };

      const created = await createTrip(payload);
      setIsSubmitting(false);
      triggerNotification('Trip Started', 'New Trip Dispatched', `Trip ${created.tripNumber} assigned to driver ${driverName}.`, 'Info');
      if (onTripCreated) onTripCreated(created);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to create trip consignment.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Create & Assign New Trip (${tripId})`}>
      <form onSubmit={handleSubmit} className="space-y-5 text-left text-xs max-h-[80vh] overflow-y-auto pr-1">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Driver Assignment Row */}
        <div>
          <label className="block text-[#6D7A79] font-bold mb-1.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#006A6A]" /> Assign Active Driver *
          </label>
          {activeDrivers.length === 0 ? (
            <div className="w-full p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              No drivers currently on duty. Drivers must start their shift first via the Driver Dashboard.
            </div>
          ) : (
            <select
              value={driverId}
              onChange={handleDriverChange}
              className="w-full p-2.5 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#0F172A] font-medium text-slate-800 dark:text-white"
            >
              {activeDrivers.map(d => (
                <option key={d.driverId} value={d.driverId}>
                  {d.name} ({d.driverId}) - [{d.status}]
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Pickup Location & Coordinates */}
        <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
          <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
            <MapPin className="w-4 h-4 text-emerald-600" /> Origin / Pickup Depot *
          </span>
          <div>
            <input
              type="text"
              placeholder="Pickup Street Address"
              value={pickupLocation}
              onChange={e => setPickupLocation(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block mb-0.5">Pickup Latitude</span>
              <input
                type="number"
                step="any"
                value={pickupLat}
                onChange={e => setPickupLat(parseFloat(e.target.value))}
                className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Pickup Longitude</span>
              <input
                type="number"
                step="any"
                value={pickupLng}
                onChange={e => setPickupLng(parseFloat(e.target.value))}
                className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Intermediate Stops */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-800 dark:text-blue-300 uppercase text-[11px] tracking-wide flex items-center gap-1">
              <MapPin className="w-4 h-4 text-blue-600" /> Route Waypoint Stops ({stops.length})
            </span>
            <Button type="button" variant="outline" size="sm" onClick={handleAddStop} className="text-[10px] py-1">
              <Plus className="w-3 h-3 mr-1" /> Add Stop
            </Button>
          </div>

          {stops.map((stop, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span>Stop #{stop.sequence}</span>
                <button type="button" onClick={() => handleRemoveStop(idx)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Stop Address"
                value={stop.address}
                onChange={e => {
                  const val = e.target.value;
                  setStops(prev => prev.map((s, i) => i === idx ? { ...s, address: val } : s));
                }}
                className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <input
                  type="number"
                  step="any"
                  placeholder="Stop Lat"
                  value={stop.latitude}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setStops(prev => prev.map((s, i) => i === idx ? { ...s, latitude: val } : s));
                  }}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Stop Lng"
                  value={stop.longitude}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setStops(prev => prev.map((s, i) => i === idx ? { ...s, longitude: val } : s));
                  }}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dropoff Destination & Coordinates */}
        <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 space-y-3">
          <span className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
            <MapPin className="w-4 h-4 text-red-600" /> Destination Dropoff *
          </span>
          <div>
            <input
              type="text"
              placeholder="Destination Address"
              value={dropLocation}
              onChange={e => setDropLocation(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block mb-0.5">Dropoff Latitude</span>
              <input
                type="number"
                step="any"
                value={dropLat}
                onChange={e => setDropLat(parseFloat(e.target.value))}
                className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Dropoff Longitude</span>
              <input
                type="number"
                step="any"
                value={dropLng}
                onChange={e => setDropLng(parseFloat(e.target.value))}
                className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Cargo & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[#6D7A79] font-bold mb-1">Cargo Description</label>
            <input
              type="text"
              value={cargoDesc}
              onChange={e => setCargoDesc(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-[#6D7A79] font-bold mb-1">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#0F172A] font-bold"
            >
              <option value="Normal">Normal</option>
              <option value="High">High 🔥</option>
              <option value="Urgent">Urgent ⚡</option>
            </select>
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[#6D7A79] font-bold mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#006A6A]" /> Date
            </label>
            <input
              type="date"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-[#6D7A79] font-bold mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#006A6A]" /> Start Time
            </label>
            <input
              type="text"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-[#6D7A79] font-bold mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#006A6A]" /> Expected End
            </label>
            <input
              type="text"
              value={expectedEndTime}
              onChange={e => setExpectedEndTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#0F172A]"
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-[#6D7A79] font-bold mb-1">Special Driver Instructions</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#0F172A]"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[#E5EEFF] dark:border-[#334155]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-[#006A6A] hover:bg-[#005555] text-white px-6 font-bold"
            disabled={isSubmitting || activeDrivers.length === 0}
          >
            {isSubmitting ? 'Creating Consignment...' : 'Create & Assign Trip'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
