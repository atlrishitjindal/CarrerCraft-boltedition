
import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Clipboard, Briefcase, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize the worker. Use a local worker if possible or the CDN one. 
// Note: In Vite, we often need to copy the worker to public folder or import it differently. 
// For now, using the CDN as provided by the user but changing version to match if needed. 
// Ideally we should use the installed package's worker.
// Let's try to trust the user's snippet first, but imports might need adjustment.
// User's snippet:
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs`;
// Since we installed pdfjs-dist, maybe we can point to local? 
// For simplicity and to match the user request exactly, I will use their URL.

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs`;

interface ResumeUploaderProps {
    onAnalyze: (resumeText: string, fileName: string | null, jobDescription: string) => void;
    isAnalyzing: boolean;
}

export const ResumeUpload: React.FC<ResumeUploaderProps> = ({ onAnalyze, isAnalyzing }) => {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [isReading, setIsReading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isText = file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md');

        // Basic validation
        if (!isPdf && !isText) {
            alert("Please upload a .pdf, .txt or .md file.");
            return;
        }

        setFileName(file.name);
        setIsReading(true);

        try {
            if (isPdf) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                        .map((item: any) => item.str)
                        .join(' ');
                    fullText += pageText + '\n\n';
                }
                setResumeText(fullText);
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const text = event.target?.result as string;
                    setResumeText(text);
                    setIsReading(false);
                };
                reader.readAsText(file);
                return; // Exit early as reader is async
            }
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Failed to extract text from file. Please try copy-pasting.");
            setFileName(null);
            setResumeText('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setIsReading(false); // Ensure this runs for PDF too
        }
    };

    const handleRemoveFile = () => {
        setFileName(null);
        setResumeText('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (resumeText.trim().length < 50) {
            alert("Please provide more resume content for a valid analysis.");
            return;
        }
        // Pass fileName too if available
        onAnalyze(resumeText, fileName, jobDescription);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-8 bg-indigo-600 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">Optimize Your Resume</h1>
                    <p className="text-indigo-100 max-w-2xl mx-auto">
                        Upload your resume or paste the content below to get instant AI-powered feedback, scoring, and improvement suggestions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Resume Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-500" />
                                Resume Content
                            </label>
                            {fileName && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {fileName}
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="ml-1.5 text-green-600 hover:text-green-900 focus:outline-none"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Upload Box */}
                            <div
                                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${fileName ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                                    }`}
                                onClick={() => !isReading && fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".txt,.md,.pdf"
                                    onChange={handleFileUpload}
                                    disabled={isReading}
                                />
                                <UploadCloud className={`w-10 h-10 mb-3 ${fileName ? 'text-green-500' : 'text-slate-400'}`} />
                                <p className="text-sm font-medium text-slate-900">
                                    {isReading ? 'Processing...' : (fileName ? 'File Selected' : 'Click to upload')}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Supported: .pdf, .txt, .md
                                </p>
                            </div>

                            {/* Text Area */}
                            <div className="relative">
                                <textarea
                                    className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm text-slate-700 bg-white"
                                    placeholder="Or paste your resume text here..."
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    disabled={isReading}
                                />
                                <div className="absolute top-3 right-3 text-slate-400">
                                    {isReading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clipboard className="w-4 h-4" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Description Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-indigo-500" />
                            Target Job Description (Optional)
                        </label>
                        <textarea
                            className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm text-slate-700"
                            placeholder="Paste the job description you are applying for to get tailored results..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isAnalyzing || isReading || !resumeText.trim()}
                            className={`
                px-8 py-4 rounded-xl font-bold text-white shadow-lg transform transition-all flex items-center gap-2
                ${(isAnalyzing || isReading || !resumeText.trim())
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-200'
                                }
              `}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze Resume'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
