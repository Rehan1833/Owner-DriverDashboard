import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FileText, FileSpreadsheet, Download, RefreshCw, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
  const { triggerNotification } = useOperations();
  const [generating, setGenerating] = useState<string | null>(null);

  const reportOptions = [
    { id: 'rep1', name: 'Raw Material Consumption & Production Yield', description: 'Detailed breakdown of manufacturing inputs vs output weight margins.', duration: 'Daily / Weekly' },
    { id: 'rep2', name: 'Logistics Fleet Fuel & Maintenance Audits', description: 'Fuel efficiency curves, servicing receipts, and transit speed compliance logs.', duration: 'Monthly' },
    { id: 'rep3', name: 'Warehouse Stock Reconciliations & Shortages', description: 'SKU counts, storage limits, and high-frequency staging items.', duration: 'Bi-Weekly' },
    { id: 'rep4', name: 'Overtime & Payout Allocations Ledger', description: 'Driver allowance listings, worker OT approvals, and bonus logs.', duration: 'Monthly' },
    { id: 'rep5', name: 'Staging Area Check-Ins & Attendance Log', description: 'Floor check times, late markers, and staging queue summaries.', duration: 'Weekly' },
  ];

  const handleGenerate = (id: string, format: 'PDF' | 'Excel') => {
    const report = reportOptions.find(r => r.id === id);
    if (!report) return;

    setGenerating(`${id}-${format}`);
    setTimeout(() => {
      setGenerating(null);
      triggerNotification(
        'System Alert',
        'Download Finished',
        `Completed download of ${report.name} in ${format} format.`,
        'Info'
      );
    }, 1800);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Operational Report Center</h2>
        <p className="text-xs text-slate-400 mt-1">Select and download aggregated database logs for local inspection, printing, or compliance auditing.</p>
      </div>

      {/* Grid of Report Cards */}
      <div className="space-y-4">
        {reportOptions.map(report => (
          <div
            key={report.id}
            className="bg-white dark:bg-slate-900 p-5 border border-gray-100 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-sm transition-all"
          >
            <div className="space-y-1.5 flex-1 max-w-2xl text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{report.name}</h4>
                <Badge variant="neutral">{report.duration}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{report.description}</p>
            </div>
            
            {/* Formats Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 text-xs text-slate-600"
                disabled={generating !== null}
                onClick={() => handleGenerate(report.id, 'PDF')}
              >
                {generating === `${report.id}-PDF` ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-red-500" />
                )}
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 text-xs text-slate-600"
                disabled={generating !== null}
                onClick={() => handleGenerate(report.id, 'Excel')}
              >
                {generating === `${report.id}-Excel` ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                )}
                Export Excel
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Export Schedule Config Mock */}
      <div className="bg-slate-50 border border-gray-100 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-blue-500" /> Auto-Scheduler Desk
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Configure automated report generation loops to deliver weekly Excel sheets to managers.
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs self-start sm:self-auto">
          Configure Scheduler
        </Button>
      </div>
    </div>
  );
};
