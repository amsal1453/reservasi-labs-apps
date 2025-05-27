import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
    id: number;
    name: string;
    nim_nip: string;
}

interface Schedule {
    id: number;
    room: string;
}

interface Reservation {
    id: number;
    purpose: string;
    day: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user: User;
    schedule: Schedule | null;
}

interface Props {
    reservations: Reservation[];
}

const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
        case 'pending':
            return <Badge variant="outline">Menunggu</Badge>;
        case 'approved':
            return <Badge variant="success">Disetujui</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Ditolak</Badge>;
    }
};

export default function Index({ reservations }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Reservations', href: route('admin.reservations.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Reservations" />

            <div className="container py-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Manage Reservations</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Reservations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations.map((reservation) => (
                                    <TableRow key={reservation.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{reservation.user.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {reservation.user.nim_nip}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{reservation.purpose}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div>{reservation.day}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {reservation.start_time} - {reservation.end_time}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                                        <TableCell>{reservation.created_at}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.reservations.show', reservation.id)}>
                                                    <Button variant="outline" size="sm">
                                                        Detail
                                                    </Button>
                                                </Link>
                                                {reservation.status === 'pending' && (
                                                    <>
                                                        <Link
                                                            href={route('admin.reservations.approve', reservation.id)}
                                                            method="post"
                                                            as="button"
                                                        >
                                                            <Button variant="outline" size="icon" className="text-green-600">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={route('admin.reservations.reject', reservation.id)}
                                                            method="post"
                                                            as="button"
                                                        >
                                                            <Button variant="outline" size="icon" className="text-red-600">
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
