import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

interface Notification {
    id: number;
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
}

interface Props {
    notification: Notification;
}

export default function Show({ notification }: Props) {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Notifications', href: route('admin.notifications.index') },
        { title: notification.title, href: route('admin.notifications.show', notification.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title={`Notification - ${notification.title}`} />

            <div className="container py-6">
                <div className="mb-6">
                    <Button variant="outline" asChild className="flex items-center gap-2">
                        <Link href={route('admin.notifications.index')}>
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
                            <div dangerouslySetInnerHTML={{ __html: notification.message }} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
