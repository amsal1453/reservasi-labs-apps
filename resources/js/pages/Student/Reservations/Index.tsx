import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye } from 'lucide-react';

interface Lab {
    id: number;
    name: string;
    location: string;
    capacity: number;
    status: string;
}

interface Reservation {
    id: number;
    user_id: number;
    lab_id: number;
    day: string;
    start_time: string;
    end_time: string;
    purpose: string;
    status: string;
    created_at: string;
    updated_at: string;
    lab: Lab;
}

interface Props {
    reservations: Reservation[];
    success?: string;
}

export default function Index({ reservations, success }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500">Disetujui</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500">Menunggu</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500">Ditolak</Badge>;
            case 'canceled':
                return <Badge className="bg-gray-500">Dibatalkan</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5); // Format HH:MM
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Reservasi', href: route('student.reservations.index') },
        ]}>
            <Head title="Daftar Reservasi" />

            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Daftar Reservasi</h1>
                <Link href={route('student.reservations.create')}>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Buat Reservasi
                    </Button>
                </Link>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
                    {success}
                </div>
            )}

            {reservations.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-500 mb-4">Anda belum memiliki reservasi</p>
                        <Link href={route('student.reservations.create')}>
                            <Button>Buat Reservasi Baru</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Reservasi Anda</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lab</TableHead>
                                    <TableHead>Hari</TableHead>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>Keperluan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations.map((reservation) => (
                                    <TableRow key={reservation.id}>
                                        <TableCell className="font-medium">{reservation.lab.name}</TableCell>
                                        <TableCell>{reservation.day}</TableCell>
                                        <TableCell>
                                            {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{reservation.purpose}</TableCell>
                                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={route('student.reservations.show', reservation.id)}>
                                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Detail
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </StudentLayout>
    );
}
