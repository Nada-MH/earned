import { Challenge, SkillLevel, GradingResult, MasteryLevel, SkillNode } from "../types";
import { 
  generateGrokSkillTree, 
  generateGrokDailyChallenge, 
  generateGrokSkillQuest, 
  verifyGrokSkillProof 
} from "./grokService";
import { evaluateWithRAG } from "./evaluator";

/**
 * Generate Daily Challenge powered by Grok AI
 */
export const generateDailyChallenge = async (role: string, level: SkillLevel): Promise<Challenge> => {
  return await generateGrokDailyChallenge(role, level as string);
};

/**
 * Generate Skill Quest powered by Grok AI
 */
export const generateSkillQuest = async (skillName: string, role: string, level: MasteryLevel): Promise<Challenge> => {
  return await generateGrokSkillQuest(skillName, role, level as string);
};

/**
 * Delegate Challenge Submission Evaluation to Unified RAG Engine (powered by Grok AI)
 */
export const evaluateSubmission = async (challenge: Challenge, submissionContent: string): Promise<GradingResult> => {
  return await evaluateWithRAG(
    challenge.role,
    challenge.title,
    challenge.description,
    challenge.criteria,
    submissionContent
  );
};

/**
 * Verify Skill Proof powered by Grok AI
 */
export const verifySkillProof = async (skillName: string, projectTitle: string, projectDescription: string): Promise<{ verified: boolean; feedback: string }> => {
  return await verifyGrokSkillProof(skillName, projectTitle, projectDescription);
};

/**
 * Delegated Skill Tree Generator — Powered by Grok AI
 */
export const generateSkillTree = async (major: string, userLevel: number = 1): Promise<SkillNode[]> => {
  return await generateGrokSkillTree(major, userLevel);
};

