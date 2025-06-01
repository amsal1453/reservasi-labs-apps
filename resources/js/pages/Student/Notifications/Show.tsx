import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface NotificationData {
    reservation_id?: number;
    status?: string;
    lab_name?: string;
    [key: string]: string | number | boolean | null | undefined;
}

interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    sent_at: string;
    data: NotificationData;
}

interface Props {
    notification: Notification;
}

export default function Show({ notification }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy, HH:mm', { locale: id });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'reservation_status_changed':
                return <Calendar className="h-6 w-6 text-blue-500" />;
            default:
                return <Info className="h-6 w-6 text-blue-500" />;
        }
    };

    const getNotificationTypeLabel = (type: string) => {
        switch (type) {
            case 'reservation_status_changed':
                return 'Status Reservasi';
            case 'reservation_reminder':
                return 'Pengingat Reservasi';
            default:
                return 'Notifikasi';
        }
    };

    // Handle additional data based on notification type
    const renderAdditionalContent = () => {
        if (notification.type === 'reservation_status_changed' && notification.data) {
            const { reservation_id, status, lab_name } = notification.data;

            return (
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Detail Reservasi</h3>
                    <div className="space-y-2">
                        {lab_name && (
                            <div className="flex items-center gap-2">
                                <div className="w-24 text-sm text-gray-500">Lab:</div>
                                <div className="text-sm">{lab_name}</div>
                            </div>
                        )}
                        {status && (
                            <div className="flex items-center gap-2">
                                <div className="w-24 text-sm text-gray-500">Status:</div>
                                <div className="text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'approved' ? 'bg-green-100 text-green-800' :
                                        status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {status === 'approved' ? 'Disetujui' :
                                            status === 'rejected' ? 'Ditolak' :
                                                status === 'pending' ? 'Menunggu' : status}
                                    </span>
                                </div>
                            </div>
                        )}
                        {reservation_id && (
                            <div className="mt-4">
                                <Link href={route('student.reservations.show', reservation_id)}>
                                    <Button variant="outline" size="sm">
                                        Lihat Detail Reservasi
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Notifikasi', href: route('student.notifications.index') },
            { title: 'Detail Notifikasi', href: route('student.notifications.show', notification.id) },
        ]}>
            <Head title="Detail Notifikasi" />

            <div className="mb-6 flex items-center">
                <Link href={route('student.notifications.index')} className="mr-4">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Detail Notifikasi</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        {getNotificationIcon(notification.type)}
                        <div>
                            <CardTitle>{notification.title}</CardTitle>
                            <p className="text-sm text-gray-500">{getNotificationTypeLabel(notification.type)}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(notification.sent_at)}</span>
                    </div>

                    <div className="mt-4 text-gray-700 border-t pt-4">
                        <p className="whitespace-pre-line">{notification.message}</p>
                    </div>

                    {renderAdditionalContent()}
                </CardContent>
            </Card>
        </StudentLayout>
    );
}
