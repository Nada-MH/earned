import React, { useState } from 'react';
import { CompanyProfile, AvatarConfig } from '../types';
import { PixelAvatar } from './ui/PixelAvatar';
import { Briefcase, Building2, Mail, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CompanyAuthProps {
  onComplete: (company: CompanyProfile) => void;
  onBack: () => void;
}

const INDUSTRY_OPTIONS = [
  'Software & SaaS',
  'Artificial Intelligence',
  'Fintech & Banking',
  'Healthcare & Biotech',
  'E-commerce & Retail',
  'Gaming & Entertainment',
  'Cybersecurity',
  'CleanTech & Energy'
];

const PRESET_AVATARS: AvatarConfig[] = [
  { archetype: 'android', color: '#10b981' },
  { archetype: 'human_male', color: '#3b82f6' },
  { archetype: 'human_female', color: '#8b5cf6' },
  { archetype: 'ethereal', color: '#f59e0b' }
];

export const CompanyAuth: React.FC<CompanyAuthProps> = ({ onComplete, onBack }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [companyName, setCompanyName] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarConfig>(PRESET_AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !recruiterName.trim() || !workEmail.trim()) return;

    const newCompany: CompanyProfile = {
      id: `company-${Date.now()}`,
      companyName: companyName.trim(),
      recruiterName: recruiterName.trim(),
      workEmail: workEmail.trim(),
      industry,
      avatar: selectedAvatar,
      joinedAt: Date.now()
    };

    onComplete(newCompany);
  };

  const handleDemoSignIn = () => {
    const demoCompany: CompanyProfile = {
      id: 'company-demo',
      companyName: 'Apex Tech Labs',
      recruiterName: 'Sarah Jenkins',
      workEmail: 'sarah.j@apextech.io',
      industry: 'Software & SaaS',
      avatar: { archetype: 'android', color: '#10b981' },
      joinedAt: Date.now() - 30 * 86400000
    };

    onComplete(demoCompany);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <button 
            onClick={onBack}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            &larr; Back to Home
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">
            <Building2 size={14} /> Recruiter Portal
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            {authMode === 'signup' ? 'Hire Verified Talent' : 'Welcome Back, Recruiter'}
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {authMode === 'signup' 
              ? 'Create your recruiter workspace to send AI interviews and hire top performers.'
              : 'Sign in to access your jobs tracker, candidate pool, and interview scores.'}
          </p>
        </div>

        {/* Quick Demo Sign In Button */}
        <div className="mb-6 relative z-10">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border border-emerald-500/40 hover:border-emerald-400 p-3.5 rounded-2xl flex items-center justify-between text-white font-bold text-sm transition-all group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                <Sparkles size={18} />
              </div>
              <div className="text-left">
                <div className="text-white text-sm font-bold">Quick Demo Recruiter Sign-In</div>
                <div className="text-emerald-300/80 text-[11px]">Instant access as Apex Tech Labs</div>
              </div>
            </div>
            <ArrowRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-4 text-xs font-bold text-slate-500 uppercase tracking-wider">or continue with email</span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'signup' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Register Workspace
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'signin' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {authMode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Recruiter Full Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Industry Sector</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {INDUSTRY_OPTIONS.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Company Badge Avatar</label>
                <div className="flex gap-3 justify-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`p-1.5 rounded-xl transition-all border-2 ${
                        selectedAvatar.archetype === av.archetype && selectedAvatar.color === av.color
                          ? 'border-emerald-400 bg-slate-800 scale-105 shadow-md'
                          : 'border-transparent hover:border-slate-700'
                      }`}
                    >
                      <PixelAvatar config={av} size={48} />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                required
                placeholder="recruiter@company.com"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20 mt-6"
          >
            <ShieldCheck size={18} />
            {authMode === 'signup' ? 'Create Recruiter Account' : 'Sign In to Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
};
