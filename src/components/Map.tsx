import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { Patrol, Incident, Criminal, HotspotZone } from '../types';
import { ShieldAlert, User, MapPin, Navigation, UserX, Crosshair, Volume2, Play, Square, ChevronRight, ChevronLeft, X, ArrowUpRight, Clock, Map as MapIcon, Mic, CheckCircle2, ClipboardList, Search, Compass, MessageSquarePlus, CornerUpLeft, Activity, Info, ExternalLink } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Circle } from 'react-leaflet';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

// Fix for default Leaflet icon markers not showing up
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Fix Leaflet Routing Machine CSS
const routingCss = `
  .leaflet-routing-container {
    display: none !important; /* Hide default panel completely */
  }
  
  /* Detailed Map Theme */
  .leaflet-container {
    background: #f8fafc !important;
  }
  .leaflet-tile-pane {
    filter: none;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0,0,0,0.2);
  }

  @keyframes pulse-blue {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
  }
`;

interface MapProps {
  patrols: Patrol[];
  incidents: Incident[];
  criminals?: Criminal[];
  hotspots?: HotspotZone[];
  center?: [number, number];
  forceNavigation?: boolean;
  selectedPatrolId?: string;
  showOptimizedRoute?: boolean;
  optimizedRoute?: {lat: number, lng: number}[];
  forceStartNavigation?: boolean;
  isSimplified?: boolean;
  showHeatmap?: boolean;
  onUpdateHotspot?: (hotspot: HotspotZone) => void;
}

// Simple Greedy TSP optimization
const optimizeRoute = (points: [number, number][]) => {
  if (points.length <= 2) return points;
  
  const optimized = [points[0]];
  const remaining = [...points.slice(1)];
  
  while (remaining.length > 0) {
    const last = optimized[optimized.length - 1];
    let closestIdx = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const dist = Math.sqrt(
        Math.pow(remaining[i][0] - last[0], 2) + 
        Math.pow(remaining[i][1] - last[1], 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }
    
    optimized.push(remaining[closestIdx]);
    remaining.splice(closestIdx, 1);
  }
  
  return optimized;
};

// Helper to validate LatLng coordinates
const isValidLatLng = (location: any): location is [number, number] => {
  return Array.isArray(location) && 
         location.length === 2 && 
         typeof location[0] === 'number' && 
         typeof location[1] === 'number' &&
         !isNaN(location[0]) && 
         !isNaN(location[1]);
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [map]);
  return null;
};

const LocationMarker = ({ isNavigating }: { isNavigating: boolean }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      if (isNavigating) {
        map.flyTo(e.latlng, map.getZoom(), { animate: true });
      }
    },
  });

  const userIcon = L.divIcon({
    html: renderToStaticMarkup(
      <div className="relative">
        {isNavigating ? (
          <div className="relative w-10 h-12 flex items-center justify-center">
            <div className="absolute bottom-0 w-8 h-4 bg-black/20 rounded-[100%] blur-[2px]" />
            <div className="relative w-6 h-10 bg-red-600 rounded-lg border-2 border-red-800 shadow-xl flex flex-col items-center overflow-hidden transform rotate-[-10deg]">
              <div className="w-full h-3 bg-sky-300/80 border-b border-red-900" />
              <div className="w-full flex-1 flex flex-col justify-between p-0.5">
                <div className="w-full h-0.5 bg-red-800 rounded-full" />
                <div className="w-full h-1 bg-red-900 rounded-t-sm" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping" />
            <div className="relative p-2 bg-blue-600 rounded-full border-2 border-white shadow-lg">
              <User className="w-4 h-4 text-white" />
            </div>
          </>
        )}
      </div>
    ),
    className: 'custom-div-icon',
    iconSize: [40, 48],
    iconAnchor: [20, 40],
  });

  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <div className="p-1 font-bold text-xs">Your Current Location</div>
      </Popup>
    </Marker>
  );
};

const RoutingMachine = ({ points, incidents, criminals, onRoutesFound }: { points: [number, number][], incidents: Incident[], criminals: Criminal[], onRoutesFound?: (routes: any) => void }) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);
  const lastPointsRef = useRef<string>('');

  useEffect(() => {
    if (!map || points.length < 2) return;
    
    // Check if points have actually changed to prevent infinite loops
    const pointsKey = JSON.stringify(points);
    if (pointsKey === lastPointsRef.current && routingControlRef.current) return;
    lastPointsRef.current = pointsKey;

    // Check if L.Routing is available
    if (!(L as any).Routing) {
      console.warn('Leaflet Routing Machine not loaded');
      return;
    }

    // Filter out any invalid points
    const validPoints = points.filter(isValidLatLng);
    if (validPoints.length < 2) return;

    // Cleanup previous control if it exists
    if (routingControlRef.current && map) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (e) {}
    }

    const routingControl = (L as any).Routing.control({
      waypoints: validPoints.map(p => L.latLng(p[0], p[1])),
      lineOptions: {
        styles: [{ color: '#00e5ff', weight: 10, opacity: 1 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      show: false, // Hiding the default panel as requested
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      collapsible: true,
      autoRoute: true,
    });

    routingControlRef.current = routingControl;

    try {
      routingControl.addTo(map);
    } catch (e) {
      console.error('Error adding routing control:', e);
      return;
    }

    // Check for criminal spots near the route
    routingControl.on('routesfound', (e: any) => {
      const routes = e.routes;
      if (!routes || routes.length === 0) return;
      const route = routes[0];
      
      if (onRoutesFound) {
        onRoutesFound(routes);
      }
      
      // Check incidents
      incidents.forEach(incident => {
        if (!isValidLatLng(incident.location)) return;
        const incidentLatLng = L.latLng(incident.location[0], incident.location[1]);
        let isNear = false;
        
        // Simple proximity check along the route coordinates
        for (let i = 0; i < route.coordinates.length; i += 10) {
          if (route.coordinates[i].distanceTo(incidentLatLng) < 200) { // 200 meters
            isNear = true;
            break;
          }
        }

        if (isNear) {
          L.popup()
            .setLatLng(incident.location)
            .setContent(`
              <div class="p-2 min-w-[180px]">
                <h3 class="font-bold text-red-600 flex items-center gap-1 text-xs">
                  ⚠️ INCIDENT ON ROUTE
                </h3>
                <p class="text-[11px] font-bold mt-1">${incident.title}</p>
                <p class="text-[10px] text-gray-500">${incident.description}</p>
                <p class="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-tighter">Priority: ${incident.priority}</p>
              </div>
            `)
            .openOn(map);
        }
      });

      // Check criminals
      criminals.forEach(criminal => {
        if (!isValidLatLng(criminal.location)) return;
        const criminalLatLng = L.latLng(criminal.location[0], criminal.location[1]);
        let isNear = false;
        
        for (let i = 0; i < route.coordinates.length; i += 10) {
          if (route.coordinates[i].distanceTo(criminalLatLng) < 200) { // 200 meters
            isNear = true;
            break;
          }
        }

        if (isNear) {
          L.popup()
            .setLatLng(criminal.location)
            .setContent(`
              <div class="p-2 min-w-[180px]">
                <h3 class="font-bold text-slate-900 flex items-center gap-1 text-xs">
                  👤 KNOWN CRIMINAL ON ROUTE
                </h3>
                <div class="flex gap-2 mt-2">
                  <img src="${criminal.photoUrl}" class="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p class="text-[11px] font-bold">${criminal.name}</p>
                    <p class="text-[9px] text-red-600 font-bold uppercase">${criminal.threatLevel} Threat</p>
                  </div>
                </div>
              </div>
            `)
            .openOn(map);
        }
      });
    });

    return () => {
      if (map && routingControlRef.current) {
        try {
          // Only remove if the map instance is still valid and has the control
          if ((map as any)._container && (map as any).hasLayer && (map as any).hasLayer(routingControlRef.current)) {
            map.removeControl(routingControlRef.current);
          }
          routingControlRef.current = null;
        } catch (e) {
          // Silently fail during cleanup to avoid crashing the app
        }
      }
    };
  }, [map, points, incidents, criminals]);

  return null;
};

const createCustomIcon = (IconComponent: any, color: string, bgColor: string = 'bg-white') => {
  const iconHtml = renderToStaticMarkup(
    <div className={`p-2 rounded-full ${bgColor} border-2 ${color} shadow-lg flex items-center justify-center`}>
      <IconComponent className="w-5 h-5" />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Heatmap Component using many circles for a "cool" effect
const CrimeHeatmap: React.FC<{ incidents: Incident[], hotspots: HotspotZone[] }> = ({ incidents, hotspots }) => {
  const points = useMemo(() => {
    const pts: { loc: [number, number], intensity: number }[] = [];
    incidents.forEach(i => {
      if (isValidLatLng(i.location)) pts.push({ loc: i.location, intensity: 0.6 });
    });
    hotspots.forEach(h => {
      if (isValidLatLng(h.location)) pts.push({ loc: h.location, intensity: h.score / 100 });
    });
    return pts;
  }, [incidents, hotspots]);

  return (
    <>
      {points.map((pt, idx) => (
        <React.Fragment key={idx}>
          <Circle
            center={pt.loc}
            radius={400}
            pathOptions={{
              fillColor: '#ef4444',
              fillOpacity: pt.intensity * 0.15,
              stroke: false,
            }}
          />
          <Circle
            center={pt.loc}
            radius={200}
            pathOptions={{
              fillColor: '#f59e0b',
              fillOpacity: pt.intensity * 0.25,
              stroke: false,
            }}
          />
        </React.Fragment>
      ))}
    </>
  );
};

const Map: React.FC<MapProps> = ({ 
  patrols, 
  incidents, 
  criminals = [], 
  hotspots = [], 
  center = [28.6139, 77.2090], 
  forceNavigation = false, 
  selectedPatrolId, 
  showOptimizedRoute = false, 
  optimizedRoute = [], 
  forceStartNavigation = false, 
  isSimplified = false, 
  showHeatmap = false,
  onUpdateHotspot
}) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [navigationData, setNavigationData] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStepIndexRef = useRef(0);
  const [simulatedPosition, setSimulatedPosition] = useState<[number, number] | null>(null);
  const [carRotation, setCarRotation] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(forceNavigation);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const simulationIntervalRef = useRef<any>(null);
  const currentCoordIndexRef = useRef(0);
  
  const [editingHotspot, setEditingHotspot] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editDesc, setEditDesc] = useState<string>('');
  
  const isStandalone = new URLSearchParams(window.location.search).get('mode') === 'navigation' || forceNavigation;

  useEffect(() => {
    if (forceStartNavigation && navigationData) {
      startNavigation();
    }
  }, [forceStartNavigation, navigationData]);

  const allSpots = useMemo(() => {
    if (!showOptimizedRoute) return [];
    
    // If a pre-calculated optimized route is provided, use it
    if (optimizedRoute && optimizedRoute.length > 0) {
      return optimizedRoute.map(p => [p.lat, p.lng] as [number, number]);
    }
    
    const spots: [number, number][] = [];
    
    // Add user location if available
    if (mapInstance) {
      const center = mapInstance.getCenter();
      spots.push([center.lat, center.lng]);
    } else if (center) {
      spots.push([center[0], center[1]]);
    }

    incidents.forEach(inc => {
      if (isValidLatLng(inc.location)) spots.push(inc.location);
    });
    
    patrols.forEach(pat => {
      if (isValidLatLng(pat.location)) spots.push(pat.location);
    });

    criminals.forEach(crim => {
      if (isValidLatLng(crim.location)) spots.push(crim.location);
    });

    return optimizeRoute(spots);
  }, [showOptimizedRoute, incidents, patrols, criminals, center, mapInstance]);

  const calculateRotation = (p1: [number, number], p2: [number, number]) => {
    const dy = p2[0] - p1[0];
    const dx = p2[1] - p1[1];
    let theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return 90 - theta; // Adjust for car icon orientation
  };

  useEffect(() => {
    if (mapInstance && center) {
      mapInstance.flyTo(center, 13, { animate: true });
    }
  }, [mapInstance, center]);

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isStandalone && navigationData && !isNavigating) {
      setTimeout(() => startNavigation(), 1000);
    }
  }, [isStandalone, navigationData]);

  const handleLocate = () => {
    if (mapInstance) {
      mapInstance.locate();
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startNavigation = () => {
    if (navigationData && navigationData[0]?.instructions?.length > 0) {
      setIsNavigating(true);
      setIsFullScreen(true);
      setCurrentStepIndex(0);
      currentStepIndexRef.current = 0;
      currentCoordIndexRef.current = 0;
      
      const route = navigationData[0];
      const coords = route.coordinates;
      const STEP_DURATION = 2000; // Slower, more realistic patrol speed (2 seconds per point)
      
      if (coords && coords.length > 0) {
        setSimulatedPosition([coords[0].lat, coords[0].lng]);
        
        // Start simulation
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        
        simulationIntervalRef.current = setInterval(() => {
          if (currentCoordIndexRef.current < coords.length - 1) {
            const startCoord = coords[currentCoordIndexRef.current];
            const endCoord = coords[currentCoordIndexRef.current + 1];
            currentCoordIndexRef.current += 1; 
            
            const startTime = Date.now();
            const rotation = calculateRotation([startCoord.lat, startCoord.lng], [endCoord.lat, endCoord.lng]);
            setCarRotation(rotation);

            // Smooth interpolation for the vehicle marker
            const animateMarker = () => {
              const now = Date.now();
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / STEP_DURATION, 1);
              
              const lat = startCoord.lat + (endCoord.lat - startCoord.lat) * progress;
              const lng = startCoord.lng + (endCoord.lng - startCoord.lng) * progress;
              
              setSimulatedPosition([lat, lng]);
              
              if (progress < 1 && isNavigating) {
                requestAnimationFrame(animateMarker);
              }
            };
            requestAnimationFrame(animateMarker);
            
            if (mapInstance) {
              mapInstance.panTo([endCoord.lat, endCoord.lng], { 
                animate: true,
                duration: STEP_DURATION / 1000,
                easeLinearity: 0.25
              });
            }
            
            // Auto-update instructions
            const currentStepIdx = currentStepIndexRef.current;
            const currentInstr = route.instructions[currentStepIdx];
            
            if (currentInstr && currentCoordIndexRef.current >= currentInstr.index && currentStepIdx < route.instructions.length - 1) {
              const nextIdx = currentStepIdx + 1;
              currentStepIndexRef.current = nextIdx;
              setCurrentStepIndex(nextIdx);
              if (route.instructions[nextIdx]?.text) {
                speak(route.instructions[nextIdx].text);
              }
            }
          } else {
            speak("You have reached your destination.");
            stopNavigation();
          }
        }, STEP_DURATION);
      }

      const firstInstruction = navigationData[0].instructions[0]?.text || "Starting navigation";
      speak(firstInstruction);
    }
  };

  const stopNavigation = () => {
    if (isStandalone) {
      window.close();
    }
    setIsNavigating(false);
    setIsFullScreen(false);
    setSimulatedPosition(null);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    window.speechSynthesis.cancel();
  };

  const nextStep = () => {
    if (navigationData && currentStepIndex < navigationData[0].instructions.length - 1) {
      const nextIndex = currentStepIndex + 1;
      currentStepIndexRef.current = nextIndex;
      setCurrentStepIndex(nextIndex);
      const instruction = navigationData[0].instructions[nextIndex]?.text;
      if (instruction) speak(instruction);
    } else {
      speak("You have reached your destination.");
      stopNavigation();
    }
  };

  const prevStep = () => {
    if (navigationData && currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      currentStepIndexRef.current = prevIndex;
      setCurrentStepIndex(prevIndex);
      const instruction = navigationData[0].instructions[prevIndex]?.text;
      if (instruction) speak(instruction);
    }
  };

  const openInNewWindow = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'navigation');
    window.open(url.toString(), '_blank');
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className={cn(
      "w-full h-full relative group font-sans transition-all duration-500",
      isFullScreen ? "fixed inset-0 z-[5000] bg-slate-900" : "relative"
    )}>
      <style>{routingCss}</style>
      
      {/* Map Controls */}
      {!isNavigating && !isSimplified && (
        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
          <button 
            onClick={handleLocate}
            className="p-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 shadow-xl transition-all active:scale-95 group/btn"
            title="My Location"
          >
            <Crosshair className="w-5 h-5 text-blue-600 group-hover/btn:rotate-90 transition-transform duration-500" />
          </button>

          {navigationData && (
            <button 
              onClick={startNavigation}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl border border-blue-500 shadow-xl transition-all active:scale-95 flex items-center justify-center shadow-blue-200"
              title="Start Voice Navigation"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Navigation UI */}
      {isNavigating && navigationData && (
        <div className="absolute inset-0 z-[2000] pointer-events-none flex flex-col p-4">
          {/* Top Instruction Bar */}
          <div className="w-full max-w-lg mx-auto bg-slate-900/90 backdrop-blur-md text-white rounded-3xl shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-top duration-500 border border-white/10">
            <div className="p-6 flex items-center gap-6">
              <div className="flex flex-col items-center justify-center">
                <ArrowUpRight className="w-10 h-10 mb-1 text-blue-400" />
                <span className="text-xl font-bold">300m</span>
              </div>
              <div className="flex-1 border-l border-white/20 pl-6">
                <p className="text-2xl font-bold leading-tight">
                  {navigationData[0].instructions[currentStepIndex]?.text || 'Navigating...'}
                </p>
                <div className="flex items-center gap-2 mt-2 opacity-80">
                  <span className="text-sm font-medium">Then</span>
                  <Navigation className="w-4 h-4 rotate-90 text-blue-400" />
                </div>
              </div>
              <button 
                onClick={() => setShowAllSteps(!showAllSteps)}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                  showAllSteps ? "bg-blue-600 text-white" : "bg-white text-blue-600"
                )}
              >
                <ClipboardList className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* All Steps Panel */}
          {showAllSteps && (
            <div className="absolute top-32 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 flex flex-col max-h-[60vh]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900">All Navigation Steps</h3>
                <button onClick={() => setShowAllSteps(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {navigationData[0].instructions.map((step: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-start gap-4 p-3 rounded-2xl transition-all cursor-pointer",
                      idx === currentStepIndex ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50"
                    )}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      currentStepIndexRef.current = idx;
                      speak(step.text);
                    }}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs",
                      idx === currentStepIndex ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-medium",
                        idx === currentStepIndex ? "text-blue-900" : "text-slate-700"
                      )}>
                        {step.text}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                        {Math.round(step.distance)} meters
                      </p>
                    </div>
                    {idx === currentStepIndex && (
                      <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right Side Buttons */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
            {!isStandalone && (
              <button 
                onClick={openInNewWindow}
                className="w-14 h-14 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-900 shadow-xl border border-slate-200 transition-all"
                title="Open in New Window"
              >
                <MapIcon className="w-6 h-6 text-blue-600" />
              </button>
            )}
            <button className="w-14 h-14 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-900 shadow-xl border border-slate-200 transition-all">
              <Crosshair className="w-6 h-6 text-blue-600" />
            </button>
            <button className="w-14 h-14 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-900 shadow-xl border border-slate-200 transition-all">
              <Volume2 className="w-6 h-6 text-blue-600" />
            </button>
            <button className="w-14 h-14 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-900 shadow-xl border border-slate-200 transition-all">
              <Navigation className="w-6 h-6 text-blue-600" />
            </button>
          </div>

          {/* Bottom Trip Summary */}
          <div className="mt-auto w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl text-slate-900 rounded-[40px] shadow-2xl pointer-events-auto border border-slate-200 animate-in slide-in-from-bottom duration-500">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-blue-600">
                      {navigationData[0]?.summary?.totalTime ? Math.round(navigationData[0].summary.totalTime / 60) : '--'}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">min</span>
                  </div>
                  <p className="text-lg font-medium text-slate-500 mt-1">
                    {navigationData[0]?.summary?.totalDistance ? (navigationData[0].summary.totalDistance / 1000).toFixed(1) : '0.0'} km • 7:44 PM
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={nextStep} className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <ChevronRight className="w-8 h-8 text-slate-900" />
                  </button>
                  <button onClick={stopNavigation} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all shadow-lg shadow-red-100">
                    <X className="w-8 h-8 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="h-1 w-12 bg-slate-200 mx-auto rounded-full" />
            </div>
          </div>
        </div>
      )}

      <MapContainer 
        center={center} 
        zoom={13} 
        className="w-full h-full min-h-[400px]"
        ref={setMapInstance}
      >
        <MapResizer />
        <LocationMarker isNavigating={isNavigating} />
        
        {simulatedPosition && (
          <Marker 
            position={simulatedPosition} 
            icon={L.divIcon({
              html: renderToStaticMarkup(
                <div className="relative w-10 h-12 flex items-center justify-center">
                  <div className="absolute bottom-0 w-8 h-4 bg-black/20 rounded-[100%] blur-[2px]" />
                  <div 
                    className="relative w-8 h-12 bg-red-600 rounded-lg border-2 border-red-800 shadow-xl flex flex-col items-center overflow-hidden transform transition-all duration-100"
                    style={{ transform: `rotate(${carRotation}deg)` }}
                  >
                    <div className="w-full h-3 bg-sky-300/80 border-b border-red-900" />
                    <div className="w-full flex-1 flex flex-col justify-between p-0.5">
                      <div className="w-full h-0.5 bg-red-800 rounded-full" />
                      <div className="w-full h-1 bg-red-900 rounded-t-sm" />
                    </div>
                  </div>
                </div>
              ),
              className: 'custom-div-icon',
              iconSize: [40, 48],
              iconAnchor: [20, 40],
            })}
          />
        )}

        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps/copyright">Google Maps</a>'
          url={process.env.NAVIGATION_API_KEY 
            ? `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${process.env.NAVIGATION_API_KEY}`
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />

        {showHeatmap && <CrimeHeatmap incidents={incidents} hotspots={hotspots} />}

        {hotspots.map((hotspot) => (
          <React.Fragment key={hotspot.id}>
            <Circle
              center={hotspot.location}
              radius={200}
              pathOptions={{
                fillColor: '#f59e0b',
                fillOpacity: 0.2,
                color: '#f59e0b',
                weight: 1,
              }}
            />
            <Marker 
              position={hotspot.location} 
              icon={createCustomIcon(Activity, 'border-amber-500 text-amber-500', 'bg-amber-50')}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  {editingHotspot === hotspot.id ? (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">Update Hotspot</h4>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Risk Score (0-100)</label>
                        <input 
                          type="number" 
                          value={editScore} 
                          onChange={(e) => setEditScore(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                        <textarea 
                          value={editDesc} 
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs h-20"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (onUpdateHotspot) {
                              onUpdateHotspot({
                                ...hotspot,
                                score: editScore,
                                description: editDesc
                              });
                            }
                            setEditingHotspot(null);
                          }}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingHotspot(null)}
                          className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{hotspot.name}</h3>
                        <span className={cn(
                          "px-1.5 py-0.5 text-[8px] rounded-full font-bold uppercase tracking-wider",
                          hotspot.trend === 'up' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                          {hotspot.trend}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 leading-relaxed">{hotspot.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold border-t border-slate-100 pt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(hotspot.createdAt), 'MMM d')}
                        </div>
                        <div className="flex items-center gap-1 text-amber-600">
                          <Info className="w-3 h-3" />
                          Score: {hotspot.score}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingHotspot(hotspot.id);
                          setEditScore(hotspot.score);
                          setEditDesc(hotspot.description);
                        }}
                        className="w-full mt-3 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-2"
                      >
                        <MessageSquarePlus className="w-3 h-3" />
                        Update Status
                      </button>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {showOptimizedRoute && allSpots.length >= 2 && (
          <RoutingMachine 
            points={allSpots} 
            incidents={incidents}
            criminals={criminals}
            onRoutesFound={setNavigationData}
          />
        )}

        {patrols.map((patrol) => {
          const patrolPoints = isValidLatLng(patrol.location) && patrol.routePoints 
            ? [patrol.location, ...patrol.routePoints.map(rp => rp.location)].filter(isValidLatLng)
            : [];

          return (
            <React.Fragment key={patrol.id}>
              {isValidLatLng(patrol.location) && (
                <Marker 
                  position={patrol.location} 
                  icon={createCustomIcon(User, 'border-blue-600 text-blue-600')}
                >
                  <Tooltip permanent direction="top" offset={[0, -20]} className="bg-white/90 border-blue-600 text-blue-600 font-bold text-[10px] rounded-lg shadow-sm">
                    {patrol.officerName}
                  </Tooltip>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-gray-900">{patrol.officerName}</h3>
                      <p className="text-xs text-gray-500">{patrol.id} • {patrol.zone}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider",
                          patrol.status === 'Responding' ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                        )}>
                          {patrol.status}
                        </span>
                        <button 
                          onClick={() => openInGoogleMaps(patrol.location[0], patrol.location[1])}
                          className="ml-auto p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Navigate to Officer"
                        >
                          <Navigation className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <a 
                          href={`${window.location.origin}?mode=navigation&patrolId=${patrol.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                        >
                          <ExternalLink className="w-3 h-3" />
                          LIVE TRACKING LINK
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Directions for the active patrol */}
              {((selectedPatrolId && patrol.id === selectedPatrolId) || (!selectedPatrolId && patrol.status === 'On Patrol')) && patrolPoints.length >= 2 && (
                <>
                  <RoutingMachine 
                    points={patrolPoints as [number, number][]} 
                    incidents={incidents}
                    criminals={criminals}
                    onRoutesFound={setNavigationData}
                  />
                  {/* Start and End Markers */}
                  <Marker 
                    position={patrolPoints[0] as [number, number]} 
                    icon={createCustomIcon(MapPin, 'border-green-600 text-green-600', 'bg-green-50')}
                  >
                    <Popup>Start of Route</Popup>
                  </Marker>
                  <Marker 
                    position={patrolPoints[patrolPoints.length - 1] as [number, number]} 
                    icon={createCustomIcon(CheckCircle2, 'border-blue-600 text-blue-600', 'bg-blue-50')}
                  >
                    <Popup>Destination</Popup>
                  </Marker>
                </>
              )}
            </React.Fragment>
          );
        })}

        {incidents.map((incident) => isValidLatLng(incident.location) && (
          <Marker 
            key={incident.id} 
            position={incident.location} 
            icon={createCustomIcon(ShieldAlert, 'border-red-500 text-red-500', 'bg-red-50')}
          >
            <Tooltip permanent direction="top" offset={[0, -20]} className="bg-white/90 border-red-500 text-red-500 font-bold text-[10px] rounded-lg shadow-sm">
              {incident.title}
            </Tooltip>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-red-600">{incident.title}</h3>
                <p className="text-xs text-gray-700 mt-1">{incident.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider",
                    incident.priority === 'Critical' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {incident.type}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button 
                    onClick={() => openInGoogleMaps(incident.location[0], incident.location[1])}
                    className="ml-auto p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Navigate to Incident"
                  >
                    <Navigation className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {criminals.map((criminal) => isValidLatLng(criminal.location) && (
          <Marker 
            key={criminal.id} 
            position={criminal.location} 
            icon={createCustomIcon(UserX, 'border-slate-900 text-slate-900', 'bg-slate-100')}
          >
            <Tooltip permanent direction="top" offset={[0, -20]} className="bg-white/90 border-slate-900 text-slate-900 font-bold text-[10px] rounded-lg shadow-sm">
              {criminal.name}
            </Tooltip>
            <Popup>
              <div className="w-48 overflow-hidden rounded-lg">
                <img 
                  src={criminal.photoUrl} 
                  alt={criminal.name} 
                  className="w-full h-24 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-sm">{criminal.name}</h3>
                  <p className="text-[10px] text-red-600 font-bold uppercase mb-1">{criminal.threatLevel} Threat</p>
                  <p className="text-[10px] text-gray-500 italic">Alias: {criminal.alias}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {criminal.crimes.slice(0, 2).map((crime, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[8px] font-bold">
                        {crime}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
