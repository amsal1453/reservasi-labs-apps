import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
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
    start_time: string;
    end_time: string;
    purpose: string;
    status: string;
    created_at: string;
    updated_at: string;
    lab: Lab;
}

interface Props {
    reservation: Reservation;
}

export default function Show({ reservation }: Props) {
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Reservasi', href: route('student.reservations.index') },
            { title: `Detail #${reservation.id}`, href: route('student.reservations.show', reservation.id) },
        ]}>
            <Head title={`Detail Reservasi #${reservation.id}`} />

            <div className="mb-6 flex items-center">
                <Link href={route('student.reservations.index')} className="mr-4">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Detail Reservasi</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Reservasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Status</h3>
                                <div className="mt-2">{getStatusBadge(reservation.status)}</div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium">Keperluan</h3>
                                <p className="mt-2 text-gray-700">{reservation.purpose}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium">Jadwal</h3>
                                    <div className="mt-2 flex items-center space-x-2">
                                        <Clock className="h-5 w-5 text-gray-500" />
                                        <span>
                                            {reservation.day}, {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium">Tanggal Pengajuan</h3>
                                    <p className="mt-2 text-gray-700">{formatDate(reservation.created_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Lab</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Nama Lab</h3>
                                <p className="text-gray-700">{reservation.lab.name}</p>
                            </div>

                            <div>
                                <h3 className="font-medium">Lokasi</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">{reservation.lab.location}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium">Kapasitas</h3>
                                <p className="text-gray-700">{reservation.lab.capacity} orang</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StudentLayout>
    );
}
