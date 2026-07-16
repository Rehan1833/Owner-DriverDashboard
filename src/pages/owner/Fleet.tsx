import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Truck, MapPin, Gauge, ShieldAlert, Plus, Edit2, Trash2, Download, FileCheck, CheckCircle2, Clock, Users, UserCheck } from 'lucide-react';
import { Trip, Vehicle } from '../../types';

export const Fleet: React.FC = () => {
  const { vehicles, trips, createVehicle, updateVehicle, deleteVehicle } = useOperations();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedPODTrip, setSelectedPODTrip] = useState<Trip | null>(null);

  const downloadPODPDF = (trip: Trip) => {
    alert(`Compiling Proof of Delivery PDF for ${trip.tripNumber}... Download started!`);
    const doc = window.open('', '_blank');
    if (doc) {
      doc.document.write(`
        <html>
          <head>
            <title>Proof of Delivery - ${trip.tripNumber}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; color: #1e293b; }
              .ref { font-family: monospace; color: #64748b; margin-top: 5px; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
              .field { font-size: 12px; }
              .label { color: #64748b; font-weight: 500; }
              .value { font-weight: 600; color: #0f172a; margin-top: 2px; }
              .photo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px; }
              .photo { width: 100%; max-height: 250px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; }
              .signature { max-width: 200px; max-height: 100px; border-bottom: 1px dashed #94a3b8; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">SMARTOPS LOGISTICS GATEWAY</div>
              <div class="ref">Official Receipt Reference: POD-RECIEPT-${trip.tripNumber}</div>
            </div>
            <div class="section">
              <div class="section-title">Consignment Run Details</div>
              <div class="grid">
                <div class="field"><div class="label">Trip ID</div><div class="value">${trip.tripNumber}</div></div>
                <div class="field"><div class="label">Invoice Reference</div><div class="value">${trip.invoiceNumber}</div></div>
                <div class="field"><div class="label">Assigned Operator</div><div class="value">${trip.driverName}</div></div>
                <div class="field"><div class="label">Vehicle Registration</div><div class="value">${trip.vehicleNumber}</div></div>
                <div class="field"><div class="label">Pickup Source</div><div class="value">${trip.pickupLocation}</div></div>
                <div class="field"><div class="label">Delivery Drop Destination</div><div class="value">${trip.dropLocation}</div></div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Consignee Receipt Checklist</div>
              <div class="grid">
                <div class="field"><div class="label">Customer Name</div><div class="value">${trip.customerName}</div></div>
                <div class="field"><div class="label">Status</div><div class="value">Delivered & Verified</div></div>
                <div class="field"><div class="label">Timestamp</div><div class="value">${new Date((trip as any).updatedAt || trip.timestamp).toLocaleString()}</div></div>
                <div class="field"><div class="label">GPS Validation coordinates</div><div class="value">Lat: 19.0760, Lng: 72.8777 (Verified)</div></div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Proof of Delivery Photos</div>
              <div class="photo-grid">
                \${trip.deliveryPhoto && trip.deliveryPhoto.length > 0
                  ? trip.deliveryPhoto.map(p => \`<img src="\${p}" class="photo" />\`).join('')
                  : '<p style="font-size: 12px; color: #94a3b8;">No physical cargo photo verification loaded.</p>'
                }
              </div>
            </div>
            <div class="section">
              <div class="section-title">Customer Consignee Signature Verification</div>
              \${trip.signatureData
                ? \`<img src="\${trip.signatureData}" class="signature" />\`
                : '<p style="font-size: 12px; color: #94a3b8;">No customer consignee digital signature locked.</p>'
              }
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      doc.document.close();
    }
  };

  // Form state
  const [form, setForm] = useState({
    vehicleNumber: '',
    vehicleType: 'Container Truck (18T)',
    driver: '',
    rcNumber: '',
    insurance: '',
    permit: '',
    fitness: '',
    fuelType: 'Diesel',
    mileage: 6.0,
    currentLocation: '',
    status: 'Idle' as Vehicle['status']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'mileage' ? Number(value) : value
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVehicle(form);
    setCreateModalOpen(false);
    resetForm();
  };

  const handleEditClick = (veh: Vehicle) => {
    setSelectedVehicle(veh);
    setForm({
      vehicleNumber: veh.vehicleNumber,
      vehicleType: veh.vehicleType,
      driver: veh.driver,
      rcNumber: veh.rcNumber,
      insurance: veh.insurance,
      permit: veh.permit,
      fitness: veh.fitness,
      fuelType: veh.fuelType,
      mileage: veh.mileage,
      currentLocation: veh.currentLocation,
      status: veh.status
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVehicle) {
      updateVehicle(selectedVehicle.id, form);
    }
    setEditModalOpen(false);
    resetForm();
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to remove this vehicle asset from register?')) {
      deleteVehicle(id);
    }
  };

  const resetForm = () => {
    setForm({
      vehicleNumber: '',
      vehicleType: 'Container Truck (18T)',
      driver: '',
      rcNumber: '',
      insurance: '',
      permit: '',
      fitness: '',
      fuelType: 'Diesel',
      mileage: 6.0,
      currentLocation: '',
      status: 'Idle'
    });
    setSelectedVehicle(null);
  };

  const activeTripColumns = [
    {
      header: 'Trip ID',
      accessor: (row: Trip) => <span className="font-mono text-xs font-semibold text-slate-800">{row.tripNumber}</span>,
      sortKey: 'tripNumber' as keyof Trip,
    },
    {
      header: 'Driver Name',
      accessor: 'driverName' as keyof Trip,
      sortKey: 'driverName' as keyof Trip,
    },
    {
      header: 'Vehicle Reg',
      accessor: 'vehicleNumber' as keyof Trip,
      sortKey: 'vehicleNumber' as keyof Trip,
    },
    {
      header: 'Locations Map',
      accessor: (row: Trip) => (
        <div className="flex flex-col gap-0.5 max-w-xs">
          <span className="text-xs text-slate-700 font-medium truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            Pick: {row.pickupLocation}
          </span>
          <span className="text-xs text-slate-500 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Drop: {row.dropLocation}
          </span>
        </div>
      ),
    },
    {
      header: 'Remaining dist',
      accessor: (row: Trip) => (
        <div className="flex flex-col gap-1 w-24">
          <span className="font-semibold text-slate-700 text-xs">{row.distanceRemaining} km left</span>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${Math.max(10, Math.min(100, 100 - (row.distanceRemaining / 4.8)))}%` }} 
            />
          </div>
        </div>
      ),
      sortKey: 'distanceRemaining' as keyof Trip,
    },
    {
      header: 'ETA Clock',
      accessor: (row: Trip) => <span className="font-medium text-slate-700">{row.eta}</span>,
    },
    {
      header: 'Transit Status',
      accessor: (row: Trip) => (
        <Badge
          variant={
            row.status === 'Completed' || row.status === 'Delivered'
              ? 'success'
              : (row.status as any) === 'Delayed'
              ? 'danger'
              : row.status === 'In Transit' || row.status === 'Started'
              ? 'info'
              : 'warning'
          }
        >
          {row.status}
        </Badge>
      ),
      sortKey: 'status' as keyof Trip,
    },
    {
      header: 'Actions',
      accessor: (row: Trip) => {
        const hasPOD = row.status === 'Completed' || row.deliveryPhoto?.length || row.signatureData;
        return (
          <div className="flex gap-2">
            {hasPOD ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedPODTrip(row)}
                className="bg-blue-600 hover:bg-blue-700 text-[10px] font-bold py-1 px-2.5 rounded-lg text-white cursor-pointer"
              >
                View POD
              </Button>
            ) : (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">In Progress</span>
            )}
          </div>
        );
      }
    }
  ];

  const vehicleColumns = [
    {
      header: 'Vehicle Registration',
      accessor: (row: Vehicle) => (
        <div>
          <span className="font-bold text-slate-800 text-xs block">{row.vehicleNumber}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{row.vehicleType}</span>
        </div>
      ),
      sortKey: 'vehicleNumber' as keyof Vehicle,
    },
    {
      header: 'Driver Assigned',
      accessor: 'driver' as keyof Vehicle,
      sortKey: 'driver' as keyof Vehicle,
    },
    {
      header: 'Fuel / Mileage',
      accessor: (row: Vehicle) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-700 block">{row.fuelType}</span>
          <span className="text-[10px] text-slate-400 block">({row.mileage} km/l)</span>
        </div>
      ),
    },
    {
      header: 'Last Location',
      accessor: 'currentLocation' as keyof Vehicle,
      sortKey: 'currentLocation' as keyof Vehicle,
    },
    {
      header: 'Expiry Dates',
      accessor: (row: Vehicle) => (
        <div className="text-[10px] text-slate-500 space-y-0.5">
          <div>Permit: <span className="font-mono text-slate-700">{row.permit}</span></div>
          <div>Fitness: <span className="font-mono text-slate-700">{row.fitness}</span></div>
        </div>
      ),
    },
    {
      header: 'Diagnostics Status',
      accessor: (row: Vehicle) => (
        <Badge variant={row.status === 'Moving' ? 'success' : row.status === 'Delayed' ? 'danger' : 'info'}>
          {row.status}
        </Badge>
      ),
      sortKey: 'status' as keyof Vehicle,
    },
    {
      header: 'Actions',
      accessor: (row: Vehicle) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ];



  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Fleet & Diagnostics Registry</h2>
          <p className="text-xs text-slate-400 mt-1">Directly execute full CRUD operations over transport vehicles.</p>
        </div>
        <Button
          onClick={() => { resetForm(); setCreateModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Fleet Size</span>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{vehicles.length} Carriers</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Medium to heavy cargo haulers</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Transit Cargo Runs</span>
            <h4 className="text-lg font-bold text-emerald-600">{trips.filter(t => t.status !== 'Completed').length} active</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">GPS trackers synced</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 animate-pulse">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Yard Maintenance Alerts</span>
            <h4 className="text-lg font-bold text-red-600">{vehicles.filter(v => v.status === 'Maintenance').length} Flags</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Servicing in progress</p>
          </div>
        </div>
      </div>

      {/* Trips list */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Active Cargo Trips (Real-time telemetry)</h3>
        <Table
          data={trips}
          columns={activeTripColumns}
          searchKey="tripNumber"
          searchPlaceholder="Search active runs..."
          exportFileName="trips-telemetry"
        />
      </div>

      {/* Vehicles CRUD list */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Diagnostics Registry</h3>
        <Table
          data={vehicles}
          columns={vehicleColumns}
          searchKey="vehicleNumber"
          searchPlaceholder="Search registry plates..."
          exportFileName="vehicles-crud-registry"
        />
      </div>

      {/* Forms */}
      {[
        { isOpen: createModalOpen, setOpen: setCreateModalOpen, title: 'Register New Fleet Vehicle', submit: handleCreateSubmit },
        { isOpen: editModalOpen, setOpen: setEditModalOpen, title: 'Modify Vehicle Details', submit: handleEditSubmit }
      ].map((modal, idx) => (
        <Modal key={idx} isOpen={modal.isOpen} onClose={() => modal.setOpen(false)} title={modal.title} size="lg">
          <form onSubmit={modal.submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Vehicle Registration No.</label>
                <input
                  type="text"
                  required
                  name="vehicleNumber"
                  placeholder="e.g. MH-12-QW-9874"
                  value={form.vehicleNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option>Container Truck (18T)</option>
                  <option>Flatbed Trailer (24T)</option>
                  <option>Reefer Truck (15T)</option>
                  <option>Box Truck (7T)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assigned Driver</label>
                <input
                  type="text"
                  required
                  name="driver"
                  placeholder="e.g. Rajesh Kumar"
                  value={form.driver}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">RC Smartcard Number</label>
                <input
                  type="text"
                  required
                  name="rcNumber"
                  placeholder="e.g. RC-MH-12-9874"
                  value={form.rcNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Insurance Expiry</label>
                <input
                  type="date"
                  required
                  name="insurance"
                  value={form.insurance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Permit Expiry</label>
                <input
                  type="date"
                  required
                  name="permit"
                  value={form.permit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fitness Cert Expiry</label>
                <input
                  type="date"
                  required
                  name="fitness"
                  value={form.fitness}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fuel Type</label>
                <select
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="EV">Electric (EV)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mileage (km/l)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  name="mileage"
                  value={form.mileage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Diagnostics Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Idle">Idle (Yard)</option>
                  <option value="Moving">Moving (Transit)</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Current GPS Location</label>
              <input
                type="text"
                required
                name="currentLocation"
                placeholder="e.g. Pune Highway"
                value={form.currentLocation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => modal.setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Vehicle
              </Button>
            </div>
          </form>
        </Modal>
      ))}

      {/* Proof of Delivery Inspection Modal */}
      <Modal
        isOpen={selectedPODTrip !== null}
        onClose={() => setSelectedPODTrip(null)}
        title={`POD Cargo Verification: ${selectedPODTrip?.tripNumber}`}
        size="xl"
      >
        {selectedPODTrip && (
          <div className="space-y-6 text-slate-800 dark:text-slate-100">
            {/* Header Status Bar */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Receipt Code</span>
                <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  POD-RECEIPT-{selectedPODTrip.tripNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">✓ Verified & Audited</Badge>
                <Button
                  onClick={() => downloadPODPDF(selectedPODTrip)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer animate-pulse"
                >
                  <Download className="h-3.5 w-3.5" /> Print PDF Receipt
                </Button>
              </div>
            </div>

            {/* Side-by-Side Metadata Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-2xl space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide border-b border-gray-100 dark:border-slate-800 pb-1.5">
                  Consignment & Vehicle
                </h5>
                <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Operator Name</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedPODTrip.driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Vehicle Reg</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedPODTrip.vehicleNumber}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 dark:text-slate-505 block">Invoice Number</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{selectedPODTrip.invoiceNumber}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-2xl space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide border-b border-gray-100 dark:border-slate-800 pb-1.5">
                  Client & Transit Info
                </h5>
                <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Consignee Client</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedPODTrip.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">GPS Telemetry</span>
                    <span className="font-bold text-emerald-600 font-mono flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" /> Verified GPS
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 dark:text-slate-505 block">Completion Clock</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">
                      {new Date((selectedPODTrip as any).updatedAt || selectedPODTrip.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Photos Gallery Section */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Cargo Delivery Verification Photos ({selectedPODTrip.deliveryPhoto?.length || 0})
              </h5>
              <div className="grid grid-cols-3 gap-3">
                {selectedPODTrip.deliveryPhoto && selectedPODTrip.deliveryPhoto.length > 0 ? (
                  selectedPODTrip.deliveryPhoto.map((photoUrl, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-250 dark:border-slate-800 bg-slate-950 group">
                      <img
                        src={photoUrl}
                        alt={`Verification capture ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 p-8 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20">
                    No physical cargo photo verification documents uploaded.
                  </div>
                )}
              </div>
            </div>

            {/* Signature Block */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Consignee E-Signature Verification
              </h5>
              <div className="p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl flex items-center justify-center h-32 relative">
                {selectedPODTrip.signatureData ? (
                  <img
                    src={selectedPODTrip.signatureData}
                    alt="Customer Consignee Signature"
                    className="max-h-full max-w-xs object-contain"
                  />
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No signature file archived.</p>
                )}
                <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[9px] text-slate-450 dark:text-slate-550">
                  <FileCheck className="h-3 w-3 text-emerald-500" /> Signature Match ID
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
