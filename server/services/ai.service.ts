import { openai } from '../config/openai';
import {
  ResumeAnalysis,
  ImprovementSuggestion,
  SkillSuggestion,
  JobMatch,
  InterviewQuestion
} from '../types';

export class AIService {
  async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    try {
      const prompt = `Analyze the following resume and provide:
1. ATS score (0-100)
2. Improvement suggestions for grammar, tone, structure, content, and formatting
3. Skill suggestions based on current market demand
4. List of extracted skills
5. Estimated years of experience

Resume:
${resumeText}

Respond in JSON format with this structure:
{
  "atsScore": number,
  "improvementSuggestions": [
    {
      "category": "grammar|tone|structure|content|formatting",
      "severity": "high|medium|low",
      "issue": "description of issue",
      "suggestion": "how to fix",
      "example": "optional example"
    }
  ],
  "skillSuggestions": [
    {
      "skill": "skill name",
      "relevance": number (0-100),
      "demand": "high|medium|low",
      "category": "technical|soft|industry",
      "description": "why this skill matters"
    }
  ],
  "skillsExtracted": ["skill1", "skill2"],
  "experienceYears": number
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume analyst and career advisor. Provide detailed, actionable feedback.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('AI Resume Analysis Error:', error);
      return this.getFallbackAnalysis();
    }
  }

  async improveResume(resumeText: string): Promise<string> {
    try {
      const prompt = `Rewrite the following resume to make it more professional, ATS-friendly, and impactful:

${resumeText}

Improvements to make:
- Use strong action verbs
- Quantify achievements where possible
- Improve grammar and clarity
- Optimize for ATS systems
- Enhance professional tone
- Better formatting and structure`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume writer with expertise in ATS optimization.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      return response.choices[0].message.content || resumeText;
    } catch (error) {
      console.error('AI Resume Improvement Error:', error);
      throw new Error('Failed to improve resume');
    }
  }

  async identifySkillsGap(
    resumeText: string,
    targetRole: string
  ): Promise<SkillSuggestion[]> {
    try {
      const prompt = `Given this resume and target role "${targetRole}", identify skills gaps:

Resume:
${resumeText}

Provide a list of skills the candidate should develop to be competitive for the target role.
Respond in JSON format:
{
  "skillSuggestions": [
    {
      "skill": "skill name",
      "relevance": number (0-100),
      "demand": "high|medium|low",
      "category": "technical|soft|industry",
      "description": "why this skill matters for the role"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a career advisor specializing in skill development.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return [];
      }

      const result = JSON.parse(content);
      return result.skillSuggestions || [];
    } catch (error) {
      console.error('AI Skills Gap Error:', error);
      return [];
    }
  }

  async matchJobToResume(
    resumeText: string,
    jobDescription: string,
    jobTitle: string
  ): Promise<JobMatch> {
    try {
      const prompt = `Match this resume to the job posting:

Resume:
${resumeText}

Job Title: ${jobTitle}
Job Description:
${jobDescription}

Provide:
1. Compatibility score (0-100)
2. Matching skills
3. Missing keywords
4. Recommendations to improve match

Respond in JSON format:
{
  "compatibilityScore": number,
  "matchingSkills": ["skill1", "skill2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at matching candidates to job opportunities.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const result = JSON.parse(content);
      return {
        jobId: '',
        ...result
      };
    } catch (error) {
      console.error('AI Job Match Error:', error);
      return {
        jobId: '',
        compatibilityScore: 0,
        matchingSkills: [],
        missingKeywords: [],
        recommendations: []
      };
    }
  }

  async generateCoverLetter(
    resumeText: string,
    jobDescription: string,
    jobTitle: string,
    company: string
  ): Promise<string> {
    try {
      const prompt = `Write a professional cover letter for this job application:

Job Title: ${jobTitle}
Company: ${company}

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Create a compelling, personalized cover letter that:
- Highlights relevant experience
- Shows enthusiasm for the role
- Addresses key job requirements
- Is professional yet personable
- Is approximately 3-4 paragraphs`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cover letter writer.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('AI Cover Letter Error:', error);
      throw new Error('Failed to generate cover letter');
    }
  }

  async generateInterviewQuestions(
    jobDescription: string,
    jobTitle: string,
    resumeText: string
  ): Promise<InterviewQuestion[]> {
    try {
      const prompt = `Generate interview questions and suggested answers for:

Job Title: ${jobTitle}
Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Provide 10 relevant interview questions with suggested answers.
Respond in JSON format:
{
  "questions": [
    {
      "question": "the question",
      "category": "technical|behavioral|situational",
      "difficulty": "easy|medium|hard",
      "suggestedAnswer": "comprehensive answer",
      "tips": ["tip1", "tip2"]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return [];
      }

      const result = JSON.parse(content);
      return result.questions || [];
    } catch (error) {
      console.error('AI Interview Questions Error:', error);
      return [];
    }
  }

  private getFallbackAnalysis(): ResumeAnalysis {
    return {
      atsScore: 0,
      improvementSuggestions: [
        {
          category: 'content',
          severity: 'high',
          issue: 'AI analysis unavailable',
          suggestion: 'Please configure OpenAI API key to enable AI features'
        }
      ],
      skillSuggestions: [],
      skillsExtracted: [],
      experienceYears: 0
    };
  }
}

export const aiService = new AIService();
