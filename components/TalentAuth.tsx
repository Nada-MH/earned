import React, { useState } from 'react';
import { UserProfile, AvatarConfig, ROLE_SUGGESTIONS } from '../types';
import { PixelAvatar } from './ui/PixelAvatar';
import { db } from '../services/dbService';
import { ArrowRight, ChevronLeft, Sparkles, User, Mail, Shield, Zap, RefreshCw } from 'lucide-react';

interface TalentAuthProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

type AuthMode = 'signin' | 'signup';
type SignUpStep = 'details' | 'character';
type AvatarTab = 'presets' | 'draw';

export const TalentAuth: React.FC<TalentAuthProps> = ({ onComplete, onBack }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [step, setStep] = useState<SignUpStep>('details');
  const [avatarTab, setAvatarTab] = useState<AvatarTab>('presets');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('Software Engineer');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({ archetype: 'human_male', color: '#10b981' });

  // Avatar Options
  const archetypes: { id: AvatarConfig['archetype']; label: string }[] = [
    { id: 'human_male', label: 'Male' },
    { id: 'human_female', label: 'Female' },
    { id: 'android', label: 'Android' },
    { id: 'ethereal', label: 'Ethereal' },
  ];

  const colors = [
    { hex: '#10b981', label: 'Emerald' }, // Green
    { hex: '#3b82f6', label: 'Sapphire' }, // Blue
    { hex: '#f59e0b', label: 'Amber' }, // Orange
    { hex: '#ef4444', label: 'Crimson' }, // Red
    { hex: '#8b5cf6', label: 'Violet' }, // Purple
  ];

  let AvatarDrawer: any;
  try {
    AvatarDrawer = require('./ui/AvatarDrawer').AvatarDrawer;
  } catch (e) {
    AvatarDrawer = () => <div className="text-white">AvatarDrawer component will be integrated here</div>;
  }

  const [signInEmail, setSignInEmail] = useState('demo@example.com');
  const [signInPass, setSignInPass] = useState('password');
  const [authError, setAuthError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const existingUser = db.findUserByEmail(signInEmail);
    if (existingUser) {
      onComplete(existingUser);
    } else {
      // Create new account if email not found
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: signInEmail.split('@')[0],
        email: signInEmail,
        password: signInPass,
        role: "Software Engineer",
        completedStages: 0,
        hiringReadiness: 50,
        avatar: { archetype: 'human_male', color: '#10b981' },
        xp: 100,
        streak: 1,
        badges: [],
        skills: [{ name: 'Problem Solving', score: 80 }],
        skillTree: [],
        projects: [],
        history: [],
        followers: 0,
        following: 0,
        joinedAt: Date.now()
      };
      db.saveUser(newUser);
      onComplete(newUser);
    }
  };

  const handleSignUpComplete = () => {
    // Construct new profile and persist in LocalStorage Database
    const newProfile: UserProfile = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        completedStages: 0,
        hiringReadiness: 20,
        avatar: avatarConfig,
        xp: 100,
        streak: 1,
        badges: [],
        skills: [],
        skillTree: [], 
        projects: [],
        history: [],
        followers: 0,
        following: 0,
        joinedAt: Date.now()
    };
    db.saveUser(newProfile);
    onComplete(newProfile);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 relative bg-slate-950">
       <button onClick={onBack} className="absolute top-6 left-6 text-slate-500 hover:text-white flex items-center gap-2">
         <ChevronLeft size={20} /> Back
       </button>

       <div className="w-full max-w-md animate-in slide-in-from-bottom duration-500">
         
         {/* Logo Header */}
         <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">EARNED</h1>
            <div className="flex justify-center gap-4 text-sm font-medium">
               <button 
                 onClick={() => setMode('signin')}
                 className={`pb-2 border-b-2 transition-colors ${mode === 'signin' ? 'text-emerald-400 border-emerald-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
               >
                 Sign In
               </button>
               <button 
                 onClick={() => setMode('signup')}
                 className={`pb-2 border-b-2 transition-colors ${mode === 'signup' ? 'text-emerald-400 border-emerald-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
               >
                 New Account
               </button>
            </div>
         </div>

         {/* SIGN IN FORM */}
         {mode === 'signin' && (
           <form onSubmit={handleSignIn} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-emerald-500" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={signInPass}
                    onChange={e => setSignInPass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-emerald-500" 
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors">
                Enter Dashboard
              </button>
           </form>
         )}

         {/* SIGN UP FLOW */}
         {mode === 'signup' && step === 'details' && (
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white mb-4">Initialize Profile</h2>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-emerald-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. CyberSamurai" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-emerald-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class (Role)</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Mechanical Engineer" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 mb-2" 
                />
                <div className="flex flex-wrap gap-2">
                   {ROLE_SUGGESTIONS.map((r) => (
                      <button 
                        key={r} 
                        type="button"
                        onClick={() => setRole(r)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          role === r ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {r}
                      </button>
                   ))}
                </div>
              </div>
              <button 
                onClick={() => name && role && email && setStep('character')}
                disabled={!name || !role || !email}
                className="w-full bg-white text-slate-950 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Next Step <ArrowRight size={18} />
              </button>
           </div>
         )}

         {/* CHARACTER BUILDER */}
         {mode === 'signup' && step === 'character' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="text-center">
                 <h2 className="text-xl font-bold text-white">Build Your Character</h2>
                 <p className="text-sm text-slate-400">Design your digital identity.</p>
               </div>

               <div className="flex justify-center gap-4 text-sm font-medium border-b border-slate-800 pb-2">
                  <button 
                    onClick={() => setAvatarTab('presets')}
                    className={`pb-2 transition-colors ${avatarTab === 'presets' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Presets
                  </button>
                  <button 
                    onClick={() => setAvatarTab('draw')}
                    className={`pb-2 transition-colors ${avatarTab === 'draw' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Draw Your Own
                  </button>
               </div>

               {avatarTab === 'presets' && (
                 <>
                   {/* Preview */}
                   <div className="flex justify-center py-4">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent blur-xl rounded-full" />
                        <PixelAvatar config={avatarConfig} size={120} className="relative z-10 shadow-2xl border-4 border-slate-800" />
                        <button 
                          className="absolute -bottom-2 -right-2 bg-slate-800 p-2 rounded-full border border-slate-700 text-slate-400 hover:text-white"
                          onClick={() => {
                            const randomColor = colors[Math.floor(Math.random() * colors.length)].hex;
                            const randomArch = archetypes[Math.floor(Math.random() * archetypes.length)].id;
                            setAvatarConfig({ ...avatarConfig, archetype: randomArch, color: randomColor });
                          }}
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                   </div>

                   {/* Controls */}
                   <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Archetype</label>
                        <div className="grid grid-cols-2 gap-2">
                           {archetypes.map(arch => (
                             <button
                               key={arch.id}
                               onClick={() => setAvatarConfig({ ...avatarConfig, archetype: arch.id })}
                               className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                                 avatarConfig.archetype === arch.id 
                                 ? 'bg-slate-800 text-white border-slate-600' 
                                 : 'bg-slate-950 text-slate-500 border-slate-800'
                               }`}
                             >
                               {arch.label}
                             </button>
                           ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Aura Color</label>
                        <div className="flex justify-between gap-2">
                           {colors.map(c => (
                             <button
                               key={c.hex}
                               onClick={() => setAvatarConfig({ ...avatarConfig, color: c.hex })}
                               className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform active:scale-95 ${
                                 avatarConfig.color === c.hex ? 'border-white scale-110' : 'border-transparent'
                               }`}
                               style={{ backgroundColor: c.hex }}
                             >
                                {avatarConfig.color === c.hex && <Sparkles size={16} className="text-white drop-shadow-md" />}
                             </button>
                           ))}
                        </div>
                      </div>
                   </div>
                 </>
               )}

               {avatarTab === 'draw' && (
                  <AvatarDrawer 
                    color={avatarConfig.color} 
                    onSave={(dataUrl: string) => setAvatarConfig(prev => ({...prev, customAvatar: dataUrl}))} 
                    onCancel={() => setAvatarTab('presets')} 
                  />
               )}

               <div className="pt-4 border-t border-slate-800 flex gap-3">
                 <button 
                   onClick={() => setStep('details')}
                   className="px-4 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800"
                 >
                   Back
                 </button>
                 <button 
                    onClick={handleSignUpComplete}
                    className="flex-1 bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                 >
                    <Zap size={18} fill="currentColor" /> Start Career
                 </button>
               </div>
            </div>
         )}

       </div>
    </div>
  );
};
