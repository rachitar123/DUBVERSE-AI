import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const activityData = [
  { day: 'Mon', minutes: 12, projects: 2 },
  { day: 'Tue', minutes: 28, projects: 5 },
  { day: 'Wed', minutes: 45, projects: 8 },
  { day: 'Thu', minutes: 32, projects: 4 },
  { day: 'Fri', minutes: 64, projects: 11 },
  { day: 'Sat', minutes: 80, projects: 14 },
  { day: 'Sun', minutes: 95, projects: 16 },
];

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

interface AnalyticsChartsProps {
  languagesBreakdown?: Record<string, number>;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ languagesBreakdown }) => {
  const pieData = languagesBreakdown && Object.keys(languagesBreakdown).length > 0
    ? Object.entries(languagesBreakdown).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Hindi', value: 45 },
        { name: 'Spanish', value: 25 },
        { name: 'French', value: 15 },
        { name: 'German', value: 15 },
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Dubbing Output Chart */}
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Dubbing Output & Usage Trends</h3>
            <p className="text-xs text-slate-400">Total dubbing minutes generated over time</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-xs text-slate-300">Minutes Processed</span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
              />
              <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Language Distribution */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">Target Languages</h3>
          <p className="text-xs text-slate-400">Distribution across dubbing projects</p>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '0.75rem',
                  color: '#fff',
                }}
              />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
