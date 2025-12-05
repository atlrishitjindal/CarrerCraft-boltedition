import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { resumeService } from '@/services/resume.service';
import { toast } from 'sonner';

interface ResumeUploadProps {
    onUploadSuccess: () => void;
}

export function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setUploading(true);
        setProgress(0);

        // Simulate progress for better UX since axios upload progress is not hooked up in service yet
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);

        try {
            await resumeService.uploadResume(file);
            clearInterval(progressInterval);
            setProgress(100);
            toast.success('Resume uploaded successfully');
            onUploadSuccess();
        } catch (error: any) {
            clearInterval(progressInterval);
            setProgress(0);
            const message = error.response?.data?.message || 'Failed to upload resume';
            toast.error(message);
        } finally {
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
            }, 1000);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
        },
        maxFiles: 1,
        multiple: false,
        disabled: uploading
    });

    return (
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <CardContent className="p-0">
                <div
                    {...getRootProps()}
                    className="flex flex-col items-center justify-center p-12 text-center"
                >
                    <input {...getInputProps()} />
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-sm">
                        Drag and drop your resume here, or click to browse. Supported formats: PDF, DOC, DOCX (Max 10MB)
                    </p>
                    {uploading ? (
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Uploading...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    ) : (
                        <Button variant="outline" className="mt-2">
                            Select File
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
