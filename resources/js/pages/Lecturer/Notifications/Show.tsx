import LecturerLayout from '@/layouts/LecturerLayout';
import { Head } from '@inertiajs/react';

interface Notification {
    id: number;
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
    user_id: number;
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
                <h1 className="text-xl font-bold mb-2">{notification.title}</h1>
                <p className="text-gray-600 text-sm mb-4">{notification.sent_at}</p>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: notification.message }} />
            </div>
        </LecturerLayout>
    );
}
