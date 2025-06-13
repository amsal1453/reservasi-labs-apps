import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    status: string;
    created_at: string;
    updated_at: string;
    lab: Lab;
}

interface PageProps {
    reservation: Reservation;
}

export default function Show({ reservation }: PageProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Menunggu Persetujuan</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-100 text-green-800">Disetujui</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800">Ditolak</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800">Dibatalkan</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Reservasi', href: route('student.reservations.index') },
            { title: `Detail Reservasi #${reservation.id}`, href: route('student.reservations.show', reservation.id) },
        ]}>
            <Head title={`Detail Reservasi #${reservation.id}`} />

            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Reservasi #{reservation.id}</CardTitle>
                        <CardDescription>
                            Dibuat pada {formatDate(reservation.created_at)}
                        </CardDescription>
                        <div className="mt-2">
                            {getStatusBadge(reservation.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Laboratorium</h4>
                                <p>{reservation.lab?.name || 'Lab tidak ditemukan'}</p>
                                <p className="text-sm text-gray-500">{reservation.lab?.location || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Waktu Reservasi</h4>
                                <p>{reservation.date ? formatDate(reservation.date) : reservation.day}</p>
                                <p className="text-sm text-gray-500">{reservation.start_time.substring(0, 5)} - {reservation.end_time.substring(0, 5)}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Tujuan Penggunaan</h4>
                            <p className="whitespace-pre-line">{reservation.purpose}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Kapasitas Lab</h4>
                            <p>{reservation.lab?.capacity || '-'} orang</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Link href={route('student.reservations.index')}>
                            <Button variant="outline">Kembali</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </StudentLayout>
    );
}
