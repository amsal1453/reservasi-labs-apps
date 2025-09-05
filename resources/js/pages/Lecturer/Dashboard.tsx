import LecturerLayout from '@/layouts/LecturerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Clock, School, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Reservation {
    id: number;
    lab: string;
    date: string;
    time: string;
    status: 'approved' | 'pending' | 'rejected' | 'cancelled';
}

interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
}

interface DashboardProps {
    upcomingReservations: Reservation[];
    recentNotifications: Notification[];
    stats: {
        totalReservations: number;
        pendingReservations: number;
        labsAvailable: number;
    };
}

export default function Dashboard({ upcomingReservations, recentNotifications, stats }: DashboardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <LecturerLayout breadcrumbs={[
            { title: 'Dashboard', href: route('lecturer.dashboard') }
        ]}>
            <Head title="Dashboard" />

            <h1 className="mb-6 text-2xl font-bold text-[#800000]">Dashboard Dosen</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Reservasi</CardTitle>
                        <CalendarDays className="w-4 h-4 text-[#800000]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalReservations}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.pendingReservations} menunggu persetujuan
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Sesi Mendatang</CardTitle>
                        <Clock className="w-4 h-4 text-[#800000]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingReservations.filter(r => r.status === 'approved').length}</div>
                        <p className="text-xs text-muted-foreground">
                            Sesi berikutnya pada {upcomingReservations[0]?.date || 'N/A'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Lab Tersedia</CardTitle>
                        <School className="w-4 h-4 text-[#800000]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.labsAvailable}</div>
                        <p className="text-xs text-muted-foreground">
                            Tersedia untuk reservasi
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 mt-6 md:grid-cols-2">
                <Card className="col-span-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <CardHeader>
                        <CardTitle>Reservasi Mendatang</CardTitle>
                        <CardDescription>Sesi lab yang telah dijadwalkan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingReservations.length > 0 ? (
                                upcomingReservations.map((reservation) => (
                                    <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h3 className="font-medium">{reservation.lab}</h3>
                                            <div className="text-sm text-muted-foreground">
                                                <span>{reservation.date}</span> • <span>{reservation.time}</span>
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(reservation.status)}>
                                            {reservation.status === 'approved' ? 'Disetujui' :
                                                reservation.status === 'pending' ? 'Menunggu' :
                                                    reservation.status === 'rejected' ? 'Ditolak' : 'Dibatalkan'}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                        Tidak ada reservasi mendatang
                                </div>
                            )}
                            <Button variant="outline" className="w-full mt-2" asChild>
                                <Link href={route('lecturer.reservations.index')}>
                                    Lihat Semua Reservasi
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Notifikasi Terbaru</CardTitle>
                            <CardDescription>Pembaruan dan pemberitahuan</CardDescription>
                        </div>
                        <Bell className="w-5 h-5 text-[#800000]" />
                    </CardHeader>
                    <CardContent>
                        {recentNotifications.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Judul</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="w-16">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentNotifications.map((notification) => (
                                        <TableRow key={notification.id}>
                                            <TableCell>
                                                <div className="font-medium">{notification.title}</div>
                                                <div className="text-sm text-muted-foreground">{notification.message}</div>
                                            </TableCell>
                                            <TableCell>{notification.date}</TableCell>
                                            <TableCell>
                                                {!notification.read && (
                                                    <Badge className="bg-[#800000]/10 text-[#800000]">Baru</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">
                                    Tidak ada notifikasi terbaru
                            </div>
                        )}
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link href={route('lecturer.notifications.index')}>
                                Lihat Semua Notifikasi
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </LecturerLayout>
    );
}
