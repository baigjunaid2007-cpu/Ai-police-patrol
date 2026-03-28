import React, { useState, useEffect, useMemo } from 'react';
import Map from './Map';
import RouteAnalysis from './RouteAnalysis';
import { Patrol, Incident, Criminal, HotspotZone } from '../types';
import { Brain, Navigation, Activity, UserCircle, MapPin, Camera, CheckCircle2, Upload, Play, Shield, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { differenceInDays } from 'date-fns';

interface AIPatrolMapProps {
  patrols: Patrol[];
  incidents: Incident[];
  criminals: Criminal[];
  hotspots: HotspotZone[];
  onAddHotspot?: (hotspot: HotspotZone) => void;
  onUpdateHotspot?: (hotspot: HotspotZone) => void;
}

const AIPatrolMap: React.FC<AIPatrolMapProps> = ({ patrols, incidents, criminals, hotspots, onAddHotspot, onUpdateHotspot }) => {
  const [selectedPatrol, setSelectedPatrol] = useState<Patrol | null>(patrols.length > 0 ? patrols[0] : null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<any[]>([]);
  const [isSimplified, setIsSimplified] = useState(false);
  const [forceStartNav, setForceStartNav] = useState(false);

  // Implement 2-day decay logic
  const activeHotspots = useMemo(() => {
    return hotspots.filter(h => {
      const daysOld = differenceInDays(new Date(), new Date(h.createdAt));
      return daysOld <= 2;
    });
  }, [hotspots]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition((pos) => {
        setCurrentCoords([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  // 🚀 Optimize route (Greedy TSP) including hotspots
  const calculateOptimizedRoute = (points: {lat: number, lng: number, type: string, id: string}[], start: {lat: number, lng: number}) => {
    const remaining = [...points];
    const route = [];
    let current = start;

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let minDist = Infinity;

      remaining.forEach((p, i) => {
        const dist = Math.sqrt(
          Math.pow(current.lat - p.lat, 2) +
          Math.pow(current.lng - p.lng, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearestIndex = i;
        }
      });

      const next = remaining.splice(nearestIndex, 1)[0];
      route.push(next);
      current = next;
    }

    return route;
  };

  // 🔄 Run optimization
  useEffect(() => {
    if (isOptimizing && currentCoords) {
      // Points to visit: Hotspots -> Incidents -> Criminals
      const points: any[] = [];
      
      activeHotspots.forEach(h => points.push({ lat: h.location[0], lng: h.location[1], type: 'hotspot', id: h.id }));
      incidents.forEach(i => points.push({ lat: i.location[0], lng: i.location[1], type: 'incident', id: i.id }));
      criminals.forEach(c => points.push({ lat: c.location[0], lng: c.location[1], type: 'criminal', id: c.id }));

      const route = calculateOptimizedRoute(points, {
        lat: currentCoords[0],
        lng: currentCoords[1]
      });

      setOptimizedRoute(route);
    } else if (!isOptimizing) {
      setOptimizedRoute([]);
    }
  }, [isOptimizing, currentCoords, activeHotspots, incidents, criminals]);

  const handleReportHotspot = () => {
    if (onAddHotspot && currentCoords) {
      const newHotspot: HotspotZone = {
        id: `Z-${Date.now()}`,
        name: `Field Hotspot ${hotspots.length + 1}`,
        location: currentCoords,
        score: 85,
        trend: 'up',
        createdAt: new Date().toISOString(),
        description: 'Officer reported high activity hotspot during patrol.'
      };
      onAddHotspot(newHotspot);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-8 bg-slate-50">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Patrol Map & Intelligence</h1>
            <p className="text-slate-500 text-sm font-medium">Smart routing based on real-time hotspots & incidents.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReportHotspot}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold transition-all flex items-center gap-2 hover:bg-red-100"
          >
            <Plus className="w-4 h-4" />
            Report Hotspot
          </button>
          <button 
            onClick={() => setIsSimplified(!isSimplified)}
            className={cn(
              "px-4 py-2 border rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm",
              isSimplified ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
            )}
          >
            <MapPin className={cn("w-4 h-4", isSimplified ? "text-white" : "text-slate-900")} />
            {isSimplified ? "Dashboard View" : "Simplified Patrol"}
          </button>
          <button 
            onClick={() => setIsOptimizing(!isOptimizing)}
            className={cn(
              "px-4 py-2 border rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm",
              isOptimizing ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
            )}
          >
            <Navigation className={cn("w-4 h-4", isOptimizing ? "text-white" : "text-blue-600")} />
            {isOptimizing ? "Routes Optimized" : "Optimize Routes"}
          </button>
          {isOptimizing && (
            <button 
              onClick={() => {
                setForceStartNav(true);
                setTimeout(() => setForceStartNav(false), 100);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-100 animate-pulse"
            >
              <Play className="w-4 h-4" />
              Start Navigation
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
        <div className={cn(
          "bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl relative transition-all duration-500",
          isSimplified ? "lg:col-span-4" : "lg:col-span-3"
        )}>
          <Map 
            patrols={patrols} 
            incidents={incidents} 
            criminals={criminals} 
            hotspots={activeHotspots}
            showOptimizedRoute={isOptimizing}
            optimizedRoute={optimizedRoute}
            forceStartNavigation={forceStartNav}
            isSimplified={isSimplified}
            onUpdateHotspot={onUpdateHotspot}
          />
          {!isSimplified && (
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-2xl z-[1000] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Optimization Engine</p>
                  <p className="text-sm font-bold text-slate-700">Route optimized for {activeHotspots.length} active hotspots.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-lg">
                <Activity className="w-4 h-4" />
                98% Coverage
              </div>
            </div>
          )}
        </div>

        {!isSimplified && (
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            <RouteAnalysis 
              patrols={patrols} 
              incidents={incidents} 
              criminals={criminals} 
              isOptimizing={isOptimizing} 
            />
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-blue-600" />
                Officer Check-in
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Active Officer</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    onChange={(e) => setSelectedPatrol(patrols.find(p => p.id === e.target.value) || null)}
                    value={selectedPatrol?.id}
                  >
                    {patrols.map(p => (
                      <option key={p.id} value={p.id}>{p.officerName} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Current Zone</span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                      {selectedPatrol?.zone}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {selectedPatrol?.routePoints[0]?.name || 'Unknown'}
                  </p>
                </div>

                {selectedPatrol?.status === 'On Patrol' && (
                  <button 
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('mode', 'navigation');
                      if (selectedPatrol) url.searchParams.set('patrolId', selectedPatrol.id);
                      window.open(url.toString(), '_blank');
                    }}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-100 animate-pulse"
                  >
                    <Navigation className="w-4 h-4" />
                    Start Patrol Navigation
                  </button>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upload Patrol Evidence</label>
                  <div className="grid grid-cols-3 gap-3">
                    {uploadedPhotos.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm group relative">
                        <img src={photo} alt="Patrol evidence" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group">
                      <Camera className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-[10px] font-bold text-slate-400 mt-2 group-hover:text-blue-600">Add Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                </div>

                <button 
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg",
                    uploadedPhotos.length > 0 
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100" 
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                  disabled={uploadedPhotos.length === 0}
                >
                  <Upload className="w-4 h-4" />
                  Submit Attendance
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Assigned Route Points</h3>
              <div className="space-y-6">
                {selectedPatrol?.routePoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    {i < selectedPatrol.routePoints.length - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-[-24px] w-0.5 bg-slate-100" />
                    )}
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 mt-1 z-10 flex-shrink-0",
                      i === 0 ? "bg-blue-600 border-blue-600" : "bg-white border-slate-200"
                    )} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{point.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Scheduled Checkpoint</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPatrolMap;
