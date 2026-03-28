import React, { useRef, useState } from 'react';
import { MOCK_INCIDENTS } from '../constants';
import { ShieldAlert, Clock, MapPin, User, AlertCircle, CheckCircle2, MoreVertical, Paperclip, FileText, Image as ImageIcon, X, Plus, FileSpreadsheet, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { Incident } from '../types';

interface IncidentListProps {
  incidents?: Incident[];
}

const IncidentList: React.FC<IncidentListProps> = ({ incidents: initialIncidents = MOCK_INCIDENTS }) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, incidentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFile = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/plain')
    };

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          files: [...(inc.files || []), newFile]
        };
      }
      return inc;
    }));

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mock parsing: Add a new incident based on the file name
    const newIncident: Incident = {
      id: `I-${Date.now()}`,
      title: `Imported: ${file.name}`,
      description: `Data imported from ${file.name}. Processing records...`,
      location: [14.6819, 77.6006],
      priority: 'Medium',
      type: 'Theft',
      status: 'In-Progress',
      timestamp: new Date().toISOString(),
      locationName: 'Imported Location',
      files: [{ name: file.name, url: URL.createObjectURL(file), type: file.type }]
    };

    setIncidents(prev => [newIncident, ...prev]);
    
    if (importInputRef.current) importInputRef.current.value = '';
    alert(`Successfully imported data from ${file.name}`);
  };

  const removeFile = (incidentId: string, fileName: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          files: inc.files?.filter(f => f.name !== fileName)
        };
      }
      return inc;
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Incident Reports</h2>
          <p className="text-gray-500 mt-1">Track and manage security incidents across the field.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => importInputRef.current?.click()}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Upload className="w-5 h-5 text-blue-600" />
            Import Excel/Data
          </button>
          <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Report Incident
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                incident.priority === 'High' || incident.priority === 'Critical' 
                  ? "bg-red-500 text-white shadow-red-100" 
                  : "bg-yellow-400 text-white shadow-yellow-100"
              )}>
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{incident.title}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        incident.priority === 'High' || incident.priority === 'Critical' 
                          ? "bg-red-100 text-red-700" 
                          : "bg-yellow-100 text-yellow-700"
                      )}>
                        {incident.priority} Priority
                      </span>
                    </div>
                    <p className="text-gray-500 line-clamp-2">{incident.description}</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {incident.locationName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4 text-gray-400" />
                    Dispatch Unit
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                    <CheckCircle2 className="w-4 h-4" />
                    {incident.status}
                  </div>
                </div>

                {/* Evidence & Files Section */}
                <div className="pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <Paperclip className="w-3.5 h-3.5" />
                      Evidence & Files
                    </div>
                    <button 
                      onClick={() => {
                        setActiveIncidentId(incident.id);
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add File
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {incident.files && incident.files.length > 0 ? (
                      incident.files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100 group/file relative">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                          ) : file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv') ? (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">{file.name}</span>
                          <button 
                            onClick={() => removeFile(incident.id, file.name)}
                            className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover/file:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No evidence files attached.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col gap-3 justify-center">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm shadow-blue-100">
                  Resolve
                </button>
                <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => activeIncidentId && handleFileUpload(e, activeIncidentId)}
      />
      <input 
        type="file" 
        ref={importInputRef}
        accept=".xlsx,.xls,.csv,.json"
        className="hidden"
        onChange={handleImportData}
      />
    </div>
  );
};

export default IncidentList;
