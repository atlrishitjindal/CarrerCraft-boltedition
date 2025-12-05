import { api } from '@/lib/api';

export interface Resume {
    id: string;
    file_name: string;
    file_url: string;
    ats_score?: number;
    created_at: string;
    improvement_suggestions?: any[];
    skill_suggestions?: any[];
    skills_extracted?: string[];
    experience_years?: number;
}

export interface AnalysisResult {
    atsScore: number;
    improvementSuggestions: any[];
    skillSuggestions: any[];
    skillsExtracted: string[];
    experienceYears: number;
}

export const resumeService = {
    uploadResume: async (file: File) => {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await api.post<{ resume: Resume }>('/resumes/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getResumes: async () => {
        const response = await api.get<{ resumes: Resume[] }>('/resumes');
        return response.data;
    },

    analyzeResume: async (resumeId: string) => {
        const response = await api.post<{ analysis: AnalysisResult }>(`/resumes/${resumeId}/analyze`);
        return response.data;
    },

    deleteResume: async (resumeId: string) => {
        const response = await api.delete(`/resumes/${resumeId}`);
        return response.data;
    },

    improveResume: async (resumeId: string) => {
        const response = await api.post<{ improvedText: string }>(`/resumes/${resumeId}/improve`);
        return response.data;
    },

    getSkillsGap: async (resumeId: string, targetRole: string) => {
        const response = await api.post<{ skillSuggestions: any[] }>(`/resumes/${resumeId}/skills-gap`, { targetRole });
        return response.data;
    },
};
