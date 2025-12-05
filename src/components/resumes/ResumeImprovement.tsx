import { useState } from 'react';
import { Copy, FileText, Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { resumeService } from '@/services/resume.service';
import { toast } from 'sonner';

interface ResumeImprovementProps {
    resumeId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ResumeImprovement({ resumeId, isOpen, onClose }: ResumeImprovementProps) {
    const [loading, setLoading] = useState(false);
    const [improvedText, setImprovedText] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleImprove = async () => {
        setLoading(true);
        try {
            const { improvedText: text } = await resumeService.improveResume(resumeId);
            setImprovedText(text);
        } catch (error) {
            toast.error('Failed to improve resume');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (improvedText) {
            navigator.clipboard.writeText(improvedText);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>AI Resume Improvement</DialogTitle>
                    <DialogDescription>
                        Get an AI-rewritten version of your resume optimized for ATS and professional tone.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto min-h-[300px] mt-4 p-4 bg-gray-50 rounded-lg border">
                    {improvedText ? (
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-sm">
                            {improvedText}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                            <FileText className="h-12 w-12 opacity-20" />
                            <p>Click below to generate an improved version</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {improvedText ? (
                        <Button onClick={handleCopy} className="gap-2">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy Text'}
                        </Button>
                    ) : (
                        <Button onClick={handleImprove} disabled={loading}>
                            {loading ? 'Improving...' : 'Improve with AI'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
