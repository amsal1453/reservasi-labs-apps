import LecturerLayout from '@/layouts/LecturerLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NotificationAction {
    url?: string;
    text?: string;
}

interface NotificationData {
    title?: string;
    message?: string;
    text?: string;
    action?: NotificationAction;
    [key: string]: unknown;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
    data?: NotificationData;
}

interface PageProps {
    notification: Notification;
}

export default function Show({ notification }: PageProps) {
    return (
        <LecturerLayout breadcrumbs={[
            { title: 'Dashboard', href: route('lecturer.dashboard') },
            { title: 'Notifications', href: route('lecturer.notifications.index') },
            { title: notification.title, href: route('lecturer.notifications.show', notification.id) },
        ]}>
            <Head title="Notification Detail" />
            <div className="p-6">
                <div className="mb-6">
                    <Button variant="outline" asChild className="flex items-center gap-2">
                        <Link href={route('lecturer.notifications.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Notifications</span>
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{notification.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{notification.sent_at}</span>
                                </div>
                                <Badge variant={notification.is_read ? "outline" : "default"}>
                                    {notification.is_read ? "Read" : "New"}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="prose max-w-none">
                            {notification.message ? (
                                <div dangerouslySetInnerHTML={{ __html: notification.message }} />
                            ) : (
                                <p className="text-gray-500">No content available</p>
                            )}
                        </div>

                        {notification.data && notification.data.action && (
                            <div className="mt-6">
                                <Button asChild>
                                    <Link href={notification.data.action.url || '#'}>
                                        {notification.data.action.text || 'View Details'}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </LecturerLayout>
    );
}
