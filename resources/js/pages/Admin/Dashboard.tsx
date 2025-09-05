import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

// Tipe data statistik
interface StatType {
    totalReservations: number;
    todayReservations: number;
    totalLabs: number;
    totalUsers: number;
}

// Tipe data reservasi
interface ReservationType {
    id: number;
    user_name: string;
    lab_name: string;
    date: string;
    status: string;
}

// Tipe data reservasi mendatang
interface UpcomingReservation {
    lab_name: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
}

// Tipe data notifikasi
interface NotificationType {
    title: string;
    body: string;
    date: string;
    is_new: boolean;
}

interface DashboardProps {
    stats: StatType;
    recentReservations: ReservationType[];
    upcomingReservations: UpcomingReservation[];
    latestNotifications: NotificationType[];
}

// Warna untuk setiap card statistik yang disesuaikan dengan identitas warna kampus (UUI)
const statColors = [
    'bg-[#800000] text-white',   // Maroon - Jumlah Reservasi
    'bg-[#800000] text-white',   // Merah terang - Sesi Mendatang
    'bg-[#800000] text-white',   // Maroon - Laboratorium Tersedia
    'bg-[#800000] text-white',   // Merah terang - Jumlah Pengguna
];

export default function Dashboard({ stats, recentReservations, upcomingReservations, latestNotifications }: DashboardProps) {
    const statList = [
        { title: 'Jumlah Reservasi', value: stats.totalReservations },
        { title: 'Sesi Mendatang', value: stats.todayReservations },
        { title: 'Laboratorium Tersedia', value: stats.totalLabs },
        { title: 'Jumlah Pengguna', value: stats.totalUsers },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }]}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-2 min-h-screen bg-white dark:bg-neutral-900 mt-12">
                {/* Statistik Ringkas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 -mt-12 z-10">
                    {statList.map((stat, idx) => (
                        <StatCard key={stat.title} title={stat.title} value={stat.value} className={statColors[idx % statColors.length]} />
                    ))}
                </div>

                {/* Reservasi Mendatang & Pemberitahuan Terbaru */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {/* Reservasi Mendatang */}
                    <div className="rounded-xl shadow p-4 border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                        <h2 className="font-bold text-lg mb-2">Reservasi Mendatang</h2>
                        <div className="text-sm text-gray-500 mb-3">Sesi lab terjadwal Anda berikutnya</div>
                        <div className="space-y-3">
                            {upcomingReservations && upcomingReservations.length > 0 ? (
                                upcomingReservations.map((r, idx) => (
                                    <div key={idx} className="border rounded-lg p-3 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">{r.lab_name}</div>
                                            <div className="text-xs text-gray-500">{r.date} • {r.start_time} - {r.end_time}</div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.status === 'disetujui' ? 'bg-green-100 text-green-700' : r.status === 'tertunda' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Tidak ada reservasi mendatang
                                </div>
                            )}
                        </div>
                        <div className="mt-3">
                            <Link href={route('admin.reservations.index')} className="text-sm text-blue-600 hover:underline">
                                Lihat semua reservasi
                            </Link>
                        </div>
                    </div>
                    {/* Pemberitahuan Terbaru */}
                    <div className="rounded-xl shadow p-4 border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-bold text-lg">Pemberitahuan Terbaru</h2>
                            <span className="text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></span>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">Pembaruan dan peringatan</div>
                        <div className="space-y-2">
                            {latestNotifications && latestNotifications.length > 0 ? (
                                latestNotifications.map((n, idx) => (
                                    <div key={idx} className="border-b pb-2 mb-2 rounded">
                                        <div className="font-semibold">{n.title}</div>
                                        <div className="text-xs text-gray-500">{n.body}</div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-gray-400">{n.date}</span>
                                            {n.is_new && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">Baru</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Tidak ada notifikasi terbaru
                                </div>
                            )}
                        </div>
                        <div className="mt-3">
                            <Link href={route('admin.notifications.index')} className="text-sm text-blue-600 hover:underline">
                                Lihat semua notifikasi
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tabel Reservasi Terbaru */}
                <div className="rounded-xl shadow p-4 mt-4 border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <h2 className="font-bold text-lg mb-2">Reservasi Terbaru</h2>
                    {recentReservations && recentReservations.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Nama</th>
                                    <th className="text-left py-2">Lab</th>
                                    <th className="text-left py-2">Tanggal</th>
                                    <th className="text-left py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentReservations.map((r) => (
                                    <tr key={r.id} className="border-b">
                                        <td className="py-2">{r.user_name}</td>
                                        <td className="py-2">{r.lab_name}</td>
                                        <td className="py-2">{r.date}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${r.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {r.status === 'approved' ? 'Disetujui' :
                                                    r.status === 'pending' ? 'Tertunda' : 'Ditolak'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            Tidak ada reservasi terbaru
                        </div>
                    )}
                    <div className="mt-3">
                        <Link href={route('admin.reservations.index')} className="text-sm text-blue-600 hover:underline">
                            Lihat semua reservasi
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Komponen Card Statistik
function StatCard({ title, value, className }: { title: string; value: number; className?: string }) {
    return (
        <div className={`rounded-xl shadow p-4 flex flex-col items-center ${className}`}>
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-sm">{title}</span>
        </div>
    );
}
