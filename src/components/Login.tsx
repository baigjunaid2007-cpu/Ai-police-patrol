import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export type UserRole = 'BEAT_OFFICER' | 'HIGHER_OFFICIAL';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [credentials, setCredentials] = useState({ id: '', password: '' });

  const handlePortalSelect = (role: UserRole) => {
    setSelectedPortal(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    // Simulate login delay
    setTimeout(() => {
      onLogin(selectedPortal!);
      setIsLoggingIn(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Left Side: Branding */}
        <div className="flex flex-col justify-center space-y-6 text-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Sentinel Path</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl font-light leading-tight">
              AI-Powered <span className="font-bold text-blue-400">Patrol Intelligence</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-md">
              Secure access to real-time crime analysis, route optimization, and strategic decision-making tools.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://picsum.photos/seed/officer${i}/40/40`} alt="Officer" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              Trusted by <span className="text-white font-medium">500+</span> law enforcement units
            </p>
          </div>
        </div>

        {/* Right Side: Login Portals */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!selectedPortal ? (
              <motion.div
                key="portal-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Select Your Portal</h3>
                  <p className="text-slate-400">Choose the appropriate gateway to continue</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => handlePortalSelect('BEAT_OFFICER')}
                    className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-left flex items-center gap-5"
                  >
                    <div className="p-4 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">Beat Officer Portal</h4>
                      <p className="text-sm text-slate-400">Field operations, live tracking & navigation</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => handlePortalSelect('HIGHER_OFFICIAL')}
                    className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-left flex items-center gap-5"
                  >
                    <div className="p-4 bg-indigo-500/20 rounded-xl group-hover:scale-110 transition-transform">
                      <Briefcase className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">Higher Official Portal</h4>
                      <p className="text-sm text-slate-400">Strategic analytics, reports & oversight</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
                    Secure 256-bit Encryption Active
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedPortal(null)}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">
                      {selectedPortal === 'BEAT_OFFICER' ? 'Officer Login' : 'Command Login'}
                    </h3>
                    <p className="text-slate-400 text-sm">Enter your credentials to access the portal</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Personnel ID</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={credentials.id}
                          onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                          placeholder="e.g. SP-2024-001"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Access Key</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={credentials.password}
                          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg",
                      selectedPortal === 'BEAT_OFFICER' 
                        ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20" 
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20",
                      isLoggingIn && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isLoggingIn ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Authorize Access
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <button className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    Forgot your access key?
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
