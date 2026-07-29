<<<<<<< HEAD
﻿import React from 'react';
=======
import React from 'react';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
import { useOperations } from '../../store/OperationsContext';
import { OperationsChart } from '../../components/charts/Charts';
import { Badge } from '../../components/ui/Badge';
import { Settings, UserCheck, Wrench, Shield } from 'lucide-react';

export const Operations: React.FC = () => {
<<<<<<< HEAD
  const { attendance } = useOperations();

  const productionLineData = [
    { name: 'Shift A', line1: 180, line2: 150, line3: 90 },
    { name: 'Shift B', line1: 220, line2: 190, line3: 110 },
    { name: 'Shift C', line1: 140, line2: 120, line3: 40 },
=======
  const { attendance, inventory } = useOperations();

  const totalInventoryUnits = inventory.reduce((sum, i) => sum + i.quantity, 0);

  const productionLineData = [
    { name: 'Shift A', line1: Math.round(totalInventoryUnits * 0.4), line2: Math.round(totalInventoryUnits * 0.3), line3: 0 },
    { name: 'Shift B', line1: Math.round(totalInventoryUnits * 0.2), line2: Math.round(totalInventoryUnits * 0.1), line3: 0 },
    { name: 'Shift C', line1: 0, line2: 0, line3: 0 },
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div>
        <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-slate-100 tracking-tight leading-none">Manufacturing & Operations Console</h2>
        <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">Operational performance metrics, assembly line telemetry, and staging schedules.</p>
      </div>

      {/* Assembly Lines Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-[#006A6A]/10 text-[#006A6A]">
<<<<<<< HEAD
            <Settings className="h-6 w-6 animate-spin" />
          </div>
          <div className="space-y-2">
            <span className="text-[13px] font-semibold text-[#6D7A79] dark:text-[#6D7A79] uppercase tracking-tight block">Assembly Line 1</span>
            <h4 className="text-lg font-bold text-[#0B1C30] dark:text-white leading-tight">Active (440 units)</h4>
            <Badge variant="success">Normal Load</Badge>
=======
            <Settings className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[13px] font-semibold text-[#6D7A79] dark:text-[#6D7A79] uppercase tracking-tight block">Assembly Line 1</span>
            <h4 className="text-lg font-bold text-[#0B1C30] dark:text-white leading-tight">
              {totalInventoryUnits > 0 ? `Active (${totalInventoryUnits} units)` : 'Idle (0 units)'}
            </h4>
            <Badge variant={totalInventoryUnits > 0 ? 'success' : 'neutral'}>
              {totalInventoryUnits > 0 ? 'Normal Load' : 'Standby'}
            </Badge>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-[#10B981]/10 text-[#10B981]">
            <UserCheck className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[13px] font-semibold text-[#6D7A79] dark:text-[#6D7A79] uppercase tracking-tight block">Assembly Line 2</span>
<<<<<<< HEAD
            <h4 className="text-lg font-bold text-[#0B1C30] dark:text-white leading-tight">Active (390 units)</h4>
            <Badge variant="success">Normal Load</Badge>
=======
            <h4 className="text-lg font-bold text-[#0B1C30] dark:text-white leading-tight">Idle (0 units)</h4>
            <Badge variant="neutral">Standby</Badge>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-start gap-4">
<<<<<<< HEAD
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 text-[#EF4444]">
=======
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[13px] font-semibold text-[#6D7A79] dark:text-[#6D7A79] uppercase tracking-tight block">Assembly Line 3</span>
<<<<<<< HEAD
            <h4 className="text-lg font-bold text-[#EF4444] dark:text-red-450 leading-tight">Halted (MCU Depleted)</h4>
            <Badge variant="danger">Critical Alert</Badge>
=======
            <h4 className="text-lg font-bold text-slate-600 dark:text-slate-400 leading-tight">Offline (0 units)</h4>
            <Badge variant="neutral">Inactive</Badge>
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
          </div>
        </div>
      </div>

      {/* Line Output Chart */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm">
        <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-[#F8FAFC] mb-5 uppercase tracking-wide">Production Output by Shift & Assembly Line</h3>
        <OperationsChart
          data={productionLineData}
          xKey="name"
          series={[
            { key: 'line1', name: 'Assembly Line 1', color: '#006A6A', type: 'bar' },
            { key: 'line2', name: 'Assembly Line 2', color: '#14B8A6', type: 'bar' },
            { key: 'line3', name: 'Assembly Line 3', color: '#EF4444', type: 'bar' }
          ]}
          type="bar"
        />
      </div>

      {/* Workers Productivity Board */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm">
        <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-[#F8FAFC] mb-5 uppercase tracking-wide">Floor Check-Ins (Shift A & B)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendance.map(worker => (
            <div key={worker.id} className="p-4 border border-[#E5EEFF] dark:border-[#334155] bg-white dark:bg-[#0F172A]/40 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={worker.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${worker.employeeName}&backgroundColor=006A6A`}
                  alt=""
                  className="w-9 h-9 rounded-full bg-[#F8F9FF] dark:bg-slate-800 border border-[#E5EEFF] dark:border-[#334155] shadow-sm"
                />
                <div className="text-left">
                  <h5 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] leading-tight">{worker.employeeName}</h5>
                  <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] font-semibold mt-0.5">{worker.role || 'Staff'}</p>
                </div>
              </div>
              <div>
                <Badge variant={worker.status === 'Present' ? 'success' : worker.status === 'Late' ? 'warning' : 'danger'}>
                  {worker.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


