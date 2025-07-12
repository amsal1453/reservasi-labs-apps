import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ClipboardList, Bell, ArrowRight } from 'lucide-react';

interface Reservation {
    id: number;
    purpose: string;
    status: string;
    date: string;
    lab: {
        name: string;
    };
}

interface Schedule {
    id: number;
    day: string;
    start_time: string;
    end_time: string;
    lab: {
        name: string;
    };
}

interface Notification {
    id: number;
    title: string;
    is_read: boolean;
    sent_at: string;
}

interface PageProps {
    upcomingReservations: Reservation[];
    todaySchedules: Schedule[];
    unreadNotifications: Notification[];
    stats: {
        totalReservations: number;
        pendingReservations: number;
        approvedReservations: number;
        rejectedReservations: number;
    };
}

export default function Dashboard({
    upcomingReservations,
    todaySchedules,
    unreadNotifications,
    stats
}: PageProps) {
    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') }
        ]}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h1 className="text-2xl font-bold text-[#800000]">Selamat Datang di Sistem Reservasi Lab</h1>
                    <p className="text-gray-600 mt-2">
                        Kelola reservasi lab, lihat jadwal, dan pantau notifikasi Anda.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Reservasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalReservations}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Menunggu Persetujuan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-500">{stats.pendingReservations}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Disetujui</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-500">{stats.approvedReservations}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Ditolak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-500">{stats.rejectedReservations}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upcoming Reservations */}
                    <Card className="col-span-1">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Reservasi Mendatang</CardTitle>
                                <ClipboardList className="h-5 w-5 text-[#800000]" />
                            </div>
                            <CardDescription>Reservasi yang akan datang</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            {upcomingReservations.length === 0 ? (
                                <p className="text-gray-500 text-sm">Tidak ada reservasi mendatang.</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingReservations.map((reservation) => (
                                        <div key={reservation.id} className="border-b pb-3 last:border-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-sm">{reservation.purpose}</h4>
                                                    <p className="text-xs text-gray-500">
                                                        {reservation.lab.name} - {reservation.date}
                                                    </p>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-xs ${reservation.status === 'approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : reservation.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {reservation.status === 'approved'
                                                        ? 'Disetujui'
                                                        : reservation.status === 'rejected'
                                                            ? 'Ditolak'
                                                            : 'Menunggu'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" size="sm" className="w-full text-[#800000] hover:text-[#800000]/80 hover:bg-[#800000]/10" asChild>
                                <a href={route('student.reservations.index')} className="flex items-center justify-center gap-2">
                                    Lihat Semua
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Today's Schedules */}
                    <Card className="col-span-1">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Jadwal Hari Ini</CardTitle>
                                <Calendar className="h-5 w-5 text-[#800000]" />
                            </div>
                            <CardDescription>Jadwal lab untuk hari ini</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            {todaySchedules.length === 0 ? (
                                <p className="text-gray-500 text-sm">Tidak ada jadwal lab hari ini.</p>
                            ) : (
                                <div className="space-y-3">
                                    {todaySchedules.map((schedule) => (
                                        <div key={schedule.id} className="border-b pb-3 last:border-0">
                                            <h4 className="font-medium text-sm">{schedule.lab.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" size="sm" className="w-full text-[#800000] hover:text-[#800000]/80 hover:bg-[#800000]/10" asChild>
                                <a href={route('student.lab-schedules.index')} className="flex items-center justify-center gap-2">
                                    Lihat Semua
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Notifications */}
                    <Card className="col-span-1">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Notifikasi Terbaru</CardTitle>
                                <Bell className="h-5 w-5 text-[#800000]" />
                            </div>
                            <CardDescription>Notifikasi yang belum dibaca</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            {unreadNotifications.length === 0 ? (
                                <p className="text-gray-500 text-sm">Tidak ada notifikasi baru.</p>
                            ) : (
                                <div className="space-y-3">
                                    {unreadNotifications.map((notification) => (
                                        <div key={notification.id} className="border-b pb-3 last:border-0">
                                            <h4 className="font-medium text-sm">{notification.title}</h4>
                                            <p className="text-xs text-gray-500">{notification.sent_at}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" size="sm" className="w-full text-[#800000] hover:text-[#800000]/80 hover:bg-[#800000]/10" asChild>
                                <a href={route('student.notifications.index')} className="flex items-center justify-center gap-2">
                                    Lihat Semua
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4 text-[#800000]">Aksi Cepat</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button className="bg-[#800000] hover:bg-[#800000]/90" asChild>
                            <a href={route('student.reservations.create')} className="flex items-center justify-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                Buat Reservasi
                            </a>
                        </Button>
                        <Button variant="outline" className="border-[#800000] text-[#800000] hover:bg-[#800000]/10" asChild>
                            <a href={route('student.lab-schedules.index')} className="flex items-center justify-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Lihat Jadwal Lab
                            </a>
                        </Button>
                        <Button variant="outline" className="border-[#800000] text-[#800000] hover:bg-[#800000]/10" asChild>
                            <a href={route('student.notifications.index')} className="flex items-center justify-center gap-2">
                                <Bell className="h-5 w-5" />
                                Cek Notifikasi
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

