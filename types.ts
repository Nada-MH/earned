// Roles are now free-text strings — no fixed enum.
// Users type their major/field (e.g., "Mechanical Engineer", "Graphic Designer", etc.)
// The AI generates a custom skill tree for that field.

// Challenge difficulty remains separate from user level
export enum SkillLevel {
  ENTRY = 'Entry',
  INTERMEDIATE = 'Intermediate',
  SENIOR = 'Senior',
  PRINCIPAL = 'Principal'
}

export enum MasteryLevel {
  NOVICE = 'Novice',
  PRO = 'Pro',
  EXPERT = 'Expert'
}

export const LEVEL_TITLES = [
  'Initiate',            // Level 1
  'Contributor',         // Level 2
  'Practitioner',        // Level 3
  'Specialist',          // Level 4
  'Professional',        // Level 5
  'Senior Professional', // Level 6
  'Expert',              // Level 7
  'Lead',                // Level 8
  'Principal',           // Level 9
  'Elite'                // Level 10
] as const;

export type SkillStatus = 'locked' | 'available' | 'completed';

export interface ProjectProof {
  title: string;
  description: string;
  verified: boolean;
  feedback?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  level: MasteryLevel;
  status: SkillStatus;
  tier: number; // 0 = Root, 1 = Branch, 2 = Deep, 3 = Advanced
  parentId?: string;
  description: string;
  proof?: ProjectProof;
  unlockLevel?: number; // Min user level to unlock this node (for progressive reveal)
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: SkillLevel;
  role: string; // Free-text role/major
  timeLimitMinutes: number;
  criteria: string[];
  xpReward: number;
  type?: 'daily' | 'skill_quest';
  targetSkill?: string;
}

// --- RAG EVALUATOR RUBRIC TYPES ---

export interface CategoryScore {
  category: 'Technical Accuracy & Depth' | 'Architectural & Trade-off Reasoning' | 'Metric & Quantitative Evidence' | 'Edge Cases & Error Handling';
  score: number; // 0-100
  weight: number; // e.g. 0.40, 0.30, 0.20, 0.10
  feedback: string;
}

export interface GradingResult {
  score: number; // 0-100 Composite
  feedbackSummary: string;
  categoryBreakdown?: CategoryScore[];
  ragBenchmarkMatch?: string; // Standard or pattern retrieved from RAG repository
  strengths: string[];
  weaknesses: string[];
  actionableTips: string[];
}

export interface Submission {
  id: string;
  challengeId: string;
  content: string;
  timestamp: number;
  grading: GradingResult | null;
}

export interface AvatarConfig {
  archetype: 'human_male' | 'human_female' | 'android' | 'ethereal';
  color: string;
  customAvatar?: string; // Data URL for user-drawn 32x32 pixel art
}

// --- PORTFOLIO PROJECT TYPES ---

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  roleTag: string;
  tags: string[];
  projectUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  verifiedSkills: string[];
  xpEarned: number;
  aiFeedback?: string;
  createdAt: number;
}

// --- BADGE SYSTEM TYPES ---

export type BadgeCategory = 'Consistency' | 'Excellence' | 'Growth' | 'Integrity' | 'Collaboration' | 'Soft Skills';
export type BadgeRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type BadgeIconName = 
  | 'Users' | 'Brain' | 'Lightbulb' | 'Thermometer' | 'Gavel' | 'Scale'
  | 'CalendarClock' | 'CalendarCheck' | 'CalendarRange' | 'Infinity' | 'RefreshCcw'
  | 'Target' | 'Star' | 'Crosshair' | 'TrendingUp' | 'Zap' | 'ArrowUpCircle'
  | 'ShieldAlert' | 'FileCheck' | 'Handshake' | 'Radio' | 'MessageSquare'
  | 'Clock' | 'ShieldCheck' | 'Activity' | 'Gauge' | 'Crown' | 'Award';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string; // User facing flavor text
  criteria: string;    // Recruiter facing strict requirements
  category: BadgeCategory;
  rarity: BadgeRarity;
  icon: BadgeIconName;
}

export interface UserBadge {
  badgeId: string;
  earnedAt: number;
}

export interface SoftSkillsProfile {
  teamwork: number;
  criticalThinking: number;
  creativity: number;
  pressure: number;
  decisionMaking: number;
  lastAssessed: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string; // Free-text major/field
  completedStages: number; 
  hiringReadiness: number; // 0-100 Score
  avatar: AvatarConfig;
  xp: number;
  streak: number;
  badges: UserBadge[]; 
  skills: { name: string; score: number }[];
  skillTree: SkillNode[];
  projects?: PortfolioProject[];
  history: Submission[];
  followers: number;
  following: number;
  portfolioUrl?: string;
  softSkills?: SoftSkillsProfile;
  joinedAt?: number; // Timestamp of when the user joined
}

export interface Candidate {
  id: string;
  name: string;
  role: string; // Free-text major/field
  completedStages: number;
  hiringReadiness: number;
  earnedScore: number;
  topSkills: string[];
  badges: UserBadge[];
  avatar: AvatarConfig;
  skills: { name: string; score: number }[];
  projects?: PortfolioProject[];
  streak: number;
  history: Submission[];
  softSkills?: SoftSkillsProfile;
}

// --- RECRUITER & COMPANY TYPES ---

export interface CompanyProfile {
  id: string;
  companyName: string;
  recruiterName: string;
  workEmail: string;
  password?: string;
  industry: string;
  avatar: AvatarConfig;
  joinedAt: number;
}

export type JobStatus = 'Open' | 'Filled' | 'Paused';

export interface JobPosting {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salaryRange: string;
  description: string;
  requiredSkills: string[];
  status: JobStatus;
  createdAt: number;
  applicantsCount: number;
  interviewsSentCount: number;
}

export type InterviewStatus = 'Pending' | 'Completed' | 'Declined';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'Technical' | 'Behavioral' | 'Problem Solving';
  recommendedDurationSeconds: number;
}

export interface InterviewAnswer {
  questionId: string;
  transcript: string;
  mode: 'text' | 'video';
  videoDataUrl?: string;
}

export interface AIInterviewRequest {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: AvatarConfig;
  status: InterviewStatus;
  sentAt: number;
  completedAt?: number;
  questions: InterviewQuestion[];
  answers?: InterviewAnswer[];
  grading?: GradingResult;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'talent' | 'recruiter';
  receiverId: string;
  subject: string;
  body: string;
  timestamp: number;
  isRead: boolean;
  interviewRequestId?: string;
}

// --- SETTINGS TYPES ---

export type AppTheme = 'dark' | 'light';
export type AppLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ar';

export interface AppSettings {
  theme: AppTheme;
  language: AppLanguage;
}

// --- ROLE SUGGESTIONS ---
export const ROLE_SUGGESTIONS = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Sales Representative',
  'Graphic Designer',
  'Mechanical Engineer',
  'Marketing Strategist',
  'Financial Analyst',
  'DevOps Engineer',
  'Cybersecurity Analyst',
  'AI/ML Engineer',
  'Full Stack Developer',
  'Mobile Developer',
  'Game Developer',
  'Cloud Architect',
  'Business Analyst',
  'Content Creator',
  'Project Manager',
  'QA Engineer',
] as const;
