import { useState, useEffect } from 'react';
import { FileText, Trash2, BarChart2, CheckCircle2, AlertTriangle, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { resumeService, Resume, AnalysisResult } from '@/services/resume.service';
import { toast } from 'sonner';

import { ResumeImprovement } from './ResumeImprovement';
import { SkillsGap } from './SkillsGap';

interface ResumeListProps {
    refreshTrigger: number;
}


export function ResumeList({ refreshTrigger }: ResumeListProps) {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [improvementId, setImprovementId] = useState<string | null>(null);
    const [skillsGapId, setSkillsGapId] = useState<string | null>(null);

    useEffect(() => {
        fetchResumes();
    }, [refreshTrigger]);

    const fetchResumes = async () => {
        try {
            const { resumes } = await resumeService.getResumes();
            setResumes(resumes);
        } catch (error) {
            console.error('Failed to fetch resumes:', error);
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async (resumeId: string) => {
        if (analyzingIds.includes(resumeId)) return;

        setAnalyzingIds(prev => [...prev, resumeId]);
        try {
            const { analysis } = await resumeService.analyzeResume(resumeId);

            // Update local state with analysis results
            setResumes(prev => prev.map(r => {
                if (r.id === resumeId) {
                    return {
                        ...r,
                        ats_score: analysis.atsScore,
                        improvement_suggestions: analysis.improvementSuggestions,
                        skill_suggestions: analysis.skillSuggestions,
                        skills_extracted: analysis.skillsExtracted,
                        experience_years: analysis.experienceYears
                    };
                }
                return r;
            }));

            toast.success('Resume analysis complete');
            setExpandedId(resumeId); // Auto expand to show results
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to analyze resume';
            toast.error(message);
        } finally {
            setAnalyzingIds(prev => prev.filter(id => id !== resumeId));
        }
    };

    const handleDelete = async (resumeId: string) => {
        if (!confirm('Are you sure you want to delete this resume?')) return;

        try {
            await resumeService.deleteResume(resumeId);
            setResumes(prev => prev.filter(r => r.id !== resumeId));
            toast.success('Resume deleted successfully');
        } catch (error) {
            toast.error('Failed to delete resume');
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (resumes.length === 0) {
        return null; // Empty state handled by parent layout or just show upload
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Resumes</h2>
            <div className="grid gap-4">
                {resumes.map((resume) => (
                    <Card key={resume.id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{resume.file_name}</h3>
                                            <p className="text-sm text-gray-500">
                                                Uploaded on {format(new Date(resume.created_at), 'PPP')}
                                            </p>
                                            {resume.ats_score !== undefined && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(resume.ats_score)}`}>
                                                        ATS Score: {resume.ats_score}/100
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {resume.experience_years ? `${resume.experience_years} years exp.` : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {resume.ats_score === undefined ? (
                                            <Button
                                                onClick={() => handleAnalyze(resume.id)}
                                                disabled={analyzingIds.includes(resume.id)}
                                                className="gap-2"
                                            >
                                                {analyzingIds.includes(resume.id) ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <BarChart2 className="h-4 w-4" />
                                                )}
                                                Analyze
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}
                                                className="gap-2"
                                            >
                                                {expandedId === resume.id ? "Hide Analysis" : "View Analysis"}
                                                {expandedId === resume.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(resume.id)}
                                            className="text-gray-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Analysis View */}
                                <AnimatePresence>
                                    {expandedId === resume.id && resume.improvement_suggestions && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-6 border-t pt-6"
                                        >
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                        Improvements Needed
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {(resume.improvement_suggestions || []).slice(0, 3).map((suggestion: any, idx: number) => (
                                                            <div key={idx} className="bg-yellow-50 p-3 rounded-lg text-sm border border-yellow-100">
                                                                <p className="font-medium text-yellow-800 mb-1">{suggestion.issue}</p>
                                                                <p className="text-yellow-700">{suggestion.suggestion}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        Skills Detected
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(resume.skills_extracted || []).map((skill: string, idx: number) => (
                                                            <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    {resume.skill_suggestions && resume.skill_suggestions.length > 0 && (
                                                        <div className="mt-4">
                                                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Recommended Skills</h4>
                                                            <div className="space-y-2">
                                                                {(resume.skill_suggestions || []).slice(0, 3).map((skill: any, idx: number) => (
                                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600">{skill.skill}</span>
                                                                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                            {skill.demand} demand
                                                                        </Badge>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {improvementId && (
                <ResumeImprovement
                    resumeId={improvementId}
                    isOpen={!!improvementId}
                    onClose={() => setImprovementId(null)}
                />
            )}

            {skillsGapId && (
                <SkillsGap
                    resumeId={skillsGapId}
                    isOpen={!!skillsGapId}
                    onClose={() => setSkillsGapId(null)}
                />
            )}
        </div>
    );
}
