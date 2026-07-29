<<<<<<< HEAD
﻿import React from 'react';
=======
import React from 'react';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
import { useOperations } from '../../store/OperationsContext';
import { Badge } from '../../components/ui/Badge';
import { Truck, ShieldCheck, Fuel, Calendar, Wrench, FileText, AlertTriangle } from 'lucide-react';

export const VehicleInfo: React.FC = () => {
  const { vehicles } = useOperations();
  const driverVehicle = vehicles[0] || {
    vehicleNumber: 'MH-12-QW-9874',
    vehicleType: 'Container Truck (18T)',
    status: 'Moving',
    fuelLevel: 78,
    odometer: 48200,
    insurance: '2026-12-31',
    permit: '2027-06-30',
    fitness: '2026-10-15',
    rcNumber: 'RC-MH12-9988-ABC',
    mileage: 6.2
  };

  const docs = [
    { name: 'Registration Certificate (RC)', status: 'Verified', date: driverVehicle.fitness || '2026-12-31', id: driverVehicle.rcNumber || 'RC-MH12-9988-ABC' },
    { name: 'Commercial Vehicle Insurance', status: 'Verified', date: driverVehicle.insurance || '2026-10-15', id: 'INS-COMM-90812' },
    { name: 'Interstate National Permit', status: 'Verified', date: driverVehicle.permit || '2027-06-30', id: 'PMT-IN-55441' },
    { name: 'Fitness & Emission Certificate', status: 'Verified', date: driverVehicle.fitness || '2026-10-15', id: 'FTN-EMIS-88220' },
  ];

  return (
<<<<<<< HEAD
    <div className="space-y-8 max-w-4xl mx-auto text-left animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-slate-100 tracking-tight leading-none">Assigned Fleet Vehicle Information</h2>
        <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">Review live engine telemetry logs, registration certificates, and maintenance warnings.</p>
=======
    <div className="space-y-6 max-w-4xl mx-auto text-left animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-[26px] font-extrabold text-[#111827] dark:text-[#F8FAFC] tracking-tight leading-none">Assigned Fleet Vehicle Information</h2>
        <p className="text-[13px] text-[#4B5563] dark:text-[#94A3B8] mt-1.5 font-medium">Review live engine telemetry logs, registration certificates, and maintenance warnings.</p>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Truck Status & Fuel Gage (1 column) */}
        <div className="md:col-span-1 space-y-6">
          {/* Truck Card */}
<<<<<<< HEAD
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-[#006A6A]/10 text-[#006A6A] rounded-2xl">
              <Truck className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0B1C30] dark:text-slate-100">{driverVehicle.vehicleNumber}</h3>
              <p className="text-xs text-[#6D7A79] dark:text-[#94A3B8] font-semibold">{driverVehicle.vehicleType}</p>
=======
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-[#006A6A]/10 text-[#006A6A] dark:text-[#7DF5F5] rounded-2xl">
              <Truck className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">{driverVehicle.vehicleNumber}</h3>
              <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-semibold">{driverVehicle.vehicleType}</p>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
              <div className="pt-2">
                <Badge variant={driverVehicle.status === 'Moving' ? 'success' : 'info'}>
                  {driverVehicle.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Fuel Status Card */}
<<<<<<< HEAD
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[13px] font-bold text-[#6D7A79] dark:text-[#94A3B8] uppercase tracking-tight flex items-center gap-1.5">
=======
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[13px] font-extrabold text-[#4B5563] dark:text-[#94A3B8] uppercase tracking-tight flex items-center gap-1.5">
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
              <Fuel className="h-4 w-4 text-orange-500" /> Diesel Fuel Level
            </h4>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-end">
<<<<<<< HEAD
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">{(driverVehicle.fuelLevel ?? 78)}%</span>
                <span className="text-[11px] text-[#6D7A79] font-semibold">Capacity: 350 Liters</span>
              </div>
              
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
=======
                <span className="text-2xl font-bold text-[#111827] dark:text-[#F8FAFC] font-mono">{(driverVehicle.fuelLevel ?? 78)}%</span>
                <span className="text-[11px] text-[#4B5563] dark:text-[#94A3B8] font-semibold">Capacity: 350 Liters</span>
              </div>
              
              <div className="w-full h-3 bg-[#F3F4F6] dark:bg-slate-800 rounded-full overflow-hidden">
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    (driverVehicle.fuelLevel ?? 0) > 25 ? 'bg-orange-500' : 'bg-[#EF4444] animate-pulse'
                  }`}
                  style={{ width: `${driverVehicle.fuelLevel ?? 0}%` }}
                />
              </div>
<<<<<<< HEAD
              <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] font-semibold leading-relaxed">
=======
              <p className="text-[11px] text-[#4B5563] dark:text-[#94A3B8] font-semibold leading-relaxed">
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
                Good range. Low diesel notification threshold is set to 20% capacity warning.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Specifications & Compliances (2 columns) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Key Specifications */}
<<<<<<< HEAD
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[15px] font-bold text-[#0B1C30] dark:text-slate-100 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
=======
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[15px] font-extrabold text-[#111827] dark:text-[#F8FAFC] border-b border-[#E5E7EB] dark:border-[#334155] pb-3 flex items-center gap-1.5 uppercase tracking-wide">
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
              <Wrench className="h-4 w-4 text-[#006A6A]" /> Vehicle Engine Telemetry Specs
            </h4>
            <div className="grid grid-cols-2 gap-6 text-xs font-bold">
              <div>
<<<<<<< HEAD
                <span className="text-[#6D7A79] dark:text-[#6D7A79] block font-semibold text-[10px] uppercase">Current Odometer</span>
                <span className="font-bold font-mono text-slate-700 dark:text-[#F8FAFC] block mt-1">{(driverVehicle.odometer || 48200).toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-[#6D7A79] dark:text-[#6D7A79] block font-semibold text-[10px] uppercase">Fuel Mileage Efficiency</span>
                <span className="font-bold text-slate-700 dark:text-[#F8FAFC] block mt-1">{driverVehicle.mileage || 6.2} km/Liter</span>
              </div>
              <div>
                <span className="text-[#6D7A79] dark:text-[#6D7A79] block font-semibold text-[10px] uppercase">Last Serviced Date</span>
                <span className="font-bold text-slate-700 dark:text-[#F8FAFC] block mt-1">2026-06-05</span>
              </div>
              <div>
                <span className="text-[#6D7A79] dark:text-[#6D7A79] block font-semibold text-[10px] uppercase">Maintenance Cycle Due</span>
                <span className="font-bold text-slate-700 dark:text-[#F8FAFC] block mt-1">Within 4,800 km</span>
=======
                <span className="text-[#6B7280] dark:text-[#94A3B8] block font-extrabold text-[10px] uppercase">Current Odometer</span>
                <span className="font-bold font-mono text-[#111827] dark:text-[#F8FAFC] block mt-1">{(driverVehicle.odometer || 48200).toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#94A3B8] block font-extrabold text-[10px] uppercase">Fuel Mileage Efficiency</span>
                <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block mt-1">{driverVehicle.mileage || 6.2} km/Liter</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#94A3B8] block font-extrabold text-[10px] uppercase">Last Serviced Date</span>
                <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block mt-1">2026-06-05</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#94A3B8] block font-extrabold text-[10px] uppercase">Maintenance Cycle Due</span>
                <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block mt-1">Within 4,800 km</span>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
              </div>
            </div>
          </div>

          {/* Compliance & Documents Table */}
<<<<<<< HEAD
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[15px] font-bold text-[#0B1C30] dark:text-slate-100 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
=======
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-sm space-y-4 text-left">
            <h4 className="text-[15px] font-extrabold text-[#111827] dark:text-[#F8FAFC] border-b border-[#E5E7EB] dark:border-[#334155] pb-3 flex items-center gap-1.5 uppercase tracking-wide">
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
              <FileText className="h-4 w-4 text-[#006A6A]" /> Regulatory Vehicle Compliances
            </h4>
            
            <div className="space-y-4 pt-1">
              {docs.map((doc, idx) => (
<<<<<<< HEAD
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs p-3.5 border border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 rounded-xl hover:bg-[#F8F9FF]/50 dark:hover:bg-slate-800/40 transition-colors gap-2 shadow-sm">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-[#F8FAFC] leading-normal">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-[#6D7A79] mt-0.5 font-bold uppercase font-mono">Ref: {doc.id} • Expiry: {doc.date}</p>
=======
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs p-3.5 border border-[#E5E7EB] dark:border-[#334155] rounded-xl hover:bg-[#F9FAFB] dark:hover:bg-slate-800/40 transition-colors gap-2 shadow-sm bg-white dark:bg-[#1E293B]">
                  <div>
                    <p className="font-bold text-[#111827] dark:text-[#F8FAFC] leading-normal">{doc.name}</p>
                    <p className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] mt-0.5 font-bold uppercase font-mono">Ref: {doc.id} • Expiry: {doc.date}</p>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
                  </div>
                  <Badge variant="success" className="text-[10px] self-start sm:self-auto flex items-center gap-0.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Approved
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings Panel */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 rounded-xl p-5 flex items-start gap-3 text-left">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Logistics Yard Dispatch Directive</h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed font-semibold">
                Interstate carriages require mandatory physical permit copy log in the cabin dashboard console. Verify vehicle fitness labels before crossing toll borders.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};


