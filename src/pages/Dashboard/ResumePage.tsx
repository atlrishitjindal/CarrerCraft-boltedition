import { useState } from 'react';
import { ResumeUpload } from '@/components/resumes/ResumeUpload';
import { ResumeList } from '@/components/resumes/ResumeList';
import { resumeService } from '@/services/resume.service';
import { toast } from 'sonner';

export function ResumePage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async (resumeText: string, fileName: string | null, jobDescription: string) => {
        try {
            setIsAnalyzing(true);

            // 1. Upload/Save the text resume
            const { resume } = await resumeService.uploadResumeText(resumeText, fileName || undefined, jobDescription);

            // 2. Trigger analysis
            const { analysis } = await resumeService.analyzeResume(resume.id);

            // 3. Refresh list
            setRefreshTrigger(prev => prev + 1);

            toast.success(`Analysis complete! Score: ${analysis.atsScore}`);

            // TODO: Navigate to analysis details or show modal? 
            // For now, the user can see it in the list below.

        } catch (error: any) {
            console.error('Analysis failed:', error);
            toast.error(error.response?.data?.message || 'Failed to analyze resume');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
                <p className="text-gray-600 mt-1">Upload and analyze your resumes to improve your job matches.</p>
            </div>

            <div className="space-y-8">
                <section>
                    <ResumeUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                </section>

                <section>
                    <ResumeList refreshTrigger={refreshTrigger} />
                </section>
            </div>
        </div>
    );
}
