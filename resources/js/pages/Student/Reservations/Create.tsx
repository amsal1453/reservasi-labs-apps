import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

interface Lab {
    id: number;
    name: string;
    location: string;
    capacity: number;
    status: string;
}

interface Props {
    labs: Lab[];
    errors: {
        day?: string;
        start_time?: string;
        end_time?: string;
        purpose?: string;
        lab_id?: string;
        conflict?: string;
    };
}

export default function Create({ labs, errors }: Props) {
    const { data, setData, post, processing } = useForm({
        day: '',
        start_time: '',
        end_time: '',
        purpose: '',
        lab_id: '',
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('student.reservations.store'));
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Reservasi', href: route('student.reservations.index') },
            { title: 'Buat Reservasi', href: route('student.reservations.create') },
        ]}>
            <Head title="Buat Reservasi" />

            <div className="mb-6 flex items-center">
                <Link href={route('student.reservations.index')} className="mr-4">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Buat Reservasi Lab</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Form Reservasi</CardTitle>
                </CardHeader>
                <CardContent>
                    {errors.conflict && (
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
                            {errors.conflict}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="lab_id">Lab</Label>
                                <Select
                                    value={data.lab_id}
                                    onValueChange={(value) => setData('lab_id', value)}
                                >
                                    <SelectTrigger id="lab_id" className="w-full">
                                        <SelectValue placeholder="Pilih Lab" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {labs.map((lab) => (
                                            <SelectItem key={lab.id} value={lab.id.toString()}>
                                                {lab.name} - {lab.location}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.lab_id && <p className="text-sm text-red-500 mt-1">{errors.lab_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="day">Hari</Label>
                                <Select
                                    value={data.day}
                                    onValueChange={(value) => setData('day', value)}
                                >
                                    <SelectTrigger id="day" className="w-full">
                                        <SelectValue placeholder="Pilih Hari" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.day && <p className="text-sm text-red-500 mt-1">{errors.day}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_time">Waktu Mulai</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                    />
                                    {errors.start_time && <p className="text-sm text-red-500 mt-1">{errors.start_time}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="end_time">Waktu Selesai</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                    />
                                    {errors.end_time && <p className="text-sm text-red-500 mt-1">{errors.end_time}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="purpose">Keperluan</Label>
                                <Textarea
                                    id="purpose"
                                    placeholder="Jelaskan keperluan penggunaan lab"
                                    value={data.purpose}
                                    onChange={(e) => setData('purpose', e.target.value)}
                                    rows={3}
                                />
                                {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Mengirim...' : 'Kirim Reservasi'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </StudentLayout>
    );
}
