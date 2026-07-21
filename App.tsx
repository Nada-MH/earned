import React, { useState, useEffect } from 'react';
import { Layout, AppView } from './components/Layout';
import { TalentDashboard } from './components/TalentDashboard';
import { CompanyDashboard } from './components/CompanyDashboard';
import { CompanyAuth } from './components/CompanyAuth';
import { CompanyJobs } from './components/CompanyJobs';
import { MessagesView } from './components/MessagesView';
import { PublicProfile } from './components/PublicProfile';
import { TalentFeed } from './components/TalentFeed';
import { Landing } from './components/Landing';
import { TalentAuth } from './components/TalentAuth';
import { UserProfile, CompanyProfile, JobPosting, AIInterviewRequest, DirectMessage, Submission, InterviewAnswer, GradingResult, Candidate } from './types';
import { SettingsProvider } from './contexts/SettingsContext';
import { generateSkillTree } from './services/geminiService';
import { db } from './services/dbService';
import { Loader2 } from 'lucide-react';

// Helper to generate mock history for demo user
const generateMockHistory = (): Submission[] => {
  const history: Submission[] = [];
  const now = Date.now();
  const dayMs = 86400000;
  for (let i = 0; i < 80; i++) {
     const daysAgo = Math.floor(Math.pow(Math.random(), 0.5) * 180);
     history.push({
       id: `hist-${i}`,
       challengeId: 'mock',
       content: 'mock solution',
       timestamp: now - (daysAgo * dayMs),
       grading: { 
         score: 80 + Math.floor(Math.random() * 20), 
         feedbackSummary: 'Good solid work on this challenge.', 
         strengths: ['Clean code structure'], 
         weaknesses: [], 
         actionableTips: [] 
        }
     });
  }
  return history.sort((a, b) => b.timestamp - a.timestamp);
};

const MOCK_DATA_TEMPLATE: Partial<UserProfile> = {
  streak: 5,
  badges: [],
  skills: [
    { name: "Frontend", score: 85 },
    { name: "Backend", score: 78 },
    { name: "System Architecture", score: 82 }
  ],
  followers: 128,
  following: 45,
  portfolioUrl: 'https://github.com/demo-user',
  skillTree: [],
  history: []
};

// Initial Mock Jobs
const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'job-1',
    companyId: 'company-demo',
    companyName: 'Apex Tech Labs',
    title: 'Senior Full Stack Engineer',
    location: 'Remote',
    type: 'Full-time',
    salaryRange: '$140,000 - $180,000',
    description: 'We are hiring a Senior Full Stack Engineer to build next-gen AI platform tools.',
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'System Architecture'],
    status: 'Open',
    createdAt: Date.now() - 7 * 86400000,
    applicantsCount: 12,
    interviewsSentCount: 3
  },
  {
    id: 'job-2',
    companyId: 'company-demo',
    companyName: 'Apex Tech Labs',
    title: 'AI/ML Product Manager',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    salaryRange: '$160,000 - $210,000',
    description: 'Lead AI product strategy and model evaluation workflows.',
    requiredSkills: ['Product Strategy', 'LLM Architectures', 'Data Analytics'],
    status: 'Open',
    createdAt: Date.now() - 14 * 86400000,
    applicantsCount: 8,
    interviewsSentCount: 2
  }
];

// Initial Mock Candidates for Recruiter Jobs Tracker
const INITIAL_CANDIDATES: Candidate[] = [
  { 
    id: 'c1', 
    name: 'Alex Chen', 
    role: 'Software Engineer', 
    completedStages: 18, 
    hiringReadiness: 94, 
    earnedScore: 92, 
    topSkills: ['React', 'TypeScript', 'Node.js'], 
    badges: [{ badgeId: 'growth-10', earnedAt: Date.now() - 86400000 }],
    avatar: { archetype: 'human_male', color: '#10b981' },
    skills: [{ name: 'React', score: 95 }, { name: 'TypeScript', score: 92 }],
    streak: 12,
    history: []
  },
  { 
    id: 'c2', 
    name: 'Elena Rostova', 
    role: 'AI/ML Engineer', 
    completedStages: 24, 
    hiringReadiness: 88, 
    earnedScore: 88, 
    topSkills: ['Python', 'PyTorch', 'System Architecture'], 
    badges: [{ badgeId: 'exc-100', earnedAt: Date.now() - 2 * 86400000 }],
    avatar: { archetype: 'human_female', color: '#8b5cf6' },
    skills: [{ name: 'Python', score: 92 }, { name: 'PyTorch', score: 90 }],
    streak: 8,
    history: []
  },
  { 
    id: 'c3', 
    name: 'Marcus Vance', 
    role: 'Product Manager', 
    completedStages: 12, 
    hiringReadiness: 81, 
    earnedScore: 84, 
    topSkills: ['Product Strategy', 'Roadmapping', 'UX Research'], 
    badges: [{ badgeId: 'cons-7', earnedAt: Date.now() - 5 * 86400000 }],
    avatar: { archetype: 'android', color: '#3b82f6' },
    skills: [{ name: 'Product Strategy', score: 85 }],
    streak: 5,
    history: []
  }
];

// Initial Mock Interview Invites
const INITIAL_INTERVIEWS: AIInterviewRequest[] = [
  {
    id: 'req-101',
    jobId: 'job-1',
    jobTitle: 'Senior Full Stack Engineer',
    companyId: 'company-demo',
    companyName: 'Apex Tech Labs',
    candidateId: 'demo-talent',
    candidateName: 'Demo Talent Candidate',
    candidateAvatar: { archetype: 'human_male', color: '#10b981' },
    status: 'Pending',
    sentAt: Date.now() - 3600000,
    questions: [
      { id: 'q1', question: 'How do you design scalable state management for large React applications?', category: 'Technical', recommendedDurationSeconds: 120 },
      { id: 'q2', question: 'Walk us through how you diagnose and fix a memory leak or CPU bottleneck in Node.js production code.', category: 'Problem Solving', recommendedDurationSeconds: 120 },
      { id: 'q3', question: 'Describe a time you led an urgent technical trade-off decision under tight deadlines.', category: 'Behavioral', recommendedDurationSeconds: 90 }
    ]
  }
];

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  
  // Account States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [companyUser, setCompanyUser] = useState<CompanyProfile | null>(null);
  const [isGeneratingTree, setIsGeneratingTree] = useState(false);

  // App Shared State — Initialized from LocalStorage Database
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [interviewRequests, setInterviewRequests] = useState<AIInterviewRequest[]>(() => {
    const loaded = db.getInterviews();
    return loaded.length > 0 ? loaded : INITIAL_INTERVIEWS;
  });
  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    return db.getMessages();
  });

  // Sync User Changes to LocalStorage DB
  useEffect(() => {
    if (user) {
      db.saveUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (companyUser) {
      db.saveCompany(companyUser);
    }
  }, [companyUser]);

  useEffect(() => {
    if (!process.env.API_KEY) {
      console.warn("Warning: API_KEY is not set. Gemini AI features will use safe fallback handlers.");
    }
  }, []);

  const handleGetStarted = (role: 'talent' | 'company') => {
    if (role === 'talent') {
      setCurrentView('auth');
    } else {
      setCurrentView('company-auth');
    }
  };

  const handleTalentAuthComplete = async (profile: UserProfile) => {
    setIsGeneratingTree(true);

    try {
      const isDemo = profile.name === "Demo User";
      const mockHistory = isDemo ? generateMockHistory() : [];
      const newSkillTree = await generateSkillTree(profile.role, 1);

      const fullProfile: UserProfile = {
          ...MOCK_DATA_TEMPLATE,
          ...profile,
          id: isDemo ? 'demo-talent' : `talent-${Date.now()}`,
          joinedAt: profile.joinedAt || Date.now(),
          history: mockHistory,
          skillTree: newSkillTree, 
          followers: MOCK_DATA_TEMPLATE.followers || 0,
          following: MOCK_DATA_TEMPLATE.following || 0,
          portfolioUrl: MOCK_DATA_TEMPLATE.portfolioUrl,
          completedStages: mockHistory.length + (newSkillTree.filter(n => n.status === 'completed').length || 0),
          hiringReadiness: isDemo ? 88 : 10
      };
      
      setUser(fullProfile);
      setCompanyUser(null);
      setCurrentView('talent-dashboard');
    } catch (e) {
      console.error("Failed to generate skill tree", e);
    } finally {
      setIsGeneratingTree(false);
    }
  };

  const handleCompanyAuthComplete = (company: CompanyProfile) => {
    setCompanyUser(company);
    setUser(null);
    setCurrentView('company-pool');
  };

  const handleLogout = () => {
    setUser(null);
    setCompanyUser(null);
    setCurrentView('landing');
  };

  // Job & Interview Handlers
  const handleCreateJob = (newJob: JobPosting) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const handleSendInterview = (req: AIInterviewRequest) => {
    db.saveInterview(req);
    setInterviewRequests(prev => [req, ...prev]);
    // Also send an automated direct message notification
    const autoMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: req.companyId,
      senderName: req.companyName,
      senderRole: 'recruiter',
      receiverId: req.candidateId,
      subject: `AI Video Interview Request: ${req.jobTitle}`,
      body: `Hi ${req.candidateName}, ${req.companyName} has invited you to take an automated 3-question Grok AI Video Interview for the ${req.jobTitle} position. Please check your Mailbox tab!`,
      timestamp: Date.now(),
      isRead: false,
      interviewRequestId: req.id
    };
    db.saveMessage(autoMsg);
    setMessages(prev => [autoMsg, ...prev]);
  };

  const handleCompleteInterview = (requestId: string, answers: InterviewAnswer[], grading: GradingResult) => {
    setInterviewRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const updated = {
          ...r,
          status: 'Completed' as const,
          completedAt: Date.now(),
          answers,
          grading
        };
        db.saveInterview(updated);
        return updated;
      }
      return r;
    }));

    // If active logged in user completed it, boost their hiring readiness score
    if (user) {
      setUser(prev => prev ? {
        ...prev,
        hiringReadiness: Math.min(100, Math.max(prev.hiringReadiness, grading.score)),
        completedStages: prev.completedStages + 1
      } : null);
    }
  };

  const handleSendMessage = (msg: DirectMessage) => {
    db.saveMessage(msg);
    setMessages(prev => [msg, ...prev]);
  };

  const unreadCount = messages.filter(m => !m.isRead).length + interviewRequests.filter(r => r.status === 'Pending').length;

  return (
    <>
      {isGeneratingTree && (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white">Generating your career map...</h2>
          <p className="text-slate-400 mt-2">AI is customizing a skill tree for your major.</p>
        </div>
      )}

      <Layout 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        user={user || undefined}
        companyUser={companyUser || undefined}
        onLogout={handleLogout}
        unreadMessagesCount={unreadCount}
      >
        {currentView === 'landing' && (
          <Landing onGetStarted={handleGetStarted} />
        )}

        {currentView === 'auth' && (
          <TalentAuth 
            onComplete={handleTalentAuthComplete} 
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'company-auth' && (
          <CompanyAuth
            onComplete={handleCompanyAuthComplete}
            onBack={() => setCurrentView('landing')}
          />
        )}
        
        {currentView === 'talent-dashboard' && user && (
          <TalentDashboard 
            user={user} 
            onUpdateUser={setUser} 
          />
        )}

        {currentView === 'talent-profile' && user && (
          <PublicProfile user={user} isOwner={true} />
        )}

        {currentView === 'talent-feed' && (
          <TalentFeed user={user || undefined} />
        )}

        {currentView === 'messages' && (
          <MessagesView
            user={user || undefined}
            companyUser={companyUser || undefined}
            interviewRequests={interviewRequests}
            messages={messages}
            onCompleteInterview={handleCompleteInterview}
            onSendMessage={handleSendMessage}
          />
        )}
        
        {currentView === 'company-pool' && (
          <CompanyDashboard />
        )}

        {currentView === 'company-jobs' && companyUser && (
          <CompanyJobs
            company={companyUser}
            jobs={jobs}
            candidates={candidates}
            interviewRequests={interviewRequests}
            onCreateJob={handleCreateJob}
            onSendInterview={handleSendInterview}
            onUpdateJobStatus={(jobId, status) => setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j))}
          />
        )}
      </Layout>
    </>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
