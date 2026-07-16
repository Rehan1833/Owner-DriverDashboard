import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { OperationsChart, OperationsDonut } from '../../components/ui/Charts';
import {
  TrendingUp,
  Package,
  CheckCircle,
  Truck,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileDown,
  Navigation,
  CheckSquare
} from 'lucide-react';
import { Task, SystemNotification } from '../../types';

// Helper component for KPI Cards with mini-graphs
const KPICard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<any>;
  sparklineData: number[];
  color: string;
}> = ({ title, value, change, isPositive, icon: Icon, sparklineData, color }) => {
  // Generate SVG path for mini sparkline
  const width = 80;
  const height = 30;
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / (range || 1)) * height + 2; // offset padding
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700/80 transition-all duration-200 flex justify-between items-start group">
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{title}</span>
        <h4 className="text-xl font-bold text-slate-805 dark:text-white">{value}</h4>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-success" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-danger" />
          )}
          <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>{change}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-1">vs last week</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:scale-105 transition-transform duration-200`} style={{ color }}>
          <Icon className="h-5 w-5" />
        </div>
        {/* Sparkline mini-graph */}
        <svg width={width} height={height} className="overflow-visible mt-1">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const {
    user,
    vehicles,
    trips,
    payroll,
    attendance,
    inventory,
    activities,
    createTask,
    approvePayroll,
    triggerNotification
  } = useOperations();

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssigned, setNewTaskAssigned] = useState('Amit Patel (Supervisor)');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('High');

  // Chart datasets
  const productionData = [
    { name: 'Mon', target: 450, output: 432, revenue: 15400 },
    { name: 'Tue', target: 450, output: 468, revenue: 17200 },
    { name: 'Wed', target: 480, output: 490, revenue: 19100 },
    { name: 'Thu', target: 480, output: 440, revenue: 16500 },
    { name: 'Fri', target: 500, output: 512, revenue: 21000 },
    { name: 'Sat', target: 350, output: 360, revenue: 12200 },
    { name: 'Sun', target: 350, output: 345, revenue: 11800 },
  ];

  const inventoryDistribution = [
    { name: 'Raw Materials', value: 85000, color: 'var(--color-primary)' },
    { name: 'Finished Goods', value: 60000, color: 'var(--color-tertiary-container)' },
    { name: 'Packaging', value: 24000, color: 'var(--color-secondary)' },
  ];

  // Calculated Metrics
  const activeVehicles = vehicles.filter(v => v.status === 'Moving').length;
  const onlineDrivers = trips.filter(t => t.status !== 'Completed').length;
  const totalPayrollValue = payroll.reduce((acc, curr) => acc + (curr.finalSalary || curr.netPay || 0), 0);
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const lowStockCount = inventory.filter(i => i.quantity <= i.minimumQuantity).length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask({
      title: newTaskTitle,
      description: 'Review variance and update daily stages.',
      priority: newTaskPriority,
      assignedTo: newTaskAssigned,
      deadline: '2026-07-20'
    });
    setNewTaskTitle('');
    setTaskModalOpen(false);
  };

  const triggerExportReport = (type: string) => {
    triggerNotification(
      'System Alert',
      'Export In Progress',
      `Preparing downloadable sheet for: ${type}. Please check your downloads folder shortly.`,
      'Info'
    );
    setReportModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-slate-900 to-blue-950 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Welcome Back</span>
          <h2 className="text-2xl font-bold tracking-tight">Hello, {user?.fullName || 'Administrator'}</h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
            Here is your daily business overview for {user?.companyName || 'SmartOps Ltd.'}. GPS tracking and telemetry loops are active.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button variant="outline" className="text-white border-slate-700 hover:bg-slate-800 bg-transparent text-xs" onClick={() => setReportModalOpen(true)}>
            <FileDown className="h-4 w-4 mr-1.5" />
            Generate Report
          </Button>
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => setTaskModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Task
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue (Simulated)"
          value="INR 1.28L"
          change="+12.4%"
          isPositive={true}
          icon={TrendingUp}
          sparklineData={[11000, 13400, 12000, 15000, 16800, 18500, 21000]}
          color="var(--color-revenue)"
        />
        <KPICard
          title="Vehicles Active"
          value={activeVehicles}
          change="+4"
          isPositive={true}
          icon={Truck}
          sparklineData={[2, 3, 3, 2, 4, 3, activeVehicles]}
          color="var(--color-fleet)"
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockCount}
          change="-2"
          isPositive={true}
          icon={Package}
          sparklineData={[6, 5, 5, 4, 3, 3, lowStockCount]}
          color="var(--color-warning)"
        />
        <KPICard
          title="Workers Present"
          value={`${presentCount}/${attendance.length}`}
          change="92%"
          isPositive={true}
          icon={Users}
          sparklineData={[80, 85, 90, 88, 92, 92, 92]}
          color="var(--color-success)"
        />
      </div>

      {/* Main Charts & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Production Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Production Output vs Target</h3>
              <p className="text-[11px] text-slate-405 dark:text-slate-500 mt-0.5">Manufacturing units output trend vs targeted daily metrics</p>
            </div>
            <span className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold px-2.5 py-1 rounded-lg">Last 7 Days</span>
          </div>
          <OperationsChart
            data={productionData}
            xKey="name"
            series={[
              { key: 'target', name: 'Target Level', color: 'var(--color-text-muted)', type: 'line' },
              { key: 'output', name: 'Actual Output', color: 'var(--color-primary)', type: 'area' }
            ]}
          />
        </div>

        {/* Inventory Distribution Donut Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Inventory Classification</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Warehouse asset valuations and stock distribution</p>
          </div>
          <div className="my-auto">
            <OperationsDonut data={inventoryDistribution} />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 border-t border-gray-50 dark:border-slate-800/80 pt-4 mt-2">
            <span>Total Valuation:</span>
            <span className="text-slate-800 dark:text-slate-200">INR 1.69 Lakhs</span>
          </div>
        </div>
      </div>

      {/* Live Operations Map & Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid Map Simulation */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Live Vehicle GPS Grid</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Simulated real-time tracking points for transit cargo</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-505 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Transiting
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-505 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" /> Delayed
              </span>
            </div>
          </div>

          {/* Graphical Coordinates Area */}
          <div className="h-68 w-full bg-slate-900 dark:bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 dark:border-slate-850 shadow-inner flex flex-col justify-end p-4 animate-[fade-in_400ms_ease]">
            {/* Coordinates Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

            {/* Simulated Path Line (Route A) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 240">
              <path d="M 40,80 Q 200,30 310,140 T 460,80" fill="none" stroke="var(--color-outline-variant)" strokeWidth="2.5" strokeDasharray="5,5" />
              <path d="M 40,80 Q 200,30 310,140 T 460,80" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="300" strokeDashoffset="50" className="animate-[dash_8s_linear_infinite]" />
            </svg>

            {/* Real-time moving truck symbols */}
            <div className="absolute top-16 left-28 flex flex-col items-center gap-1">
              <span className="bg-primary text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-lg border border-primary-container">
                MH-12 (Rajesh)
              </span>
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center border border-white dark:border-slate-800 shadow-xl animate-pulse">
                <Navigation className="h-3 w-3 rotate-45" />
              </div>
            </div>

            <div className="absolute bottom-20 right-32 flex flex-col items-center gap-1">
              <span className="bg-amber-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-lg border border-amber-400">
                HR-55 (Arjun)
              </span>
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center border border-white dark:border-slate-800 shadow-xl animate-bounce">
                <AlertTriangle className="h-3 w-3" />
              </div>
            </div>

            {/* Map Telemetry Statistics Card */}
            <div className="relative z-10 bg-slate-950/60 border border-slate-800/80 backdrop-blur-md rounded-xl p-3.5 text-white max-w-sm flex items-center justify-between w-full">
              <div className="space-y-0.5">
                <span className="text-[9px] text-blue-400 uppercase font-bold tracking-wider">Telemetry Core</span>
                <p className="text-xs font-semibold">{trips.length} Active Shipments</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                  GPS Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Recent Operations Log</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Real-time status updates across departments</p>
          </div>
          <div className="mt-4 space-y-4.5 overflow-y-auto max-h-[250px] pr-1">
            {activities.slice(0, 5).map(act => (
              <div key={act.id} className="flex gap-3 text-xs leading-normal">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div className="w-[1.5px] h-full bg-gray-100 dark:bg-slate-800 mt-1.5" />
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-0.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{act.user}</span>
                    <span className="text-[10px] font-medium">{act.timestamp}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reusable Modals */}

      {/* Task Creation Modal */}
      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Create Operations Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-450 dark:text-slate-405 uppercase">Task Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Verify gate 2 vehicle logs"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 dark:text-slate-405 uppercase">Assigned Staff</label>
              <select
                value={newTaskAssigned}
                onChange={e => setNewTaskAssigned(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              >
                <option>Amit Patel (Supervisor)</option>
                <option>Vikram Singh (Fleet Manager)</option>
                <option>Sanjay Dutt (Technician)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-405 uppercase">Priority Rating</label>
              <select
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value as Task['priority'])}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-805 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-slate-950 text-slate-705 dark:text-slate-200"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Assign Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reports Generator Modal */}
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Generate Corporate Report">
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose an operational report sheet to export in PDF or CSV formats:</p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              'Production Status Sheet',
              'Inventory Level Count',
              'June Payroll Overview',
              'Fleet Fuel Consumption',
              'Gate Log Records',
              'Driver Performance Metrics',
            ].map(sheet => (
              <button
                key={sheet}
                onClick={() => triggerExportReport(sheet)}
                className="p-3 border border-gray-200 dark:border-slate-800 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50/20 text-xs font-semibold text-slate-700 dark:text-slate-300 dark:bg-slate-950/40 hover:dark:bg-blue-950/20 transition-colors cursor-pointer"
              >
                {sheet}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-slate-800">
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
