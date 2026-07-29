<<<<<<< HEAD
﻿import React, { useState } from 'react';
=======
import React, { useState, useMemo } from 'react';
import { useOperations } from '../../store/OperationsContext';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
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
<<<<<<< HEAD

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
=======
  const { inventory, vehicles, payroll, trips } = useOperations();

  const totalRevenue = useMemo(() => inventory.reduce((sum, i) => sum + (i.sellingPrice * i.quantity), 0), [inventory]);
  const totalCost = useMemo(() => inventory.reduce((sum, i) => sum + (i.purchasePrice * i.quantity), 0) + payroll.reduce((sum, p) => sum + p.finalSalary, 0), [inventory, payroll]);

  const monthlyRevenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(m => ({
      name: m,
      target: 0,
      revenue: Math.round(totalRevenue / 6),
      cost: Math.round(totalCost / 6)
    }));
  }, [totalRevenue, totalCost]);

  const fuelConsumptionData = useMemo(() => {
    if (vehicles.length === 0) return [];
    return [
      { name: 'Primary Hub', activeVehicles: vehicles.length, fuelUsed: 0, mileageCost: 0 }
    ];
  }, [vehicles]);

  const stockTurnoverData = useMemo(() => {
    if (inventory.length === 0) return [];
    return inventory.map(item => ({
      name: item.itemName,
      turnoverRate: Number((item.quantity / (item.minimumQuantity || 1)).toFixed(1)),
      orderLeadTime: 2
    }));
  }, [inventory]);

  const profitMarginPercent = totalRevenue > 0 ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1) + '%' : '0%';
  const avgCostPerTrip = trips.length > 0 ? `₹${Math.round(totalCost / trips.length)}` : '₹0';
  const stockTurn = `${inventory.length}.0x`;
  const operationalEfficiency = trips.length > 0 ? `${Math.round((trips.filter(t => t.status === 'Completed').length / trips.length) * 100)}%` : '100%';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16 text-left animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-white tracking-tight flex items-center gap-2.5 leading-none">
            <Activity className="h-7 w-7 text-[#006A6A] dark:text-[#14B8A6]" />
            Executive Business Analytics
          </h2>
          <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">
            Track operational costs, fleet telemetry variance, stock turnovers, and profit margins.
          </p>
        </div>
        <div className="flex gap-1.5 bg-[#F8F9FF] dark:bg-[#0F172A] p-1 border border-[#E5EEFF]/80 dark:border-[#334155]/60 rounded-xl self-stretch sm:self-auto">
          {['Week', 'Month', 'Year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#6D7A79] hover:text-[#545F73]'
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
<<<<<<< HEAD
          { title: 'Gross Profit Margin', value: '47.5%', change: '+3.2%', isPositive: true, desc: 'Gross margin vs target', icon: DollarSign, color: '#006A6A', bg: 'bg-[#006A6A]/10' },
          { title: 'Average Cost Per Trip', value: '?4,120', change: '-4.8%', isPositive: true, desc: 'Fuel and maintenance costs', icon: Truck, color: '#14B8A6', bg: 'bg-[#14B8A6]/10' },
          { title: 'Inventory Stock Turn', value: '5.8x', change: '+1.2%', isPositive: true, desc: 'Average cycles this month', icon: Warehouse, color: '#F59E0B', bg: 'bg-[#F59E0B]/10' },
          { title: 'Operational Efficiency', value: '94.2%', change: '+1.5%', isPositive: true, desc: 'SLA delivery timelines met', icon: TrendingUp, color: '#10B981', bg: 'bg-[#10B981]/10' }
=======
          { title: 'Gross Profit Margin', value: profitMarginPercent, change: '', isPositive: true, desc: 'Gross margin vs cost', icon: DollarSign, color: '#006A6A', bg: 'bg-[#006A6A]/10' },
          { title: 'Average Cost Per Trip', value: avgCostPerTrip, change: '', isPositive: true, desc: 'Fuel and maintenance costs', icon: Truck, color: '#14B8A6', bg: 'bg-[#14B8A6]/10' },
          { title: 'Inventory Stock Turn', value: stockTurn, change: '', isPositive: true, desc: 'Active stock items count', icon: Warehouse, color: '#F59E0B', bg: 'bg-[#F59E0B]/10' },
          { title: 'Operational Efficiency', value: operationalEfficiency, change: '', isPositive: true, desc: 'SLA delivery timelines met', icon: TrendingUp, color: '#10B981', bg: 'bg-[#10B981]/10' }
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-[13px] font-semibold text-[#6D7A79] dark:text-[#6D7A79] uppercase tracking-tight block">{kpi.title}</span>
              <h4 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-white leading-tight">{kpi.value}</h4>
              <div className="flex items-center gap-1.5">
<<<<<<< HEAD
                <span className="text-xs font-bold text-emerald-600">{kpi.change}</span>
=======
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
                <span className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] font-semibold">{kpi.desc}</span>
              </div>
            </div>
            <div className={`p-3.5 rounded-xl ${kpi.bg}`} style={{ color: kpi.color }}>
              <kpi.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost vs Revenue Chart */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="text-left">
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white">Corporate Financial Margins</h3>
              <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] mt-0.5 font-medium">Calculated total revenue vs operational costs</p>
            </div>
            <span className="text-[11px] bg-[#F8F9FF] dark:bg-slate-800 text-[#545F73] font-bold px-2.5 py-1 rounded-lg border border-[#E5EEFF]/80 dark:border-[#334155]/60">INR (?) Lakhs</span>
          </div>
          <OperationsChart
            data={monthlyRevenueData}
            xKey="name"
            series={[
              { key: 'revenue', name: 'Total Revenue', color: '#006A6A', type: 'area' },
              { key: 'cost', name: 'Operational Cost', color: '#EF4444', type: 'line' },
              { key: 'target', name: 'Financial Target', color: '#10B981', type: 'line' }
            ]}
          />
        </div>

        {/* Fleet Fuel Consumption Chart */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="text-left">
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white">Fleet Fuel Telemetry</h3>
              <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] mt-0.5 font-medium">Hub-wise mileage, diesel liters, and transit costs</p>
            </div>
            <span className="text-[11px] bg-[#F8F9FF] dark:bg-slate-800 text-[#545F73] font-bold px-2.5 py-1 rounded-lg border border-[#E5EEFF]/80 dark:border-[#334155]/60">Liters (L)</span>
          </div>
          <OperationsChart
            data={fuelConsumptionData}
            xKey="name"
            series={[
              { key: 'fuelUsed', name: 'Fuel Liters Consumed', color: '#14B8A6', type: 'bar' },
              { key: 'mileageCost', name: 'Operational Cost (?)', color: '#F59E0B', type: 'line' }
            ]}
            type="bar"
          />
        </div>

        {/* Stock Turnover and Lead Times */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div className="text-left">
              <h3 className="text-[15px] font-bold text-[#0B1C30] dark:text-white">Warehouse Stock Turnover Rates</h3>
              <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] mt-0.5 font-medium">Average stock rotation cycles and supplier order lead times</p>
            </div>
            <button className="text-xs text-[#006A6A] dark:text-[#14B8A6] font-bold hover:underline flex items-center gap-1.5 cursor-pointer p-1">
              <FileSpreadsheet className="h-4 w-4" /> Export Ledger Data
            </button>
          </div>
          <OperationsChart
            data={stockTurnoverData}
            xKey="name"
            series={[
              { key: 'turnoverRate', name: 'Turnover Rate (Cycles)', color: '#006A6A', type: 'area' },
              { key: 'orderLeadTime', name: 'Order Lead Time (Days)', color: '#F59E0B', type: 'line' }
            ]}
            type="line"
          />
        </div>
      </div>
    </div>
  );
};


