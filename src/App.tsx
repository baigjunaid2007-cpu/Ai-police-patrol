/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Map from './components/Map';
import PatrolList from './components/PatrolList';
import IncidentList from './components/IncidentList';
import AIPatrolMap from './components/AIPatrolMap';
import CriminalProfiles from './components/CriminalProfiles';
import Analytics from './components/Analytics';
import MapExplorer from './components/MapExplorer';
import Login, { UserRole } from './components/Login';
import { getMockData } from './constants';
import { HotspotZone } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userLocation, setUserLocation] = useState<[number, number]>([28.6139, 77.2090]);
  const [data, setData] = useState(getMockData([28.6139, 77.2090]));
  const [hotspots, setHotspots] = useState<HotspotZone[]>(data.hotspots || []);
  const [isOptimizingHeatmap, setIsOptimizingHeatmap] = useState(false);
  const [user, setUser] = useState<{ role: UserRole } | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          const newData = getMockData(newLocation);
          setData(newData);
          setHotspots(newData.hotspots || []);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleAddHotspot = (hotspot: HotspotZone) => {
    setHotspots(prev => [hotspot, ...prev]);
  };

  const handleUpdateHotspot = (updatedHotspot: HotspotZone) => {
    setHotspots(prev => prev.map(h => h.id === updatedHotspot.id ? updatedHotspot : h));
  };

  const handleLogin = (role: UserRole) => {
    setUser({ role });
    // Set default tab based on role
    if (role === 'BEAT_OFFICER') {
      setActiveTab('ai-map');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const { patrols, incidents, criminals } = data;

  // Check for navigation mode in URL
  const urlParams = new URLSearchParams(window.location.search);
  const isNavigationOnly = urlParams.get('mode') === 'navigation';
  const patrolId = urlParams.get('patrolId');

  if (isNavigationOnly) {
    const filteredPatrols = patrolId ? patrols.filter(p => p.id === patrolId) : patrols;
    return (
      <div className="h-screen w-screen bg-slate-900">
        <Map patrols={filteredPatrols} incidents={incidents} criminals={criminals} hotspots={hotspots} center={userLocation} />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    // Enforce role-based access for Beat Officers
    if (user?.role === 'BEAT_OFFICER' && activeTab !== 'ai-map') {
      return <AIPatrolMap patrols={patrols} incidents={incidents} criminals={criminals} hotspots={hotspots} onAddHotspot={handleAddHotspot} onUpdateHotspot={handleUpdateHotspot} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard patrols={patrols} incidents={incidents} />;
      case 'crime-history':
        return <IncidentList incidents={incidents} />;
      case 'hotspots':
      case 'heatmap':
      case 'live-tracking':
        return (
          <MapExplorer 
            activeTab={activeTab}
            patrols={patrols}
            incidents={incidents}
            criminals={criminals}
            hotspots={hotspots}
            userLocation={userLocation}
            isOptimizingHeatmap={isOptimizingHeatmap}
            setIsOptimizingHeatmap={setIsOptimizingHeatmap}
            onAddHotspot={handleAddHotspot}
            onUpdateHotspot={handleUpdateHotspot}
          />
        );
      case 'ai-map':
        return <AIPatrolMap patrols={patrols} incidents={incidents} criminals={criminals} hotspots={hotspots} onAddHotspot={handleAddHotspot} onUpdateHotspot={handleUpdateHotspot} />;
      case 'patrol-routes':
        return <PatrolList patrols={patrols} />;
      case 'criminals':
        return <CriminalProfiles criminals={criminals} />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard patrols={patrols} incidents={incidents} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={user.role} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
