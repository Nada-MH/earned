import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserBadge } from '../types';
import { PixelAvatar } from './ui/PixelAvatar';
import { BadgeDisplay } from './ui/BadgeDisplay';
import { 
  ArrowRight, Brain, Lightbulb, Users, Gavel, Thermometer, 
  Scale, Clock, X, Check, Activity, Radar, Award
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar } from 'recharts';

interface SoftSkillsAssessmentProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
  onClose: () => void;
}

interface Choice {
  id: string;
  text: string;
  impact: {
    teamwork?: number;
    criticalThinking?: number;
    creativity?: number;
    pressure?: number;
    decisionMaking?: number;
  };
}

interface Scene {
  id: number;
  title: string;
  description: string;
  speaker: { name: string; avatar: { archetype: 'human_male' | 'human_female' | 'android' | 'ethereal'; color: string } };
  choices: Choice[];
  pressureTimeSeconds?: number;
}

const STORY_SCENES: Scene[] = [
  {
    id: 1,
    title: "The Scope Creep",
    description: "It's Day 1 of 'Project Orbit', a flagship feature launch. We have 48 hours. The CEO just asked to include an experimental AI module that wasn't in the spec.",
    speaker: { name: "CEO Jordan", avatar: { archetype: "human_male", color: "#3b82f6" } },
    choices: [
      { id: "1a", text: "Push back politely. We need to focus on stability first.", impact: { criticalThinking: 2, decisionMaking: 2, pressure: 1 } },
      { id: "1b", text: "Let's brainstorm a 'lite' version we can safely squeeze in.", impact: { creativity: 3, teamwork: 1 } },
      { id: "1c", text: "Accept the challenge! We'll work overtime if needed.", impact: { teamwork: -1, pressure: -2, decisionMaking: -1 } },
    ]
  },
  {
    id: 2,
    title: "The Tech Conflict",
    description: "Alex (Lead Dev) and Sam (Designer) are arguing. Sam wants a complex animation. Alex says it will kill mobile performance.",
    speaker: { name: "Alex (Dev)", avatar: { archetype: "android", color: "#6366f1" } },
    choices: [
      { id: "2a", text: "Side with Alex. Performance data trumps aesthetics.", impact: { criticalThinking: 2, decisionMaking: 1 } },
      { id: "2b", text: "Ask them to pair-program a compromise for 30 minutes.", impact: { teamwork: 3, decisionMaking: 1 } },
      { id: "2c", text: "Let them figure it out, I have other fires to fight.", impact: { teamwork: -2, decisionMaking: 1 } },
    ]
  },
  {
    id: 3,
    title: "The Server Crisis",
    description: "WARNING: Staging server just crashed. Launch is in 12 hours. The team is panicking.",
    speaker: { name: "System", avatar: { archetype: "android", color: "#ef4444" } },
    pressureTimeSeconds: 15,
    choices: [
      { id: "3a", text: "Everybody stop! Let's trace the logs systematically.", impact: { criticalThinking: 2, pressure: 2 } },
      { id: "3b", text: "I'll hotfix it myself! Stand back!", impact: { teamwork: -1, pressure: 2 } },
      { id: "3c", text: "Spin up a backup instance immediately, debug later.", impact: { decisionMaking: 3, pressure: 1 } },
    ]
  },
  {
    id: 4,
    title: "The Competitor Move",
    description: "A competitor just announced a similar feature. It looks slicker than ours. Morale just tanked.",
    speaker: { name: "Sam (Design)", avatar: { archetype: "human_female", color: "#ec4899" } },
    choices: [
      { id: "4a", text: "Ignore them. Our backend is more robust.", impact: { criticalThinking: 1, decisionMaking: 2 } },
      { id: "4b", text: "Quick pivot! Let's re-skin our UI to look distinct.", impact: { creativity: 3, pressure: 1 } },
      { id: "4c", text: "Gather the team. Remind them why our mission matters.", impact: { teamwork: 3, criticalThinking: 1 } },
    ]
  },
  {
    id: 5,
    title: "The Late Night Glitch",
    description: "2:00 AM. You found a critical bug. Fixing it properly takes 4 hours. Hacking it takes 30 mins but creates technical debt.",
    speaker: { name: "Inner Monologue", avatar: { archetype: "ethereal", color: "#10b981" } },
    pressureTimeSeconds: 10,
    choices: [
      { id: "5a", text: "Do it properly. We can delay the internal demo.", impact: { criticalThinking: 2, decisionMaking: 1 } },
      { id: "5b", text: "Hack it. We need to ship, we'll refactor next week.", impact: { decisionMaking: 2, pressure: 2 } },
      { id: "5c", text: "Hide the feature behind a toggle for the demo.", impact: { creativity: 2, criticalThinking: 1 } },
    ]
  },
  {
    id: 6,
    title: "The Presentation",
    description: "You're on stage. The live WiFi goes down. The demo won't load.",
    speaker: { name: "Crowd", avatar: { archetype: "human_male", color: "#64748b" } },
    pressureTimeSeconds: 8,
    choices: [
      { id: "6a", text: "Switch to the local video backup immediately.", impact: { criticalThinking: 2, pressure: 2 } },
      { id: "6b", text: "Make a joke about 'Cloud weather' and use your hotspot.", impact: { creativity: 3, pressure: 2 } },
      { id: "6c", text: "Apologize and wait for the connection to return.", impact: { pressure: -1, decisionMaking: -1 } },
    ]
  },
  {
    id: 7,
    title: "The Debrief",
    description: "Launch successful! The CEO is praising you specifically. The team looks exhausted.",
    speaker: { name: "CEO Jordan", avatar: { archetype: "human_male", color: "#3b82f6" } },
    choices: [
      { id: "7a", text: "Accept the praise. I did carry the project.", impact: { teamwork: -2, decisionMaking: 1 } },
      { id: "7b", text: "Interrupt. 'This was 100% a team effort, Alex and Sam killed it.'", impact: { teamwork: 4 } },
      { id: "7c", text: "Pivot to next steps. 'Thanks, here is what we improve next.'", impact: { criticalThinking: 2, decisionMaking: 1 } },
    ]
  },
  {
    id: 8,
    title: "The Future",
    description: "With the product live, what is your primary focus for the next quarter?",
    speaker: { name: "Inner Monologue", avatar: { archetype: "ethereal", color: "#8b5cf6" } },
    choices: [
      { id: "8a", text: "Analyze usage data to optimize conversion.", impact: { criticalThinking: 3 } },
      { id: "8b", text: "Brainstorm the next 'wow' feature.", impact: { creativity: 3 } },
      { id: "8c", text: "Refine our agile process so we burn out less.", impact: { teamwork: 2, decisionMaking: 1 } },
    ]
  }
];

interface SoftSkillsScores {
  teamwork: number;
  criticalThinking: number;
  creativity: number;
  pressure: number;
  decisionMaking: number;
}

export const SoftSkillsAssessment: React.FC<SoftSkillsAssessmentProps> = ({ user, onComplete, onClose }) => {
  const [phase, setPhase] = useState<'intro' | 'play' | 'results'>('intro');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [scores, setScores] = useState<SoftSkillsScores>({
    teamwork: 50,
    criticalThinking: 50,
    creativity: 50,
    pressure: 50,
    decisionMaking: 50
  });
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const activeScene = STORY_SCENES[currentSceneIndex];
  const handleChoiceRef = useRef<((choice: Choice) => void) | null>(null);

  // Handle Choice Callback Definition
  const handleChoice = (choice: Choice) => {
    const newScores = { ...scores };
    if (choice.impact.teamwork) newScores.teamwork += choice.impact.teamwork * 5;
    if (choice.impact.criticalThinking) newScores.criticalThinking += choice.impact.criticalThinking * 5;
    if (choice.impact.creativity) newScores.creativity += choice.impact.creativity * 5;
    if (choice.impact.pressure) newScores.pressure += choice.impact.pressure * 5;
    if (choice.impact.decisionMaking) newScores.decisionMaking += choice.impact.decisionMaking * 5;

    // Cap scores 0-100
    (Object.keys(newScores) as Array<keyof SoftSkillsScores>).forEach(key => {
      newScores[key] = Math.min(100, Math.max(0, newScores[key]));
    });

    setScores(newScores);

    if (currentSceneIndex < STORY_SCENES.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      finishAssessment(newScores);
    }
  };

  // Keep Ref Updated (Top Level, NOT inside handleChoice!)
  useEffect(() => {
    handleChoiceRef.current = handleChoice;
  });

  // Timer Logic
  useEffect(() => {
    if (phase === 'play' && activeScene.pressureTimeSeconds) {
      setTimeLeft(activeScene.pressureTimeSeconds);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            const worstChoice = [...activeScene.choices].sort((a, b) => {
               const scoreA = Object.values(a.impact).reduce((sum, val) => sum + (val || 0), 0);
               const scoreB = Object.values(b.impact).reduce((sum, val) => sum + (val || 0), 0);
               return scoreA - scoreB;
            })[0];
            if (handleChoiceRef.current) handleChoiceRef.current(worstChoice);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setTimeLeft(null);
    }
  }, [activeScene, phase]);

  const finishAssessment = (finalScores: typeof scores) => {
    setPhase('results');
    
    const newBadges: UserBadge[] = [];
    const now = Date.now();

    if (finalScores.teamwork >= 80) newBadges.push({ badgeId: 'soft-team', earnedAt: now });
    if (finalScores.criticalThinking >= 80) newBadges.push({ badgeId: 'soft-critic', earnedAt: now });
    if (finalScores.creativity >= 80) newBadges.push({ badgeId: 'soft-creative', earnedAt: now });
    if (finalScores.pressure >= 85) newBadges.push({ badgeId: 'soft-pressure', earnedAt: now });
    if (finalScores.decisionMaking >= 80) newBadges.push({ badgeId: 'soft-decide', earnedAt: now });
    
    const allAbove60 = Object.values(finalScores).every((s: number) => s >= 60);
    if (allAbove60) newBadges.push({ badgeId: 'soft-balance', earnedAt: now });

    const uniqueNewBadges = newBadges.filter(nb => !user.badges.some(ub => ub.badgeId === nb.badgeId));

    const updatedUser: UserProfile = {
      ...user,
      badges: [...user.badges, ...uniqueNewBadges],
      softSkills: {
        ...finalScores,
        lastAssessed: now
      },
      xp: user.xp + 500,
      hiringReadiness: Math.min(100, user.hiringReadiness + 5)
    };

    onComplete(updatedUser);
  };

  // Intro View
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          <div className="h-40 bg-gradient-to-r from-indigo-900 to-purple-900 relative flex items-center justify-center">
             <div className="absolute inset-0 bg-white/5 mix-blend-overlay"></div>
             <Brain size={64} className="text-white relative z-10 opacity-90" />
          </div>
          <div className="p-8 text-center space-y-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Scenario: The Startup Sprint</h2>
              <p className="text-slate-400 text-lg">
                Step into the shoes of a Product Lead at "Orbit". You have 48 hours to launch. 
                Your choices determine the outcome—and reveal your hidden professional strengths.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <Activity className="text-emerald-500 mb-2" size={24} />
                  <h4 className="font-bold text-white text-sm">Real Pressure</h4>
                  <p className="text-xs text-slate-500">Timed decisions simulate actual crunch time.</p>
               </div>
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <Radar className="text-blue-500 mb-2" size={24} />
                  <h4 className="font-bold text-white text-sm">Deep Analysis</h4>
                  <p className="text-xs text-slate-500">Measure Teamwork, Creativity, and Critical Thinking.</p>
               </div>
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <Award className="text-amber-500 mb-2" size={24} />
                  <h4 className="font-bold text-white text-sm">Earn Badges</h4>
                  <p className="text-xs text-slate-500">Unlock unique profile badges based on your style.</p>
               </div>
            </div>

            <div className="pt-4 flex gap-4 justify-center">
              <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => setPhase('play')}
                className="px-8 py-3 rounded-xl font-bold bg-white text-slate-950 hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20"
              >
                Start Assessment <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Play View
  if (phase === 'play') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4">
        
        {/* Progress Bar */}
        <div className="w-full max-w-2xl h-1.5 bg-slate-800 rounded-full mb-6 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${((currentSceneIndex + 1) / STORY_SCENES.length) * 100}%` }}
          />
        </div>

        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-right duration-500" key={currentSceneIndex}>
          
          {/* Scene Header */}
          <div className="bg-slate-950/50 p-6 flex items-center gap-6 border-b border-slate-800">
             <div className="relative">
               <PixelAvatar config={activeScene.speaker.avatar} size={80} className="border-4 border-slate-800 shadow-xl" />
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold text-white whitespace-nowrap border border-slate-700">
                 {activeScene.speaker.name}
               </div>
             </div>
             <div className="flex-1">
               <h3 className="text-xl font-bold text-white mb-2">{activeScene.title}</h3>
               <div className="bg-white text-slate-900 p-4 rounded-xl rounded-tl-none text-sm font-medium shadow-lg relative">
                 <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                 {activeScene.description}
               </div>
             </div>
          </div>

          {/* Pressure Timer */}
          {timeLeft !== null && (
            <div className="bg-red-500/10 border-b border-red-500/20 py-2 px-6 flex items-center justify-between">
               <span className="text-red-400 text-xs font-bold uppercase flex items-center gap-2 animate-pulse">
                 <Clock size={14} /> Decision Required
               </span>
               <span className="text-red-500 font-mono font-bold text-lg">00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
          )}

          {/* Choices */}
          <div className="p-6 space-y-3">
             {activeScene.choices.map((choice) => (
               <button
                 key={choice.id}
                 onClick={() => handleChoice(choice)}
                 className="w-full text-left p-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 hover:scale-[1.01] transition-all group"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-colors">
                     {choice.id.slice(-1).toUpperCase()}
                   </div>
                   <span className="text-slate-200 group-hover:text-white font-medium text-sm">{choice.text}</span>
                 </div>
               </button>
             ))}
          </div>

        </div>
      </div>
    );
  }

  // Phase: Results
  const chartData = [
    { subject: 'Teamwork', A: scores.teamwork, fullMark: 100 },
    { subject: 'Critical Thinking', A: scores.criticalThinking, fullMark: 100 },
    { subject: 'Creativity', A: scores.creativity, fullMark: 100 },
    { subject: 'Pressure', A: scores.pressure, fullMark: 100 },
    { subject: 'Decisions', A: scores.decisionMaking, fullMark: 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-y-auto">
       <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-500 my-8">
         
         <div className="p-8 text-center border-b border-slate-800 bg-slate-950/50">
           <h2 className="text-3xl font-black text-white mb-2">Assessment Complete</h2>
           <p className="text-slate-400">Here is your professional soft skills profile.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-center bg-slate-900">
               <div className="w-full h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <RechartsRadar
                        name="My Skills"
                        dataKey="A"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="#10b981"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                 </ResponsiveContainer>
               </div>
               <div className="mt-4 flex gap-4 text-xs font-bold text-slate-500 uppercase">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500/40 border border-emerald-500 rounded-sm"></div> Your Profile</div>
               </div>
            </div>

            <div className="p-8 space-y-6 bg-slate-950/30">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Strengths Identified</h3>
               
               {(Object.entries(scores) as [string, number][])
                 .sort(([,a], [,b]) => b - a)
                 .slice(0, 3)
                 .map(([key, score]) => (
                   <div key={key} className="flex gap-4">
                      <div className="mt-1">
                        {key === 'teamwork' && <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Users size={20}/></div>}
                        {key === 'criticalThinking' && <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Brain size={20}/></div>}
                        {key === 'creativity' && <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg"><Lightbulb size={20}/></div>}
                        {key === 'pressure' && <div className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Thermometer size={20}/></div>}
                        {key === 'decisionMaking' && <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg"><Gavel size={20}/></div>}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                           <h4 className="font-bold text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                           <span className="text-emerald-500 font-mono font-bold">{Math.round(score)}/100</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {score > 80 ? "You exhibit exceptional natural ability in this area." : "A solid foundation with room to grow into a leadership strength."}
                        </p>
                      </div>
                   </div>
                 ))
               }
            </div>
         </div>

         <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-slate-400">
               <Check className="text-emerald-500" size={16} /> Profile Updated
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Return to Dashboard
            </button>
         </div>
       </div>
    </div>
  );
};
