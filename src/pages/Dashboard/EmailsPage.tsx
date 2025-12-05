import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MOCK_EMAILS = [
    {
        id: 1,
        from: 'CareerCraft AI',
        subject: 'Welcome to your new career assistant',
        preview: 'Hi there, welcome to CareerCraft AI! We are excited to help you...',
        date: '2 hours ago',
        read: false,
        tag: 'System'
    },
    {
        id: 2,
        from: 'Tech Corp Recruiting',
        subject: 'Application Received - Senior Developer',
        preview: 'Thank you for your application. We have received your resume and...',
        date: '1 day ago',
        read: true,
        tag: 'Applications'
    },
    {
        id: 3,
        from: 'Job Match Alert',
        subject: 'New Match: Frontend Engineer at StartupXYZ',
        preview: 'We found a new job that matches your profile perfectly...',
        date: '2 days ago',
        read: true,
        tag: 'Jobs'
    }
];

export function EmailsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
                    <p className="text-gray-600 mt-1">Notifications and communications</p>
                </div>
                <Button variant="outline" size="icon">
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                    <CardDescription>You have {MOCK_EMAILS.filter(e => !e.read).length} unread messages</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {MOCK_EMAILS.map((email) => (
                            <div
                                key={email.id}
                                className={`flex gap-4 p-4 rounded-lg border ${email.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
                            >
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${email.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-medium truncate ${email.read ? 'text-gray-900' : 'text-blue-900'}`}>
                                            {email.from}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{email.date}</span>
                                    </div>
                                    <p className={`text-sm mt-1 truncate ${email.read ? 'text-gray-500' : 'text-blue-700'}`}>
                                        {email.subject}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1 truncate">
                                        {email.preview}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <Badge variant="outline">{email.tag}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
