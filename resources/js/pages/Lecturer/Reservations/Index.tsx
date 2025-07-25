import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LecturerLayout from '@/layouts/LecturerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: {
        pendingConflict?: string;
    };
}

export default function Index({ reservations, flash = {}, errors }: PageProps) {
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

            {flash?.success && (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                    <AlertCircle className="h-4 w-4 text-green-800" />
                    <AlertTitle>Sukses</AlertTitle>
                    <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
            )}

            {flash?.error && (
                <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-800" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}

            {errors?.pendingConflict && (
                <Alert className="mb-6 bg-yellow-50 text-yellow-800 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-800" />
                    <AlertTitle>Perhatian</AlertTitle>
                    <AlertDescription>{errors.pendingConflict}</AlertDescription>
                </Alert>
            )}

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
                                    <Link href={route('lecturer.reservations.destroy', reservation.id)} method="delete" as="button">
                                        <Button variant="destructive" size="sm">Hapus</Button>
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
