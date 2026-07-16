import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Table } from '../../components/ui/Table';
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
        <div className="max-w-xs sm:max-w-sm">
          <span className="font-bold text-slate-800 text-xs block">{row.title}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">{row.description}</span>
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
        <div className="flex items-center gap-2 w-28">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                row.status === 'Completed'
                  ? 'bg-success'
                  : row.status === 'Overdue'
                  ? 'bg-danger'
                  : 'bg-primary'
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-slate-600">{row.progress}%</span>
        </div>
      ),
      sortKey: 'progress' as keyof Task,
    },
    {
      header: 'Deadline Date',
      accessor: (row: Task) => <span className="font-mono text-xs text-slate-500">{row.deadline}</span>,
      sortKey: 'deadline' as keyof Task,
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-808 dark:text-slate-100">Operational Task Board</h2>
          <p className="text-xs text-slate-405 dark:text-slate-500 mt-1">Delegated shift checklists, maintenance schedules, and administrative operations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1 border border-gray-100 dark:border-slate-800 rounded-xl">
          {(['All', 'Pending', 'In Progress', 'Completed', 'Overdue'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 shrink-0">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-405 dark:text-slate-500 uppercase block">Pending Tasks</span>
            <h4 className="text-base font-bold text-slate-808 dark:text-white">{pendingCount} Items</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-405 dark:text-slate-500 uppercase block">In Progress</span>
            <h4 className="text-base font-bold text-slate-808 dark:text-white">{inProgressCount} Items</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-405 dark:text-slate-500 uppercase block">Completed</span>
            <h4 className="text-base font-bold text-slate-808 dark:text-white">{completedCount} Items</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-405 dark:text-slate-500 uppercase block">Overdue Alerts</span>
            <h4 className="text-base font-bold text-red-650 dark:text-red-400">{overdueCount} Items</h4>
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
