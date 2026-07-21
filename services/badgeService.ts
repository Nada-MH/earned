import { BadgeDefinition, BadgeCategory, BadgeRarity, UserProfile, GradingResult, UserBadge, BadgeIconName } from "../types";

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  // --- SOFT SKILLS ---
  'soft-team': {
    id: 'soft-team',
    name: 'Team Catalyst',
    description: 'The glue that holds the team together.',
    criteria: 'Scored High in Teamwork during Soft Skills Assessment.',
    category: 'Soft Skills',
    rarity: 'Rare',
    icon: 'Users'
  },
  'soft-critic': {
    id: 'soft-critic',
    name: 'Strategic Mind',
    description: 'Sees the chess moves before they happen.',
    criteria: 'Scored High in Critical Thinking during Soft Skills Assessment.',
    category: 'Soft Skills',
    rarity: 'Rare',
    icon: 'Brain'
  },
  'soft-creative': {
    id: 'soft-creative',
    name: 'Creative Spark',
    description: 'Innovation is your default setting.',
    criteria: 'Scored High in Creativity during Soft Skills Assessment.',
    category: 'Soft Skills',
    rarity: 'Rare',
    icon: 'Lightbulb'
  },
  'soft-pressure': {
    id: 'soft-pressure',
    name: 'Pressure-Proof',
    description: 'Cooler than liquid nitrogen.',
    criteria: 'Scored High in Working Under Pressure during Soft Skills Assessment.',
    category: 'Soft Skills',
    rarity: 'Epic',
    icon: 'Thermometer'
  },
  'soft-decide': {
    id: 'soft-decide',
    name: 'Decisive Operator',
    description: 'Action over analysis paralysis.',
    criteria: 'Scored High in Decision Making during Soft Skills Assessment.',
    category: 'Soft Skills',
    rarity: 'Rare',
    icon: 'Gavel'
  },
  'soft-balance': {
    id: 'soft-balance',
    name: 'Balanced Performer',
    description: 'The complete professional package.',
    criteria: 'Maintained above average scores in all 5 soft skill categories.',
    category: 'Soft Skills',
    rarity: 'Legendary',
    icon: 'Scale'
  },

  // --- CONSISTENCY ---
  'cons-7': {
    id: 'cons-7',
    name: 'Contributor (7 Days)',
    description: 'A solid week of effort.',
    criteria: 'Complete daily challenges for 7 consecutive days.',
    category: 'Consistency',
    rarity: 'Common',
    icon: 'CalendarClock'
  },
  'cons-30': {
    id: 'cons-30',
    name: 'Contributor (30 Days)',
    description: 'Dedication that stands out.',
    criteria: 'Complete daily challenges for 30 consecutive days.',
    category: 'Consistency',
    rarity: 'Rare',
    icon: 'CalendarCheck'
  },
  'cons-365': {
    id: 'cons-365',
    name: 'Contributor (Year)',
    description: 'Unwavering commitment.',
    criteria: 'Maintain consistent participation over one year.',
    category: 'Consistency',
    rarity: 'Legendary',
    icon: 'CalendarRange'
  },
  'cons-unbroken': {
    id: 'cons-unbroken',
    name: 'Unbroken',
    description: 'A perfect month.',
    criteria: 'No missed challenges for a full calendar month.',
    category: 'Consistency',
    rarity: 'Epic',
    icon: 'Infinity'
  },
  'cons-comeback': {
    id: 'cons-comeback',
    name: 'Comeback',
    description: 'Bounce back stronger.',
    criteria: 'Recover consistency after a lapse and maintain it for 14 days.',
    category: 'Consistency',
    rarity: 'Rare',
    icon: 'RefreshCcw'
  },
  
  // --- EXCELLENCE ---
  'exc-perfect': {
    id: 'exc-perfect',
    name: 'Perfect Execution',
    description: 'Absolute flawlessness.',
    criteria: 'Achieve a 100% Performance Score on a daily challenge.',
    category: 'Excellence',
    rarity: 'Epic',
    icon: 'Target'
  },
  'exc-flawless': {
    id: 'exc-flawless',
    name: 'Flawless Week',
    description: 'Streak of perfection.',
    criteria: '100% Performance Score across all challenges in one week.',
    category: 'Excellence',
    rarity: 'Legendary',
    icon: 'Star'
  },
  'exc-precision': {
    id: 'exc-precision',
    name: 'Precision Specialist',
    description: 'Consistent high quality.',
    criteria: 'Maintain ≥95% average Performance Score over 20 challenges.',
    category: 'Excellence',
    rarity: 'Epic',
    icon: 'Crosshair'
  },
  'exc-highbar': {
    id: 'exc-highbar',
    name: 'High Bar',
    description: 'Exceeding expectations.',
    criteria: 'Score ≥90% on an Advanced or higher difficulty challenge.',
    category: 'Excellence',
    rarity: 'Rare',
    icon: 'TrendingUp'
  },

  // --- GROWTH ---
  'growth-improver': {
    id: 'growth-improver',
    name: 'Rapid Improver',
    description: 'Fast tracked learning.',
    criteria: 'Increase average score by 20 points in 30 days.',
    category: 'Growth',
    rarity: 'Rare',
    icon: 'Zap'
  },
  'growth-levelup': {
    id: 'growth-levelup',
    name: 'Level Up',
    description: 'Moving up the ranks.',
    criteria: 'Advance to a new level with no Consistency Score drops.',
    category: 'Growth',
    rarity: 'Common',
    icon: 'ArrowUpCircle'
  },
  'growth-resilience': {
    id: 'growth-resilience',
    name: 'Resilience',
    description: 'Learning from failure.',
    criteria: 'Recover from a low-performance task and exceed previous average within 5 challenges.',
    category: 'Growth',
    rarity: 'Rare',
    icon: 'ShieldAlert'
  },

  // --- INTEGRITY ---
  'int-clean': {
    id: 'int-clean',
    name: 'Clean Record',
    description: 'Professional integrity.',
    criteria: 'Zero plagiarism or integrity flags over 50 submissions.',
    category: 'Integrity',
    rarity: 'Common',
    icon: 'FileCheck'
  },
  'int-trusted': {
    id: 'int-trusted',
    name: 'Trusted Contributor',
    description: 'Peer validated.',
    criteria: 'Consistently positive peer reviews over 10 team interactions.',
    category: 'Integrity',
    rarity: 'Rare',
    icon: 'Handshake'
  },
  'int-signal': {
    id: 'int-signal',
    name: 'Signal, Not Noise',
    description: 'Focused output.',
    criteria: 'No abandoned challenges for 30 days.',
    category: 'Integrity',
    rarity: 'Common',
    icon: 'Radio'
  },

  // --- COLLABORATION ---
  'collab-team': {
    id: 'collab-team',
    name: 'Team Player',
    description: 'Works well with others.',
    criteria: 'Complete 5 team challenges with positive peer ratings.',
    category: 'Collaboration',
    rarity: 'Common',
    icon: 'Users'
  },
  'collab-clear': {
    id: 'collab-clear',
    name: 'Clear Communicator',
    description: 'Articulate and precise.',
    criteria: 'High clarity scores in collaborative tasks.',
    category: 'Collaboration',
    rarity: 'Rare',
    icon: 'MessageSquare'
  },
  'collab-reliable': {
    id: 'collab-reliable',
    name: 'Reliable Partner',
    description: 'Always on time.',
    criteria: 'No missed deadlines in team challenges for 30 days.',
    category: 'Collaboration',
    rarity: 'Epic',
    icon: 'Clock'
  },

  // --- ADVANCED ---
  'adv-proof': {
    id: 'adv-proof',
    name: 'Proof Over Claims',
    description: 'Verified skills speak louder.',
    criteria: 'Complete 10 Proof Quests with no reviewer overrides.',
    category: 'Integrity', 
    rarity: 'Epic',
    icon: 'ShieldCheck'
  },
  'adv-consistent': {
    id: 'adv-consistent',
    name: 'Consistent Performer',
    description: 'Reliably excellent.',
    criteria: 'Maintain ≥85% Performance and ≥85% Consistency for 90 days.',
    category: 'Excellence',
    rarity: 'Epic',
    icon: 'Activity'
  },
  'adv-pressure': {
    id: 'adv-pressure',
    name: 'Pressure-Tested',
    description: 'Thrives under pressure.',
    criteria: 'Succeed in risk-reward challenges with multipliers active.',
    category: 'Excellence',
    rarity: 'Rare',
    icon: 'Gauge'
  },
  'adv-elite': {
    id: 'adv-elite',
    name: 'Elite Signal',
    description: 'The top 1% of talent.',
    criteria: 'Reach Level 10 with >95 Hiring Readiness.',
    category: 'Excellence',
    rarity: 'Legendary',
    icon: 'Crown'
  }
};

export const evaluateBadges = (
  user: UserProfile, 
  currentResult?: GradingResult, 
  isSkillVerification?: boolean
): UserBadge[] => {
  const newBadges: UserBadge[] = [];
  const existingIds = new Set(user.badges.map(b => b.badgeId));
  const now = Date.now();

  const award = (id: string) => {
    if (!existingIds.has(id)) {
      newBadges.push({ badgeId: id, earnedAt: now });
      existingIds.add(id);
    }
  };

  // 1. Check Consistency
  if (user.streak >= 7) award('cons-7');
  if (user.streak >= 30) award('cons-30');
  if (user.streak >= 365) award('cons-365');
  if (user.streak >= 30) award('cons-unbroken');
  if (user.history.length >= 14 && user.streak >= 14) award('cons-comeback');

  // 2. Check Excellence (requires current result)
  if (currentResult) {
    if (currentResult.score === 100) award('exc-perfect');
    if (currentResult.score >= 90) award('exc-highbar'); 
  }
  
  if (user.history.length >= 7) {
    const last7 = user.history.slice(-7);
    if (last7.every(h => h.score === 100)) award('exc-flawless');
  }
  
  if (user.history.length >= 20) {
    const last20 = user.history.slice(-20);
    const avgScore = last20.reduce((acc, h) => acc + h.score, 0) / last20.length;
    if (avgScore >= 95) award('exc-precision');
  }

  // 3. Check Growth / Levels
  const currentLevel = Math.floor(user.completedStages / 10) + 1;
  if (currentLevel > 1) award('growth-levelup'); 
  if (user.history.length >= 10) award('growth-improver');
  if (user.history.length >= 5 && currentResult) {
    const previous4 = user.history.slice(-4); // the currentResult is not in history yet usually, or it might be. Assuming it's not.
    const avgScore = previous4.reduce((acc, h) => acc + h.score, 0) / previous4.length;
    if (currentResult.score > avgScore) award('growth-resilience');
  }
  
  if (currentLevel >= 10 && user.hiringReadiness > 95) award('adv-elite');

  // 4. Check Skill Proofs
  const verifiedCount = user.skillTree.filter(n => n.status === 'completed' && n.proof?.verified).length;
  if (verifiedCount >= 3) award('adv-proof');

  // 5. Check Integrity 
  if (user.history.length >= 50) award('int-clean');
  if (user.history.length >= 10) {
    const avgScore = user.history.reduce((acc, h) => acc + h.score, 0) / user.history.length;
    if (avgScore >= 80) award('int-trusted');
  }
  if (user.history.length >= 30 && user.streak >= 30) award('int-signal');

  // 6. Check Soft Skills & Collaboration
  if (user.softSkills) {
    const { teamwork, criticalThinking, creativity, pressure, decisionMaking } = user.softSkills;
    
    if (teamwork >= 80) award('soft-team');
    if (criticalThinking >= 80) award('soft-critic');
    if (creativity >= 80) award('soft-creative');
    if (pressure >= 85) award('soft-pressure');
    if (decisionMaking >= 80) award('soft-decide');
    
    if (teamwork >= 60 && criticalThinking >= 60 && creativity >= 60 && pressure >= 60 && decisionMaking >= 60) {
      award('soft-balance');
    }
    
    if (teamwork >= 70) award('collab-team');
    if (criticalThinking >= 70) award('collab-clear');
    if (user.streak >= 30 && decisionMaking >= 70) award('collab-reliable');
    if (pressure >= 80) award('adv-pressure');
  }
  
  if (user.streak >= 90 && user.hiringReadiness >= 85) award('adv-consistent');

  return newBadges;
};
