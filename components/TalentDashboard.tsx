import React, { useState } from 'react';
import { UserProfile, Challenge, GradingResult, SkillNode, AvatarConfig, LEVEL_TITLES, UserBadge, PortfolioProject } from '../types';
import { generateDailyChallenge, evaluateSubmission, verifySkillProof, generateSkillQuest } from '../services/geminiService';
import { analyzeProjectWithGrok } from '../services/grokService';
import { evaluateBadges } from '../services/badgeService';
import { SkillRadarChart } from './ui/RadarChart';
import { SkillTree } from './ui/SkillTree';
import { ContributionGraph } from './ui/ContributionGraph';
import { PixelAvatar } from './ui/PixelAvatar';
import { BadgeDisplay } from './ui/BadgeDisplay';
import { SoftSkillsAssessment } from './SoftSkillsAssessment';
import { ResumeParserModal } from './ui/ResumeParserModal';
import { Play, CheckCircle, Clock, Zap, Award, Loader2, Trophy, Flame, Shield, Lock, Map, X, Edit2, Save, RefreshCw, ChevronDown, Briefcase, Medal, Globe, BookOpen, Upload, Brain, Plus, FolderGit2, Sparkles, ExternalLink, Code, FileText } from 'lucide-react';

interface TalentDashboardProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const AVATAR_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
const ARCHETYPES: AvatarConfig['archetype'][] = ['human_male', 'human_female', 'android', 'ethereal'];

export const TalentDashboard: React.FC<TalentDashboardProps> = ({ user, onUpdateUser }) => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGrading, setShowGrading] = useState<GradingResult | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'progression'>('progression'); // Default to Career Map
  const [newEarnedBadges, setNewEarnedBadges] = useState<UserBadge[]>([]);
  
  // Add Project Modal State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTags, setProjTags] = useState('React, TypeScript, Node.js');
  const [projUrl, setProjUrl] = useState('');
  const [isAnalyzingProj, setIsAnalyzingProj] = useState(false);

  // Code Sandbox State
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);

  // Resume Parser State
  const [showResumeParser, setShowResumeParser] = useState(false);
  
  // Soft Skills Assessment State
  const [showSoftSkillsAssessment, setShowSoftSkillsAssessment] = useState(false);
  
  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editRole, setEditRole] = useState(user.role);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editPortfolio, setEditPortfolio] = useState(user.portfolioUrl || '');
  
  // Skill Interaction State
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null); // The node clicked
  const [interactionMode, setInteractionMode] = useState<'selection' | 'prove' | 'quest'>('selection'); // What mode are we in?
  
  // Proof Form State
  const [proofTitle, setProofTitle] = useState('');
  const [proofDesc, setProofDesc] = useState('');
  const [isVerifyingProof, setIsVerifyingProof] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // --- LEVELING LOGIC ---
  const currentLevelIndex = Math.min(Math.floor(user.completedStages / 10), 9);
  const currentLevelTitle = LEVEL_TITLES[currentLevelIndex];
  const currentLevelNumber = currentLevelIndex + 1;
  const stagesInCurrentLevel = user.completedStages % 10;
  const progressToNext = (stagesInCurrentLevel / 10) * 100;

  const getDifficultyForLevel = (lvl: number) => {
    if (lvl <= 2) return 'Entry';
    if (lvl <= 5) return 'Intermediate';
    if (lvl <= 8) return 'Senior';
    return 'Principal';
  };

  // --- DAILY CHALLENGE ---
  const startDailyChallenge = async () => {
    setIsGenerating(true);
    try {
      const challenge = await generateDailyChallenge(user.role, getDifficultyForLevel(currentLevelNumber) as any);
      setActiveChallenge(challenge);
      setSubmissionText('');
      setShowGrading(null);
      setNewEarnedBadges([]);
    } catch (e) {
      console.error(e);
      alert("Failed to generate challenge. Check your API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- SKILL QUEST ---
  const startSkillQuest = async (node: SkillNode) => {
    setIsGenerating(true);
    setInteractionMode('quest');
    try {
      const challenge = await generateSkillQuest(node.name, user.role, node.level);
      setActiveChallenge(challenge);
    } catch (e) {
      console.error(e);
      setInteractionMode('selection'); // Fallback
    } finally {
      setIsGenerating(false);
      setSubmissionText('');
    }
  };

  // --- SUBMISSION HANDLER (Used for both Daily & Skill Quests) ---
  const handleSubmit = async () => {
    if (!activeChallenge) return;
    setIsSubmitting(true);
    try {
      const result = await evaluateSubmission(activeChallenge, submissionText);
      setShowGrading(result);
      
      // Create Record
      const newSubmission = {
        id: crypto.randomUUID(),
        challengeId: activeChallenge.id,
        content: submissionText,
        timestamp: Date.now(),
        grading: result
      };
      
      // Core Logic updates
      let updatedUser = { ...user };
      const scoreImpact = (result.score - 70) * 0.2; 
      const newReadiness = Math.min(100, Math.max(0, user.hiringReadiness + scoreImpact));

      updatedUser.history = [newSubmission, ...user.history];
      updatedUser.xp += (activeChallenge.xpReward * (result.score / 100));
      updatedUser.hiringReadiness = newReadiness;

      // Handle Skill Unlock if this was a Quest
      if (activeChallenge.type === 'skill_quest' && activeChallenge.targetSkill && result.score >= 70) {
          // Unlock Logic
          const updatedTree = user.skillTree.map(n => {
              if (n.name === activeChallenge.targetSkill) {
                  return { 
                      ...n, 
                      status: 'completed' as const, 
                      proof: { 
                          title: `${activeChallenge.targetSkill} Quest`, 
                          description: "Completed AI-generated learning quest.", 
                          verified: true 
                      } 
                  };
              }
              return n;
          });

          // Unlock Children
          const finalTree = updatedTree.map(n => {
               // Find parent of this node
               const parent = updatedTree.find(p => p.id === n.parentId);
               if (parent && parent.status === 'completed' && n.status === 'locked') {
                   return { ...n, status: 'available' as const };
               }
               return n;
          });

          // Add to verified skills list for Radar Chart
          const existingSkill = user.skills.find(s => s.name === activeChallenge.targetSkill);
          let newSkills = [...user.skills];
          if (existingSkill) {
              newSkills = newSkills.map(s => s.name === activeChallenge.targetSkill ? { ...s, score: result.score } : s);
          } else {
              newSkills.push({ name: activeChallenge.targetSkill!, score: result.score });
          }

          updatedUser.skillTree = finalTree;
          updatedUser.skills = newSkills;
          updatedUser.completedStages += 1;
      } else if (activeChallenge.type === 'daily') {
          updatedUser.streak += 1;
          updatedUser.completedStages += 1;
      }

      // Evaluate Badges
      const newlyUnlocked = evaluateBadges(updatedUser, result);
      if (newlyUnlocked.length > 0) {
        setNewEarnedBadges(newlyUnlocked);
        updatedUser.badges = [...updatedUser.badges, ...newlyUnlocked];
      }

      onUpdateUser(updatedUser);
      setActiveChallenge(null); 
      setSelectedNode(null); // Close modal
    } catch (e) {
      console.error(e);
      alert("Evaluation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProfile = () => {
    if (!editName.trim()) return;
    onUpdateUser({
      ...user,
      name: editName,
      role: editRole,
      avatar: editAvatar,
      portfolioUrl: editPortfolio.trim()
    });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditName(user.name);
    setEditRole(user.role);
    setEditAvatar(user.avatar);
    setEditPortfolio(user.portfolioUrl || '');
    setIsEditing(false);
  };

  // --- SKILL NODE SELECTION ---
  const handleNodeSelect = (node: SkillNode) => {
      setSelectedNode(node);
      setInteractionMode('selection');
      setProofTitle('');
      setProofDesc('');
      setVerificationFeedback(null);
  };

  // --- PROOF HANDLER ---
  const handleSubmitProof = async () => {
    if (!selectedNode) return;
    setIsVerifyingProof(true);
    setVerificationFeedback(null);

    try {
      const result = await verifySkillProof(selectedNode.name, proofTitle, proofDesc);

      if (result.verified) {
          // Unlock Node Logic (Similar to Quest)
          const updatedTree = user.skillTree.map(n => {
              if (n.id === selectedNode.id) {
                  return { 
                      ...n, 
                      status: 'completed' as const, 
                      proof: { 
                          title: proofTitle, 
                          description: proofDesc, 
                          verified: true,
                          feedback: result.feedback
                      } 
                  };
              }
              return n;
          });

          const finalTree = updatedTree.map(n => {
              const parent = updatedTree.find(p => p.id === n.parentId);
              if (parent && parent.status === 'completed' && n.status === 'locked') {
                  return { ...n, status: 'available' as const };
              }
               // Root unlock logic check? Assuming root is always available or handled elsewhere
              return n;
          });

          // Add to Skills List for Radar
          const newSkills = [...user.skills, { name: selectedNode.name, score: 85 }]; // Default proof score

          const tempUser = {
            ...user,
            skillTree: finalTree,
            skills: newSkills,
            completedStages: user.completedStages + 1,
            hiringReadiness: Math.min(100, user.hiringReadiness + 2)
          };
          
          const newlyUnlocked = evaluateBadges(tempUser, undefined, true);
          if (newlyUnlocked.length > 0) {
             setNewEarnedBadges(newlyUnlocked);
          }

          onUpdateUser({ 
              ...tempUser, 
              badges: [...user.badges, ...newlyUnlocked]
          });
          setSelectedNode(null);
      } else {
          setVerificationFeedback(result.feedback);
      }
    } catch (e) {
      console.error(e);
      setVerificationFeedback("Verification service error. Please try again.");
    } finally {
      setIsVerifyingProof(false);
    }
  };

  // Add Portfolio Project Handler with Grok AI Analysis
  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDesc.trim()) return;

    setIsAnalyzingProj(true);
    const parsedTags = projTags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      // Analyze with Grok AI
      const analysis = await analyzeProjectWithGrok(
        user.role,
        projTitle,
        projDesc,
        parsedTags,
        projUrl
      );

      const newProject: PortfolioProject = {
        id: `proj-${Date.now()}`,
        title: projTitle,
        description: projDesc,
        roleTag: user.role,
        tags: parsedTags,
        projectUrl: projUrl || undefined,
        verifiedSkills: analysis.verifiedSkills,
        xpEarned: analysis.xpEarned,
        aiFeedback: analysis.aiFeedback,
        createdAt: Date.now()
      };

      const existingProjects = user.projects || [];
      const updatedProjects = [newProject, ...existingProjects];

      // Update User XP & Hiring Readiness
      const updatedUser: UserProfile = {
        ...user,
        projects: updatedProjects,
        xp: user.xp + analysis.xpEarned,
        hiringReadiness: Math.min(100, user.hiringReadiness + analysis.readinessBoost)
      };

      onUpdateUser(updatedUser);

      // Reset Modal Form
      setProjTitle('');
      setProjDesc('');
      setProjUrl('');
      setShowAddProjectModal(false);
    } catch (err) {
      console.error('Project AI analysis error:', err);
    } finally {
      setIsAnalyzingProj(false);
    }
  };

  // --- RENDER MODALS ---

  // 0. SOFT SKILLS ASSESSMENT
  if (showSoftSkillsAssessment) {
    return (
      <SoftSkillsAssessment 
        user={user}
        onComplete={(updatedUser) => {
          onUpdateUser(updatedUser);
          // Wait a moment so user can see result before closing
        }}
        onClose={() => setShowSoftSkillsAssessment(false)}
      />
    );
  }

  // 1. ACTIVE CHALLENGE / QUEST MODAL
  if (activeChallenge) {
    return (
      <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
        <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <button onClick={() => setActiveChallenge(null)} className="text-slate-400 text-sm font-medium hover:text-white">Cancel Quest</button>
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Zap size={16} fill="currentColor"/> {activeChallenge.xpReward} XP
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-wider text-emerald-500 uppercase">
              {activeChallenge.type === 'skill_quest' ? 'Learning Quest' : 'Daily Challenge'}
            </span>
            <h2 className="text-2xl font-bold text-white">{activeChallenge.title}</h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock size={14}/> {activeChallenge.timeLimitMinutes} min est.
              <span className="w-1 h-1 bg-slate-600 rounded-full"/>
              {activeChallenge.difficulty}
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 text-slate-300 leading-relaxed border border-slate-800">
            <h4 className="text-white font-bold mb-2">Briefing</h4>
            {activeChallenge.description}
          </div>

          <div className="space-y-3">
             <h3 className="text-sm font-semibold text-slate-400 uppercase">Success Criteria</h3>
             {activeChallenge.criteria.map((c,i) => (
               <div key={i} className="flex gap-3 text-sm text-slate-300">
                 <div className="min-w-[6px] h-[6px] rounded-full bg-emerald-500 mt-2"/>
                 {c}
               </div>
             ))}
          </div>

          {/* Interactive Code Sandbox & Runner */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-400 uppercase flex items-center gap-2">
                <Code size={16} className="text-emerald-400" /> Code Editor & Live Sandbox
              </label>
              <button
                type="button"
                onClick={() => {
                  try {
                    const logs: string[] = [];
                    const customConsole = {
                      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
                      warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
                      error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' '))
                    };
                    const runnerFn = new Function('console', submissionText);
                    const startTime = performance.now();
                    runnerFn(customConsole);
                    const duration = (performance.now() - startTime).toFixed(2);
                    const outputStr = logs.length > 0 ? logs.join('\n') : '▶ Execution clean. (No console.log outputs)';
                    setSandboxOutput(`✔ Executed in ${duration}ms\n${outputStr}`);
                  } catch (err: any) {
                    setSandboxOutput(`❌ Syntax / Runtime Error:\n${err.message}`);
                  }
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
              >
                <Play size={12} fill="currentColor" /> Run Code & Test
              </button>
            </div>

            <textarea
              className="w-full h-56 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              placeholder="// Type your solution code here (e.g. JavaScript / TypeScript)...\nfunction solve(input) {\n  console.log('Testing solution...');\n  return input;\n}\nsolve('Hello World');"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
            />

            {sandboxOutput && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Console Terminal Output</div>
                <pre className="whitespace-pre-wrap text-emerald-400">{sandboxOutput}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !submissionText.trim()}
            className="w-full bg-emerald-500 text-slate-950 font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 hover:bg-emerald-400 transition-colors"
          >
            {isSubmitting ? <Loader2 className="animate-spin"/> : "Submit & Grade"}
          </button>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8 pb-24 relative">
      
      {/* 1. PROFESSIONAL PROFILE CARD */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-0 shadow-xl relative overflow-hidden transition-all duration-300">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        {!isEditing ? (
          <div className="flex flex-col animate-in fade-in duration-300">
            {/* Top Section: Identity & Level */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start border-b border-slate-800/50">
              {/* Avatar */}
              <div className="relative group shrink-0 self-center md:self-auto">
                 <PixelAvatar config={user.avatar} size={88} className="relative z-10 border-4 border-slate-900 shadow-2xl" />
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="absolute -bottom-1 -right-1 bg-slate-800 text-slate-300 p-1.5 rounded-full border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors z-20 md:hidden"
                 >
                   <Edit2 size={12} />
                 </button>
              </div>

              {/* Core Info */}
              <div className="flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left">
                 <div className="flex items-center gap-2 mb-1">
                   <h1 className="text-2xl font-black text-white tracking-tight">{user.name}</h1>
                   <span className="md:hidden inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Level {currentLevelNumber}
                   </span>
                 </div>
                 
                 <div className="flex items-center gap-2 text-slate-400 font-medium text-sm mb-4">
                   <Briefcase size={14} />
                   {user.role}
                 </div>

                 {/* LEVEL DISPLAY */}
                 <div className="w-full bg-slate-950/50 rounded-xl p-3 border border-slate-800 flex items-center gap-4 mb-1 max-w-md">
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-1.5">
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            Level {currentLevelNumber} · {currentLevelTitle}
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono">
                            {stagesInCurrentLevel}/10 Stages
                          </span>
                       </div>
                       {/* Level Progress Bar */}
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 ease-out"
                            style={{ width: `${progressToNext}%` }}
                          />
                       </div>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-500 mt-1 pl-1">
                   Complete {10 - stagesInCurrentLevel} more verified stages to promote to {LEVEL_TITLES[currentLevelIndex + 1] || 'Max Level'}.
                 </p>
              </div>

              {/* Edit & Import CV Buttons (Desktop & Mobile accessible) */}
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setShowResumeParser(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold border border-emerald-500/20 transition-all"
                >
                  <FileText size={14} /> Import CV
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium border border-transparent hover:border-slate-700 transition-all"
                >
                  <Edit2 size={14} /> Edit
                </button>
              </div>
            </div>

            {/* Bottom Section: Stats & Badges */}
            <div className="px-6 py-4 bg-slate-900/50 flex flex-col md:flex-row gap-6 md:gap-0 md:justify-between items-center">
                  <div className="flex gap-8 md:gap-16">
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-0.5">Consistency</span>
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <Flame size={14} className={user.streak > 3 ? "text-orange-500 fill-orange-500" : "text-slate-600"} />
                        {user.streak} Days
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-0.5">Total XP</span>
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                        {Math.floor(user.xp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Badges Strip */}
                  <div className="flex items-center gap-3">
                     {user.badges.slice(0, 4).map(b => (
                       <BadgeDisplay key={b.badgeId} badge={b} size="sm" />
                     ))}
                     {user.badges.length > 4 && (
                       <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                         +{user.badges.length - 4}
                       </div>
                     )}
                     {user.badges.length === 0 && (
                       <span className="text-[10px] text-slate-600 italic">No badges yet</span>
                     )}
                  </div>
            </div>
          </div>
        ) : (
          // --- EDIT MODE ---
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                 <Edit2 size={16} className="text-emerald-500" /> Edit Profile
               </h3>
               <div className="flex gap-2">
                 <button onClick={cancelEdit} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                   <X size={18} />
                 </button>
                 <button 
                    onClick={saveProfile} 
                    disabled={!editName.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Save size={16} /> Save Changes
                 </button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8">
              <div className="flex flex-col items-center gap-4">
                 <div className="relative">
                   <PixelAvatar config={editAvatar} size={96} className="border-4 border-slate-800 shadow-xl" />
                   <button 
                      onClick={() => {
                        const rColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
                        const rArch = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
                        setEditAvatar({ archetype: rArch, color: rColor });
                      }}
                      className="absolute -bottom-2 -right-2 bg-slate-700 p-2 rounded-full border border-slate-600 text-white shadow-lg hover:scale-110 transition-transform"
                   >
                     <RefreshCw size={14} />
                   </button>
                 </div>
                 <div className="space-y-3 w-full max-w-[160px]">
                    <div className="flex justify-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap">
                      {ARCHETYPES.map(arch => (
                        <button
                          key={arch}
                          onClick={() => setEditAvatar(p => ({ ...p, archetype: arch }))}
                          className={`flex-1 min-w-[60px] py-1 rounded text-[10px] font-bold uppercase transition-colors ${editAvatar.archetype === arch ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {arch.replace('human_', '').slice(0, 4)}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center gap-2">
                      {AVATAR_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditAvatar(p => ({ ...p, color: c }))}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${editAvatar.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                 </div>
              </div>
              <div className="space-y-4 max-w-sm w-full">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Display Name</label>
                   <input 
                     type="text" 
                     value={editName}
                     onChange={e => setEditName(e.target.value)}
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Professional Role</label>
                   <input 
                     type="text" 
                     value={editRole}
                     onChange={e => setEditRole(e.target.value)}
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                   />
                </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Portfolio / Website</label>
                   <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text" 
                        value={editPortfolio}
                        onChange={e => setEditPortfolio(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. View Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex shadow-lg">
           <button 
             onClick={() => setViewMode('progression')}
             className={`px-6 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
               viewMode === 'progression' 
               ? 'bg-slate-800 text-white shadow-md border border-slate-700' 
               : 'text-slate-500 hover:text-slate-300'
             }`}
           >
             <Map size={14} className={viewMode === 'progression' ? 'text-emerald-400' : ''} />
             Career Map
           </button>
           <button 
             onClick={() => setViewMode('daily')}
             className={`px-6 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
               viewMode === 'daily' 
               ? 'bg-slate-800 text-white shadow-md border border-slate-700' 
               : 'text-slate-500 hover:text-slate-300'
             }`}
           >
             <Zap size={14} className={viewMode === 'daily' ? 'text-yellow-400' : ''} />
             Daily Quest
           </button>
        </div>
      </div>

      {viewMode === 'daily' && (
        <div className="space-y-6 animate-in slide-in-from-left duration-300">
          {/* Primary Action */}
          <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-1 shadow-2xl shadow-emerald-900/50">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
              <Trophy size={140} />
            </div>
            <div className="bg-slate-900/40 backdrop-blur-md h-full w-full rounded-[20px] p-8 relative z-10 flex flex-col items-start">
              <div className="flex justify-between items-start w-full mb-6">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold backdrop-blur-md border border-white/10 tracking-wide">
                  DAILY CHALLENGE
                </span>
                <span className="text-emerald-100 text-xs font-medium flex items-center gap-1">
                  <Clock size={12} /> Resets in 12h
                </span>
              </div>
              <h3 className="text-3xl font-black text-white mb-2 leading-tight">{user.role} Challenge</h3>
              <p className="text-emerald-50 text-sm mb-8 max-w-md leading-relaxed opacity-90">
                 Complete a {getDifficultyForLevel(currentLevelNumber).toLowerCase()} level challenge to progress towards <strong>{LEVEL_TITLES[currentLevelIndex + 1]}</strong> status.
              </p>
              
              <button 
                onClick={startDailyChallenge}
                disabled={isGenerating}
                className="w-full md:w-auto px-8 bg-white text-emerald-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 hover:scale-105 transition-all shadow-lg"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Play size={18} fill="currentColor"/>}
                Start Challenge
              </button>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div>
            <h3 className="font-bold text-white mb-4 px-1 text-sm uppercase tracking-wider text-slate-500">Recent Activity</h3>
            <div className="space-y-3">
              {user.history.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed">
                  No activity yet.
                </div>
              ) : (
                user.history.map((sub) => (
                  <div 
                    key={sub.id} 
                    onClick={() => sub.grading && setShowGrading(sub.grading)}
                    className={`bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center hover:bg-slate-800/50 transition-colors ${sub.grading ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        (sub.grading?.score || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Award size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">Challenge Completed</h4>
                        <p className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{sub.grading?.feedbackSummary}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-white text-lg">{sub.grading?.score}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Score</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'progression' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                 Career Map
              </h3>
              <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                {user.skillTree.filter(n => n.status === 'completed').length} / {user.skillTree.length} Milestones
              </span>
            </div>
            
            <div className="bg-slate-950 rounded-[32px] border border-slate-800 min-h-[400px] shadow-2xl relative overflow-hidden">
               <SkillTree nodes={user.skillTree} onNodeSelect={handleNodeSelect} userLevel={currentLevelNumber} />
            </div>
          </div>
          
          {/* Soft Skills Assessment Card */}
          <div 
             className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 cursor-pointer group hover:border-indigo-500/50 transition-colors"
             onClick={() => setShowSoftSkillsAssessment(true)}
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <Brain size={120} className="text-indigo-500" />
             </div>
             
             <div className="p-8 relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2">
                   <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                     <Brain size={24} />
                   </div>
                   <h3 className="text-xl font-bold text-white">Soft Skills Assessment</h3>
                 </div>
                 {user.softSkills && (
                   <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                     Completed
                   </span>
                 )}
               </div>
               
               <p className="text-slate-400 text-sm mb-6 max-w-md">
                 Discover your professional strengths in Leadership, Critical Thinking, and Creativity through an interactive scenario.
               </p>
               
               <div className="flex items-center gap-4">
                 <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-500/20">
                    {user.softSkills ? 'Retake Assessment' : 'Start Assessment'}
                 </button>
                 {!user.softSkills && (
                    <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                      <Clock size={12} /> ~5 mins
                    </span>
)}
               </div>
             </div>
          </div>

           {/* Portfolio Projects Section with AI Analysis */}
           <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
               <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                  <FolderGit2 size={16} className="text-emerald-500" /> Portfolio Projects
               </h3>
               <button
                 onClick={() => setShowAddProjectModal(true)}
                 className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
               >
                 <Plus size={14} /> Add Project (AI Verified)
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {(user.projects || []).map((proj) => (
                 <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
                   <div className="flex justify-between items-start">
                     <h4 className="font-bold text-white text-base">{proj.title}</h4>
                     <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                       +{proj.xpEarned} XP
                     </span>
                   </div>
                   <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
                   
                   <div className="flex flex-wrap gap-1 pt-1">
                     {proj.tags.map((t, i) => (
                       <span key={i} className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded text-[10px] font-mono border border-slate-800">
                         {t}
                       </span>
                     ))}
                   </div>

                   {proj.aiFeedback && (
                     <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px] text-slate-300 italic">
                       <span className="font-bold text-emerald-400 not-italic block mb-0.5">Grok AI Verification:</span>
                       "{proj.aiFeedback}"
                     </div>
                   )}
                 </div>
               ))}

               {(!user.projects || user.projects.length === 0) && (
                 <div className="col-span-full bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-2">
                   <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
                   <h4 className="font-bold text-white text-sm">No Projects Added Yet</h4>
                   <p className="text-xs text-slate-400 max-w-xs mx-auto">Add a project to trigger Grok AI technical verification, earn XP, and boost your hiring readiness score.</p>
                   <button
                     onClick={() => setShowAddProjectModal(true)}
                     className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors border border-slate-700"
                   >
                     <Plus size={14} /> Add First Project
                   </button>
                 </div>
               )}
             </div>
           </div>

           <ContributionGraph submissions={user.history} />
          
          {/* Achievements Grid */}
          <div>
             <h3 className="font-bold text-white mb-4 px-1 text-sm uppercase tracking-wider text-slate-500">Achievements</h3>
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex flex-wrap gap-4">
                   {user.badges.map(b => (
                     <BadgeDisplay key={b.badgeId} badge={b} size="lg" showLabel />
                   ))}
                   {user.badges.length === 0 && (
                     <p className="text-sm text-slate-500 w-full text-center py-4">Complete challenges to earn professional badges.</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
      
      {/* Badge Unlocked Celebration Modal */}
      {newEarnedBadges.length > 0 && (
         <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 w-full max-w-sm rounded-3xl p-8 text-center relative overflow-hidden animate-in zoom-in duration-300">
               {/* Confetti-like effects - Added pointer-events-none */}
               <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
               
               <div className="relative z-10">
                 <Medal size={64} className="text-emerald-400 mx-auto mb-6 animate-bounce" />
                 <h2 className="text-2xl font-black text-white mb-2">Badge Unlocked!</h2>
                 <p className="text-slate-400 mb-8">You've demonstrated verified professional growth.</p>
                 
                 <div className="flex justify-center gap-4 mb-8 flex-wrap">
                    {newEarnedBadges.map(b => (
                      <div key={b.badgeId} className="animate-in slide-in-from-bottom duration-500 delay-100">
                         <BadgeDisplay badge={b} size="lg" showLabel />
                      </div>
                    ))}
                 </div>
                 
                 <button 
                   onClick={() => {
                     setNewEarnedBadges([]);
                     // Do not clear grading result here so it remains visible after badge modal closes
                     setSelectedNode(null); 
                   }}
                   className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                 >
                   Continue Career
                 </button>
               </div>
            </div>
         </div>
      )}

      {/* --- TWO PATHS MODAL (SELECT/PROOF/LEARN) --- */}
      {selectedNode && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-slate-900 w-full sm:max-w-md sm:rounded-2xl border-t sm:border border-slate-800 overflow-hidden animate-in slide-in-from-bottom duration-300">
             
             {/* Header */}
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
               <div className="flex items-center gap-2">
                 <Shield className="text-emerald-500" size={18} />
                 <span className="font-bold text-white">
                    {interactionMode === 'selection' ? `Unlock: ${selectedNode.name}` : 
                     interactionMode === 'prove' ? `Prove Mastery: ${selectedNode.name}` : 
                     `Learning Quest: ${selectedNode.name}`}
                 </span>
               </div>
               <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
                 <X size={20} />
               </button>
             </div>
             
             {/* Content Area */}
             <div className="p-6">
                
                {/* 1. SELECTION MODE */}
                {interactionMode === 'selection' && (
                    <div className="space-y-6">
                        {selectedNode.status === 'completed' ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                                <CheckCircle className="text-emerald-500" size={24} />
                                <div>
                                    <h4 className="font-bold text-emerald-400 text-sm">Verified Skill</h4>
                                    <p className="text-xs text-emerald-500/80">Proof accepted by Earned AI</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-300">
                                    This skill node is currently <strong>{selectedNode.status}</strong>. How would you like to proceed?
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setInteractionMode('prove')}
                                        className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all hover:scale-[1.02]"
                                    >
                                        <Upload size={24} className="text-blue-400 mb-2" />
                                        <span className="text-xs font-bold text-white">Upload Proof</span>
                                        <span className="text-[10px] text-slate-400 text-center mt-1">I already know this</span>
                                    </button>
                                    <button 
                                        onClick={() => startSkillQuest(selectedNode)}
                                        className="flex flex-col items-center justify-center p-4 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-xl transition-all hover:scale-[1.02]"
                                    >
                                        <BookOpen size={24} className="text-emerald-400 mb-2" />
                                        <span className="text-xs font-bold text-white">Start Quest</span>
                                        <span className="text-[10px] text-slate-400 text-center mt-1">Teach me this skill</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {selectedNode.status === 'completed' && (
                           <div className="space-y-2">
                             <div className="text-xs text-slate-500 uppercase font-bold">Verified Evidence</div>
                             <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                <h5 className="text-white text-sm font-bold">{selectedNode.proof?.title}</h5>
                                <p className="text-xs text-slate-400 mt-1">{selectedNode.proof?.description}</p>
                             </div>
                           </div>
                        )}
                    </div>
                )}

                {/* 2. PROVE MODE */}
                {interactionMode === 'prove' && (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <button onClick={() => setInteractionMode('selection')} className="text-xs text-slate-500 hover:text-white flex items-center gap-1 mb-2">
                             &larr; Back
                        </button>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold">Project Title</label>
                            <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. E-commerce API"
                            value={proofTitle}
                            onChange={e => setProofTitle(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold">Description & Tech Stack</label>
                            <textarea 
                            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                            placeholder="Describe how you used this skill..."
                            value={proofDesc}
                            onChange={e => setProofDesc(e.target.value)}
                            />
                        </div>

                        {verificationFeedback && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            ⚠ {verificationFeedback}
                            </div>
                        )}

                        <button 
                            onClick={handleSubmitProof}
                            disabled={isVerifyingProof || !proofTitle || !proofDesc}
                            className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl mt-4 flex justify-center items-center gap-2"
                        >
                            {isVerifyingProof ? <Loader2 className="animate-spin" /> : "Verify & Unlock"}
                        </button>
                    </div>
                )}

                {/* 3. QUEST LOADING MODE */}
                {interactionMode === 'quest' && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in duration-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                            <Loader2 size={48} className="text-emerald-400 animate-spin relative z-10" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-white font-bold text-lg">Preparing Quest</h4>
                            <p className="text-slate-400 text-sm mt-1">AI is tailoring a challenge for {selectedNode.name}...</p>
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Hide grading report if badge celebration is active to prevent overlap/z-index fighting */}
      {showGrading && newEarnedBadges.length === 0 && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-slate-900 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl border-t sm:border border-slate-800 overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
             <div className="p-8 text-center bg-gradient-to-b from-slate-800 to-slate-900">
               <div className="mx-auto w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center mb-4 bg-slate-950 shadow-xl shadow-emerald-500/20">
                 <span className="text-4xl font-black text-white">{showGrading.score}</span>
               </div>
               <h2 className="text-xl font-bold text-white mb-2">Performance Report</h2>
               <p className="text-sm text-slate-400 leading-relaxed">{showGrading.feedbackSummary}</p>
             </div>
             
             <div className="p-6 space-y-6">
                {/* RAG Category Breakdown */}
                {showGrading.categoryBreakdown && showGrading.categoryBreakdown.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">RAG Rubric Breakdown</h4>
                      {showGrading.ragBenchmarkMatch && (
                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                          {showGrading.ragBenchmarkMatch}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                      {showGrading.categoryBreakdown.map((cat, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300 font-medium">{cat.category} ({(cat.weight * 100).toFixed(0)}%)</span>
                            <span className="font-bold text-emerald-400 font-mono">{cat.score}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${cat.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">Key Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {showGrading.strengths.map((s,i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3">Areas for Improvement</h4>
                  <div className="flex flex-col gap-2">
                    {showGrading.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-rose-500 mt-0.5">•</span>
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3">Actionable Tips</h4>
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                    <ul className="space-y-2">
                      {showGrading.actionableTips.map((tip, i) => (
                        <li key={i} className="text-xs text-slate-400 flex gap-2">
                          <span className="text-blue-500 font-bold">{i + 1}.</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => setShowGrading(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Continue
                </button>
             </div>
          </div>
        </div>
      )}

      {/* ADD PORTFOLIO PROJECT MODAL (GROK AI ANALYSIS) */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Add Portfolio Project</h3>
                  <p className="text-xs text-slate-400">Grok AI will analyze your code, verify skills, and award XP</p>
                </div>
              </div>

              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-500 hover:text-white p-2">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cache Engine"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description & Architecture</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your project, key problems solved, trade-offs, and technical architecture..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Redis, Go"
                  value={projTags}
                  onChange={(e) => setProjTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Repository / Live Demo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/user/project"
                  value={projUrl}
                  onChange={(e) => setProjUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzingProj || !projTitle || !projDesc}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isAnalyzingProj ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Grok AI Analyzing Code & Skills...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Analyze & Publish to Portfolio
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Parser Modal */}
      {showResumeParser && (
        <ResumeParserModal
          onParsed={(data) => {
            const updatedUser: UserProfile = {
              ...user,
              role: data.role || user.role,
              name: data.name || user.name,
              skillTree: data.skillTree.length > 0 ? data.skillTree : user.skillTree,
              projects: [...(user.projects || []), ...data.projects],
              xp: user.xp + data.projects.reduce((sum, p) => sum + (p.xpEarned || 0), 0),
            };
            onUpdateUser(updatedUser);
            setShowResumeParser(false);
          }}
          onClose={() => setShowResumeParser(false)}
        />
      )}
    </div>
  );
};
