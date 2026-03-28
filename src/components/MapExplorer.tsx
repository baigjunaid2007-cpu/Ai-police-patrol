import React, { useMemo } from 'react';
import Map from './Map';
import RouteAnalysis from './RouteAnalysis';
import { Patrol, Incident, Criminal, HotspotZone } from '../types';
import { cn } from '../lib/utils';
import { differenceInDays } from 'date-fns';
import { Plus, Map as MapIcon, Activity, Shield } from 'lucide-react';

interface MapExplorerProps {
  activeTab: string;
  patrols: Patrol[];
  incidents: Incident[];
  criminals: Criminal[];
  hotspots: HotspotZone[];
  userLocation: [number, number];
  isOptimizingHeatmap: boolean;
  setIsOptimizingHeatmap: (val: boolean) => void;
  onAddHotspot?: (hotspot: HotspotZone) => void;
  onUpdateHotspot?: (hotspot: HotspotZone) => void;
}

const MapExplorer: React.FC<MapExplorerProps> = ({
  activeTab,
  patrols,
  incidents,
  criminals,
  hotspots,
  userLocation,
  isOptimizingHeatmap,
  setIsOptimizingHeatmap,
  onAddHotspot,
  onUpdateHotspot
}) => {
  // Implement 2-day decay logic
  const activeHotspots = useMemo(() => {
    return hotspots.filter(h => {
      const daysOld = differenceInDays(new Date(), new Date(h.createdAt));
      return daysOld <= 2;
    });
  }, [hotspots]);

  const handleReportHotspot = () => {
    if (onAddHotspot) {
      const newHotspot: HotspotZone = {
        id: `Z-${Date.now()}`,
        name: `New Hotspot ${hotspots.length + 1}`,
        location: userLocation,
        score: 75,
        trend: 'up',
        createdAt: new Date().toISOString(),
        description: 'Officer reported hotspot based on recent suspicious activity.'
      };
      onAddHotspot(newHotspot);
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'hotspots': return 'Crime Hotspots';
      case 'heatmap': return 'Crime Heatmap';
      case 'live-tracking': return 'Live Tracking';
      default: return 'Map View';
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case 'hotspots': return 'Visualizing high-risk areas based on recent data.';
      case 'heatmap': return 'Density analysis of criminal activities.';
      case 'live-tracking': return 'Real-time position of all active units.';
      default: return '';
    }
  };

  return (
    <div className="h-full w-full p-8">
      <div className="h-full w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
        <Map 
          patrols={patrols} 
          incidents={incidents} 
          criminals={criminals} 
          hotspots={activeHotspots}
          center={userLocation} 
          showOptimizedRoute={isOptimizingHeatmap} 
          showHeatmap={activeTab === 'heatmap'}
          onUpdateHotspot={onUpdateHotspot}
        />
        
        <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-xl max-w-xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900">{getTitle()}</h3>
            {activeTab === 'hotspots' && (
              <button 
                onClick={handleReportHotspot}
                className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Report Hotspot"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">{getDescription()}</p>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Active Units</span>
              <span className="font-bold text-blue-600">{patrols.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Open Incidents</span>
              <span className="font-bold text-red-600">{incidents.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Active Hotspots</span>
              <span className="font-bold text-amber-600">{activeHotspots.length}</span>
            </div>
          </div>
          
          {(activeTab === 'hotspots' || activeTab === 'heatmap') && (
            <button 
              onClick={() => setIsOptimizingHeatmap(!isOptimizingHeatmap)}
              className={cn(
                "w-full mt-4 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm border",
                isOptimizingHeatmap ? "bg-red-600 border-red-600 text-white" : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full animate-pulse", isOptimizingHeatmap ? "bg-white" : "bg-red-600")} />
              {isOptimizingHeatmap ? "Hotspots Connected" : "Connect Hotspots"}
            </button>
          )}
        </div>

        <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-4 max-w-sm">
          {isOptimizingHeatmap && (
            <RouteAnalysis 
              patrols={patrols} 
              incidents={incidents} 
              criminals={criminals} 
              isOptimizing={isOptimizingHeatmap} 
            />
          )}
          
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-gray-100 shadow-lg">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Legend
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-gray-600">Patrol Unit</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-red-600" />
                <span className="text-gray-600">Active Incident</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-gray-600">Crime Hotspot</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-slate-900" />
                <span className="text-gray-600">Criminal Last Seen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
