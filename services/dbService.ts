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
        },
        {
          id: 'int-demo-3',
          companyId: 'company-demo',
          companyName: 'Google DeepMind',
          candidateId: 'demo-talent',
          jobTitle: 'Staff ML Infrastructure Engineer',
          status: 'Completed',
          sentAt: Date.now() - 8 * 86400000,
          completedAt: Date.now() - 7 * 86400000,
          questions: [
            {
              id: 'q4',
              text: 'Design a distributed training pipeline for a 70B parameter LLM across 512 TPU v5e pods. How do you handle checkpointing, gradient synchronization, and fault recovery?',
              category: 'Technical Depth',
              expectedKeywords: ['FSDP', 'pipeline parallelism', 'checkpoint', 'gradient accumulation', 'fault tolerance']
            },
            {
              id: 'q5',
              text: 'You notice a 15% degradation in model convergence after scaling from 128 to 512 accelerators. Walk me through your debugging methodology.',
              category: 'Problem Solving',
              expectedKeywords: ['learning rate scaling', 'batch size', 'gradient noise', 'profiling', 'tensorboard']
            },
            {
              id: 'q6',
              text: 'How would you design an efficient serving infrastructure for a multimodal model that handles text, image, and video inputs with p99 latency under 200ms?',
              category: 'Architecture',
              expectedKeywords: ['batching', 'KV cache', 'speculative decoding', 'model sharding', 'triton']
            }
          ],
          answers: [
            {
              questionId: 'q4',
              answerText: 'I would implement a hybrid parallelism strategy combining FSDP for model sharding across pods with pipeline parallelism for the transformer layers. Checkpointing uses asynchronous distributed snapshots to GCS every 500 steps with delta compression, reducing checkpoint I/O by 60%. Gradient synchronization uses all-reduce with bf16 precision to minimize communication bandwidth. For fault recovery, I implement elastic training with automatic pod replacement and checkpoint resumption — our system at scale achieved 99.7% training uptime over 3-week runs.',
              durationSeconds: 145
            },
            {
              questionId: 'q5',
              answerText: 'First, I verify the effective batch size scaling — going from 128 to 512 accelerators with constant local batch size means 4x global batch size, requiring learning rate warmup adjustment using linear scaling rule. I would profile gradient norms across layers using PyTorch profiler to detect gradient noise amplification. Then check for communication bottlenecks in the all-reduce topology using NCCL debug logs. In my experience, the fix was usually a combination of: (1) square-root LR scaling instead of linear, (2) increasing warmup steps proportionally, and (3) adding gradient clipping at 1.0 to stabilize early training.',
              durationSeconds: 130
            },
            {
              questionId: 'q6',
              answerText: 'For multimodal serving, I would deploy modality-specific encoders (ViT for images, Whisper for audio) as separate microservices with shared KV cache for the language backbone. Request batching uses continuous batching with iteration-level scheduling to maximize GPU utilization at 85%+. Speculative decoding with a small draft model reduces autoregressive latency by 2.3x. The full pipeline uses Triton Inference Server with TensorRT-LLM optimization, model sharded across 4 A100s via tensor parallelism. This architecture achieved p99 latency of 180ms for text+image inputs at 2000 QPS in production.',
              durationSeconds: 155
            }
          ],
          grading: {
            score: 97,
            categoryScores: { technicalDepth: 99, architecture: 97, metricEvidence: 96, edgeCases: 95 },
            feedbackSummary: 'Exceptional performance across all dimensions. Candidate demonstrates rare depth in distributed ML systems, with production-grade metrics and concrete debugging methodology. Strong hire recommendation for Staff-level ML Infrastructure.',
            strengths: ['Production-validated distributed training expertise', 'Concrete metrics throughout (99.7% uptime, 60% checkpoint reduction, 2.3x latency improvement)', 'Systematic debugging methodology'],
            improvements: ['Could discuss cost optimization strategies for large-scale training runs']
          }
        },
        {
          id: 'int-demo-4',
          companyId: 'company-demo',
          companyName: 'NEOM Tech',
          candidateId: 'demo-talent',
          jobTitle: 'Principal IoT & Smart City Platform Engineer',
          status: 'Completed',
          sentAt: Date.now() - 12 * 86400000,
          completedAt: Date.now() - 10 * 86400000,
          questions: [
            {
              id: 'q7',
              text: 'Design a real-time sensor data ingestion platform for a smart city with 2 million IoT devices generating 500,000 events per second. How do you ensure data freshness under 3 seconds?',
              category: 'Architecture',
              expectedKeywords: ['Kafka', 'time-series', 'edge computing', 'stream processing', 'partitioning']
            },
            {
              id: 'q8',
              text: 'A critical building management system goes offline during a sandstorm, but safety sensors must continue reporting. How do you architect for resilience in extreme conditions?',
              category: 'Problem Solving',
              expectedKeywords: ['edge gateway', 'offline-first', 'mesh network', 'failover', 'battery backup']
            }
          ],
          answers: [
            {
              questionId: 'q7',
              answerText: 'I would deploy a 3-tier architecture: (1) Edge gateways running lightweight Kafka producers with local buffering at each district node, (2) Regional Kafka clusters with 128 partitions per topic for parallel ingestion, and (3) Apache Flink stream processing for real-time aggregation before landing in TimescaleDB. Data freshness is guaranteed via event-time watermarking with a 2-second allowed lateness window. At 500K events/sec, the system uses compacted topics with 72-hour retention and Flink checkpointing every 10 seconds. We achieved end-to-end p99 latency of 1.8 seconds in our pilot with 200K devices.',
              durationSeconds: 120
            },
            {
              questionId: 'q8',
              answerText: 'Critical safety sensors operate on an independent mesh network using LoRaWAN with 48-hour battery backup independent of city power. Each building has a hardened edge gateway with 72 hours of local storage that continues collecting and processing safety data offline. When connectivity resumes, the gateway performs ordered replay to the central platform using sequence IDs to prevent duplicates. For the sandstorm scenario specifically, I would implement predictive pre-caching — weather API integration triggers automatic failover mode 6 hours before severe weather, pre-loading ML models locally for anomaly detection without cloud dependency.',
              durationSeconds: 105
            }
          ],
          grading: {
            score: 93,
            categoryScores: { technicalDepth: 95, architecture: 94, metricEvidence: 90, edgeCases: 92 },
            feedbackSummary: 'Outstanding IoT architecture design with practical consideration for extreme environmental conditions. Candidate shows strong systems thinking and real-world deployment experience.',
            strengths: ['Excellent 3-tier IoT architecture with concrete scale numbers', 'Creative predictive failover for weather events', 'Strong edge computing and offline-first design'],
            improvements: ['Could discuss data privacy and sovereignty implications for smart city data']
          }
        },
        {
          id: 'int-demo-5',
          companyId: 'company-demo',
          companyName: 'Stripe Engineering',
          candidateId: 'demo-talent',
          jobTitle: 'Senior Payment Systems Engineer',
          status: 'Completed',
          sentAt: Date.now() - 18 * 86400000,
          completedAt: Date.now() - 16 * 86400000,
          questions: [
            {
              id: 'q9',
              text: 'Design an idempotent payment processing system that handles exactly-once semantics across distributed microservices. How do you prevent double-charges?',
              category: 'Technical Depth',
              expectedKeywords: ['idempotency key', 'saga pattern', 'two-phase commit', 'event sourcing', 'deduplication']
            },
            {
              id: 'q10',
              text: 'A merchant reports that 0.3% of transactions are failing silently — charges go through but webhooks never fire. How do you investigate and fix this?',
              category: 'Problem Solving',
              expectedKeywords: ['observability', 'distributed tracing', 'dead letter queue', 'retry', 'webhook reliability']
            },
            {
              id: 'q11',
              text: 'Tell me about a time you had to make a difficult technical decision that impacted the business. What trade-offs did you consider?',
              category: 'Behavioral',
              expectedKeywords: ['trade-off', 'stakeholder', 'data-driven', 'risk', 'outcome']
            }
          ],
          answers: [
            {
              questionId: 'q9',
              answerText: 'Every API request includes a client-generated idempotency key stored in a distributed cache (Redis Cluster) with a 24-hour TTL. The payment flow uses the Saga pattern: (1) Reserve funds via auth hold, (2) Execute business logic, (3) Capture or release. Each step writes to an event sourcing log in PostgreSQL before executing, enabling deterministic replay. For cross-service exactly-once semantics, I use transactional outbox pattern — the payment state change and outbox event are written in a single DB transaction, then a CDC connector (Debezium) reliably publishes to Kafka. This eliminated our double-charge rate from 0.02% to effectively zero across 14M daily transactions.',
              durationSeconds: 140
            },
            {
              questionId: 'q10',
              answerText: 'Step 1: Query distributed traces (Jaeger) filtering for transactions with successful charge status but no corresponding webhook delivery event. Step 2: Check the webhook delivery service logs — likely a dead letter queue buildup or connection pool exhaustion to merchant endpoints. Step 3: Correlate with infrastructure metrics — the 0.3% rate suggests a systematic issue, not random failures. In a similar case I debugged, the root cause was DNS resolution timeouts for a subset of merchant webhook URLs that exceeded our 5-second timeout. Fix: increased timeout to 10s, added retry with exponential backoff (3 retries over 1 hour), implemented a webhook delivery dashboard with SLA tracking, and added a merchant-facing webhook health endpoint.',
              durationSeconds: 125
            },
            {
              questionId: 'q11',
              answerText: 'At my previous company, we had to choose between migrating to a new payment processor mid-quarter (better rates, saving $2.1M annually) or waiting until Q1 to avoid risk during peak holiday season. I gathered data: our current processor had 99.95% uptime but the new one offered 99.99% SLA. I proposed a phased migration — route 5% of traffic to the new processor during November as a canary, scaling to 100% by January. This approach de-risked the migration while capturing $500K in savings during the partial rollout. The board approved, and we completed full migration with zero payment disruptions.',
              durationSeconds: 95
            }
          ],
          grading: {
            score: 91,
            categoryScores: { technicalDepth: 93, architecture: 92, metricEvidence: 90, edgeCases: 88 },
            feedbackSummary: 'Strong payment systems expertise with excellent production debugging methodology. Candidate demonstrates both deep technical knowledge and strong business acumen in trade-off decisions.',
            strengths: ['Robust idempotency design with concrete metrics (14M daily transactions, zero double-charges)', 'Systematic debugging approach with clear root cause analysis', 'Data-driven business decision-making'],
            improvements: ['Could discuss PCI compliance and security audit considerations more deeply']
          }
        },
        {
          id: 'int-demo-6',
          companyId: 'company-demo',
          companyName: 'Microsoft Azure',
          candidateId: 'demo-talent',
          jobTitle: 'Senior Cloud Platform Engineer',
          status: 'Completed',
          sentAt: Date.now() - 22 * 86400000,
          completedAt: Date.now() - 20 * 86400000,
          questions: [
            {
              id: 'q12',
              text: 'Design a multi-tenant Kubernetes platform that isolates workloads for 500+ enterprise customers while maintaining cost efficiency. How do you handle noisy neighbor problems?',
              category: 'Architecture',
              expectedKeywords: ['namespace isolation', 'resource quotas', 'network policies', 'node affinity', 'priority classes']
            },
            {
              id: 'q13',
              text: 'A customer reports intermittent 502 errors that only occur between 2-4 AM UTC. Standard monitoring shows no anomalies. Walk through your investigation.',
              category: 'Problem Solving',
              expectedKeywords: ['cron jobs', 'node scaling', 'certificate rotation', 'DNS TTL', 'connection draining']
            }
          ],
          answers: [
            {
              questionId: 'q12',
              answerText: 'I implement a hierarchical isolation model: (1) Dedicated namespaces per tenant with ResourceQuotas capping CPU/memory/storage, (2) NetworkPolicies enforcing zero-trust east-west traffic between tenant namespaces, (3) PriorityClasses ensuring premium tenants get scheduling priority during contention, (4) Node pools with taints/tolerations — large enterprise tenants get dedicated node pools while smaller tenants share pools with pod anti-affinity rules. For noisy neighbors specifically: I deploy a custom metrics controller that monitors per-namespace resource consumption against quotas, automatically throttling workloads exceeding 80% of their burst limit. This reduced noisy neighbor incidents by 94% across our 500-tenant platform.',
              durationSeconds: 135
            },
            {
              questionId: 'q13',
              answerText: 'The 2-4 AM UTC window immediately suggests a scheduled process. Investigation steps: (1) Check cluster autoscaler logs — are nodes being scaled down during low-traffic hours and new pods failing readiness probes during scale-up? (2) Review CronJob schedules — batch jobs like backups or cert rotations running at 2 AM could consume resources. (3) Check for TLS certificate auto-rotation — cert-manager renewals can cause brief ingress disruptions. (4) Examine DNS — if internal DNS cache TTLs expire and coredns pods were evicted during scale-down, resolution failures cause 502s. In a real case I solved: the root cause was cert-manager renewing wildcard TLS certs at 2 AM, causing a 30-second ingress reload. Fix: configured cert-manager to renew 24 hours before expiry during business hours and added ingress controller rolling updates.',
              durationSeconds: 140
            }
          ],
          grading: {
            score: 89,
            categoryScores: { technicalDepth: 92, architecture: 90, metricEvidence: 86, edgeCases: 88 },
            feedbackSummary: 'Solid Kubernetes platform engineering knowledge with practical multi-tenant experience. Strong systematic debugging approach for intermittent production issues.',
            strengths: ['Comprehensive multi-tenant isolation strategy with quantified results (94% noisy neighbor reduction)', 'Excellent root cause analysis for time-based intermittent failures'],
            improvements: ['Could discuss cost allocation and chargeback models for multi-tenant platforms', 'More detail on disaster recovery and multi-region failover']
          }
        }
      ];

      mockInterviews.forEach(i => this.saveInterview(i));
    }

    // Seed Chat Conversations
    if (this.getMessages().length === 0) {
      const h = 3600000; // 1 hour in ms
      const d = 86400000; // 1 day in ms
      const mockMessages: DirectMessage[] = [
        // === Thread 1: Sarah Jenkins (Apex Tech Labs) — 7 messages ===
        {
          id: 'msg-1a', senderId: 'company-demo', senderName: 'Sarah Jenkins', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'Apex Tech Labs',
          body: 'Hey Alex! 👋 Just reviewed your Grok AI interview — 94/100 is seriously impressive. Your API gateway design was next level.',
          timestamp: Date.now() - 5 * h, isRead: true
        },
        {
          id: 'msg-1b', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'Apex Tech Labs',
          body: 'Thanks Sarah! That means a lot. I really enjoyed the interview format — felt way more natural than a typical whiteboard session.',
          timestamp: Date.now() - 4.5 * h, isRead: true
        },
        {
          id: 'msg-1c', senderId: 'company-demo', senderName: 'Sarah Jenkins', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'Apex Tech Labs',
          body: 'Right?? That\'s exactly why we switched to Earned. Anyway — our engineering VP wants to chat with you about the Senior Architect role. Would Thursday work?',
          timestamp: Date.now() - 4 * h, isRead: true
        },
        {
          id: 'msg-1d', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'Apex Tech Labs',
          body: 'Thursday works perfectly! What time zone are you in?',
          timestamp: Date.now() - 3.5 * h, isRead: true
        },
        {
          id: 'msg-1e', senderId: 'company-demo', senderName: 'Sarah Jenkins', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'Apex Tech Labs',
          body: 'We\'re KSA time (UTC+3). How about 2:00 PM? I\'ll send a Google Meet link.',
          timestamp: Date.now() - 3 * h, isRead: true
        },
        {
          id: 'msg-1f', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'Apex Tech Labs',
          body: 'Perfect, 2 PM KSA works great. Looking forward to it! 🚀',
          timestamp: Date.now() - 2.5 * h, isRead: true
        },
        {
          id: 'msg-1g', senderId: 'company-demo', senderName: 'Sarah Jenkins', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'Apex Tech Labs',
          body: 'Awesome! Calendar invite sent ✅ Also, our VP loved your skill tree — the React + distributed systems combo is exactly what we need. See you Thursday!',
          timestamp: Date.now() - 2 * h, isRead: false
        },

        // === Thread 2: DeepMind Recruiting — 6 messages ===
        {
          id: 'msg-2a', senderId: 'company-demo', senderName: 'DeepMind Recruiting', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'DeepMind',
          body: 'Hi Alex, congratulations on your interview score of 97/100! That puts you in the top 1% of candidates for Staff ML Infrastructure.',
          timestamp: Date.now() - 6 * d, isRead: true
        },
        {
          id: 'msg-2b', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'DeepMind',
          body: 'Wow, thank you! I\'m genuinely excited about the distributed training work you\'re doing. The TPU pod architecture question was really fun to think through.',
          timestamp: Date.now() - 5.8 * d, isRead: true
        },
        {
          id: 'msg-2c', senderId: 'company-demo', senderName: 'DeepMind Recruiting', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'DeepMind',
          body: 'Your answer on hybrid parallelism with FSDP was exactly what our team lead was hoping to hear. We\'d love to set up a team-matching call. Mon-Wed next week?',
          timestamp: Date.now() - 5.5 * d, isRead: true
        },
        {
          id: 'msg-2d', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'DeepMind',
          body: 'Monday or Tuesday would be ideal for me. Any time after 10 AM UTC works.',
          timestamp: Date.now() - 5.2 * d, isRead: true
        },
        {
          id: 'msg-2e', senderId: 'company-demo', senderName: 'DeepMind Recruiting', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'DeepMind',
          body: 'Let\'s lock in Tuesday at 11 AM UTC. You\'ll be meeting with Dr. Sarah Park (ML Infra Lead) and James Chen (Staff Engineer). They\'re particularly interested in your checkpointing approach.',
          timestamp: Date.now() - 5 * d, isRead: true
        },
        {
          id: 'msg-2f', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'DeepMind',
          body: 'Sounds great, looking forward to meeting them! I\'ll prep some thoughts on async checkpoint compression too. Thanks for the fast turnaround 🙏',
          timestamp: Date.now() - 4.8 * d, isRead: true
        },

        // === Thread 3: NEOM Tech — 5 messages ===
        {
          id: 'msg-3a', senderId: 'company-demo', senderName: 'NEOM Tech', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'NEOM Tech',
          body: 'Hey Alex! Your IoT architecture interview was fantastic (93/100). Our CTO is curious about the predictive failover idea you mentioned.',
          timestamp: Date.now() - 9 * d, isRead: true
        },
        {
          id: 'msg-3b', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'NEOM Tech',
          body: 'Thanks! Yeah the weather-triggered failover is something I prototyped at my current company. We saw 40% fewer outages during sandstorm season.',
          timestamp: Date.now() - 8.7 * d, isRead: true
        },
        {
          id: 'msg-3c', senderId: 'company-demo', senderName: 'NEOM Tech', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'NEOM Tech',
          body: 'That\'s exactly the kind of practical experience we need. Would you be open to a 45-min deep dive with our CTO? He wants to understand how you integrated the weather API triggers.',
          timestamp: Date.now() - 8.5 * d, isRead: true
        },
        {
          id: 'msg-3d', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'NEOM Tech',
          body: 'Absolutely! I can walk through the full LoRaWAN mesh + edge gateway architecture. Any day this week works for me.',
          timestamp: Date.now() - 8.2 * d, isRead: true
        },
        {
          id: 'msg-3e', senderId: 'company-demo', senderName: 'NEOM Tech', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'NEOM Tech',
          body: 'Perfect! I\'ll send a calendar invite for Wednesday 3 PM. Also, the role comes with relocation to NEOM if you\'re interested — it\'s an incredible place to build from scratch 🏗️',
          timestamp: Date.now() - 8 * d, isRead: true
        },

        // === Thread 4: Stripe Engineering — 4 messages ===
        {
          id: 'msg-4a', senderId: 'company-demo', senderName: 'Stripe Engineering', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'Stripe',
          body: 'Alex, your payment systems interview was solid — 91/100. Your Saga pattern + idempotency key approach mirrors how we actually do it at Stripe.',
          timestamp: Date.now() - 15 * d, isRead: true
        },
        {
          id: 'msg-4b', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'Stripe',
          body: 'That\'s great to hear! I\'ve been a huge fan of Stripe\'s engineering blog — especially the idempotency keys post from a few years back. It really shaped my thinking.',
          timestamp: Date.now() - 14.5 * d, isRead: true
        },
        {
          id: 'msg-4c', senderId: 'company-demo', senderName: 'Stripe Engineering', senderRole: 'recruiter',
          receiverId: 'demo-talent', subject: 'Stripe',
          body: 'Ha, that\'s awesome! We\'d like to invite you for a final round at our SF office. All travel and accommodation covered. We\'re flexible on timing — any 2-week window that works?',
          timestamp: Date.now() - 14 * d, isRead: true
        },
        {
          id: 'msg-4d', senderId: 'demo-talent', senderName: 'Alex Chen', senderRole: 'talent',
          receiverId: 'company-demo', subject: 'Stripe',
          body: 'I\'d love that! I\'m flexible the first two weeks of next month. Would be amazing to see the office and meet the team in person. Let me know what works best! 🤝',
          timestamp: Date.now() - 13.5 * d, isRead: true
        }
      ];

      mockMessages.forEach(m => this.saveMessage(m));
    }
  }
}

export const db = new DatabaseService();
db.seedDatabaseIfEmpty();
