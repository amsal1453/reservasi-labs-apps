import { Head, Link, useForm } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

interface ScheduleData {
    id: number;
    day: string;
    start_time: string;
    end_time: string;
    course_name: string;
    lecturer_name: string;
    lab_id: number;
    repeat_weeks?: number;
    group_id?: string | null;
}

interface Lab {
    id: number;
    name: string;
}

interface EditProps {
    schedule: ScheduleData;
    labs: Lab[];
    errors: Record<string, string>;
}

export default function Edit({ schedule, labs, errors }: EditProps) {
    const { data, setData, put, processing } = useForm({
        day: schedule.day,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        course_name: schedule.course_name,
        lecturer_name: schedule.lecturer_name || '',
        lab_id: schedule.lab_id || '',
        repeat_weeks: schedule.repeat_weeks || 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.schedules.update', schedule.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Jadwal', href: route('admin.schedules.index') },
        { title: `Edit Jadwal #${schedule.id}`, href: route('admin.schedules.edit', schedule.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Jadwal #${schedule.id}`} />

            <div className="container py-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Edit Jadwal</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Edit Jadwal</CardTitle>
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
                                    <Label htmlFor="repeat_weeks">Pengulangan Mingguan</Label>
                                    <Input
                                        id="repeat_weeks"
                                        type="number"
                                        min="1"
                                        max="16"
                                        value={data.repeat_weeks}
                                        onChange={(e) => setData('repeat_weeks', parseInt(e.target.value) || 1)}
                                        disabled
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Pengulangan tidak dapat diubah setelah jadwal dibuat
                                    </p>
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

                            {errors.conflict && (
                                <p className="text-sm text-red-500">{errors.conflict}</p>
                            )}

                            <div className="flex items-center justify-end gap-4">
                                <Link href={route('admin.schedules.index')}>
                                    <Button type="button" variant="outline">Batal</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
