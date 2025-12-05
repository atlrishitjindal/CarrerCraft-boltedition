import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Briefcase,
  Target,
  TrendingUp,
  Upload,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resumeService } from '@/services/resume.service';
import { jobService } from '@/services/job.service';

export function DashboardOverview() {
  const { data: resumes, isLoading: isLoadingResumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeService.getResumes
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: jobService.getMatches
  });

  const latestResume = resumes?.resumes?.[0];
  const atsScore = latestResume?.ats_score || 0;
  const matchCount = matches?.matches?.length || 0;

  const applications = matches?.matches?.filter(m => m.status === 'applied' || m.status === 'interviewing' || m.status === 'hired' || m.status === 'rejected') || [];
  const applicationCount = applications.length;

  const responseCount = matches?.matches?.filter(m => m.status === 'interviewing' || m.status === 'hired').length || 0;
  const responseRate = applicationCount > 0 ? Math.round((responseCount / applicationCount) * 100) : 0;

  const stats = [
    {
      name: 'Resume Score',
      value: atsScore.toString(),
      suffix: '/100',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Job Matches',
      value: matchCount.toString(),
      suffix: '',
      icon: Briefcase,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'Applications',
      value: applicationCount.toString(),
      suffix: '',
      icon: Target,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Response Rate',
      value: responseRate.toString(),
      suffix: '%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  const recentActivity = [
    ...(matches?.matches || []).slice(0, 3).map(m => ({
      type: 'match',
      title: m.job.title,
      company: m.job.company,
      time: new Date(m.created_at).toLocaleDateString(),
      status: m.status
    }))
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your career overview</p>
        </div>
        <Link to="/dashboard/resumes">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Resume
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold">
                      {stat.value}
                      <span className="text-lg text-gray-500">{stat.suffix}</span>
                    </p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">Activity tracking coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/dashboard/resumes">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Analyze Resume</p>
                    <p className="text-sm text-gray-500">Get AI-powered insights</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard/jobs">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Find Job Matches</p>
                    <p className="text-sm text-gray-500">Discover opportunities</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard/applications">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Track Applications</p>
                    <p className="text-sm text-gray-500">Monitor progress</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {activity.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-blue-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.company} • {activity.time}
                    </p>
                  </div>
                  <Badge variant={activity.status === 'new' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
