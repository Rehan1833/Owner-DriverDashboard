import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOperations } from '../../store/OperationsContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { OperationsChart } from '../../components/charts/Charts';
import { soundPlayer } from '../../utils/audio';
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
  CheckSquare,
  DollarSign,
  ShoppingCart,
  Clock,
  Bell,
  Wallet,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertCircle,
  MapPin,
  Calendar
} from 'lucide-react';
import { Task, SystemNotification, InventoryItem, AttendanceRecord, Vehicle, Trip, ActivityItem } from '../../types';

// Sparkline Mini Chart Renderer with Soft Gradient
const Sparkline: React.FC<{ data: number[]; color: string; id: string }> = ({ data, color, id }) => {
  const width = 110;
  const height = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / (range || 1)) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sparkline-grad-${id})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Executive Card (Linear / Stripe / Attio inspired)
const KPICard: React.FC<{
  id: string;
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<any>;
  sparklineData: number[];
  color: string;
  description: string;
  onClick?: () => void;
}> = ({ id, title, value, change, isPositive, icon: Icon, sparklineData, color, description, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between items-stretch gap-4 group cursor-pointer text-left"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1 min-w-0">
          <span className="text-[15px] font-semibold text-[#6D7A79] dark:text-[#94A3B8] tracking-tight block whitespace-normal break-words leading-tight">{title}</span>
          <h4 className="text-[40px] font-extrabold text-[#0B1C30] dark:text-white leading-none tracking-tight">{value}</h4>
        </div>
        <div className="p-3 rounded-xl transition-all duration-300 shrink-0" style={{ backgroundColor: `${color}12`, color }}>
          <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>
      <div className="flex items-end justify-between pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-[#10B981] shrink-0" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-[#EF4444] shrink-0" />
            )}
            <span className={`text-[13px] font-bold ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{change}</span>
          </div>
          <p className="text-[13px] font-medium text-[#6D7A79] dark:text-[#94A3B8] whitespace-normal break-words leading-tight max-w-[150px]">{description}</p>
        </div>
        <div className="shrink-0 pl-2">
          <Sparkline id={id} data={sparklineData} color={color} />
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    vehicles,
    trips,
    payroll,
    attendance,
    inventory,
    activities,
    notifications,
    createTask,
    triggerNotification,
    addActivity
  } = useOperations();

  const handleCardClick = (id: string) => {
    switch (id) {
      case 'rev':
        navigate('/owner/analytics');
        break;
      case 'fleet':
        navigate('/owner/fleet');
        break;
      case 'stock':
        navigate('/owner/inventory');
        break;
      case 'att':
        navigate('/owner/attendance');
        break;
      case 'total':
        navigate('/owner/workers');
        break;
      case 'del':
        navigate('/owner/pod');
        break;
      case 'ship':
        navigate('/owner/fleet');
        break;
      case 'alerts':
        navigate('/owner/notifications');
        break;
      case 'salary':
        navigate('/owner/payroll');
        break;
      case 'inc':
        navigate('/owner/operations');
        break;
      default:
        break;
    }
  };

  // Selected multi-metric chart trigger
  const [activeChartTab, setActiveChartTab] = useState<'Inventory' | 'Revenue' | 'Attendance' | 'Fleet' | 'Stock'>('Revenue');

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssigned, setNewTaskAssigned] = useState('Amit Patel (Supervisor)');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('High');

  // Multi-table selection
  const [activeTableTab, setActiveTableTab] = useState<'Inventory' | 'Attendance' | 'Fleet' | 'Activities' | 'Notifications' | 'Orders'>('Inventory');
  
  // Table search & sort helpers
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortAsc, setSortAsc] = useState(true);

  // Play audio helper
  const triggerAudio = (severity: 'Success' | 'Warning' | 'Error' | 'Info') => {
    const saved = localStorage.getItem('smartops_owner_settings');
    const settings = saved ? JSON.parse(saved) : { soundEnabled: true, soundVolume: 0.5 };
    if (settings.soundEnabled) {
      soundPlayer.play(severity, settings.soundVolume);
    }
  };

  // Mock Orders dataset
  const latestOrders = useMemo(() => [
    { id: 'O-1002', item: 'Cold-Rolled Steel Coils', client: 'L&T Manufacturing', qty: 250, status: 'Completed', date: 'Today' },
    { id: 'O-1003', item: 'Zinc Galvanized Plates', client: 'Tata Motors Pune', qty: 400, status: 'Pending', date: 'Today' },
    { id: 'O-1004', item: 'Machine Fasteners (Grade 8)', client: 'Bajaj Auto', qty: 1500, status: 'Completed', date: 'Yesterday' },
    { id: 'O-1005', item: 'Aluminium Extrusion Bars', client: 'Thermax India', qty: 350, status: 'Pending', date: 'Yesterday' }
  ], []);

  // Calculated Metrics for the 10 KPI Cards
  const activeVehiclesCount = vehicles.filter(v => v.status === 'Moving').length;
  const lowStockCount = inventory.filter(i => i.quantity <= i.minimumQuantity).length;
  const presentCount = attendance.filter(a => a.attendanceStatus === 'Present' || a.attendanceStatus === 'Late').length;
  const pendingTripsCount = trips.filter(t => t.status !== 'Completed').length;
  const processedPayrollCount = payroll.filter(p => p.paymentStatus === 'Paid').length;
  const totalEmployeesCount = 18; // Drivers + Managers + Supervisor

  // Chart datasets generator
  const revenueChartData = [
    { name: 'Mon', revenue: 15400, cost: 7200, target: 12000 },
    { name: 'Tue', revenue: 17200, cost: 7500, target: 12000 },
    { name: 'Wed', revenue: 19100, cost: 8100, target: 14000 },
    { name: 'Thu', revenue: 16500, cost: 7000, target: 14000 },
    { name: 'Fri', revenue: 21000, cost: 9500, target: 15000 },
    { name: 'Sat', revenue: 12200, cost: 5800, target: 10000 },
    { name: 'Sun', revenue: 11800, cost: 5400, target: 10000 }
  ];

  const inventoryChartData = [
    { name: 'Mon', itemsIn: 450, itemsOut: 432 },
    { name: 'Tue', itemsIn: 520, itemsOut: 468 },
    { name: 'Wed', itemsIn: 610, itemsOut: 490 },
    { name: 'Thu', itemsIn: 380, itemsOut: 440 },
    { name: 'Fri', itemsIn: 720, itemsOut: 512 },
    { name: 'Sat', itemsIn: 300, itemsOut: 360 },
    { name: 'Sun', itemsIn: 290, itemsOut: 345 }
  ];

  const attendanceChartData = [
    { name: 'Mon', present: 14, late: 2 },
    { name: 'Tue', present: 15, late: 1 },
    { name: 'Wed', present: 16, late: 0 },
    { name: 'Thu', present: 13, late: 3 },
    { name: 'Fri', present: 15, late: 1 },
    { name: 'Sat', present: 8, late: 0 },
    { name: 'Sun', present: 6, late: 0 }
  ];

  const fleetChartData = [
    { name: 'Mon', moving: 6, idle: 3, delayed: 1 },
    { name: 'Tue', moving: 8, idle: 2, delayed: 0 },
    { name: 'Wed', moving: 7, idle: 2, delayed: 1 },
    { name: 'Thu', moving: 5, idle: 4, delayed: 1 },
    { name: 'Fri', moving: 9, idle: 1, delayed: 0 },
    { name: 'Sat', moving: 4, idle: 6, delayed: 0 },
    { name: 'Sun', moving: 3, idle: 7, delayed: 0 }
  ];

  const stockSafetyChartData = [
    { name: 'Coils', safetyQty: 100, currentQty: 140 },
    { name: 'Plates', safetyQty: 150, currentQty: 180 },
    { name: 'Fasteners', safetyQty: 500, currentQty: 320 }, // Low Stock
    { name: 'Bars', safetyQty: 80, currentQty: 95 }
  ];

  // Actions
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    createTask({
      title: newTaskTitle,
      description: 'Critical business variance resolution duty.',
      priority: newTaskPriority,
      assignedTo: newTaskAssigned,
      deadline: '2026-07-22'
    });
    setNewTaskTitle('');
    setTaskModalOpen(false);
    triggerAudio('Success');
  };

  const handleExport = (format: 'PDF' | 'Excel') => {
    triggerNotification(
      'System Alert',
      'Export Dispatched',
      `Calculated operational reports successfully compiled. Exported file: smartops_export_${activeTableTab.toLowerCase()}.${format === 'PDF' ? 'pdf' : 'xlsx'}`,
      'Info'
    );
    addActivity('Data Export', `Downloaded ${activeTableTab} table in ${format} format`, 'fleet');
    triggerAudio('Success');
    alert(`${activeTableTab} ledger sheet exported as ${format}!`);
  };

  // Sorting Handler
  const requestSort = (field: string) => {
    let asc = true;
    if (sortField === field && sortAsc) {
      asc = false;
    }
    setSortField(field);
    setSortAsc(asc);
  };

  // Processing Table Data
  const sortedTableData = useMemo(() => {
    let data: any[] = [];
    if (activeTableTab === 'Inventory') data = [...inventory];
    else if (activeTableTab === 'Attendance') data = [...attendance];
    else if (activeTableTab === 'Fleet') data = [...vehicles];
    else if (activeTableTab === 'Activities') data = [...activities];
    else if (activeTableTab === 'Notifications') data = [...notifications];
    else if (activeTableTab === 'Orders') data = [...latestOrders];

    // Search filter
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      data = data.filter(item => {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(q)
        );
      });
    }

    // Sort sorting
    if (sortField) {
      data.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [activeTableTab, inventory, attendance, vehicles, activities, notifications, latestOrders, tableSearch, sortField, sortAsc]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
      {/* Hero Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-[#0B1C30] via-[#0D2A4A] to-[#0A1828] p-8 md:p-10 rounded-[24px] text-white shadow-lg border border-[#E5EEFF]/80 dark:border-[#334155]/60 text-left animate-fade-in">
        <div className="space-y-2">
          <span className="text-[13px] font-bold text-[#14B8A6] tracking-widest uppercase">Admin Executive Console</span>
          <h2 className="text-[42px] font-extrabold tracking-tight leading-none text-white">Hello, {user?.fullName || 'Harsh Vardhan'}</h2>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-2xl font-medium pt-1">
            Logistics dashboards and telemetry channels are synchronized. Branch operations in Pune, Mumbai and Bangalore are actively reporting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            className="text-white border-slate-700 hover:bg-slate-800 bg-transparent text-xs py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            onClick={() => setReportModalOpen(true)}
          >
            <FileDown className="h-4 w-4 text-slate-400" />
            Generate Report
          </Button>
          <Button
            variant="primary"
            className="text-xs py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-teal-900/20"
            onClick={() => setTaskModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* 10 KPI Cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          id="rev"
          title="Gross Revenue"
          value="₹1.28L"
          description="Total simulated revenue"
          change="+12.4%"
          isPositive={true}
          icon={DollarSign}
          sparklineData={[11000, 13400, 12000, 15000, 16800, 18500, 21000]}
          color="#10B981"
          onClick={() => handleCardClick('rev')}
        />
        <KPICard
          id="fleet"
          title="Active Vehicles"
          value={`${activeVehiclesCount}/${vehicles.length}`}
          description="Trucks moving transit cargo"
          change="+4"
          isPositive={true}
          icon={Truck}
          sparklineData={[2, 3, 3, 2, 4, 3, activeVehiclesCount]}
          color="#006A6A"
          onClick={() => handleCardClick('fleet')}
        />
        <KPICard
          id="stock"
          title="Safety Low Stock"
          value={lowStockCount}
          description="Critical safety replenishment"
          change="-2"
          isPositive={true}
          icon={Package}
          sparklineData={[6, 5, 5, 4, 3, 3, lowStockCount]}
          color="#F59E0B"
          onClick={() => handleCardClick('stock')}
        />
        <KPICard
          id="att"
          title="Workers Present"
          value={`${presentCount}/${totalEmployeesCount}`}
          description="Daily check-in logs active"
          change="92%"
          isPositive={true}
          icon={Users}
          sparklineData={[12, 14, 15, 13, 15, 14, presentCount]}
          color="#14B8A6"
          onClick={() => handleCardClick('att')}
        />
        <KPICard
          id="total"
          title="Total Employees"
          value={totalEmployeesCount}
          description="Roster registry headcount"
          change="Stable"
          isPositive={true}
          icon={Users}
          sparklineData={[18, 18, 18, 18, 18, 18, 18]}
          color="#8B5CF6"
          onClick={() => handleCardClick('total')}
        />
        <KPICard
          id="del"
          title="Completed Deliveries"
          value="142"
          description="SLA orders reached yard"
          change="+15.2%"
          isPositive={true}
          icon={CheckCircle}
          sparklineData={[110, 115, 120, 128, 132, 138, 142]}
          color="#10B981"
          onClick={() => handleCardClick('del')}
        />
        <KPICard
          id="ship"
          title="Pending Shipments"
          value={pendingTripsCount}
          description="Unload cargo in transit"
          change="+1"
          isPositive={false}
          icon={ShoppingCart}
          sparklineData={[3, 2, 4, 2, 3, 2, pendingTripsCount]}
          color="#3b82f6"
          onClick={() => handleCardClick('ship')}
        />
        <KPICard
          id="alerts"
          title="Critical Alerts"
          value={notifications.filter(n => !n.read).length}
          description="Active unresolved warnings"
          change="-5"
          isPositive={true}
          icon={Bell}
          sparklineData={[12, 10, 8, 9, 6, 5, notifications.filter(n => !n.read).length]}
          color="#EF4444"
          onClick={() => handleCardClick('alerts')}
        />
        <KPICard
          id="salary"
          title="Salary Disbursed"
          value={`${processedPayrollCount}/${payroll.length}`}
          description="Staff payroll structures paid"
          change="100%"
          isPositive={true}
          icon={Wallet}
          sparklineData={[3, 4, 5, 6, 6, 6, processedPayrollCount]}
          color="#EC4899"
          onClick={() => handleCardClick('salary')}
        />
        <KPICard
          id="inc"
          title="Incident Status"
          value="Normal"
          description="Telemetry alerts status"
          change="Stable"
          isPositive={true}
          icon={CheckCircle}
          sparklineData={[1, 1, 1, 1, 1, 1, 1]}
          color="#10B981"
          onClick={() => handleCardClick('inc')}
        />
      </div>

      {/* Main interactive charts & side widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Central Switcher Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] p-6 rounded-2xl shadow-sm flex flex-col justify-between text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-4 mb-5">
            <div>
              <h3 className="text-[15px] font-semibold text-[#0B1C30] dark:text-white">Business Dashboard Trends</h3>
              <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-0.5 font-medium">Toggle tabs to view live trends from different parameters</p>
            </div>
            {/* Tab switch buttons */}
            <div className="flex flex-wrap gap-1 bg-[#F8F9FF] dark:bg-[#0F172A] p-1 border border-[rgba(11,28,48,0.04)] rounded-xl">
              {['Revenue', 'Inventory', 'Attendance', 'Fleet', 'Stock'].map((tab: any) => (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeChartTab === tab
                      ? 'bg-[#006A6A] text-white shadow-sm'
                      : 'text-[#6D7A79] hover:text-[#545F73] dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {activeChartTab === 'Revenue' && (
              <OperationsChart
                data={revenueChartData}
                xKey="name"
                series={[
                  { key: 'revenue', name: 'Total Revenue (â‚¹)', color: '#006A6A', type: 'area' },
                  { key: 'cost', name: 'Operational Cost (â‚¹)', color: '#EF4444', type: 'line' },
                  { key: 'target', name: 'Target Target (â‚¹)', color: '#10B981', type: 'line' }
                ]}
              />
            )}
            {activeChartTab === 'Inventory' && (
              <OperationsChart
                data={inventoryChartData}
                xKey="name"
                series={[
                  { key: 'itemsIn', name: 'Stock Checked In', color: '#006A6A', type: 'area' },
                  { key: 'itemsOut', name: 'Stock Dispatched', color: '#F59E0B', type: 'line' }
                ]}
              />
            )}
            {activeChartTab === 'Attendance' && (
              <OperationsChart
                data={attendanceChartData}
                xKey="name"
                series={[
                  { key: 'present', name: 'Drivers Present', color: '#10B981', type: 'bar' },
                  { key: 'late', name: 'Check-In Delay (Late)', color: '#EF4444', type: 'line' }
                ]}
                type="bar"
              />
            )}
            {activeChartTab === 'Fleet' && (
              <OperationsChart
                data={fleetChartData}
                xKey="name"
                series={[
                  { key: 'moving', name: 'Moving Active', color: '#006A6A', type: 'area' },
                  { key: 'idle', name: 'Yard Idle', color: '#667085', type: 'line' },
                  { key: 'delayed', name: 'Delayed Telemetry', color: '#EF4444', type: 'bar' }
                ]}
              />
            )}
            {activeChartTab === 'Stock' && (
              <OperationsChart
                data={stockSafetyChartData}
                xKey="name"
                series={[
                  { key: 'currentQty', name: 'Current Stock Level', color: '#006A6A', type: 'bar' },
                  { key: 'safetyQty', name: 'Safety Threshold Limit', color: '#EF4444', type: 'line' }
                ]}
                type="bar"
              />
            )}
          </div>
        </div>

        {/* 6 Side Widgets */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] p-6 rounded-2xl shadow-sm space-y-6 text-left flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#0B1C30] dark:text-white">Operational Health status</h3>
            <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-0.5 font-medium">Live telemetry widgets tracking yard parameters</p>
          </div>

          <div className="space-y-4">
            {/* Widget 1: Inventory Health */}
            <div className="flex justify-between items-center text-[15px] font-medium text-[#545F73]">
              <span className="text-[#545F73] dark:text-[#CBD5E1]">Inventory Health</span>
              <span className="px-2.5 py-0.5 text-xs bg-[#10B981]/10 text-[#10B981] font-bold rounded-full border border-[#10B981]/15">Optimal 94%</span>
            </div>

            {/* Widget 2: Stock Availability */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[13px] font-bold text-[#6D7A79]">
                <span>Stock Availability</span>
                <span className="text-[#0B1C30] dark:text-[#CBD5E1]">86% Capacity</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-[#006A6A] h-full rounded-full" style={{ width: '86%' }} />
              </div>
            </div>

            {/* Widget 3: Storage Utilization */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[13px] font-bold text-[#6D7A79]">
                <span>Storage Utilization</span>
                <span className="text-[#0B1C30] dark:text-[#CBD5E1]">68% Filled</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-[#14B8A6] h-full rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            {/* Widget 4: Pending Deliveries */}
            <div className="flex justify-between items-center text-[15px] font-medium">
              <span className="text-[#545F73] dark:text-[#CBD5E1]">Pending Deliveries</span>
              <span className="font-extrabold text-[#006A6A] dark:text-[#14B8A6]">{pendingTripsCount} Shipments</span>
            </div>

            {/* Widget 5: Driver Availability */}
            <div className="flex justify-between items-center text-[15px] font-medium">
              <span className="text-[#545F73] dark:text-[#CBD5E1]">Driver On-Duty status</span>
              <span className="px-2.5 py-0.5 text-xs bg-[#10B981]/10 text-[#10B981] font-bold rounded-full border border-[#10B981]/15">14 Active</span>
            </div>

            {/* Widget 6: Vehicle Health */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[13px] font-bold text-[#6D7A79]">
                <span>Vehicle Health Tracker</span>
                <span className="text-[#0B1C30] dark:text-[#CBD5E1]">92% Clean SLA</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pt-4 flex justify-between items-center text-[13px] font-bold text-[#6D7A79]">
            <span>YARDS ACTIVE</span>
            <span className="text-[#0B1C30] dark:text-[#CBD5E1]">PUNE, BOM, BLR</span>
          </div>
        </div>
      </div>

      {/* Interactive Tables Section */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] p-6 rounded-[20px] shadow-sm text-left">
        {/* Table Selector & Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-4 mb-6">
          <div className="flex flex-wrap gap-1 bg-[#F8F9FF] dark:bg-[#0F172A] p-1 border border-[rgba(11,28,48,0.04)] rounded-xl">
            {['Inventory', 'Attendance', 'Fleet', 'Activities', 'Notifications', 'Orders'].map((tab: any) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTableTab(tab);
                  setSortField('');
                  setTableSearch('');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTableTab === tab
                    ? 'bg-[#006A6A] text-white shadow-sm'
                    : 'text-[#6D7A79] hover:text-[#545F73] dark:hover:text-slate-200'
                }`}
              >
                {tab} Ledgers
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5 items-center w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTableTab.toLowerCase()}...`}
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                className="w-full lg:w-60 pl-9 pr-4 py-2 h-10 text-xs border border-[#E5EEFF] dark:border-[#334155] rounded-xl bg-[#F8F9FF] dark:bg-[#0F172A] text-slate-700 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] transition-all font-medium"
              />
            </div>

            {/* Export buttons */}
            <button
              onClick={() => handleExport('Excel')}
              className="h-10 px-4 border border-[#E5EEFF] dark:border-[#334155] bg-white hover:bg-[#F8F9FF] dark:bg-[#0F172A] dark:hover:bg-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="h-4 w-4 text-slate-400" /> XLS
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="h-10 px-4 border border-[#E5EEFF] dark:border-[#334155] bg-white hover:bg-[#F8F9FF] dark:bg-[#0F172A] dark:hover:bg-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileDown className="h-4 w-4 text-slate-400" /> PDF
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 rounded-xl max-h-[380px]">
          <table className="w-full text-[15px] text-[#545F73] dark:text-[#CBD5E1] relative border-collapse">
            {/* Header */}
            <thead className="text-xs font-bold text-[#0B1C30] dark:text-[#F8FAFC] uppercase tracking-wider bg-[#F8F9FF] dark:bg-[#0F172A] sticky top-0 border-b border-[#E5EEFF] dark:border-[#334155] z-10">
              <tr>
                {activeTableTab === 'Inventory' && (
                  <>
                    <th onClick={() => requestSort('itemName')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      Item Name <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th onClick={() => requestSort('sku')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      SKU <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th onClick={() => requestSort('quantity')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      Quantity <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th onClick={() => requestSort('minimumQuantity')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      Safety Min <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th className="px-5 py-4 text-left">Status</th>
                  </>
                )}

                {activeTableTab === 'Attendance' && (
                  <>
                    <th onClick={() => requestSort('employeeName')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      Staff Member <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th onClick={() => requestSort('date')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      Shift Date <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th className="px-5 py-4 text-left">Check In</th>
                    <th className="px-5 py-4 text-left">Check Out</th>
                    <th className="px-5 py-4 text-left">Status</th>
                  </>
                )}

                {activeTableTab === 'Fleet' && (
                  <>
                    <th onClick={() => requestSort('vehicleNumber')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      Truck Reg <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th onClick={() => requestSort('vehicleType')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      Type <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th onClick={() => requestSort('status')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      Telemetry <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th className="px-5 py-4 text-left">Last Serviced</th>
                  </>
                )}

                {activeTableTab === 'Activities' && (
                  <>
                    <th onClick={() => requestSort('user')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      User <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th onClick={() => requestSort('action')} className="px-5 py-4 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      Action <ArrowUpDown className="h-3.5 w-3.5 inline ml-1 text-slate-400" />
                    </th>
                    <th className="px-5 py-4 text-left">Details</th>
                    <th className="px-5 py-4 text-left">Timestamp</th>
                  </>
                )}

                {activeTableTab === 'Notifications' && (
                  <>
                    <th className="px-5 py-4 text-left">Severity</th>
                    <th className="px-5 py-4 text-left">Alert Title</th>
                    <th className="px-5 py-4 text-left">Incident Log</th>
                    <th className="px-5 py-4 text-left">Date</th>
                  </>
                )}

                {activeTableTab === 'Orders' && (
                  <>
                    <th className="px-5 py-4 text-left">Order ID</th>
                    <th className="px-5 py-4 text-left">Consignment Item</th>
                    <th className="px-5 py-4 text-left">Client Entity</th>
                    <th className="px-5 py-4 text-left">Quantity</th>
                    <th className="px-5 py-4 text-left">Status</th>
                  </>
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {sortedTableData.length > 0 ? (
                sortedTableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8F9FF]/50 dark:hover:bg-slate-950/20 transition-colors">
                    {activeTableTab === 'Inventory' && (
                      <>
                        <td className="px-5 py-4 font-bold text-[#0B1C30] dark:text-[#F8FAFC]">{(row as InventoryItem).itemName}</td>
                        <td className="px-5 py-4 font-mono text-xs">{(row as InventoryItem).sku}</td>
                        <td className="px-5 py-4 font-extrabold text-[#0B1C30] dark:text-white">{(row as InventoryItem).quantity}</td>
                        <td className="px-5 py-4 text-[#6D7A79]">{(row as InventoryItem).minimumQuantity}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            (row as InventoryItem).quantity <= (row as InventoryItem).minimumQuantity
                              ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                              : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                          }`}>
                            {(row as InventoryItem).quantity <= (row as InventoryItem).minimumQuantity ? 'âš ï¸ Low Stock' : 'âœ… Healthy'}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTableTab === 'Attendance' && (
                      <>
                        <td className="px-5 py-4 font-bold text-[#0B1C30] dark:text-[#F8FAFC]">{(row as AttendanceRecord).employeeName}</td>
                        <td className="px-5 py-4 font-mono text-xs">{(row as AttendanceRecord).date}</td>
                        <td className="px-5 py-4">{(row as AttendanceRecord).checkIn || '09:00 AM'}</td>
                        <td className="px-5 py-4">{(row as AttendanceRecord).checkOut || '--:--'}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            (row as AttendanceRecord).attendanceStatus === 'Present' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' :
                            (row as AttendanceRecord).attendanceStatus === 'Late' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' :
                            'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                          }`}>
                            {(row as AttendanceRecord).attendanceStatus}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTableTab === 'Fleet' && (
                      <>
                        <td className="px-5 py-4 font-mono font-bold text-[#0B1C30] dark:text-white">{(row as Vehicle).vehicleNumber}</td>
                        <td className="px-5 py-4 text-[#545F73] dark:text-[#94A3B8]">{(row as Vehicle).vehicleType}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            (row as Vehicle).status === 'Moving' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' :
                            (row as Vehicle).status === 'Idle' ? 'bg-slate-500/10 text-[#6D7A79] border-slate-500/20' :
                            'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                          }`}>
                            {(row as Vehicle).status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs">{(row as Vehicle).fitness || '2026-06-01'}</td>
                      </>
                    )}

                    {activeTableTab === 'Activities' && (
                      <>
                        <td className="px-5 py-4 font-bold text-[#0B1C30] dark:text-[#F8FAFC]">{(row as ActivityItem).user}</td>
                        <td className="px-5 py-4 text-[#0B1C30] dark:text-white font-semibold">{(row as ActivityItem).action}</td>
                        <td className="px-5 py-4 text-[#6D7A79] whitespace-normal break-words max-w-xs leading-normal">{(row as ActivityItem).details}</td>
                        <td className="px-5 py-4 font-mono text-xs">{(row as ActivityItem).timestamp}</td>
                      </>
                    )}

                    {activeTableTab === 'Notifications' && (
                      <>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            (row as SystemNotification).severity === 'Error' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                            (row as SystemNotification).severity === 'Warning' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' :
                            'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20'
                          }`}>
                            {(row as SystemNotification).severity}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-[#0B1C30] dark:text-[#F8FAFC]">{(row as SystemNotification).title}</td>
                        <td className="px-5 py-4 text-[#6D7A79]">{(row as SystemNotification).message}</td>
                        <td className="px-5 py-4 font-mono text-xs">{(row as SystemNotification).timestamp}</td>
                      </>
                    )}

                    {activeTableTab === 'Orders' && (
                      <>
                        <td className="px-5 py-4 font-mono font-bold text-[#0B1C30] dark:text-[#F8FAFC]">{row.id}</td>
                        <td className="px-5 py-4 font-bold text-[#0B1C30] dark:text-white">{row.item}</td>
                        <td className="px-5 py-4 text-[#545F73] dark:text-[#CBD5E1]">{row.client}</td>
                        <td className="px-5 py-4 font-extrabold text-[#0B1C30] dark:text-white">{row.qty}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            row.status === 'Completed' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#6D7A79] dark:text-[#6D7A79] font-medium">
                    No registry rows matching current search index.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Creation Modal */}
      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Create Operations Task">
        <form onSubmit={handleCreateTask} className="space-y-5 text-left">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase tracking-wide">Task Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Verify gate 2 vehicle logs"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] bg-white dark:bg-[#0F172A] text-slate-700 dark:text-[#F8FAFC] transition-all shadow-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase tracking-wide">Assigned Staff</label>
              <select
                value={newTaskAssigned}
                onChange={e => setNewTaskAssigned(e.target.value)}
                className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] transition-all bg-white dark:bg-[#0F172A] text-slate-700 dark:text-[#F8FAFC] cursor-pointer shadow-sm font-medium"
              >
                <option>Amit Patel (Supervisor)</option>
                <option>Vikram Singh (Fleet Manager)</option>
                <option>Sanjay Dutt (Technician)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase tracking-wide">Priority Rating</label>
              <select
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value as Task['priority'])}
                className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] transition-all bg-white dark:bg-[#0F172A] text-slate-700 dark:text-[#F8FAFC] cursor-pointer shadow-sm font-medium"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 mt-4">
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
        <div className="space-y-5 text-left">
          <p className="text-[15px] text-[#6D7A79] dark:text-[#94A3B8] font-medium leading-normal">Choose an operational report sheet to export in PDF or CSV formats:</p>
          <div className="grid grid-cols-2 gap-3">
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
                onClick={() => {
                  triggerNotification(
                    'System Alert',
                    'Report Dispatch',
                    `Corporate document exported and queued: ${sheet}`,
                    'Info'
                  );
                  addActivity('Report Generated', `Exported corporate ledger: ${sheet}`, 'fleet');
                  triggerAudio('Success');
                  setReportModalOpen(false);
                  alert(`Report queued: ${sheet}`);
                }}
                className="p-4 border border-[#E5EEFF] dark:border-[#334155] rounded-xl text-left hover:border-[#006A6A] hover:bg-[#F8F9FF] text-xs font-bold text-slate-700 dark:text-[#CBD5E1] dark:bg-[#0F172A]/40 hover:dark:bg-slate-850/50 transition-colors cursor-pointer"
              >
                {sheet}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 mt-4">
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};



