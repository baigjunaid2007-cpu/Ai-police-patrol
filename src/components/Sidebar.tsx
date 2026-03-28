import React from 'react';
import { LayoutDashboard, Map as MapIcon, ShieldAlert, ClipboardList, Settings, LogOut, Shield, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

import { UserRole } from './Login';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, onLogout }) => {
  const sections = [
    {
      title: 'Overview',
      role: ['HIGHER_OFFICIAL'],
      items: [
        { id: 'dashboard', label: 'Command Centre', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
      ]
    },
    {
      title: 'Intelligence',
      role: ['HIGHER_OFFICIAL'],
      items: [
        { id: 'crime-history', label: 'Crime History', icon: ClipboardList },
        { id: 'hotspots', label: 'Hotspots', icon: ShieldAlert },
        { id: 'heatmap', label: 'Crime Heatmap', icon: MapIcon },
        { id: 'criminals', label: 'Criminals', icon: Shield },
      ]
    },
    {
      title: 'Operations',
      role: ['BEAT_OFFICER', 'HIGHER_OFFICIAL'],
      items: [
        { id: 'patrol-routes', label: 'Patrol Routes', icon: ClipboardList, role: ['HIGHER_OFFICIAL'] },
        { id: 'live-tracking', label: 'Live Tracking', icon: MapIcon, role: ['HIGHER_OFFICIAL'] },
        { id: 'ai-map', label: 'AI Patrol Map', icon: MapIcon },
      ]
    }
  ];

  const filteredSections = sections
    .filter(section => !section.role || section.role.includes(userRole))
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.role || item.role.includes(userRole))
    }))
    .filter(section => section.items.length > 0);

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Sentinel Path</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            {userRole === 'BEAT_OFFICER' ? 'Officer Portal' : 'Command Portal'}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-blue-600" : "text-gray-400")} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <div className="px-4 py-2 mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Session</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-medium text-gray-600 truncate">
              {userRole === 'BEAT_OFFICER' ? 'Beat Officer Active' : 'Higher Official Active'}
            </p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="font-medium">Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
