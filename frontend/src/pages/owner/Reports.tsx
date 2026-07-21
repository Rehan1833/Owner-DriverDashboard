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
    <div className="space-y-8 animate-fade-in text-left">
      <div>
        <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-slate-100 tracking-tight leading-none">Operational Report Center</h2>
        <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">Select and download aggregated database logs for local inspection, printing, or compliance auditing.</p>
      </div>

      {/* Grid of Report Cards */}
      <div className="space-y-4">
        {reportOptions.map(report => (
          <div
            key={report.id}
            className="bg-white dark:bg-[#1E293B] p-6 border border-[#E5EEFF] dark:border-[#334155] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-sm transition-all"
          >
            <div className="space-y-2 flex-1 max-w-2xl text-left">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-[15px] font-semibold text-[#0B1C30] dark:text-slate-100 leading-tight">{report.name}</h4>
                <Badge variant="neutral">{report.duration}</Badge>
              </div>
              <p className="text-[15px] text-[#6D7A79] dark:text-[#94A3B8] leading-relaxed font-medium">{report.description}</p>
            </div>
            
            {/* Formats Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 border border-[#E5EEFF] dark:border-[#334155] text-slate-700 hover:bg-[#F9FAFB]"
                disabled={generating !== null}
                onClick={() => handleGenerate(report.id, 'PDF')}
              >
                {generating === `${report.id}-PDF` ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 text-[#EF4444]" />
                )}
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 border border-[#E5EEFF] dark:border-[#334155] text-slate-700 hover:bg-[#F9FAFB]"
                disabled={generating !== null}
                onClick={() => handleGenerate(report.id, 'Excel')}
              >
                {generating === `${report.id}-Excel` ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 text-[#10B981]" />
                )}
                Export Excel
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Export Schedule Config Mock */}
      <div className="bg-[#F8F9FF] dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm text-left">
        <div className="space-y-1">
          <h4 className="text-[15px] font-bold text-[#0B1C30] flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[#006A6A] dark:text-[#14B8A6]" /> Auto-Scheduler Desk
          </h4>
          <p className="text-[13px] text-[#6D7A79] font-medium leading-normal">
            Configure automated report generation loops to deliver weekly Excel sheets to managers.
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs self-start sm:self-auto border border-[#E5EEFF] dark:border-[#334155] bg-white text-slate-700">
          Configure Scheduler
        </Button>
      </div>
    </div>
  );
};


