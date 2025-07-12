import { Head, usePage } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem, type SharedData } from '@/types';

import AppLayout from '@/layouts/app-layout';
import LecturerLayout from '@/layouts/LecturerLayout';
import StudentLayout from '@/layouts/StudentLayout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: '/settings/profile',
    },
    {
        title: 'Tampilan',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user.roles[0]?.name;

    // Render content
    const renderContent = () => (
        <>
            <Head title="Pengaturan Tampilan" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Pengaturan Tampilan" description="Perbarui pengaturan tampilan akun Anda" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </>
    );

    // Render with appropriate layout based on user role
    switch (userRole) {
        case 'admin':
            return <AppLayout breadcrumbs={breadcrumbs}>{renderContent()}</AppLayout>;
        case 'lecturer':
            return <LecturerLayout breadcrumbs={breadcrumbs}>{renderContent()}</LecturerLayout>;
        case 'student':
            return <StudentLayout breadcrumbs={breadcrumbs}>{renderContent()}</StudentLayout>;
        default:
            return <AppLayout breadcrumbs={breadcrumbs}>{renderContent()}</AppLayout>;
    }


}
