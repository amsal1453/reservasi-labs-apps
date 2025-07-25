import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Edit, Plus, Trash2, Eye } from 'lucide-react';

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
import { type BreadcrumbItem } from '@/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Lab {
    id: number;
    name: string;
    capacity: number | null;
    status: 'available' | 'maintenance';
    reservations_count: number;
}

interface Props {
    labs: Lab[];
}

const getStatusBadge = (status: Lab['status']) => {
    switch (status) {
        case 'available':
            return <Badge variant="success">Tersedia</Badge>;
        case 'maintenance':
            return <Badge variant="destructive">Maintenance</Badge>;
    }
};

export default function Index({ labs }: Props) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [labToDelete, setLabToDelete] = useState<Lab | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Lab', href: route('admin.labs.index') },
    ];

    const handleDeleteClick = (lab: Lab) => {
        setLabToDelete(lab);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (labToDelete) {
            window.location.href = route('admin.labs.destroy', labToDelete.id);
        }
        setIsDeleteDialogOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Lab" />

            <div className="container py-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Kelola Lab</h1>
                    <Link href={route('admin.labs.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Lab
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Lab</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Kapasitas</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reservasi</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {labs.map((lab) => (
                                    <TableRow key={lab.id}>
                                        <TableCell className="font-medium">{lab.name}</TableCell>
                                        <TableCell>{lab.capacity || '-'}</TableCell>
                                        <TableCell>{getStatusBadge(lab.status)}</TableCell>
                                        <TableCell>{lab.reservations_count}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.labs.edit', lab.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(lab)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {labs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                                            Tidak ada data lab
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus lab "{labToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
