import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Table } from '../../components/tables/Table';
import { Badge } from '../../components/ui/Badge';
import { CheckSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Task } from '../../types';

export const Tasks: React.FC = () => {
  const { tasks } = useOperations();
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'In Progress' | 'Completed' | 'Overdue'>('All');

  // Count stats
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const overdueCount = tasks.filter(t => t.status === 'Overdue').length;

  const handleFilter = (data: Task[]) => {
    if (filterStatus === 'All') return data;
    return data.filter(t => t.status === filterStatus);
  };

  const columns = [
    {
      header: 'Task Details',
      accessor: (row: Task) => (
        <div className="max-w-xs sm:max-w-sm text-left">
          <span className="font-bold text-[#0B1C30] text-sm block">{row.title}</span>
          <span className="text-[11px] text-[#6D7A79] mt-1 block whitespace-normal break-words leading-tight font-medium">{row.description}</span>
        </div>
      ),
      sortKey: 'title' as keyof Task,
    },
    {
      header: 'Staff Assignment',
      accessor: 'assignedTo' as keyof Task,
      sortKey: 'assignedTo' as keyof Task,
    },
    {
      header: 'Priority',
      accessor: (row: Task) => (
        <Badge
          variant={
            row.priority === 'Critical'
              ? 'danger'
              : row.priority === 'High'
              ? 'warning'
              : row.priority === 'Medium'
              ? 'info'
              : 'neutral'
          }
        >
          {row.priority}
        </Badge>
      ),
      sortKey: 'priority' as keyof Task,
    },
    {
      header: 'Status',
      accessor: (row: Task) => (
        <Badge
          variant={
            row.status === 'Completed'
              ? 'success'
              : row.status === 'In Progress'
              ? 'info'
              : row.status === 'Overdue'
              ? 'danger'
              : 'neutral'
          }
        >
          {row.status}
        </Badge>
      ),
      sortKey: 'status' as keyof Task,
    },
    {
      header: 'Progress',
      accessor: (row: Task) => (
        <div className="flex items-center gap-2.5 w-28 text-left">
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.status === 'Completed'
                  ? 'bg-[#10B981]'
                  : row.status === 'Overdue'
                  ? 'bg-[#EF4444]'
                  : 'bg-[#006A6A]'
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">{row.progress}%</span>
        </div>
      ),
      sortKey: 'progress' as keyof Task,
    },
    {
      header: 'Deadline Date',
      accessor: (row: Task) => <span className="font-mono text-xs text-[#6D7A79] dark:text-[#94A3B8] font-semibold">{row.deadline}</span>,
      sortKey: 'deadline' as keyof Task,
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-slate-100 tracking-tight leading-none">Operational Task Board</h2>
          <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">Delegated shift checklists, maintenance schedules, and administrative operations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-[#F8F9FF] dark:bg-[#0F172A] p-1 border border-[#E5EEFF]/80 dark:border-[#334155]/60 rounded-xl">
          {(['All', 'Pending', 'In Progress', 'Completed', 'Overdue'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#6D7A79] hover:text-[#545F73] dark:hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-[#006A6A]/10 text-[#006A6A] shrink-0">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">Pending Tasks</span>
            <h4 className="text-[22px] font-extrabold text-slate-900 dark:text-white leading-tight">{pendingCount} Items</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-[#14B8A6]/10 text-[#14B8A6] shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">In Progress</span>
            <h4 className="text-[22px] font-extrabold text-slate-900 dark:text-white leading-tight">{inProgressCount} Items</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-[#10B981]/10 text-[#10B981] shrink-0">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">Completed</span>
            <h4 className="text-[22px] font-extrabold text-slate-900 dark:text-white leading-tight">{completedCount} Items</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 text-[#EF4444] shrink-0">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">Overdue Alerts</span>
            <h4 className="text-[22px] font-extrabold text-[#EF4444] leading-tight">{overdueCount} Items</h4>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div>
        <Table
          data={tasks}
          columns={columns}
          searchKey="title"
          searchPlaceholder="Search task headings..."
          filterComponent={handleFilter}
          exportFileName="operational-tasks"
        />
      </div>
    </div>
  );
};


