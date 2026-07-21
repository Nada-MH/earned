import React from 'react';
import { Hexagon, ArrowRight } from 'lucide-react';

interface LandingProps {
  onGetStarted: (role: 'talent' | 'company') => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"/>
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"/>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-8">
        
        {/* Logo Block */}
        <div className="mb-8 animate-in zoom-in duration-700">
           <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20 mx-auto rotate-3">
              <Hexagon size={48} className="text-white fill-white/20" />
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Earned</h1>
           <p className="text-slate-400 mt-2 text-lg">Merit over Marketing.</p>
        </div>

        {/* Value Prop */}
        <div className="space-y-6 animate-in slide-in-from-bottom duration-700 delay-200">
           <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-300 leading-relaxed font-medium">
                The first professional network where your opportunities are defined by your <span className="text-emerald-400 font-bold">verified performance</span>, not your resume.
              </p>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 animate-in slide-in-from-bottom duration-700 delay-300 pt-8">
           <button 
             onClick={() => onGetStarted('talent')}
             className="w-full bg-white text-slate-950 font-bold h-14 rounded-xl flex items-center justify-between px-6 hover:bg-slate-200 transition-colors"
           >
             <span>I'm Talent</span>
             <ArrowRight size={20} />
           </button>
           
           <button 
             onClick={() => onGetStarted('company')}
             className="w-full bg-slate-900 border border-slate-800 text-white font-bold h-14 rounded-xl flex items-center justify-between px-6 hover:bg-slate-800 transition-colors"
           >
             <span>I'm Hiring</span>
             <ArrowRight size={20} />
           </button>
        </div>

        <p className="text-xs text-slate-600 pt-8">By continuing, you agree to our Terms of Service.</p>
      </div>
    </div>
  );
};
