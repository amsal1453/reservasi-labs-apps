import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { NotificationBell } from '@/components/NotificationBell';
import AppLogo from './app-logo';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    // Ambil tanggal hari ini
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const formattedDate = `${days[today.getDay()]}, ${today.getDate().toString().padStart(2, '0')}-${months[today.getMonth()]}-${today.getFullYear()}`;

    return (
        <div className="bg-white flex flex-col -ml-8">
            {/* Atas: Logo menu, Tanggal, dan Notifikasi */}
            <div className="flex items-center justify-between gap-4 px-4 py-2">
                {/* Kiri: Logo menu dan Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="text-[#800000] hover:bg-[#800000]/10" />
                    {breadcrumbs.length > 0 && (
                        <div className="flex items-center h-7">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    )}
                </div>
                {/* Kanan: Tanggal dan Notifikasi */}
                <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold whitespace-nowrap text-[#800000] flex items-center h-7">
                        {formattedDate}
                    </span>
                    <NotificationBell href={route('admin.notifications.index')} className="w-7 h-7 text-[#800000]" />
                </div>
            </div>
        </div>
    );
}
