import { UserProfile, CompanyProfile, JobPosting, AIInterviewRequest, DirectMessage, Candidate, PortfolioProject } from '../types';

const STORAGE_KEYS = {
  USERS: 'earned_db_users',
  COMPANIES: 'earned_db_companies',
  JOBS: 'earned_db_jobs',
  INTERVIEWS: 'earned_db_interviews',
  MESSAGES: 'earned_db_messages',
  CURRENT_USER_ID: 'earned_db_current_user_id',
  CURRENT_COMPANY_ID: 'earned_db_current_company_id'
};

/**
 * Local Storage Database Service for Auth & Platform Persistence
 */
class DatabaseService {
  
  // --- USERS / TALENT ---
  getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => (u.id && u.id === user.id) || u.email.toLowerCase() === user.email.toLowerCase());
    
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  findUserByEmail(email: string): UserProfile | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // --- COMPANIES / RECRUITERS ---
  getCompanies(): CompanyProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCompany(company: CompanyProfile): void {
    const companies = this.getCompanies();
    const existingIndex = companies.findIndex(c => (c.id && c.id === company.id) || c.workEmail.toLowerCase() === company.workEmail.toLowerCase());
    
    if (existingIndex >= 0) {
      companies[existingIndex] = { ...companies[existingIndex], ...company };
    } else {
      companies.push(company);
    }

    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }

  findCompanyByEmail(email: string): CompanyProfile | undefined {
    return this.getCompanies().find(c => c.workEmail.toLowerCase() === email.toLowerCase());
  }

  // --- JOBS ---
  getJobs(): JobPosting[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOBS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveJob(job: JobPosting): void {
    const jobs = this.getJobs();
    const existingIndex = jobs.findIndex(j => j.id === job.id);
    if (existingIndex >= 0) {
      jobs[existingIndex] = job;
    } else {
      jobs.unshift(job);
    }
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }

  // --- INTERVIEWS ---
  getInterviews(): AIInterviewRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveInterview(request: AIInterviewRequest): void {
    const interviews = this.getInterviews();
    const existingIndex = interviews.findIndex(i => i.id === request.id);
    if (existingIndex >= 0) {
      interviews[existingIndex] = request;
    } else {
      interviews.unshift(request);
    }
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
  }

  // --- MESSAGES ---
  getMessages(): DirectMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveMessage(msg: DirectMessage): void {
    const messages = this.getMessages();
    messages.unshift(msg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }

  // --- SEED INITIAL DEMO DATA FOR HACKATHON JUDGES ---
  seedDatabaseIfEmpty(): void {
    if (this.getUsers().length === 0) {
      const demoUser: UserProfile = {
        id: 'demo-talent',
        name: 'Alex Chen',
        email: 'demo@example.com',
        password: 'password',
        role: 'Software Engineer',
        completedStages: 78,
        hiringReadiness: 94,
        avatar: { archetype: 'human_male', color: '#3b82f6' },
        xp: 9400,
        streak: 14,
        badges: [
          { badgeId: 'exc-precision', earnedAt: Date.now() - 86400000 },
          { badgeId: 'adv-consistent', earnedAt: Date.now() - 3 * 86400000 }
        ],
        skills: [
          { name: 'React', score: 95 },
          { name: 'System Design', score: 92 },
          { name: 'Node.js', score: 88 },
          { name: 'TypeScript', score: 94 }
        ],
        skillTree: [
          { id: 'f-1', name: 'Software Foundations', description: 'Core principles & algorithms', tier: 0, status: 'completed', level: 'Pro' as any, unlockLevel: 1 },
          { id: 'b-1', name: 'Frontend Architecture', parentId: 'f-1', description: 'React 18 & UI Micro-frontends', tier: 1, status: 'completed', level: 'Master' as any, unlockLevel: 1 },
          { id: 'b-2', name: 'Backend Systems', parentId: 'f-1', description: 'Node.js & Distributed DBs', tier: 1, status: 'completed', level: 'Expert' as any, unlockLevel: 1 }
        ],
        projects: [
          {
            id: 'proj-1',
            title: 'Earned AI Merit Engine',
            description: 'AI-driven skill verification & recruitment platform built with React, Vite, and xAI Grok API.',
            roleTag: 'Software Engineer',
            tags: ['React', 'TypeScript', 'Grok AI', 'TailwindCSS'],
            verifiedSkills: ['React', 'TypeScript', 'System Architecture'],
            xpEarned: 450,
            aiFeedback: 'Verified high complexity project with robust state management and Grok AI integration.',
            createdAt: Date.now() - 7 * 86400000
          },
          {
            id: 'proj-2',
            title: 'High-Throughput Microservice Gateway',
            description: 'Event-driven API gateway with distributed caching and zero-downtime deployment pipelines.',
            roleTag: 'Software Engineer',
            tags: ['Node.js', 'Redis', 'Docker', 'GraphQL'],
            verifiedSkills: ['Node.js', 'System Design'],
            xpEarned: 400,
            aiFeedback: 'Verified scalable backend architecture with fault-tolerant circuit breaker patterns.',
            createdAt: Date.now() - 14 * 86400000
          }
        ],
        history: Array.from({ length: 45 }).map((_, i) => ({ id: `sub_${i}`, challengeId: 'c1', content: '', timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180, grading: null })),
        softSkills: { teamwork: 90, criticalThinking: 85, creativity: 80, pressure: 95, decisionMaking: 88, lastAssessed: Date.now() },
        followers: 124,
        following: 45,
        joinedAt: Date.now() - 30 * 86400000
      };
      this.saveUser(demoUser);
    }

    if (this.getCompanies().length === 0) {
      const demoCompany: CompanyProfile = {
        id: 'company-demo',
        companyName: 'Apex Tech Labs',
        recruiterName: 'Sarah Jenkins',
        workEmail: 'sarah.j@apextech.io',
        password: 'password',
        industry: 'Software & SaaS',
        avatar: { archetype: 'android', color: '#10b981' },
        joinedAt: Date.now() - 30 * 86400000
      };
      this.saveCompany(demoCompany);
    }

    // Seed Completed AI Video Interviews
    if (this.getInterviews().length === 0) {
      const mockInterviews: AIInterviewRequest[] = [
        {
          id: 'int-demo-1',
          companyId: 'company-demo',
          companyName: 'Apex Tech Labs',
          candidateId: 'demo-talent',
          jobTitle: 'Senior Full Stack Architect',
          status: 'Completed',
          sentAt: Date.now() - 2 * 86400000,
          completedAt: Date.now() - 86400000,
          questions: [
            {
              id: 'q1',
              text: 'How do you design a high-throughput API gateway to handle 100,000 requests per second under peak load?',
              category: 'Technical Depth',
              expectedKeywords: ['rate limiting', 'caching', 'load balancer', 'redis']
            },
            {
              id: 'q2',
              text: 'Describe a time you resolved a major production concurrency bug under pressure.',
              category: 'Soft Skills',
              expectedKeywords: ['post-mortem', 'monitoring', 'communication', 'root cause']
            }
          ],
          answers: [
            {
              questionId: 'q1',
              answerText: 'I would deploy a multi-region NGINX load balancer with Redis cluster caching for sub-millisecond responses. I implement token-bucket rate limiting at the gateway level, coupled with asynchronous queue processing using RabbitMQ for non-blocking I/O.',
              durationSeconds: 85
            },
            {
              questionId: 'q2',
              answerText: 'During a Black Friday spike, a race condition caused DB locks. I isolated the deadlocked transactions, added pessimistic locking with quick timeouts, communicated updates to leadership every 15 minutes, and published a full post-mortem with automated regression tests.',
              durationSeconds: 110
            }
          ],
          grading: {
            score: 94,
            categoryScores: { technicalDepth: 96, architecture: 94, metricEvidence: 92, edgeCases: 90 },
            feedbackSummary: 'Exceptional architectural response. Candidate demonstrates deep hands-on expertise in distributed systems, load balancing, and calm incident leadership under high stress.',
            strengths: ['Clear distributed system design rationale', 'Data-backed incident recovery strategy'],
            improvements: ['Could elaborate further on canary deployment safety gates']
          }
        },
        {
          id: 'int-demo-2',
          companyId: 'company-demo',
          companyName: 'Aramco Digital',
          candidateId: 'demo-talent',
          jobTitle: 'Lead AI & Fullstack Specialist',
          status: 'Completed',
          sentAt: Date.now() - 5 * 86400000,
          completedAt: Date.now() - 3 * 86400000,
          questions: [
            {
              id: 'q3',
              text: 'Explain how you integrate LLM vector search with structured SQL databases in a hybrid RAG pipeline.',
              category: 'Architecture',
              expectedKeywords: ['embeddings', 'vector database', 'pgvector', 'RAG']
            }
          ],
          answers: [
            {
              questionId: 'q3',
              answerText: 'I combine pgvector inside PostgreSQL for unified relational and embedding queries, utilizing cosine distance indexes (HNSW) for sub-10ms similarity retrieval before passing augmented context to Grok AI.',
              durationSeconds: 90
            }
          ],
          grading: {
            score: 96,
            categoryScores: { technicalDepth: 98, architecture: 96, metricEvidence: 95, edgeCases: 94 },
            feedbackSummary: 'Top tier AI RAG architectural answer. Candidate demonstrates practical mastery of vector embeddings and hybrid SQL search.',
            strengths: ['Deep technical understanding of vector indexing', 'Practical RAG optimization'],
            improvements: []
          }
        }
      ];

      mockInterviews.forEach(i => this.saveInterview(i));
    }

    // Seed Direct Messages
    if (this.getMessages().length === 0) {
      const mockMessages: DirectMessage[] = [
        {
          id: 'msg-1',
          senderId: 'company-demo',
          senderName: 'Sarah Jenkins (Apex Tech Labs)',
          senderRole: 'recruiter',
          receiverId: 'demo-talent',
          subject: 'Offer Invitation — Senior Architect Role',
          body: 'Hi Alex! We were thoroughly impressed by your 94/100 Grok AI Video Interview score and verified System Architecture portfolio projects. We would love to move forward with a formal offer conversation.',
          timestamp: Date.now() - 3600000,
          isRead: false
        },
        {
          id: 'msg-2',
          senderId: 'demo-talent',
          senderName: 'Alex Chen',
          senderRole: 'talent',
          receiverId: 'company-demo',
          subject: 'Re: Offer Invitation — Senior Architect Role',
          body: "Thank you Sarah! I really enjoyed the Grok AI interview process and learning about Apex Tech's scale. I am available this Thursday at 2:00 PM KSA time for our meeting.",
          timestamp: Date.now() - 1800000,
          isRead: true
        }
      ];

      mockMessages.forEach(m => this.saveMessage(m));
    }
  }
}

export const db = new DatabaseService();
db.seedDatabaseIfEmpty();
