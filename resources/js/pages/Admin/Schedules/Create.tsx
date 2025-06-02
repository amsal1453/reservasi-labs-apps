import { Head, Link, useForm } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

interface Lab {
    id: number;
    name: string;
}

interface CreateProps {
    labs: Lab[];
    errors: Record<string, string>;
}

export default function Create({ labs, errors }: CreateProps) {
    const { data, setData, post, processing } = useForm({
        day: 'Monday',
        schedule_date: new Date().toISOString().split('T')[0],
        start_time: '07:00',
        end_time: '09:00',
        course_name: '',
        lecturer_name: '',
        lab_id: labs[0]?.id || '',
        repeat_weeks: 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.schedules.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Jadwal', href: route('admin.schedules.index') },
        { title: 'Tambah Jadwal', href: route('admin.schedules.create') },
    ];

    // Generate options for repeat weeks (1-16)
    const repeatOptions = Array.from({ length: 16 }, (_, i) => i + 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Jadwal" />

            <div className="container py-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Tambah Jadwal</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Tambah Jadwal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="day">Hari</Label>
                                    <Select
                                        value={data.day}
                                        onValueChange={(value) => setData('day', value)}
                                    >
                                        <SelectTrigger id="day">
                                            <SelectValue placeholder="Pilih Hari" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                                <SelectItem key={day} value={day}>
                                                    {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.day} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="schedule_date">Tanggal Mulai</Label>
                                    <Input
                                        id="schedule_date"
                                        type="date"
                                        value={data.schedule_date}
                                        onChange={(e) => {
                                            // Update tanggal
                                            setData('schedule_date', e.target.value);

                                            // Update hari berdasarkan tanggal yang dipilih
                                            const selectedDate = new Date(e.target.value);
                                            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                            const day = dayNames[selectedDate.getDay()];
                                            setData('day', day);
                                        }}
                                    />
                                    <InputError message={errors.schedule_date} className="mt-2" />
                                    <p className="text-xs text-muted-foreground mt-1">Tanggal pertama jadwal</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="start_time">Waktu Mulai</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        step="60"
                                        pattern="[0-9]{2}:[0-9]{2}"
                                    />
                                    <InputError message={errors.start_time} className="mt-2" />
                                    {errors.start_time ? null : (
                                        <p className="text-xs text-muted-foreground mt-1">Format: HH:MM (contoh: 07:00)</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="end_time">Waktu Selesai</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        step="60"
                                        pattern="[0-9]{2}:[0-9]{2}"
                                    />
                                    <InputError message={errors.end_time} className="mt-2" />
                                    {errors.end_time ? null : (
                                        <p className="text-xs text-muted-foreground mt-1">Format: HH:MM (contoh: 09:00)</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="course_name">Mata Kuliah</Label>
                                <Input
                                    id="course_name"
                                    value={data.course_name}
                                    onChange={(e) => setData('course_name', e.target.value)}
                                />
                                <InputError message={errors.course_name} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="lecturer_name">Dosen</Label>
                                <Input
                                    id="lecturer_name"
                                    placeholder="Masukkan nama dosen"
                                    value={data.lecturer_name}
                                    onChange={(e) => setData('lecturer_name', e.target.value)}
                                />
                                <InputError message={errors.lecturer_name} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="lab_id">Lab</Label>
                                <Select
                                    value={data.lab_id ? data.lab_id.toString() : ''}
                                    onValueChange={(value) => setData('lab_id', value ? parseInt(value) : '')}
                                >
                                    <SelectTrigger id="lab_id">
                                        <SelectValue placeholder="Pilih Lab" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {labs.map((lab) => (
                                            <SelectItem key={lab.id} value={lab.id.toString()}>
                                                {lab.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.lab_id} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="repeat_weeks">Pengulangan Mingguan</Label>
                                    <Select
                                        value={data.repeat_weeks.toString()}
                                        onValueChange={(value) => setData('repeat_weeks', parseInt(value))}
                                    >
                                        <SelectTrigger id="repeat_weeks">
                                            <SelectValue placeholder="Pilih Jumlah Minggu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {repeatOptions.map((weeks) => (
                                                <SelectItem key={weeks} value={weeks.toString()}>
                                                    {weeks === 1 ? '1 minggu (tidak berulang)' : `${weeks} minggu`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.repeat_weeks} className="mt-2" />
                                    {!errors.repeat_weeks && data.repeat_weeks > 1 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Jadwal akan dibuat untuk {data.repeat_weeks} minggu berturut-turut
                                        </p>
                                    )}
                                </div>
                            </div>

                            {errors.conflict && (
                                <p className="text-sm text-red-500">{errors.conflict}</p>
                            )}

                            <div className="flex items-center justify-end gap-4">
                                <Link href={route('admin.schedules.index')}>
                                    <Button type="button" variant="outline">Batal</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Simpan</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
