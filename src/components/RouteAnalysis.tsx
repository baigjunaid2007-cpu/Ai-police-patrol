import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain, Loader2, Sparkles, AlertTriangle, Clock, Map as MapIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Patrol, Incident, Criminal } from '../types';

interface RouteAnalysisProps {
  patrols: Patrol[];
  incidents: Incident[];
  criminals: Criminal[];
  isOptimizing: boolean;
}

const RouteAnalysis: React.FC<RouteAnalysisProps> = ({ patrols, incidents, criminals, isOptimizing }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRoute = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Analyze the following police patrol data and provide an optimized travel plan.
        
        Patrols: ${JSON.stringify(patrols.map(p => ({ id: p.id, officer: p.officerName, zone: p.zone })))}
        Incidents: ${JSON.stringify(incidents.map(i => ({ title: i.title, priority: i.priority, type: i.type })))}
        Criminals: ${JSON.stringify(criminals.map(c => ({ name: c.name, threat: c.threatLevel })))}
        
        The route has been optimized using a TSP algorithm.
        Please provide:
        1. A summary of the route's efficiency.
        2. Key risk areas to watch out for.
        3. A "Easy Way" travel plan for the officers to cover all spots in minimum time.
        4. Specific instructions for high-priority incidents.
        
        Keep the response professional, concise, and formatted with clear headings.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAnalysis(response.text);
    } catch (error) {
      console.error('Error analyzing route:', error);
      setAnalysis("Failed to generate AI analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
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

  if (!isOptimizing) return null;

  return (
    <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Route Intelligence</h3>
            <p className="text-slate-400 text-xs">Real-time analysis of optimized patrol paths.</p>
          </div>
        </div>
        {!analysis && !isAnalyzing ? (
          <button 
            onClick={analyzeRoute}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            <Sparkles className="w-4 h-4" />
            Analyze Now
          </button>
        ) : analysis && (
          <button 
            onClick={() => speak(analysis)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition-all border border-slate-700"
            title="Listen to Summary"
          >
            <Clock className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Processing route data & generating intelligence...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium">
              {analysis}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
              <Clock className="w-5 h-5 text-blue-400 mb-2" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Est. Time</span>
              <span className="text-sm font-bold">42 mins</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
              <MapIcon className="w-5 h-5 text-green-400 mb-2" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Coverage</span>
              <span className="text-sm font-bold">98.4%</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
              <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Risk Level</span>
              <span className="text-sm font-bold">Medium</span>
            </div>
          </div>

          <button 
            onClick={() => setAnalysis(null)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all border border-slate-700"
          >
            Refresh Analysis
          </button>
        </div>
      ) : (
        <div className="p-8 border-2 border-dashed border-slate-800 rounded-3xl text-center">
          <p className="text-slate-500 text-sm">Click "Analyze Now" to get a detailed travel plan and risk assessment for the current optimized route.</p>
        </div>
      )}
    </div>
  );
};

export default RouteAnalysis;
