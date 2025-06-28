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
        <LecturerLayout>
            <Head title="Dashboard" />

            <h1 className="mb-6 text-2xl font-bold">Lecturer Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                        <CalendarDays className="w-4 h-4 text-red-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalReservations}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.pendingReservations} pending approval
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                        <Clock className="w-4 h-4 text-red-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingReservations.filter(r => r.status === 'approved').length}</div>
                        <p className="text-xs text-muted-foreground">
                            Next session on {upcomingReservations[0]?.date || 'N/A'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Labs Available</CardTitle>
                        <School className="w-4 h-4 text-red-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.labsAvailable}</div>
                        <p className="text-xs text-muted-foreground">
                            Available for reservation
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 mt-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Upcoming Reservations</CardTitle>
                        <CardDescription>Your next scheduled lab sessions</CardDescription>
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
                                            {reservation.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    No upcoming reservations
                                </div>
                            )}
                            <Button variant="outline" className="w-full mt-2" asChild>
                                <Link href={route('lecturer.reservations.index')}>
                                    View All Reservations
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Notifications</CardTitle>
                            <CardDescription>Updates and alerts</CardDescription>
                        </div>
                        <Bell className="w-5 h-5 text-red-700" />
                    </CardHeader>
                    <CardContent>
                        {recentNotifications.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Date</TableHead>
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
                                                    <Badge className="bg-red-100 text-red-800">New</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">
                                No recent notifications
                            </div>
                        )}
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link href={route('lecturer.notifications.index')}>
                                View All Notifications
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </LecturerLayout>
    );
}
