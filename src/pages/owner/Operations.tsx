import React from 'react';
import { useOperations } from '../../store/OperationsContext';
import { OperationsChart } from '../../components/ui/Charts';
import { Badge } from '../../components/ui/Badge';
import { Settings, UserCheck, Wrench, Shield } from 'lucide-react';

export const Operations: React.FC = () => {
  const { attendance } = useOperations();

  const productionLineData = [
    { name: 'Shift A', line1: 180, line2: 150, line3: 90 },
    { name: 'Shift B', line1: 220, line2: 190, line3: 110 },
    { name: 'Shift C', line1: 140, line2: 120, line3: 40 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Manufacturing & Operations Console</h2>
        <p className="text-xs text-slate-405 dark:text-slate-500 mt-1">Operational performance metrics, assembly line telemetry, and staging schedules.</p>
      </div>

      {/* Assembly Lines Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <Settings className="h-5 w-5 animate-spin" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Assembly Line 1</span>
            <h4 className="text-lg font-bold text-slate-808 dark:text-white">Active (440 units)</h4>
            <Badge variant="success">Normal Load</Badge>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Assembly Line 2</span>
            <h4 className="text-lg font-bold text-slate-808 dark:text-white">Active (390 units)</h4>
            <Badge variant="success">Normal Load</Badge>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400">
            <Shield className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase block">Assembly Line 3</span>
            <h4 className="text-lg font-bold text-red-650 dark:text-red-450">Halted (MCU Depleted)</h4>
            <Badge variant="danger">Critical Alert</Badge>
          </div>
        </div>
      </div>

      {/* Line Output Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-6">Production Output by Shift & Assembly Line</h3>
        <OperationsChart
          data={productionLineData}
          xKey="name"
          series={[
            { key: 'line1', name: 'Assembly Line 1', color: 'var(--color-primary)', type: 'bar' },
            { key: 'line2', name: 'Assembly Line 2', color: 'var(--color-fleet)', type: 'bar' },
            { key: 'line3', name: 'Assembly Line 3', color: 'var(--color-revenue)', type: 'bar' }
          ]}
          type="bar"
        />
      </div>

      {/* Workers Productivity Board */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Floor Check-Ins (Shift A & B)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendance.map(worker => (
            <div key={worker.id} className="p-4 border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={worker.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${worker.employeeName}`}
                  alt=""
                  className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800"
                />
                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">{worker.employeeName}</h5>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{worker.role || 'Staff'}</p>
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
