import React, { useState, useMemo } from 'react';
import { Candidate, LEVEL_TITLES } from '../types';
import { BADGE_DEFINITIONS } from '../services/badgeService';
import { Search, Briefcase, Award, ChevronRight, Target, Info, Flame, X } from 'lucide-react';
import { PixelAvatar } from './ui/PixelAvatar';
import { BadgeDisplay } from './ui/BadgeDisplay';
import { ContributionGraph } from './ui/ContributionGraph';
import { SkillRadarChart } from './ui/RadarChart';

const MOCK_CANDIDATES: Candidate[] = [
  { 
    id: '1', 
    name: 'Alex Chen', 
    role: 'Software Engineer', 
    completedStages: 78, 
    hiringReadiness: 94, 
    earnedScore: 9400, 
    topSkills: ['React', 'System Design', 'Node.js'], 
    badges: [{ badgeId: 'exc-precision', earnedAt: Date.now() }],
    avatar: { archetype: 'human_male', color: '#3b82f6' },
    skills: [{ name: 'Frontend', score: 95 }, { name: 'Backend', score: 88 }, { name: 'DevOps', score: 70 }, { name: 'System Design', score: 92 }],
    streak: 14,
    projects: [
      {
        id: 'p1-1',
        title: 'Earned AI Merit Engine',
        description: 'AI-driven skill verification & recruitment platform built with React, Vite, and Grok AI API.',
        roleTag: 'Software Engineer',
        tags: ['React', 'TypeScript', 'Grok AI'],
        verifiedSkills: ['React', 'TypeScript', 'System Architecture'],
        xpEarned: 450,
        aiFeedback: 'Verified high complexity project with robust state management and Grok AI integration.',
        createdAt: Date.now() - 7 * 86400000
      }
    ],
    history: Array.from({ length: 45 }).map((_, i) => ({ id: `sub_${i}`, challengeId: 'c1', content: '', timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180, grading: null })),
    softSkills: { teamwork: 90, criticalThinking: 85, creativity: 80, pressure: 95, decisionMaking: 88, lastAssessed: Date.now() }
  },
  { 
    id: '2', 
    name: 'Sarah Jones', 
    role: 'Product Manager', 
    completedStages: 45, 
    hiringReadiness: 88, 
    earnedScore: 8800, 
    topSkills: ['User Research', 'Agile', 'Roadmapping'], 
    badges: [{ badgeId: 'adv-consistent', earnedAt: Date.now() }],
    avatar: { archetype: 'human_female', color: '#ec4899' },
    skills: [{ name: 'Strategy', score: 90 }, { name: 'Execution', score: 85 }, { name: 'Data Analysis', score: 75 }],
    streak: 7,
    projects: [
      {
        id: 'p2-1',
        title: 'Vision 2030 Talent Accelerator Roadmap',
        description: 'Product specs, GTM strategy, and cohort analytics dashboard for Saudi fintech startup.',
        roleTag: 'Product Manager',
        tags: ['Roadmapping', 'Agile', 'User Research'],
        verifiedSkills: ['Product Strategy', 'User Analytics'],
        xpEarned: 400,
        aiFeedback: 'Verified product strategy with data-driven KPI metrics.',
        createdAt: Date.now() - 10 * 86400000
      }
    ],
    history: Array.from({ length: 20 }).map((_, i) => ({ id: `sub_${i}`, challengeId: 'c2', content: '', timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180, grading: null })),
    softSkills: { teamwork: 95, criticalThinking: 92, creativity: 88, pressure: 85, decisionMaking: 90, lastAssessed: Date.now() }
  },
  { 
    id: '3', 
    name: 'Mike Ross', 
    role: 'Data Scientist', 
    completedStages: 32, 
    hiringReadiness: 85, 
    earnedScore: 8500, 
    topSkills: ['Python', 'Machine Learning', 'SQL'], 
    badges: [{ badgeId: 'int-clean', earnedAt: Date.now() }],
    avatar: { archetype: 'android', color: '#10b981' },
    skills: [{ name: 'ML', score: 85 }, { name: 'Stats', score: 88 }, { name: 'Data Viz', score: 80 }],
    streak: 3,
    projects: [
      {
        id: 'p3-1',
        title: 'Predictive Fraud Detection Pipeline',
        description: 'Real-time transaction anomaly detector using PyTorch and XGBoost on 1M+ dataset.',
        roleTag: 'Data Scientist',
        tags: ['Python', 'PyTorch', 'SQL'],
        verifiedSkills: ['Machine Learning', 'Data Pipelines'],
        xpEarned: 380,
        aiFeedback: 'Verified high-precision model architecture (98.4% AUC-ROC score).',
        createdAt: Date.now() - 12 * 86400000
      }
    ],
    history: Array.from({ length: 15 }).map((_, i) => ({ id: `sub_${i}`, challengeId: 'c3', content: '', timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180, grading: null })),
  },
  { 
    id: '4', 
    name: 'Emily Blunt', 
    role: 'UX Designer', 
    completedStages: 61, 
    hiringReadiness: 92, 
    earnedScore: 9200, 
    topSkills: ['Figma', 'Prototyping', 'Accessibility'], 
    badges: [{ badgeId: 'growth-improver', earnedAt: Date.now() }],
    avatar: { archetype: 'ethereal', color: '#8b5cf6' },
    skills: [{ name: 'UI', score: 95 }, { name: 'UX', score: 90 }, { name: 'Research', score: 85 }],
    streak: 21,
    projects: [
      {
        id: 'p4-1',
        title: 'Accessible Healthcare App Design System',
        description: 'WCAG AAA compliant mobile design system with interactive Figma prototype.',
        roleTag: 'UX Designer',
        tags: ['Figma', 'Accessibility', 'Prototyping'],
        verifiedSkills: ['Figma', 'UI Architecture'],
        xpEarned: 420,
        aiFeedback: 'Verified accessible color contrast and fluid component design.',
        createdAt: Date.now() - 5 * 86400000
      }
    ],
    history: Array.from({ length: 30 }).map((_, i) => ({ id: `sub_${i}`, challengeId: 'c4', content: '', timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180, grading: null })),
    softSkills: { teamwork: 92, criticalThinking: 88, creativity: 98, pressure: 80, decisionMaking: 85, lastAssessed: Date.now() }
  },
  { 
    id: '5', 
    name: 'David Kim', 
    role: 'DevOps Engineer', 
    completedStages: 12, 
    hiringReadiness: 72, 
    earnedScore: 7800, 
    topSkills: ['Docker', 'Kubernetes', 'CI/CD'], 
    badges: [{ badgeId: 'growth-levelup', earnedAt: Date.now() }],
    avatar: { archetype: 'human_male', color: '#f59e0b' },
    skills: [{ name: 'Infra', score: 80 }, { name: 'CI/CD', score: 75 }, { name: 'Networking', score: 65 }],
    streak: 2,
    projects: [
      {
        id: 'p5-1',
        title: 'Kubernetes Multi-Region Auto-scaler',
        description: 'Terraform and Helm infrastructure for automated cloud failover across AWS & GCP.',
        roleTag: 'DevOps Engineer',
        tags: ['Docker', 'Kubernetes', 'Terraform'],
        verifiedSkills: ['Kubernetes', 'CI/CD'],
        xpEarned: 350,
        aiFeedback: 'Verified IaC scripts with automated security scanning.',
        createdAt: Date.now() - 20 * 86400000
      }
    ],
    history: Array.from({ length: 8 }).map((_, i) => ({ id: `sub_${i}`, challengeId: 'c5', content: '', timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180, grading: null })),
  },
  {
    id: '6',
    name: 'Aisha Patel',
    role: 'AI/ML Engineer',
    completedStages: 85,
    hiringReadiness: 97,
    earnedScore: 10200,
    topSkills: ['PyTorch', 'Transformers', 'MLOps'],
    badges: [{ badgeId: 'exc-precision', earnedAt: Date.now() }, { badgeId: 'adv-consistent', earnedAt: Date.now() }],
    avatar: { archetype: 'human_female', color: '#06b6d4' },
    skills: [{ name: 'Deep Learning', score: 98 }, { name: 'MLOps', score: 90 }, { name: 'NLP', score: 95 }],
    streak: 42,
    projects: [
      {
        id: 'p6-1',
        title: 'Arabic LLM RAG & Vector Engine',
        description: 'Fine-tuned Llama-3 model for Arabic legal document retrieval using Milvus vector DB.',
        roleTag: 'AI/ML Engineer',
        tags: ['PyTorch', 'Transformers', 'RAG'],
        verifiedSkills: ['LLMs', 'Vector Databases'],
        xpEarned: 500,
        aiFeedback: 'Verified state-of-the-art Arabic NLP fine-tuning pipeline.',
        createdAt: Date.now() - 2 * 86400000
      }
    ],
    history: Array.from({ length: 60 }).map((_, i) => ({ id: `sub_${i}`, challengeId: 'c6', content: '', timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180, grading: null })),
    softSkills: { teamwork: 85, criticalThinking: 98, creativity: 90, pressure: 88, decisionMaking: 92, lastAssessed: Date.now() }
  }
];

export const CompanyDashboard: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minReadiness, setMinReadiness] = useState<number>(0);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    MOCK_CANDIDATES.forEach(c => roles.add(c.role));
    return Array.from(roles);
  }, []);

  const filteredCandidates = useMemo(() => {
    return MOCK_CANDIDATES.filter(c => {
      const matchRole = roleFilter === 'All' || c.role === roleFilter;
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.topSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchReadiness = c.hiringReadiness >= minReadiness;
      return matchRole && matchSearch && matchReadiness;
    }).sort((a, b) => b.hiringReadiness - a.hiringReadiness);
  }, [roleFilter, searchQuery, minReadiness]);

  const avgReadiness = filteredCandidates.length > 0 
    ? Math.round(filteredCandidates.reduce((acc, c) => acc + c.hiringReadiness, 0) / filteredCandidates.length)
    : 0;
  
  const representedRoles = new Set(filteredCandidates.map(c => c.role)).size;

  const getLevelInfo = (stages: number) => {
    const idx = Math.min(Math.floor(stages / 10), 9);
    return { number: idx + 1, title: LEVEL_TITLES[idx] };
  };

  const getBreakdown = (total: number, id: string) => {
    const p = Math.min(100, total + 2);
    const c = Math.min(100, Math.max(50, total - 5));
    const g = Math.min(100, Math.max(50, total + 5));
    const r = Math.min(100, Math.max(50, total - 8));
    return { p, c, g, r };
  };

  const toggleCompare = (candidateId: string) => {
    setSelectedForCompare(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId) 
        : prev.length < 3 ? [...prev, candidateId] : prev
    );
  };

  const handleExportCSV = () => {
    const candidateList = filteredCandidates.length > 0 ? filteredCandidates : MOCK_CANDIDATES;
    const csvRows = [
      ['Name', 'Role', 'Hiring Readiness', 'Streak', 'Top Skills', 'Badges Count'],
      ...candidateList.map(c => [
        `"${c.name}"`,
        `"${c.role}"`,
        c.hiringReadiness,
        c.streak,
        `"${c.topSkills.join(', ')}"`,
        c.badges.length
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kanz_candidate_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 min-h-screen relative">
      {/* Sticky App Header */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="px-4 py-6 max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <UserCheck className="text-emerald-400" /> Talent Pool
                </h1>
                <div className="flex items-center gap-2">
                  {selectedForCompare.length > 0 && (
                    <button
                      onClick={() => setShowCompareModal(true)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Layers size={14} /> Compare ({selectedForCompare.length})
                    </button>
                  )}
                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{filteredCandidates.length} candidates</span>
                <span>·</span>
                <span>Avg readiness <span className="text-white font-semibold">{avgReadiness}</span></span>
                <span>·</span>
                <span>{representedRoles} roles represented</span>
              </p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or skill..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-slate-600 transition-all"
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Horizontal Scroll Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
              <button 
                onClick={() => setRoleFilter('All')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                  roleFilter === 'All' 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                All Roles
              </button>
              {uniqueRoles.map(role => (
                <button 
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                  roleFilter === role 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto text-sm shrink-0">
              <span className="text-slate-400 text-xs font-medium">Min Readiness: {minReadiness}</span>
              <input 
                type="range" 
                min="0" max="100" 
                value={minReadiness} 
                onChange={(e) => setMinReadiness(Number(e.target.value))}
                className="accent-emerald-500 w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full space-y-6 pb-24">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
            <Target className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No candidates found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              We couldn't find anyone matching your current filters. Try adjusting the readiness score or searching for different skills.
            </p>
            <button 
              onClick={() => { setRoleFilter('All'); setSearchQuery(''); setMinReadiness(0); }}
              className="mt-6 px-6 py-2 bg-emerald-500/10 text-emerald-400 font-semibold rounded-lg hover:bg-emerald-500/20 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredCandidates.map((c) => {
            const level = getLevelInfo(c.completedStages);
            const breakdown = getBreakdown(c.hiringReadiness, c.id);
            const recentBadgeName = c.badges.length > 0 
              ? (BADGE_DEFINITIONS[c.badges[0].badgeId]?.name || 'Unknown') 
              : 'None';
            
            return (
              <div key={c.id} className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 active:scale-[0.99] transition-all hover:border-slate-700 relative overflow-visible group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <PixelAvatar config={c.avatar} size={56} className="ring-2 ring-slate-800 group-hover:ring-emerald-500/30 transition-all" />
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-white text-xl tracking-tight">{c.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {c.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-1.5 font-medium">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-pulse" />
                          Level {level.number} · {level.title}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1 text-orange-400" title={`${c.streak} day streak`}>
                          <Flame size={14} className={c.streak > 10 ? 'animate-pulse text-orange-500' : ''} /> {c.streak} days
                        </span>
                        {c.badges.length > 0 && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1 text-amber-400">
                              <Award size={14}/> {c.badges.length} Badge{c.badges.length > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Readiness Score Badge */}
                  <div className="group/tooltip relative flex flex-col items-end cursor-help w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Readiness</span>
                      <Target size={14} className={c.hiringReadiness > 80 ? 'text-emerald-500' : 'text-slate-500'} />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="text-2xl font-black text-white min-w-[2rem] text-right">{c.hiringReadiness}</div>
                      <div className="w-full md:w-32 h-2 bg-slate-800 rounded-full overflow-hidden ring-1 ring-slate-800 group-hover/tooltip:ring-emerald-500/50 transition-all">
                        <div 
                          className={`h-full transition-all duration-700 ${c.hiringReadiness > 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-yellow-600 to-yellow-400'}`} 
                          style={{ width: `${c.hiringReadiness}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Floating Tooltip - Works on hover (desktop) and active (mobile) */}
                    <div className="absolute right-0 top-full mt-4 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl p-5 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-active/tooltip:opacity-100 group-active/tooltip:visible transition-all duration-200 z-50 translate-y-2 group-hover/tooltip:translate-y-0 pointer-events-none">
                        <div className="flex items-end justify-between mb-5 border-b border-slate-800 pb-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Composite Score</span>
                            <span className="text-white font-bold text-sm">Hiring Readiness</span>
                          </div>
                          <div className="text-4xl font-black text-emerald-400 leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            {c.hiringReadiness}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <BreakdownItem label="Performance" weight={40} value={breakdown.p} color="bg-emerald-500" />
                          <BreakdownItem label="Consistency" weight={30} value={breakdown.c} color="bg-blue-500" />
                          <BreakdownItem label="Growth" weight={20} value={breakdown.g} color="bg-purple-500" />
                          <BreakdownItem label="Reputation" weight={10} value={breakdown.r} color="bg-amber-500" />
                        </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {c.topSkills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-slate-800/50 rounded-lg text-xs text-slate-300 font-medium border border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-800">
                    <Award size={14} className="text-amber-400" />
                    <span>Recent Badge: <span className="text-slate-300">{recentBadgeName}</span></span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => toggleCompare(c.id)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedForCompare.includes(c.id)
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <CheckSquare size={14} /> {selectedForCompare.includes(c.id) ? 'Selected' : 'Compare'}
                    </button>
                    <button 
                      onClick={() => setSelectedCandidate(c)}
                      className="px-5 py-2.5 bg-white text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-400 hover:text-slate-950 transition-colors shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      View Profile <ChevronRight size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slide-over Panel */}
      {selectedCandidate && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setSelectedCandidate(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-8">
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <button className="px-6 py-2.5 bg-emerald-500 text-slate-950 text-sm font-black uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  Invite to Challenge
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-8">
                <PixelAvatar config={selectedCandidate.avatar} size={96} className="ring-4 ring-slate-800 mb-4" />
                <h2 className="text-3xl font-black text-white tracking-tight">{selectedCandidate.name}</h2>
                <p className="text-slate-400 font-medium mt-1 mb-3">{selectedCandidate.role}</p>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400">Level {getLevelInfo(selectedCandidate.completedStages).number} · {getLevelInfo(selectedCandidate.completedStages).title}</span>
                </div>
              </div>

              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Readiness Score</span>
                    <span className="text-2xl font-black text-emerald-400">{selectedCandidate.hiringReadiness}</span>
                  </div>
                  <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Active Streak</span>
                    <span className="text-2xl font-black text-orange-400 flex items-center gap-2">
                      <Flame size={20} /> {selectedCandidate.streak}
                    </span>
                  </div>
                </div>

                {/* Radar Chart */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Skill Profile</h3>
                  <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <SkillRadarChart data={selectedCandidate.skills.map(s => ({ name: s.name, score: s.score, fullMark: 100 }))} />
                  </div>
                </div>

                {/* Contribution Graph */}
                <div>
                  <ContributionGraph submissions={selectedCandidate.history} />
                </div>

                {/* Badges */}
                {selectedCandidate.badges.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Earned Badges</h3>
                    <div className="flex flex-wrap gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      {selectedCandidate.badges.map((b, i) => (
                        <BadgeDisplay key={i} badge={b} size="lg" showLabel />
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {selectedCandidate.softSkills && (
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between">
                      <span>Soft Skills</span>
                      <span className="text-[10px] text-slate-500 normal-case font-normal">Assessed {new Date(selectedCandidate.softSkills.lastAssessed).toLocaleDateString()}</span>
                    </h3>
                    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                      <BreakdownItem label="Teamwork" weight={20} value={selectedCandidate.softSkills.teamwork} color="bg-indigo-500" />
                      <BreakdownItem label="Critical Thinking" weight={20} value={selectedCandidate.softSkills.criticalThinking} color="bg-indigo-500" />
                      <BreakdownItem label="Creativity" weight={20} value={selectedCandidate.softSkills.creativity} color="bg-indigo-500" />
                      <BreakdownItem label="Working Under Pressure" weight={20} value={selectedCandidate.softSkills.pressure} color="bg-indigo-500" />
                      <BreakdownItem label="Decision Making" weight={20} value={selectedCandidate.softSkills.decisionMaking} color="bg-indigo-500" />
                    </div>
                  </div>
                )}

                {/* Verified Portfolio Projects */}
                {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between">
                      <span>Verified Portfolio Projects</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Grok AI Verified</span>
                    </h3>
                    <div className="space-y-3">
                      {selectedCandidate.projects.map((proj) => (
                        <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                              +{proj.xpEarned} XP
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
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
                    </div>
                  </div>
                )}
              </div>
              <div className="h-20" /> {/* Spacer */}
            </div>
          </div>
        </>
      )}

      {/* SIDE-BY-SIDE CANDIDATE COMPARISON MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Side-by-Side Candidate Comparison</h3>
                  <p className="text-xs text-slate-400">Compare hiring readiness, RAG rubric metrics, and soft skills</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Download size={14} /> Export Report (CSV)
                </button>
                <button onClick={() => setShowCompareModal(false)} className="text-slate-500 hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Comparison Columns Grid */}
            <div className="p-6 overflow-y-auto overflow-x-auto flex-1">
              <div className={`grid gap-6 ${selectedForCompare.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {selectedForCompare.map((cId) => {
                  const candidate = MOCK_CANDIDATES.find(c => c.id === cId) || filteredCandidates.find(c => c.id === cId);
                  if (!candidate) return null;

                  return (
                    <div key={candidate.id} className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-6 flex flex-col justify-between">
                      {/* Candidate Header */}
                      <div className="text-center space-y-2 pb-4 border-b border-slate-800/80">
                        <PixelAvatar config={candidate.avatar} size={72} className="mx-auto border-2 border-emerald-500/30" />
                        <h4 className="font-black text-white text-lg">{candidate.name}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 border border-slate-700 inline-block">
                          {candidate.role}
                        </span>
                      </div>

                      {/* Metrics List */}
                      <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-400">Hiring Readiness</span>
                            <span className="text-emerald-400 font-mono">{candidate.hiringReadiness}/100</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${candidate.hiringReadiness}%` }} />
                          </div>
                        </div>

                        <div className="flex justify-between py-2 border-b border-slate-800/60">
                          <span className="text-slate-400 font-medium">Flame Streak</span>
                          <span className="font-bold text-orange-400 font-mono flex items-center gap-1">
                            <Flame size={12} /> {candidate.streak} Days
                          </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-slate-800/60">
                          <span className="text-slate-400 font-medium">Earned Score</span>
                          <span className="font-bold text-blue-400 font-mono">{candidate.earnedScore}/100</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-slate-800/60">
                          <span className="text-slate-400 font-medium">Badges Earned</span>
                          <span className="font-bold text-amber-400 font-mono">{candidate.badges.length} Badges</span>
                        </div>

                        {/* Top Skills Tags */}
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Top Skills</span>
                          <div className="flex flex-wrap gap-1">
                            {candidate.topSkills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded text-[10px] font-mono border border-slate-800">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Soft Skills Breakdown */}
                        {candidate.softSkills && (
                          <div className="space-y-2 pt-2 border-t border-slate-800/60">
                            <span className="text-[10px] uppercase font-bold text-indigo-400 block">Soft Skills Assessment</span>
                            <div className="space-y-1 text-[11px]">
                              <div className="flex justify-between"><span className="text-slate-400">Teamwork</span><span className="font-mono text-slate-200">{candidate.softSkills.teamwork}/100</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">Critical Thinking</span><span className="font-mono text-slate-200">{candidate.softSkills.criticalThinking}/100</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">Creativity</span><span className="font-mono text-slate-200">{candidate.softSkills.creativity}/100</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">Decision Making</span><span className="font-mono text-slate-200">{candidate.softSkills.decisionMaking}/100</span></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          setShowCompareModal(false);
                          setSelectedCandidate(candidate);
                        }}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/20"
                      >
                        View Full Candidate Profile
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BreakdownItem = ({ label, weight, value, color }: { label: string, weight: number, value: number, color: string }) => (
  <div className="space-y-1.5">
     <div className="flex justify-between text-[10px] items-center">
        <span className="text-slate-400 font-bold tracking-wide uppercase">{label}</span>
        <span className="text-white font-bold">{value}/100</span>
     </div>
     <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
     </div>
  </div>
);
