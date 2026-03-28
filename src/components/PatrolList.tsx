import React from 'react';
import { MOCK_PATROLS } from '../constants';
import { Shield, Clock, MapPin, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Patrol } from '../types';

interface PatrolListProps {
  patrols?: Patrol[];
}

const PatrolList: React.FC<PatrolListProps> = ({ patrols = MOCK_PATROLS }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Patrol Routes & Units</h2>
        <p className="text-gray-500 mt-1">Monitor ongoing field operations and officer status.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {patrols.map((patrol) => (
          <div key={patrol.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{patrol.officerName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    Started {new Date(patrol.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                patrol.status === 'Responding' ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
              )}>
                {patrol.status}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Unit ID</p>
                  <p className="text-lg font-bold text-gray-900">{patrol.id}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Zone</p>
                  <p className="text-lg font-bold text-gray-900">{patrol.zone}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Current Location
                </h4>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800 font-bold">
                    {patrol.routePoints[0]?.name || 'Unknown Location'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Last updated: Just now</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex gap-3">
              <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
                View History
              </button>
              <button className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm shadow-blue-100">
                Contact Unit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatrolList;
