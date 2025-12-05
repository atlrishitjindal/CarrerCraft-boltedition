import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchList } from '@/components/jobs/MatchList';

export function JobsPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Matching</h1>
                <p className="text-gray-600 mt-1">Find and apply to jobs that match your skills.</p>
            </div>

            <Tabs defaultValue="matches" className="w-full">
                <TabsList>
                    <TabsTrigger value="matches">Recommended Matches</TabsTrigger>
                    <TabsTrigger value="search">All Jobs</TabsTrigger>
                </TabsList>
                <TabsContent value="matches" className="mt-6">
                    <MatchList />
                </TabsContent>
                <TabsContent value="search" className="mt-6">
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                        <p>Job Search Coming Soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
