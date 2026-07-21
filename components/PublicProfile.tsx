import React, { useState } from 'react';
import { UserProfile, LEVEL_TITLES } from '../types';
import { PixelAvatar } from './ui/PixelAvatar';
import { BadgeDisplay } from './ui/BadgeDisplay';
import { ContributionGraph } from './ui/ContributionGraph';
import { SkillRadarChart } from './ui/RadarChart';
import { MapPin, Calendar, Award, Shield, CheckCircle, MessageSquare, Globe, Share2, Check, Flame, ChevronDown, ChevronUp, FolderGit2, ExternalLink, Zap, Code } from 'lucide-react';

interface PublicProfileProps {
  user: UserProfile;
  isOwner?: boolean;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({ user, isOwner = false }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'timeline' | 'skills' | 'badges'>('projects');
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Level Calc
  const currentLevelIndex = Math.min(Math.floor(user.completedStages / 10), 9);
  const currentLevelTitle = LEVEL_TITLES[currentLevelIndex];
  const currentLevelNumber = currentLevelIndex + 1;
  const stagesInLevel = user.completedStages % 10;
  const levelProgress = (stagesInLevel / 10) * 100;

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${user.name.replace(/\s+/g, '-').toLowerCase()}`).catch(console.error);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const historyToShow = showAllHistory ? user.history : user.history.slice(0, 4);
  const userProjects = user.projects || [];

  return (
    <div className="max-w-4xl mx-auto pb-32 px-4 md:px-6">
      {/* Cover Banner */}
      <div className="h-40 md:h-56 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl relative overflow-hidden mt-4 border border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-950 to-transparent"></div>
      </div>

      {/* Profile Header Card */}
      <div className="px-4 md:px-8 relative -mt-16 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="relative shrink-0">
             <PixelAvatar config={user.avatar} size={128} className="border-4 border-slate-950 shadow-2xl rounded-3xl bg-slate-900" />
             <div className="absolute -bottom-2 -right-2 bg-slate-900 p-1 rounded-full border border-slate-800">
               <div className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full border border-emerald-400 shadow-lg shadow-emerald-500/20">
                 Lvl {currentLevelNumber}
               </div>
             </div>
          </div>
          
          <div className="flex-1 pb-2">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{user.name}</h1>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wide">
                   <span>{user.role}</span>
                   <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                   <span>{currentLevelTitle}</span>
                </div>
            </div>

            {/* Level Progress Bar */}
            <div className="w-full max-w-sm mt-3 mb-2">
               <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                 <span>Progress to Level {currentLevelNumber + 1}</span>
                 <span className="text-emerald-400">{stagesInLevel} / 10 Stages</span>
               </div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-800">
                 <div 
                   className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 ease-out"
                   style={{ width: `${levelProgress}%` }}
                 />
               </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-2 text-xs font-medium text-slate-400">
               <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-500"/> Global Remote</span>
               <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-500"/> Joined {user.joinedAt ? new Date(user.joinedAt).getFullYear() : new Date().getFullYear()}</span>
               {user.portfolioUrl ? (
                  <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                    <Globe size={14}/> {user.portfolioUrl.replace(/^https?:\/\//, '')}
                  </a>
               ) : (
                  <span className="flex items-center gap-1.5 opacity-50"><Globe size={14}/> No Portfolio Linked</span>
               )}
            </div>
          </div>

          <div className="flex gap-2 pb-2 mt-4 md:mt-0 shrink-0">
             {isOwner ? (
               <button 
                  onClick={handleShareProfile}
                  className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-slate-700"
                >
                  {copiedLink ? <Check size={16} className="text-emerald-500"/> : <Share2 size={16} />}
                  {copiedLink ? 'Copied!' : 'Share Profile'}
               </button>
             ) : (
               <>
                 <button 
                   onClick={() => setIsFollowing(!isFollowing)}
                   className={`flex-1 md:flex-none font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg ${
                      isFollowing 
                      ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                   }`}
                 >
                   {isFollowing ? 'Following' : 'Follow'}
                 </button>
                 <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl transition-colors border border-slate-700">
                   <MessageSquare size={18} />
                 </button>
               </>
             )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-6 mt-6 border-b border-slate-800 pb-6 overflow-x-auto items-center">
           <div className="flex flex-col pr-4 border-r border-slate-800">
              <span className="text-xl font-black text-white flex items-center gap-1">
                 <Flame size={20} className={user.streak > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-slate-600"} />
                 {user.streak}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500">Day Streak</span>
           </div>

           <div className="flex flex-col">
              <span className="text-xl font-black text-white">{userProjects.length}</span>
              <span className="text-[10px] uppercase font-bold text-blue-400">Projects</span>
           </div>
           <div className="flex flex-col">
              <span className="text-xl font-black text-white">{user.hiringReadiness}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-500">Readiness</span>
           </div>
           <div className="flex flex-col">
              <span className="text-xl font-black text-white">{user.badges.length}</span>
              <span className="text-[10px] uppercase font-bold text-amber-500">Badges</span>
           </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="mb-6">
        <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 inline-flex overflow-x-auto max-w-full">
           {[
             { id: 'projects', label: `Projects (${userProjects.length})`, icon: FolderGit2 },
             { id: 'timeline', label: 'Activity Feed', icon: Calendar },
             { id: 'skills', label: 'Verified Skills', icon: Shield },
             { id: 'badges', label: 'Badges', icon: Award }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                 activeTab === tab.id 
                 ? 'bg-slate-800 text-white shadow-md border border-slate-700' 
                 : 'text-slate-500 hover:text-slate-300'
               }`}
             >
               <tab.icon size={14} className={activeTab === tab.id ? 'text-emerald-400' : ''} />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Tab Views */}
      <div className="animate-in slide-in-from-bottom duration-300">
        
        {/* 1. PROJECTS PORTFOLIO GRID */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {userProjects.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-3">
                <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="font-bold text-white text-base">No Portfolio Projects Yet</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  Add projects to your profile to let Grok AI analyze your code, award XP, and showcase your verified skills to recruiters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userProjects.map((proj) => (
                  <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-white text-lg leading-snug">{proj.title}</h3>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shrink-0">
                          +{proj.xpEarned} XP
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>

                      {/* Tech Stack Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tags.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-950 text-slate-300 rounded-lg text-[11px] font-mono border border-slate-800">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Grok AI Feedback summary */}
                      {proj.aiFeedback && (
                        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 italic">
                          <span className="font-bold text-emerald-400 not-italic block mb-0.5">Grok AI Verification:</span>
                          "{proj.aiFeedback}"
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <Zap size={14} fill="currentColor" /> Verified Skills: {proj.verifiedSkills.join(', ')}
                      </div>

                      {proj.projectUrl && (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-700"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. ACTIVITY TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <ContributionGraph submissions={user.history} />
            
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Activity Feed</h3>
               {historyToShow.map((item) => (
                 <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-emerald-500 transition-colors"></div>
                    <div className="mt-1">
                       <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                          <CheckCircle size={20} />
                       </div>
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-slate-500 font-medium">Completed Challenge</span>
                            <h4 className="text-white font-bold text-sm">Daily {user.role} Task</h4>
                          </div>
                          <span className="text-[10px] text-slate-600">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                       </div>
                       
                       {item.grading && (
                         <div className="mt-3 bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                            <p className="text-xs text-slate-300 italic">"{item.grading.feedbackSummary}"</p>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-xs font-bold text-emerald-400">
                                 Score: {item.grading.score}/100
                               </span>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* 3. SKILLS */}
        {activeTab === 'skills' && (
          <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 min-h-[300px] flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-emerald-500"/> Verified Skills Radar
                </h3>
                {user.skills.length > 0 ? (
                   <SkillRadarChart data={user.skills.map(s => ({ ...s, fullMark: 100 }))} />
                ) : (
                   <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
                     No verified skills data available.
                   </div>
                )}
             </div>
             
             <div className="space-y-3">
               {user.skillTree.filter(n => n.status === 'completed').map(node => (
                 <div key={node.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{node.name}</h4>
                      <p className="text-xs text-slate-500">{node.description}</p>
                    </div>
                    <div className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {node.level}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* 4. BADGES */}
        {activeTab === 'badges' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[300px]">
             <div className="flex flex-wrap gap-6 justify-center">
               {user.badges.map(b => (
                 <div key={b.badgeId} className="flex flex-col items-center">
                   <BadgeDisplay badge={b} size="lg" showLabel />
                 </div>
               ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
