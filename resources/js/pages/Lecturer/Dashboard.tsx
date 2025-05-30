import LecturerLayout from '@/layouts/LecturerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { CalendarDays, Clock, School, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Reservation {
    id: number;
    lab: string;
    date: string;
    time: string;
    status: 'approved' | 'pending' | 'rejected';
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

export default function Dashboard({ upcomingReservations = [], recentNotifications = [], stats = { totalReservations: 5, pendingReservations: 2, labsAvailable: 8 } }: DashboardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Sample data for demonstration
    const sampleReservations: Reservation[] = [
        { id: 1, lab: 'Computer Lab 101', date: '2023-06-15', time: '10:00 - 12:00', status: 'approved' },
        { id: 2, lab: 'Physics Lab 202', date: '2023-06-16', time: '13:00 - 15:00', status: 'pending' },
        { id: 3, lab: 'Chemistry Lab 303', date: '2023-06-17', time: '09:00 - 11:00', status: 'approved' },
    ];

    const sampleNotifications: Notification[] = [
        { id: 1, title: 'Reservation Approved', message: 'Your reservation for Computer Lab 101 has been approved', date: '2023-06-14', read: false },
        { id: 2, title: 'Lab Schedule Updated', message: 'The schedule for Physics Lab 202 has been updated', date: '2023-06-13', read: true },
        { id: 3, title: 'Maintenance Notice', message: 'Chemistry Lab 303 will be under maintenance on June 20', date: '2023-06-12', read: true },
    ];

    const reservationsToShow = upcomingReservations.length > 0 ? upcomingReservations : sampleReservations;
    const notificationsToShow = recentNotifications.length > 0 ? recentNotifications : sampleNotifications;

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
                        <div className="text-2xl font-bold">{reservationsToShow.filter(r => r.status === 'approved').length}</div>
                        <p className="text-xs text-muted-foreground">
                            Next session on {reservationsToShow[0]?.date || 'N/A'}
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
                            {reservationsToShow.map((reservation) => (
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
                            ))}
                            <Button variant="outline" className="w-full mt-2">
                                View All Reservations
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-16">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notificationsToShow.map((notification) => (
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
                        <Button variant="outline" className="w-full mt-4">
                            View All Notifications
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </LecturerLayout>
    );
}
