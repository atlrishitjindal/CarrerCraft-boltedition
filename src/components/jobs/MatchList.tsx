import { useState, useEffect } from 'react';
import { Briefcase, Building2, MapPin, DollarSign, Star, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { jobService, Match } from '@/services/job.service';
import { resumeService } from '@/services/resume.service';
import { JobApplication } from './JobApplication';
import { toast } from 'sonner';

export function MatchList() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');
    const [matching, setMatching] = useState(false);

    useEffect(() => {
        loadResumes();
        loadMatches();
    }, []);

    const loadResumes = async () => {
        try {
            const { resumes } = await resumeService.getResumes();
            setResumes(resumes);
            if (resumes.length > 0) {
                setSelectedResumeId(resumes[0].id);
            }
        } catch (error) {
            console.error('Failed to load resumes');
        }
    };

    const loadMatches = async () => {
        try {
            const { matches } = await jobService.getMatches();
            // Filter out applied/rejected jobs for the "New Matches" view if desired, or show all with status
            setMatches(matches);
        } catch (error) {
            console.error('Failed to load matches');
        } finally {
            setLoading(false);
        }
    };

    const handleMatch = async () => {
        if (!selectedResumeId) {
            toast.error('Please upload a resume first');
            return;
        }

        setMatching(true);
        try {
            const { matches: newMatches } = await jobService.matchJobs(selectedResumeId);
            setMatches(newMatches);
            toast.success(`Found ${newMatches.length} job matches!`);
        } catch (error) {
            toast.error('Failed to find matches');
        } finally {
            setMatching(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Find New Matches</h2>
                    <p className="text-sm text-gray-500">Select a resume to match against active job postings</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        className="h-10 rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                    >
                        {resumes.map(r => (
                            <option key={r.id} value={r.id}>{r.file_name}</option>
                        ))}
                    </select>
                    <Button onClick={handleMatch} disabled={matching}>
                        {matching ? 'Analyzing...' : 'Find Matches'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {matches.map((match) => (
                    <Card key={match.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-grow space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{match.job.title}</h3>
                                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                                                <Building2 className="h-4 w-4" />
                                                <span>{match.job.company}</span>
                                                <span className="text-gray-300">•</span>
                                                <MapPin className="h-4 w-4" />
                                                <span>{match.job.location}</span>
                                            </div>
                                        </div>
                                        <div className={`flex flex-col items-center p-3 rounded-lg ${getScoreColor(match.compatibility_score)}`}>
                                            <span className="text-2xl font-bold">{match.compatibility_score}%</span>
                                            <span className="text-xs font-medium">Match</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" /> {match.job.job_type}
                                        </Badge>
                                        {(match.job.salary_min || match.job.salary_max) && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                {match.job.salary_min && `$${match.job.salary_min / 1000}k`}
                                                {match.job.salary_min && match.job.salary_max && ' - '}
                                                {match.job.salary_max && `$${match.job.salary_max / 1000}k`}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-green-700 flex items-center gap-1 mb-2">
                                                <Check className="h-4 w-4" /> Matching Skills
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {match.matching_skills.slice(0, 5).map(skill => (
                                                    <span key={skill} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs border border-green-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {match.missing_keywords.length > 0 && (
                                            <div>
                                                <span className="font-medium text-red-700 flex items-center gap-1 mb-2">
                                                    <X className="h-4 w-4" /> Missing Keywords
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {match.missing_keywords.slice(0, 5).map(keyword => (
                                                        <span key={keyword} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-100">
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-3 border-l pl-6 md:w-48">
                                    <Button
                                        className="w-full"
                                        onClick={() => setSelectedMatch(match)}
                                        disabled={match.status === 'applied'}
                                    >
                                        {match.status === 'applied' ? 'Applied' : 'Apply Now'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {matches.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium">No job matches found yet</p>
                        <p>Upload a resume and click "Find Matches" to get started</p>
                    </div>
                )}
            </div>

            {selectedMatch && (
                <JobApplication
                    match={selectedMatch}
                    isOpen={!!selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                    onApplied={() => {
                        loadMatches(); // Refresh list to show 'Applied' status
                    }}
                />
            )}
        </div>
    );
}
