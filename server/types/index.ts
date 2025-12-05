import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'employer' | 'admin';
  fullName: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface ResumeAnalysis {
  atsScore: number;
  improvementSuggestions: ImprovementSuggestion[];
  skillSuggestions: SkillSuggestion[];
  skillsExtracted: string[];
  experienceYears: number;
}

export interface ImprovementSuggestion {
  category: 'grammar' | 'tone' | 'structure' | 'content' | 'formatting';
  severity: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  example?: string;
}

export interface SkillSuggestion {
  skill: string;
  relevance: number;
  demand: 'high' | 'medium' | 'low';
  category: string;
  description: string;
}

export interface JobMatch {
  jobId: string;
  compatibilityScore: number;
  matchingSkills: string[];
  missingKeywords: string[];
  recommendations: string[];
}

export interface InterviewQuestion {
  question: string;
  category: 'technical' | 'behavioral' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedAnswer: string;
  tips: string[];
}
