import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartProps {
  data: any[];
  xKey: string;
  series: {
    key: string;
    name: string;
    color: string;
    type?: 'area' | 'line' | 'bar';
  }[];
  height?: number;
  grid?: boolean;
}

// Custom Premium Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-3.5 rounded-xl shadow-lg backdrop-blur-md">
        <p className="text-xs font-bold text-slate-850 dark:text-slate-200 mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.name}:</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// 1. Interactive Area / Line / Bar Chart
export const OperationsChart: React.FC<ChartProps & { type?: 'area' | 'line' | 'bar' }> = ({
  data,
  xKey,
  series,
  height = 300,
  grid = true,
  type = 'area'
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {series.map((s, idx) => (
                <linearGradient key={idx} id={`colorUv-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>
            {grid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" className="opacity-60" />}
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10, color: 'var(--color-text-secondary)' }} />
            {series.map((s, idx) => (
              <Area
                key={idx}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#colorUv-${s.key})`}
              />
            ))}
          </AreaChart>
        ) : type === 'bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {grid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" className="opacity-60" />}
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10, color: 'var(--color-text-secondary)' }} />
            {series.map((s, idx) => (
              <Bar
                key={idx}
                dataKey={s.key}
                name={s.name}
                fill={s.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            ))}
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {grid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" className="opacity-60" />}
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10, color: 'var(--color-text-secondary)' }} />
            {series.map((s, idx) => (
              <Line
                key={idx}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// 2. Donut / Pie Chart for Inventory or Trips distribution
interface DonutProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
}

export const OperationsDonut: React.FC<DonutProps> = ({ data, height = 240 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={((value: any) => [`${value?.toLocaleString()}`, 'Count']) as any}
            contentStyle={{ 
              borderRadius: 12, 
              border: '1px solid var(--color-border)', 
              backgroundColor: 'var(--color-card)', 
              color: 'var(--color-text-primary)', 
              fontSize: 12 
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, bottom: 0, color: 'var(--color-text-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
