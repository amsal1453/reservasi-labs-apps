import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    nim_nip: string;
    email: string;
}

interface Lab {
    id: number;
    name: string;
}

interface Schedule {
    id: number;
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
    lab: Lab;
    schedule: Schedule | null;
}

interface Props {
    reservation: Reservation;
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

export default function Show({ reservation }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Reservasi', href: route('admin.reservations.index') },
        { title: 'Detail', href: route('admin.reservations.show', reservation.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Reservasi" />

            <div className="container py-12">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.reservations.index')}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Detail Reservasi</h1>
                    </div>

                    {reservation.status === 'pending' && (
                        <div className="flex gap-2">
                            <Link
                                href={route('admin.reservations.approve', reservation.id)}
                                method="post"
                                as="button"
                            >
                                <Button variant="outline" className="text-green-600">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Setujui
                                </Button>
                            </Link>
                            <Link
                                href={route('admin.reservations.reject', reservation.id)}
                                method="post"
                                as="button"
                            >
                                <Button variant="outline" className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Tolak
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Reservasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                                    <dd className="mt-1">{getStatusBadge(reservation.status)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Dibuat Pada</dt>
                                    <dd className="mt-1">{reservation.created_at}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-sm font-medium text-muted-foreground">Tujuan</dt>
                                    <dd className="mt-1">{reservation.purpose}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Hari</dt>
                                    <dd className="mt-1">{reservation.day}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Waktu</dt>
                                    <dd className="mt-1">
                                        {reservation.start_time} - {reservation.end_time}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Lab</dt>
                                    <dd className="mt-1">{reservation.lab.name}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Pengguna</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Nama</dt>
                                    <dd className="mt-1">{reservation.user.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">NIM/NIP</dt>
                                    <dd className="mt-1">{reservation.user.nim_nip}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                    <dd className="mt-1">{reservation.user.email}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {reservation.schedule && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Jadwal</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">ID Jadwal</dt>
                                        <dd className="mt-1">#{reservation.schedule.id}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
