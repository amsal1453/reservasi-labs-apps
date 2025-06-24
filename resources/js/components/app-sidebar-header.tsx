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
        <>
            {/* Atas: Logo menu, Tanggal, dan Notifikasi di atas latar putih sejajar */}
            <div className="bg-white flex items-center justify-between gap-4 px-4 pt-1 pb-1 -ml-8">
                {/* Kiri: Logo menu */}
                <SidebarTrigger className="text-[#800000] hover:bg-[#800000]/10" />
                {/* Kanan: Tanggal dan Notifikasi */}
                <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold whitespace-nowrap text-[#800000] flex items-center h-7">
                        {formattedDate}
                    </span>
                    <NotificationBell href={route('admin.notifications.index')} className="w-7 h-7 text-[#800000]" />
                </div>
            </div>
            <header className="relative w-[calc(100%+3rem)] -mx-6 bg-[rgb(143,2,2)] h-30 flex items-center justify-between px-8">
                {/* Tengah: (bisa diisi judul, kosong, dsb) */}
                <div className="flex-1"></div>
            </header>
        </>
    );
}
