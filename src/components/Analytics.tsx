import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const crimeTypeData = [
  { name: 'Theft', value: 400 },
  { name: 'Assault', value: 300 },
  { name: 'Vandalism', value: 200 },
  { name: 'Narcotics', value: 150 },
];

const officerEfficiencyData = [
  { name: 'Unit A', value: 85 },
  { name: 'Unit B', value: 92 },
  { name: 'Unit C', value: 78 },
  { name: 'Unit D', value: 88 },
];

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981'];

const Analytics: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Advanced Analytics</h2>
          <p className="text-gray-500 mt-1">Detailed metrics on crime trends and operational efficiency.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm">
            Export PDF
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Crime Distribution by Type</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={crimeTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {crimeTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {crimeTypeData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-sm font-medium text-gray-600">{item.name}</span>
                <span className="text-sm font-bold text-gray-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Officer Efficiency Score (%)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={officerEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Predictive Heatmap Analysis</h3>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
            AI Insight
          </span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          Based on historical data and current patrol patterns, the AI predicts a 15% increase in activity in Sector 4 over the next 48 hours. Recommend increasing unit density by 20% between 22:00 and 04:00.
        </p>
        <button className="mt-6 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
          Apply AI Recommendation
        </button>
      </div>
    </div>
  );
};

export default Analytics;
