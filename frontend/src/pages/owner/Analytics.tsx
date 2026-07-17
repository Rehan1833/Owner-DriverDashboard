import React, { useState } from 'react';
import { OperationsChart } from '../../components/charts/Charts';
import {
  TrendingUp,
  DollarSign,
  Truck,
  Activity,
  Warehouse,
  FileSpreadsheet
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Month');

  // Datasets
  const monthlyRevenueData = [
    { name: 'Jan', target: 80000, revenue: 78000, cost: 42000 },
    { name: 'Feb', target: 85000, revenue: 89000, cost: 45000 },
    { name: 'Mar', target: 90000, revenue: 94000, cost: 47000 },
    { name: 'Apr', target: 100000, revenue: 98000, cost: 52000 },
    { name: 'May', target: 110000, revenue: 122000, cost: 58000 },
    { name: 'Jun', target: 120000, revenue: 128000, cost: 60000 }
  ];

  const fuelConsumptionData = [
    { name: 'Pune Hub', activeVehicles: 15, fuelUsed: 450, mileageCost: 45000 },
    { name: 'Mumbai Hub', activeVehicles: 12, fuelUsed: 380, mileageCost: 38000 },
    { name: 'Bangalore Hub', activeVehicles: 8, fuelUsed: 220, mileageCost: 22000 }
  ];

  const stockTurnoverData = [
    { name: 'Raw Metal', turnoverRate: 4.5, orderLeadTime: 3 },
    { name: 'Finished Boxes', turnoverRate: 8.2, orderLeadTime: 1.5 },
    { name: 'Fasteners', turnoverRate: 2.1, orderLeadTime: 5 },
    { name: 'Drums / Caps', turnoverRate: 5.4, orderLeadTime: 2.5 }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16 text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary dark:text-blue-500" />
            Executive Business Analytics
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">
            Track operational costs, fleet telemetry variance, stock turnovers, and profit margins.
          </p>
        </div>
        <div className="flex gap-2">
          {['Week', 'Month', 'Year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-primary text-white dark:bg-blue-600'
                  : 'bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Mini KPI Analytics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Gross Profit Margin', value: '47.5%', change: '+3.2%', isPositive: true, desc: 'Gross margin vs target', icon: DollarSign, color: 'var(--color-revenue)' },
          { title: 'Average Cost Per Trip', value: '₹4,120', change: '-4.8%', isPositive: true, desc: 'Fuel and maintenance costs', icon: Truck, color: 'var(--color-fleet)' },
          { title: 'Inventory Stock Turn', value: '5.8x', change: '+1.2%', isPositive: true, desc: 'Average cycles this month', icon: Warehouse, color: 'var(--color-warning)' },
          { title: 'Operational Efficiency', value: '94.2%', change: '+1.5%', isPositive: true, desc: 'SLA delivery timelines met', icon: TrendingUp, color: 'var(--color-success)' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">{kpi.title}</span>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white">{kpi.value}</h4>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-emerald-600">{kpi.change}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">{kpi.desc}</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400" style={{ color: kpi.color }}>
              <kpi.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost vs Revenue Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">Corporate Financial Margins</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Calculated total revenue vs operational costs</p>
            </div>
            <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 font-extrabold px-2.5 py-1 rounded-lg border border-slate-200/50">INR (₹) Lakhs</span>
          </div>
          <OperationsChart
            data={monthlyRevenueData}
            xKey="name"
            series={[
              { key: 'revenue', name: 'Total Revenue', color: 'var(--color-primary)', type: 'area' },
              { key: 'cost', name: 'Operational Cost', color: 'var(--color-danger)', type: 'line' },
              { key: 'target', name: 'Financial Target', color: 'var(--color-success)', type: 'line' }
            ]}
          />
        </div>

        {/* Fleet Fuel Consumption Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">Fleet Fuel Telemetry</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Hub-wise mileage, diesel liters, and transit costs</p>
            </div>
            <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 font-extrabold px-2.5 py-1 rounded-lg border border-slate-200/50">Liters (L)</span>
          </div>
          <OperationsChart
            data={fuelConsumptionData}
            xKey="name"
            series={[
              { key: 'fuelUsed', name: 'Fuel Liters Consumed', color: 'var(--color-fleet)', type: 'bar' },
              { key: 'mileageCost', name: 'Operational Cost (₹)', color: 'var(--color-warning)', type: 'line' }
            ]}
            type="bar"
          />
        </div>

        {/* Stock Turnover and Lead Times */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">Warehouse Stock Turnover Rates</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Average stock rotation cycles and supplier order lead times</p>
            </div>
            <button className="text-xs text-primary dark:text-blue-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4" /> Export Ledger Data
            </button>
          </div>
          <OperationsChart
            data={stockTurnoverData}
            xKey="name"
            series={[
              { key: 'turnoverRate', name: 'Turnover Rate (Cycles)', color: 'var(--color-primary-container)', type: 'area' },
              { key: 'orderLeadTime', name: 'Order Lead Time (Days)', color: 'var(--color-warning)', type: 'line' }
            ]}
            type="line"
          />
        </div>
      </div>
    </div>
  );
};
