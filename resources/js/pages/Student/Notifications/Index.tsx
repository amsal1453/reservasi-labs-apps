import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, ChevronRight, Mail, MailOpen } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    sent_at: string;
    data: Record<string, any>;
}

interface Props {
    notifications: Notification[];
}

export default function Index({ notifications }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy, HH:mm', { locale: id });
    };

    const getNotificationIcon = (type: string, isRead: boolean) => {
        if (isRead) {
            return <MailOpen className="h-5 w-5 text-gray-400" />;
        } else {
            switch (type) {
                case 'reservation_status_changed':
                    return <Bell className="h-5 w-5 text-blue-500" />;
                default:
                    return <Mail className="h-5 w-5 text-blue-500" />;
            }
        }
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Notifikasi', href: route('student.notifications.index') },
        ]}>
            <Head title="Notifikasi" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Notifikasi</h1>
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Bell className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">Anda belum memiliki notifikasi</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Semua Notifikasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={route('student.notifications.show', notification.id)}
                                    className={`block p-4 hover:bg-gray-50 transition-colors ${notification.is_read ? 'bg-white' : 'bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {getNotificationIcon(notification.type, notification.is_read)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-medium ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </h3>
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <p className={`mt-1 text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                                                {notification.message}
                                            </p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(notification.sent_at)}
                                                </span>
                                                {!notification.is_read && (
                                                    <Badge className="bg-blue-500">Baru</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </StudentLayout>
    );
}
