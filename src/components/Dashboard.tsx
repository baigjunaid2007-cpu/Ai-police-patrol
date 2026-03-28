import React from 'react';
import { Shield, ShieldAlert, ClipboardList, Map as MapIcon, ArrowUpRight, ArrowDownRight, TrendingUp, Activity } from 'lucide-react';
import { MOCK_STATS, MOCK_INCIDENTS, MOCK_PATROLS, HOTSPOT_ZONES } from '../constants';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Patrol, Incident } from '../types';

const data = [
  { name: 'Mon', incidents: 12, resolved: 10 },
  { name: 'Tue', incidents: 18, resolved: 14 },
  { name: 'Wed', incidents: 15, resolved: 12 },
  { name: 'Thu', incidents: 21, resolved: 18 },
  { name: 'Fri', incidents: 19, resolved: 16 },
  { name: 'Sat', incidents: 14, resolved: 11 },
  { name: 'Sun', incidents: 10, resolved: 9 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
        trend === 'up' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trendValue}
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
    </div>
  </div>
);

interface DashboardProps {
  patrols?: Patrol[];
  incidents?: Incident[];
}

const Dashboard: React.FC<DashboardProps> = ({ patrols = MOCK_PATROLS, incidents = MOCK_INCIDENTS }) => {
  const stats = {
    totalIncidents: incidents.length,
    activePatrols: patrols.length,
    criticalHotspots: 2,
    activeRoutes: patrols.filter(p => p.status === 'On Patrol').length,
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            Command Center
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              System Online
            </span>
          </h2>
          <p className="text-gray-500 mt-1">Real-time patrol intelligence & crime analytics</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
            Dispatch Unit
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Incidents" 
          value={stats.totalIncidents} 
          icon={ShieldAlert} 
          trend="up" 
          trendValue="+8%" 
          color="bg-red-500"
        />
        <StatCard 
          title="Active Patrols" 
          value={stats.activePatrols} 
          icon={Shield} 
          trend="up" 
          trendValue="+12%" 
          color="bg-blue-600"
        />
        <StatCard 
          title="Critical Hotspots" 
          value={stats.criticalHotspots} 
          icon={Activity} 
          trend="down" 
          trendValue="-2%" 
          color="bg-orange-500"
        />
        <StatCard 
          title="Active Routes" 
          value={stats.activeRoutes} 
          icon={MapIcon} 
          trend="stable" 
          trendValue="0%" 
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Crime Trend
              <span className="text-xs font-normal text-gray-400 ml-2">Weekly Incident Overview</span>
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-xs text-gray-500">Incidents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">Resolved</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#2563eb" fillOpacity={1} fill="url(#colorIncidents)" strokeWidth={3} />
                <Area type="monotone" dataKey="resolved" stroke="#22c55e" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex justify-between items-center">
            Hotspot Zones
            <span className="text-xs font-normal text-gray-400">5 Zones</span>
          </h3>
          <div className="space-y-4">
            {HOTSPOT_ZONES.map((zone) => (
              <div key={zone.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-700">{zone.name}</span>
                  <span className={cn(
                    "font-bold",
                    zone.score > 80 ? "text-red-600" : zone.score > 60 ? "text-orange-600" : "text-green-600"
                  )}>
                    {zone.score}/100
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      zone.score > 80 ? "bg-red-500" : zone.score > 60 ? "bg-orange-500" : "bg-green-500"
                    )}
                    style={{ width: `${zone.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex justify-between items-center">
            Recent Incidents
            <span className="text-xs font-normal text-gray-400">{incidents.length} Total</span>
          </h3>
          <div className="space-y-4">
            {incidents.slice(0, 5).map((incident) => (
              <div key={incident.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  incident.priority === 'Critical' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                )}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{incident.title}</h4>
                  <p className="text-xs text-gray-500 truncate">{incident.description}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    incident.priority === 'Critical' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {incident.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex justify-between items-center">
            Active Units
            <span className="text-xs font-normal text-gray-400">{patrols.length} Active</span>
          </h3>
          <div className="space-y-4">
            {patrols.slice(0, 5).map((patrol) => (
              <div key={patrol.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{patrol.id}</h4>
                  <p className="text-xs text-gray-500 truncate">{patrol.officerName}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    patrol.status === 'Responding' ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                  )}>
                    {patrol.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
