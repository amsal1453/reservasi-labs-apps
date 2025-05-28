import { Head, Link } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';

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
import { type BreadcrumbItem } from '@/types';

interface Schedule {
    id: number;
    day: string;
    start_time: string;
    end_time: string;
    course_name: string;
    lab: {
        id: number;
        name: string;
    };
    type: 'lecture' | 'reservation';
    lecturer?: {
        id: number;
        name: string;
    };
    reservation?: {
        id: number;
        status: string;
    };
}

interface Props {
    schedules: Schedule[];
}

export default function Index({ schedules }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Jadwal', href: route('admin.schedules.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Jadwal" />

            <div className="container py-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Kelola Jadwal</h1>
                    <Link href={route('admin.schedules.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Jadwal
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Jadwal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hari</TableHead>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>Mata Kuliah</TableHead>
                                    <TableHead>Lab</TableHead>
                                    <TableHead>Dosen</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map((schedule) => (
                                    <TableRow key={schedule.id}>
                                        <TableCell>{schedule.day}</TableCell>
                                        <TableCell>
                                            {schedule.start_time} - {schedule.end_time}
                                        </TableCell>
                                        <TableCell>{schedule.course_name || '-'}</TableCell>
                                        <TableCell>{schedule.lab.name}</TableCell>
                                        <TableCell>{schedule.lecturer?.name || '-'}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${schedule.type === 'lecture'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {schedule.type === 'lecture' ? 'Kuliah' : 'Reservasi'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {schedule.type === 'lecture' && (
                                                    <Link href={route('admin.schedules.edit', schedule.id)}>
                                                        <Button variant="outline" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                <Link
                                                    href={route('admin.schedules.destroy', schedule.id)}
                                                    method="delete"
                                                    as="button"
                                                >
                                                    <Button variant="outline" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
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
