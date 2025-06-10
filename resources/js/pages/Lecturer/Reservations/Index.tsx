import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LecturerLayout from '@/layouts/LecturerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Lab {
    id: number;
    name: string;
    location: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Reservation {
    id: number;
    lab_id: number;
    lab: Lab;
    user_id: number;
    user: User;
    day: string;
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    status: string;
}

interface PageProps {
    reservations: Reservation[];
}

export default function Index({ reservations }: PageProps) {
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

    // Function to format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'EEEE, dd MMMM yyyy', { locale: id });
        } catch {
            return dateString;
        }
    };

    return (
        <LecturerLayout breadcrumbs={[
            { title: 'Dashboard', href: route('lecturer.dashboard') },
            { title: 'Reservasi Lab', href: route('lecturer.reservations.index') },
        ]}>
            <Head title="Reservasi Lab" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Daftar Reservasi</h3>
                <Link href={route('lecturer.reservations.create')}>
                    <Button>Buat Reservasi Baru</Button>
                </Link>
            </div>

            {reservations.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada reservasi. Silakan buat reservasi baru.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservations.map((reservation) => (
                        <Card key={reservation.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle>{reservation.lab.name}</CardTitle>
                                <CardDescription>
                                    {reservation.date ? formatDate(reservation.date) : reservation.day}, {reservation.start_time} - {reservation.end_time}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-500">Status:</span>
                                    {getStatusBadge(reservation.status)}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{reservation.purpose}</p>
                            </CardContent>
                            <CardFooter className="pt-2 flex justify-between">
                                <Link href={route('lecturer.reservations.show', reservation.id)}>
                                    <Button variant="outline" size="sm">Detail</Button>
                                </Link>
                                {reservation.status === 'pending' && (
                                    <Link href={route('lecturer.reservations.edit', reservation.id)}>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </Link>
                                )}
                                {(reservation.status === 'pending' || reservation.status === 'approved') && (
                                    <Link href={route('lecturer.reservations.cancel', reservation.id)} method="post" as="button">
                                        <Button variant="destructive" size="sm">Batalkan</Button>
                                    </Link>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </LecturerLayout>
    );
}
