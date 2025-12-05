import { api } from '@/lib/api';

export interface Job {
    id: string;
    employer_id: string;
    title: string;
    company: string;
    description: string;
    requirements: string[];
    location: string;
    salary_min?: number;
    salary_max?: number;
    job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
    created_at: string;
    is_active: boolean;
}

export interface Match {
    id: string;
    user_id: string;
    job_id: string;
    compatibility_score: number;
    matching_skills: string[];
    missing_keywords: string[];
    cover_letter?: string;
    interview_questions?: any[];
    status: 'new' | 'viewed' | 'applied' | 'interviewing' | 'rejected' | 'hired';
    created_at: string;
    job: Job;
}

export const jobService = {
    getJobs: async (params?: { page?: number; search?: string; location?: string }) => {
        const response = await api.get<{ jobs: Job[]; pagination: any }>('/jobs', { params });
        return response.data;
    },

    getJobById: async (jobId: string) => {
        const response = await api.get<{ job: Job }>(`/jobs/${jobId}`);
        return response.data;
    },

    matchJobs: async (resumeId: string) => {
        const response = await api.post<{ matches: Match[] }>('/matches/match-jobs', { resumeId });
        return response.data;
    },

    getMatches: async () => {
        const response = await api.get<{ matches: Match[] }>('/matches');
        return response.data;
    },

    applyToJob: async (matchId: string) => {
        const response = await api.post(`/matches/${matchId}/apply`);
        return response.data;
    },

    generateCoverLetter: async (matchId: string) => {
        const response = await api.post<{ coverLetter: string }>(`/matches/${matchId}/cover-letter`);
        return response.data;
    },

    generateInterviewQuestions: async (matchId: string) => {
        const response = await api.post<{ questions: any[] }>(`/matches/${matchId}/interview-questions`);
        return response.data;
    },
};
