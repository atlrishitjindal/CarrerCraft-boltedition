import { useState } from 'react';
import { Target, Search, BookOpen } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { resumeService } from '@/services/resume.service';
import { toast } from 'sonner';

interface SkillsGapProps {
    resumeId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function SkillsGap({ resumeId, isOpen, onClose }: SkillsGapProps) {
    const [loading, setLoading] = useState(false);
    const [targetRole, setTargetRole] = useState('');
    const [suggestions, setSuggestions] = useState<any[] | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetRole.trim()) return;

        setLoading(true);
        try {
            const { skillSuggestions } = await resumeService.getSkillsGap(resumeId, targetRole);
            setSuggestions(skillSuggestions);
        } catch (error) {
            toast.error('Failed to analyze skills gap');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Skills Gap Analysis</DialogTitle>
                    <DialogDescription>
                        Enter a target job role to identify missing skills and recommendations.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAnalyze} className="flex gap-2 mt-2">
                    <Input
                        placeholder="e.g. Senior Frontend Engineer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading || !targetRole.trim()}>
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </Button>
                </form>

                {suggestions && (
                    <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        <h4 className="font-medium flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            Recommended Skills for {targetRole}
                        </h4>
                        <div className="space-y-3">
                            {suggestions.map((skill: any, idx: number) => (
                                <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-gray-900">{skill.skill}</span>
                                        <Badge variant={skill.demand === 'high' ? 'destructive' : 'secondary'}>
                                            {skill.demand} demand
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <BookOpen className="h-3 w-3" />
                                        <span>Relevance: {skill.relevance}%</span>
                                    </div>
                                </div>
                            ))}
                            {suggestions.length === 0 && (
                                <p className="text-center text-gray-500 py-4">No specific gaps identified! You seem well matched.</p>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
