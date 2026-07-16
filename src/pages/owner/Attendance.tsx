import React, { useState, useMemo } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserCheck, UserX, UserMinus, Clock, AlertTriangle, Truck, TrendingUp,
  Navigation, Activity, ShieldAlert, DollarSign, MapPin, Calendar, Award,
  FileText, Eye, LogOut, ExternalLink, Bell, SlidersHorizontal, ArrowUpRight,
  ArrowDownRight, Search, Download, CheckCircle2, AlertOctagon, HelpCircle, Info
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { AttendanceRecord, Trip, Vehicle, PayrollRecord } from '../../types';

// Helper component for KPI Cards with mini sparkline graphs
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<any>;
  sparklineData: number[];
  color: string;
  bgColor: string;
}> = ({ title, value, change, isPositive, icon: Icon, sparklineData, color, bgColor }) => {
  const width = 80;
  const height = 30;
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / (range || 1)) * height + 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex justify-between items-start group transition-all duration-200"
    >
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{title}</span>
        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</h4>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          )}
          <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{change}</span>
          <span className="text-[9px] text-slate-450 dark:text-slate-550 font-medium ml-1">Today</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0">
        <div className={`p-2.5 rounded-xl ${bgColor} ${color} group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <svg width={width} height={height} className="overflow-visible mt-1.5">
          <polyline
            fill="none"
            stroke="currentColor"
            className={color}
            strokeWidth="1.8"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
};

export const Attendance: React.FC = () => {
  const { attendance, vehicles, trips, payroll } = useOperations();
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [attendanceFilter, setAttendanceFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // 1. DYNAMIC KPI CALCULATION
  const todayStr = new Date().toISOString().split('T')[0];
  const totalDriversCount = vehicles.length + 1; // Seeding accounts

  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentDriversCount = todayAttendance.filter(a => a.attendanceStatus === 'Present' || a.attendanceStatus === 'Late' || a.status === 'Present' || a.status === 'Late').length;
  const lateCheckInCount = todayAttendance.filter(a => a.attendanceStatus === 'Late' || a.status === 'Late').length;
  const checkedOutDriversCount = todayAttendance.filter(a => a.checkOut).length;
  const absentDriversCount = Math.max(0, totalDriversCount - presentDriversCount);

  const onDutyCount = attendance.filter(a => a.currentStatus === 'On Duty' || a.currentStatus === 'On Trip').length;
  const offDutyCount = totalDriversCount - onDutyCount;
  const onLeaveCount = attendance.filter(a => a.attendanceStatus === 'On Leave').length;
  const overtimeCount = attendance.filter(a => a.overtime && a.overtime > 0).length;
  const activeTripsCount = trips.filter(t => t.status !== 'Completed').length;
  const completedTripsCount = trips.filter(t => t.status === 'Completed').length;

  // Mock Notifications for alerts strip
  const systemAlerts = [
    { type: 'emergency', msg: 'Emergency SOS: Flat tyre reported on KA-03-MN-4512 near Hosur toll.', time: '10 mins ago' },
    { type: 'delay', msg: 'Trip TRP-2026-8801 is delayed by 25 mins due to express highway traffic.', time: '15 mins ago' },
    { type: 'late', msg: 'Late Check-In: Driver Rajesh Kumar checked in 15 mins after shift schedule.', time: 'Just Now' },
    { type: 'overtime', msg: 'Regulatory Warning: Driver Arjun Sharma is nearing 10 consecutive hours on duty.', time: '1 hr ago' }
  ];

  // 2. MAP TRAJECTORY COORDINATES (Simulated vector paths)
  const mapDrivers = useMemo(() => {
    return [
      {
        id: 'DRV-9041',
        name: 'Rajesh Kumar',
        vehicle: 'MH-12-QW-9874',
        status: 'On Duty',
        location: 'Pune Highway',
        lat: 250,
        lng: 150,
        dest: 'Mumbai DC',
        progress: 60,
        eta: '16:45 PM',
        color: 'var(--color-success)' // Green
      },
      {
        id: 'DRV-9042',
        name: 'Satnam Singh',
        vehicle: 'KA-03-MN-4512',
        status: 'On Trip',
        location: 'Bengaluru Gate 2',
        lat: 180,
        lng: 230,
        dest: 'Chennai DC',
        progress: 25,
        eta: '22:15 PM',
        color: 'var(--color-primary)' // Blue
      },
      {
        id: 'DRV-9043',
        name: 'Arjun Sharma',
        vehicle: 'HR-55-ZX-3344',
        status: 'On Break',
        location: 'Highway Plaza Halt',
        lat: 380,
        lng: 110,
        dest: 'Delhi Cold Stg',
        progress: 80,
        eta: '18:30 PM',
        color: 'var(--color-warning)' // Orange
      }
    ];
  }, []);

  // 3. TABLE FILTERING LOGIC
  const filteredAttendance = useMemo(() => {
    return attendance.filter(row => {
      // Search
      const matchesSearch = row.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (row.driverId && row.driverId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status
      const matchesStatus = statusFilter === 'All' || row.currentStatus === statusFilter;
      
      // Attendance
      const matchesAttendance = attendanceFilter === 'All' || row.attendanceStatus === attendanceFilter;

      // Date
      const matchesDate = !dateFilter || row.date === dateFilter;

      return matchesSearch && matchesStatus && matchesAttendance && matchesDate;
    });
  }, [attendance, searchQuery, statusFilter, attendanceFilter, dateFilter]);

  // Export functions simulation
  const triggerCSVExport = () => {
    alert('Compiling CSV logs... Download triggered for duty-attendance-ledger.csv');
  };

  const triggerPDFExport = () => {
    alert('Generating PDF summary report... Download triggered for shift-duty-analytics.pdf');
  };

  // Recharts Analytics Datasets
  const trendData = [
    { day: 'Mon', Present: 5, Late: 1, Absent: 0 },
    { day: 'Tue', Present: 6, Late: 0, Absent: 0 },
    { day: 'Wed', Present: 4, Late: 2, Absent: 0 },
    { day: 'Thu', Present: 5, Late: 1, Absent: 1 },
    { day: 'Fri', Present: 6, Late: 0, Absent: 0 },
    { day: 'Sat', Present: 4, Late: 1, Absent: 0 },
    { day: 'Sun', Present: 2, Late: 0, Absent: 0 },
  ];

  const workingHoursData = [
    { day: 'Mon', hours: 7.8 },
    { day: 'Tue', hours: 8.5 },
    { day: 'Wed', hours: 9.2 },
    { day: 'Thu', hours: 8.0 },
    { day: 'Fri', hours: 9.5 },
    { day: 'Sat', hours: 7.2 },
    { day: 'Sun', hours: 6.0 },
  ];

  const lateArrivalData = [
    { name: 'On-Time', value: 82, color: 'var(--color-success)' },
    { name: 'Late Arrival', value: 14, color: 'var(--color-warning)' },
    { name: 'Absent Logs', value: 4, color: 'var(--color-danger)' }
  ];

  const tripCompletionData = [
    { name: 'Success Deliveries', value: 92, color: 'var(--color-primary)' },
    { name: 'Delayed Transit', value: 8, color: 'var(--color-danger)' }
  ];

  return (
    <div className="space-y-8">
      {/* Title & Alerts Section */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Driver Duty & Telemetry Control</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time GPS dispatch check-ins, automated attendance logs, and rest regulations monitor.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={triggerPDFExport} className="text-xs font-semibold py-2 rounded-xl flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> Download PDF Reports
          </Button>
          <Button variant="primary" size="sm" onClick={triggerCSVExport} className="bg-blue-600 hover:bg-blue-700 text-xs font-bold py-2 rounded-xl flex items-center gap-1.5 text-white">
            <SlidersHorizontal className="h-4 w-4" /> Operations Control
          </Button>
        </div>
      </div>

      {/* Real-time System Alarms Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-white overflow-hidden shadow-lg relative flex items-center gap-3">
        <div className="p-2 bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl shrink-0 flex items-center justify-center animate-pulse">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="flex-1 text-xs overflow-hidden h-5 relative">
          <div className="absolute inset-0 flex flex-col">
            {systemAlerts.map((alert, i) => (
              <div key={i} className="flex justify-between items-center h-5 w-full">
                <span className="font-semibold text-slate-200 truncate pr-4">{alert.msg}</span>
                <span className="text-[10px] text-slate-500 shrink-0 font-mono">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* metrics grid: 8 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Present Drivers"
          value={presentDriversCount}
          change="Daily presence logs"
          isPositive={true}
          icon={UserCheck}
          sparklineData={[5, 5, 6, 6, 6, 7, presentDriversCount]}
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-950/20"
        />
        <MetricCard
          title="Absent Drivers"
          value={absentDriversCount}
          change="Awaiting clock-in"
          isPositive={false}
          icon={UserX}
          sparklineData={[3, 2, 2, 3, 1, 2, absentDriversCount]}
          color="text-slate-500"
          bgColor="bg-slate-50 dark:bg-slate-950/20"
        />
        <MetricCard
          title="Late Drivers"
          value={lateCheckInCount}
          change="Checked-in after 08:30"
          isPositive={false}
          icon={AlertTriangle}
          sparklineData={[1, 0, 2, 1, 0, 1, lateCheckInCount]}
          color="text-amber-500"
          bgColor="bg-amber-50 dark:bg-amber-950/20"
        />
        <MetricCard
          title="Checked-Out Drivers"
          value={checkedOutDriversCount}
          change="Shift completed"
          isPositive={true}
          icon={CheckCircle2}
          sparklineData={[4, 5, 4, 6, 5, 6, checkedOutDriversCount]}
          color="text-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-950/20"
        />
        <MetricCard
          title="Total Driver Pool"
          value={totalDriversCount}
          change="+1 new operator"
          isPositive={true}
          icon={Users}
          sparklineData={[5, 5, 6, 6, 6, 7, totalDriversCount]}
          color="text-violet-600"
          bgColor="bg-violet-50 dark:bg-violet-950/20"
        />
        <MetricCard
          title="Overtime Hours"
          value={`${overtimeCount} drivers`}
          change="+12% overtime"
          isPositive={true}
          icon={Clock}
          sparklineData={[1, 2, 1, 3, 2, 2, overtimeCount]}
          color="text-rose-600"
          bgColor="bg-rose-50 dark:bg-rose-950/20"
        />
        <MetricCard
          title="Active Transit Runs"
          value={activeTripsCount}
          change="Live consignments"
          isPositive={true}
          icon={Truck}
          sparklineData={[3, 4, 3, 5, 4, 3, activeTripsCount]}
          color="text-sky-600"
          bgColor="bg-sky-50 dark:bg-sky-950/20"
        />
        <MetricCard
          title="Completed Delivery"
          value={completedTripsCount}
          change="100% SLA target"
          isPositive={true}
          icon={TrendingUp}
          sparklineData={[15, 18, 16, 20, 22, 19, completedTripsCount]}
          color="text-indigo-600"
          bgColor="bg-indigo-50 dark:bg-indigo-950/20"
        />
      </div>

      {/* Telemetry section: Live Map + Live driver status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Map vector tracking */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm xl:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-55 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Navigation className="h-4.5 w-4.5 text-blue-600 animate-spin-slow" /> Interactive Route Telemetry tracking map
            </h3>
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Live Tracking Loop
            </span>
          </div>

          <div className="h-100 bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-inner">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
            
            {/* SVG Path Route Pune to Mumbai */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 350">
              <path
                d="M 60,280 L 160,220 L 260,180 L 360,120 L 480,80 L 540,40"
                fill="none"
                stroke="var(--color-outline-variant)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 60,280 L 160,220 L 260,180"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Bengaluru to Chennai path */}
              <path
                d="M 120,320 L 280,290 L 390,260 L 520,240"
                fill="none"
                stroke="var(--color-outline-variant)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 120,320 L 280,290"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="60" cy="280" r="5" fill="var(--color-text-muted)" />
              <circle cx="260" cy="180" r="5" fill="var(--color-primary)" />
              <circle cx="540" cy="40" r="6" fill="var(--color-success)" />
              <circle cx="120" cy="320" r="5" fill="var(--color-text-muted)" />
              <circle cx="520" cy="240" r="6" fill="var(--color-success)" />
            </svg>

            <div className="absolute bottom-16 left-12 text-[9px] text-slate-500 font-bold">Pune Hub</div>
            <div className="absolute top-12 right-20 text-[9px] text-emerald-400 font-bold">Mumbai DC</div>
            <div className="absolute bottom-10 left-36 text-[9px] text-slate-500 font-bold">Bengaluru Yd</div>
            <div className="absolute bottom-24 right-20 text-[9px] text-emerald-400 font-bold">Chennai Terminal</div>

            {/* Active Driver Pins */}
            {mapDrivers.map(drv => (
              <div
                key={drv.id}
                className="absolute flex flex-col items-center select-none"
                style={{ top: drv.lat, left: drv.lng }}
              >
                <div className="bg-slate-900/90 text-white font-mono font-bold text-[8px] px-1.5 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap">
                  {drv.name} ({drv.vehicle.split('-')[0]})
                </div>
                <div
                  className="w-5 h-5 rounded-full text-white flex items-center justify-center border border-white shadow-lg animate-bounce"
                  style={{ backgroundColor: drv.color }}
                >
                  <Navigation className="h-2.5 w-2.5 rotate-45" />
                </div>
              </div>
            ))}

            {/* Float Info Map Overlay */}
            <div className="relative z-10 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 text-white border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <p className="text-[10px] text-slate-505 uppercase font-semibold">Active Telemetry Tracker</p>
                <p className="font-bold text-slate-200">MH-12-QW-9874 • Rajesh Kumar</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-550 uppercase font-semibold">ETA to Destination</p>
                <p className="font-bold font-mono text-blue-400">16:45 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Driver Status Board */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-gray-50 flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-blue-650" /> Live Driver Status Board
            </h3>
            
            <div className="space-y-4.5 pt-4">
              {[
                { name: 'Rajesh Kumar', vehicle: 'MH-12-QW-9874', loc: 'Pune Warehouse A', status: 'On Duty', variant: 'success', time: 'Check-In: 08:45 AM', color: 'bg-emerald-500' },
                { name: 'Satnam Singh', vehicle: 'KA-03-MN-4512', loc: 'Bengaluru Gate 2', status: 'On Trip', variant: 'info', time: 'In Transit to Chennai', color: 'bg-blue-600' },
                { name: 'Arjun Sharma', vehicle: 'HR-55-ZX-3344', loc: 'Highway Plaza Halt', status: 'On Break', variant: 'warning', time: 'Rest Break (30m)', color: 'bg-amber-500' },
                { name: 'Amit Patel', vehicle: 'DL-01-AB-1234', loc: 'Offline', status: 'Off Duty', variant: 'neutral', time: 'Clocked Out', color: 'bg-slate-400' }
              ].map((driver, index) => (
                <div key={index} className="flex justify-between items-center text-xs p-2.5 border border-gray-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${driver.color}`} />
                      <p className="font-bold text-slate-800">{driver.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">{driver.vehicle} • {driver.loc}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={driver.variant as any}>{driver.status}</Badge>
                    <p className="text-[9px] text-slate-400 font-medium block">{driver.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-55 p-4 border border-slate-100 rounded-2xl text-xs space-y-2">
            <h5 className="font-bold text-slate-700 flex items-center gap-1.5"><Award className="h-4 w-4 text-emerald-600" /> Fleet Safety Rating</h5>
            <p className="text-[10px] text-slate-500 leading-normal">
              Average safety index rating is currently at <span className="text-emerald-600 font-bold">94.8%</span>. No speed infractions logged in the last 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Main Professional Attendance Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-3 border-b border-gray-50">
          <h3 className="text-sm font-bold text-slate-800">Operational Shift Attendance Ledger</h3>
          
          {/* Custom Filters Drawer Trigger */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-205 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-205 rounded-xl p-1.5 text-xs bg-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="On Duty">On Duty</option>
              <option value="On Trip">On Trip</option>
              <option value="On Break">On Break</option>
              <option value="Off Duty">Off Duty</option>
            </select>

            <select
              value={attendanceFilter}
              onChange={e => setAttendanceFilter(e.target.value)}
              className="border border-gray-205 dark:border-slate-800 rounded-xl p-1.5 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">Attendance Status</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>

            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Clear Date
              </button>
            )}
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="border border-gray-205 dark:border-slate-800 rounded-xl p-1 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 focus:outline-none"
            />
          </div>
        </div>

        {/* Attendance ledger table */}
        <Table
          data={filteredAttendance}
          columns={[
            {
              header: 'Driver Operator',
              accessor: (row: AttendanceRecord) => (
                <div className="flex items-center gap-3">
                  <img
                    src={row.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.employeeName)}`}
                    alt="Driver Photo"
                    className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shrink-0 object-cover"
                  />
                  <div>
                    <span className="font-bold text-slate-805 dark:text-slate-200 text-xs block">{row.employeeName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">ID: {row.driverId || 'DRV-9041'}</span>
                  </div>
                </div>
              ),
              sortKey: 'employeeName'
            },
            {
              header: 'Vehicle Code',
              accessor: (row: AttendanceRecord) => (
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {row.driverId === 'DRV-9042' ? 'KA-03-MN-4512' : 'MH-12-QW-9874'}
                </span>
              )
            },
            {
              header: 'Check-In',
              accessor: (row: AttendanceRecord) => (
                <div>
                  <span className="text-xs text-slate-805 dark:text-slate-202 font-semibold block">{row.checkIn}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">{row.checkInWarehouse || 'Warehouse A'}</span>
                </div>
              )
            },
            {
              header: 'Check-Out',
              accessor: (row: AttendanceRecord) => (
                <span className="text-slate-600 dark:text-slate-350">{row.checkOut || '--'}</span>
              )
            },
            {
              header: 'Active Hours',
              accessor: (row: AttendanceRecord) => (
                <span className="text-slate-600 dark:text-slate-350">{row.workingHours ? `${row.workingHours} hrs` : '--'}</span>
              ),
              sortKey: 'workingHours'
            },
            {
              header: 'Trips (Dist)',
              accessor: (row: AttendanceRecord) => (
                <div>
                  <span className="text-xs text-slate-805 dark:text-slate-202 font-semibold block">{row.tripsCompleted || 0} runs</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">{row.distanceCovered || 0} km covered</span>
                </div>
              )
            },
            {
              header: 'Break Time',
              accessor: (row: AttendanceRecord) => (
                <span className="text-slate-600 dark:text-slate-350">{row.breakDuration ? `${row.breakDuration} mins` : '--'}</span>
              )
            },
            {
              header: 'Live Status',
              accessor: (row: AttendanceRecord) => (
                <Badge variant={
                  row.currentStatus === 'On Duty' ? 'success' :
                  row.currentStatus === 'On Trip' ? 'info' :
                  row.currentStatus === 'On Break' ? 'warning' : 'neutral'
                }>
                  {row.currentStatus || 'Off Duty'}
                </Badge>
              )
            },
            {
              header: 'Overtime',
              accessor: (row: AttendanceRecord) => (
                <span className={`text-xs font-semibold ${row.overtime && row.overtime > 0 ? 'text-red-500 font-bold dark:text-red-400' : 'text-slate-505 dark:text-slate-450'}`}>
                  {row.overtime ? `${row.overtime} hrs` : '--'}
                </span>
              )
            },
            {
              header: 'Shift Marker',
              accessor: (row: AttendanceRecord) => (
                <Badge variant={row.attendanceStatus === 'Present' ? 'success' : row.attendanceStatus === 'Late' ? 'warning' : 'danger'}>
                  {row.attendanceStatus || 'Present'}
                </Badge>
              ),
              sortKey: 'attendanceStatus'
            },
            {
              header: 'Action Hub',
              accessor: (row: AttendanceRecord) => (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedRecord(row);
                      setDrawerOpen(true);
                    }}
                    className="p-1 px-2.5 text-[10px] font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 rounded-xl cursor-pointer shadow-sm"
                  >
                    <Eye className="h-3 w-3 inline mr-1" /> Inspect Logs
                  </Button>
                </div>
              )
            }
          ]}
          searchKey="employeeName"
          searchPlaceholder="Search operator records..."
          exportFileName="driver-duty-ledger"
        />
      </div>

      {/* Side Slide-Over Drawer for Driver Details */}
      <AnimatePresence>
        {drawerOpen && selectedRecord && (
          <>
            {/* Drawer Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 shadow-2xl z-50 overflow-y-auto flex flex-col"
            >
              {/* Header profile block */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex justify-between items-start shrink-0 relative">
                <div className="flex gap-4">
                  <img
                    src={selectedRecord.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedRecord.employeeName)}`}
                    alt="Profile Avatar"
                    className="w-16 h-16 rounded-full border-2 border-white/20 bg-slate-800 object-cover"
                  />
                  <div className="space-y-1 pt-1">
                    <h3 className="text-base font-bold text-white leading-none">{selectedRecord.employeeName}</h3>
                    <p className="text-xs text-blue-400 font-semibold">{selectedRecord.driverId || 'DRV-9041'} • Active Truck Operator</p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-400">
                      <span>Lic: DL-MH12-9988</span>
                      <span>•</span>
                      <span>Phone: +91 91234 56789</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 p-6 space-y-6">
                {/* 1. Performance Indicator Dials */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Productivity Index</span>
                      <h4 className="text-lg font-bold text-slate-805 dark:text-slate-100 mt-1">{selectedRecord.performanceScore || 100}%</h4>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Award className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Final Duty Status</span>
                      <h4 className="text-lg font-bold text-slate-805 dark:text-slate-100 mt-1">{selectedRecord.attendanceStatus || 'Present'}</h4>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* 2. Today's Activity Vertical Timeline */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-gray-50 dark:border-slate-800 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-500" /> Today's Telemetry Shift Timeline
                  </h4>

                  <div className="relative pl-6 space-y-5 pt-2">
                    <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-slate-100 dark:bg-slate-800" />

                    {(selectedRecord.timeline && selectedRecord.timeline.length > 0) ? (
                      selectedRecord.timeline.map((event, idx) => (
                        <div key={idx} className="relative flex justify-between items-start gap-4 text-xs">
                          <span className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 ring-4 ring-blue-50 dark:ring-blue-950/40" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-805 dark:text-slate-200">{event.event}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{event.description || 'Verified via telemetry logs.'}</p>
                          </div>
                          <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 shrink-0">{event.time}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="relative flex justify-between items-start gap-4 text-xs">
                          <span className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 ring-4 ring-blue-50 dark:ring-blue-950/40" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-805 dark:text-slate-200">Start Duty</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Clocked in at Warehouse A (Pune).</p>
                          </div>
                          <span className="font-mono text-[9px] text-slate-405 dark:text-slate-500 shrink-0">{selectedRecord.checkIn}</span>
                        </div>
                        <div className="relative flex justify-between items-start gap-4 text-xs">
                          <span className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 ring-4 ring-blue-50 dark:ring-blue-950/40" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-805 dark:text-slate-200">Trip Assigned</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">TRP-2026-8801 linked successfully.</p>
                          </div>
                          <span className="font-mono text-[9px] text-slate-455 dark:text-slate-500 shrink-0">09:00 AM</span>
                        </div>
                        <div className="relative flex justify-between items-start gap-4 text-xs">
                          <span className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 ring-4 ring-blue-50 dark:ring-blue-950/40" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-805 dark:text-slate-200">Lunch Break</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Halted at highway food court plaza.</p>
                          </div>
                          <span className="font-mono text-[9px] text-slate-455 dark:text-slate-500 shrink-0">12:30 PM</span>
                        </div>
                        <div className="relative flex justify-between items-start gap-4 text-xs">
                          <span className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 ring-4 ring-blue-50 dark:ring-blue-950/40" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-805 dark:text-slate-200">End Duty</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Shift terminated at Mumbai terminal DC.</p>
                          </div>
                          <span className="font-mono text-[9px] text-slate-455 dark:text-slate-500 shrink-0">{selectedRecord.checkOut || '--'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Salary & Payroll Integration Summary */}
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-gray-150 dark:border-slate-800/80 flex items-center gap-1.5">
                    <DollarSign className="h-4.5 w-4.5 text-emerald-600" /> Integrated Salary Pay Calculation
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Shift Base Payment rate</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">INR 1,200.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Overtime hours logged ({selectedRecord.overtime || 0} hrs)</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">INR {Math.floor((selectedRecord.overtime || 0) * 400).toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Trip dispatch incentives</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">INR {Math.floor((selectedRecord.tripsCompleted || 0) * 500).toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Fuel saving performance bonuses</span>
                      <span className="font-bold text-emerald-605 dark:text-emerald-400">+ INR {Math.floor((selectedRecord.performanceScore || 100) * 5).toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-250 dark:border-slate-800 text-sm font-bold">
                      <span className="text-slate-805 dark:text-slate-200 font-extrabold">Final Shift Cash-Out Pay</span>
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                        INR {Math.floor(1200 + (selectedRecord.overtime || 0) * 400 + (selectedRecord.tripsCompleted || 0) * 500 + (selectedRecord.performanceScore || 100) * 5).toLocaleString()}.00
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Details and Expiries */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[9px] block">Start GPS Coordinates</span>
                    <span className="font-mono font-bold text-slate-700 block mt-0.5">{selectedRecord.checkInGPS || '18.5204, 73.8567'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[9px] block">End GPS Coordinates</span>
                    <span className="font-mono font-bold text-slate-700 block mt-0.5">{selectedRecord.checkOutGPS || '19.0760, 72.8777'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[9px] block">Checking Device model</span>
                    <span className="font-bold text-slate-700 block mt-0.5">{selectedRecord.checkInDeviceInfo || 'Samsung SM-G998B'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[9px] block">Connectivity status</span>
                    <span className="font-bold text-slate-700 block mt-0.5">{selectedRecord.checkInInternetStatus || 'Connected (5G)'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Analytics Section with Recharts */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Operational Duty & Shifts Analytics Desk</h3>
            <p className="text-xs text-slate-400 mt-1">Review historical trends, productivity graphs, and checkout compliance.</p>
          </div>
          <Badge variant="info">June - July 2026</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Attendance Trend Area Chart */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-slate-50/50 space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Weekly Shift Attendance Trend</h4>
            <div className="h-60 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaColorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} stroke="var(--color-border)" />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} stroke="var(--color-border)" />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="Present" stroke="var(--color-success)" fillOpacity={1} fill="url(#areaColorPresent)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Late" stroke="var(--color-warning)" fillOpacity={0} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Weekly Working Hours Line Chart */}
          <div className="border border-gray-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-100">Average Daily Shift Duty Hours</h4>
            <div className="h-60 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workingHoursData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} stroke="var(--color-border)" />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} stroke="var(--color-border)" />
                  <Tooltip formatter={(value) => [`${value} hrs`, 'Duty Hours']} />
                  <Line type="monotone" dataKey="hours" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Donut chart for late check-in reports */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-slate-50/50 space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Check-In Arrival Compliance Distribution</h4>
            <div className="h-60 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lateArrivalData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {lateArrivalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Trip Completion Success rate */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-slate-50/50 space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Delivery Route SLA Targets</h4>
            <div className="h-60 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tripCompletionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {tripCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
