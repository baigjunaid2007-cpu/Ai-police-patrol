import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { Criminal } from '../types';

interface CriminalProfilesProps {
  criminals: Criminal[];
}

const CriminalProfiles: React.FC<CriminalProfilesProps> = ({ criminals }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Criminal Profiles</h2>
          <p className="text-gray-500 mt-1">Database of high-threat individuals and known offenders.</p>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100">
          Add New Profile
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {criminals.map(criminal => (
          <div key={criminal.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
            <div className="h-48 relative overflow-hidden">
              <img 
                src={criminal.photoUrl} 
                alt={criminal.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg",
                  criminal.threatLevel === 'Critical' ? "bg-red-600 text-white" : 
                  criminal.threatLevel === 'High' ? "bg-orange-500 text-white" : "bg-yellow-500 text-white"
                )}>
                  {criminal.threatLevel} Threat
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{criminal.name}</h3>
                <p className="text-sm text-blue-600 font-medium">Alias: "{criminal.alias}"</p>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Seen</p>
                  <p className="text-xs text-gray-700 font-medium">{criminal.lastSeen}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Known Crimes</p>
                  <div className="flex flex-wrap gap-2">
                    {criminal.crimes.map((crime, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                        {crime}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
                View Full File
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriminalProfiles;
