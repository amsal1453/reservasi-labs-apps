import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, AlertCircle } from 'lucide-react';

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
    reservations: Reservation[];
    flash?: {
        success?: string;
        error?: string;
        showPendingWarning?: boolean;
    };
    errors?: {
        pendingConflict?: string;
        conflict?: string;
    };
}

export default function Index({ reservations, flash = {}, errors }: PageProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);

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

    const handleDelete = (id: number) => {
        setIsDeleting(true);
        router.delete(route('student.reservations.destroy', id), {
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Reservasi', href: route('student.reservations.index') },
        ]}>
            <Head title="Daftar Reservasi" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-[#800000]">Daftar Reservasi</h3>
                <Link href={route('student.reservations.create')}>
                    <Button className="bg-[#800000] hover:bg-[#800000]/90">Buat Reservasi Baru</Button>
                </Link>
            </div>

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

            {errors?.conflict && (
                <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-800" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errors.conflict}</AlertDescription>
                </Alert>
            )}

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
                                        {reservation.date ? formatDate(reservation.date) : reservation.day}, {reservation.start_time.substring(0, 5)} - {reservation.end_time.substring(0, 5)}
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
                                <Link href={route('student.reservations.show', reservation.id)}>
                                    <Button variant="outline" size="sm" className="border-[#800000] text-[#800000] hover:bg-[#800000]/10">Detail</Button>
                                </Link>

                                {reservation.status === 'pending' && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex items-center gap-1"
                                                disabled={isDeleting && reservationToDelete === reservation.id}
                                                onClick={() => setReservationToDelete(reservation.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Hapus
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Hapus Reservasi</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Apakah Anda yakin ingin menghapus reservasi ini? Tindakan ini tidak dapat dibatalkan.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setReservationToDelete(null)}>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(reservation.id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {isDeleting && reservationToDelete === reservation.id ? 'Menghapus...' : 'Hapus'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                    </div>
            )}
        </StudentLayout>
    );
}
