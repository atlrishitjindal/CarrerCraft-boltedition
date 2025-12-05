import { useState } from 'react';
import { ResumeUpload } from '@/components/resumes/ResumeUpload';
import { ResumeList } from '@/components/resumes/ResumeList';

export function ResumePage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
                <p className="text-gray-600 mt-1">Upload and analyze your resumes to improve your job matches.</p>
            </div>

            <div className="space-y-8">
                <section>
                    <ResumeUpload onUploadSuccess={handleUploadSuccess} />
                </section>

                <section>
                    <ResumeList refreshTrigger={refreshTrigger} />
                </section>
            </div>
        </div>
    );
}
