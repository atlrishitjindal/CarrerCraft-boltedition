import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Building2, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { jobService, Match } from '@/services/job.service';
import { toast } from 'sonner';

export function ApplicationsPage() {
    const [applications, setApplications] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const { matches } = await jobService.getMatches();
            // Filter for applied jobs only
            const applied = matches.filter(m => m.status === 'applied' || m.status === 'interviewing' || m.status === 'hired' || m.status === 'rejected');
            setApplications(applied);
        } catch (error) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied': return 'bg-blue-100 text-blue-700';
            case 'interviewing': return 'bg-purple-100 text-purple-700';
            case 'hired': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                <p className="text-gray-600 mt-1">Track the status of your job applications.</p>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12">Loading applications...</div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-lg font-medium">No applications yet</p>
                        <p className="mb-4">Start applying to jobs to track them here.</p>
                        <Button variant="outline" onClick={() => window.location.href = '/dashboard/jobs'}>
                            Find Jobs
                        </Button>
                    </div>
                ) : (
                    applications.map((app) => (
                        <Card key={app.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{app.job.title}</h3>
                                            <Badge variant="secondary" className={`${getStatusColor(app.status)} capitalize`}>
                                                {app.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-gray-600 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Building2 className="h-4 w-4" />
                                                <span>{app.job.company}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{app.job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Applied {format(new Date(app.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="gap-2">
                                                View Job Details <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
