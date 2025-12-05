import { useState } from 'react';
import { Send, FileText, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { jobService, Match } from '@/services/job.service';
import { toast } from 'sonner';

interface JobApplicationProps {
    match: Match;
    isOpen: boolean;
    onClose: () => void;
    onApplied: () => void;
}

export function JobApplication({ match, isOpen, onClose, onApplied }: JobApplicationProps) {
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [step, setStep] = useState<'review' | 'success'>('review');

    const handleGenerateCoverLetter = async () => {
        setGenerating(true);
        try {
            const { coverLetter: letter } = await jobService.generateCoverLetter(match.id);
            setCoverLetter(letter);
            toast.success('Cover letter generated');
        } catch (error) {
            toast.error('Failed to generate cover letter');
        } finally {
            setGenerating(false);
        }
    };

    const handleApply = async () => {
        setLoading(true);
        try {
            await jobService.applyToJob(match.id);
            setStep('success');
            setTimeout(() => {
                onApplied();
                onClose();
                setStep('review'); // Reset for next time if component reused physically (though largely unmounted)
            }, 2000);
        } catch (error) {
            toast.error('Failed to submit application');
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Apply to {match.job.company}</DialogTitle>
                    <DialogDescription>
                        {step === 'review'
                            ? `Review your application for ${match.job.title}`
                            : 'Application Status'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'review' ? (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                            <div className="relative">
                                <Textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    placeholder="Write your cover letter here or generate one with AI..."
                                    className="min-h-[200px] bg-white"
                                />
                                {!coverLetter && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <Sparkles className="h-8 w-8 text-blue-500 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-gray-500">Tap "Generate with AI" below</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateCoverLetter}
                                    disabled={generating}
                                    className="gap-2"
                                >
                                    {generating ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-3 w-3 text-blue-600" />
                                    )}
                                    {generating ? 'Writing...' : 'Generate with AI'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Sent!</h3>
                        <p className="text-gray-500">
                            Your application for {match.job.title} at {match.job.company} has been submitted successfully.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    {step === 'review' && (
                        <>
                            <Button variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button onClick={handleApply} disabled={loading || (coverLetter.length < 50 && !coverLetter)}>
                                {loading ? 'Sending...' : 'Send Application'} <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
