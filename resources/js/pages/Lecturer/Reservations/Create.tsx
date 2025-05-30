import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import LecturerLayout from '@/layouts/LecturerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError } from '@/components/form-error';

interface Lab {
    id: number;
    name: string;
    location: string;
    capacity: number;
    status: string;
}

interface PageProps {
    labs: Lab[];
}

export default function Create({ labs }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        lab_id: '',
        day: '',
        start_time: '',
        end_time: '',
        purpose: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('lecturer.reservations.store'));
    };

    const days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];

    return (
        <LecturerLayout breadcrumbs={[
            { title: 'Dashboard', href: route('lecturer.dashboard') },
            { title: 'Reservasi Lab', href: route('lecturer.reservations.index') },
            { title: 'Buat Reservasi', href: route('lecturer.reservations.create') },
        ]}>
            <Head title="Buat Reservasi Lab" />

            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Buat Reservasi Lab</CardTitle>
                        <CardDescription>
                            Silakan lengkapi form berikut untuk mengajukan reservasi lab
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="lab_id">Pilih Lab</Label>
                                <Select
                                    value={data.lab_id}
                                    onValueChange={(value) => setData('lab_id', value)}
                                >
                                    <SelectTrigger id="lab_id">
                                        <SelectValue placeholder="Pilih Lab" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {labs.map((lab) => (
                                            <SelectItem key={lab.id} value={String(lab.id)}>
                                                {lab.name} - {lab.location}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormError message={errors.lab_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="day">Hari</Label>
                                <Select
                                    value={data.day}
                                    onValueChange={(value) => setData('day', value)}
                                >
                                    <SelectTrigger id="day">
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
                                <FormError message={errors.day} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Waktu Mulai</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                    />
                                    <FormError message={errors.start_time} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_time">Waktu Selesai</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                    />
                                    <FormError message={errors.end_time} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose">Tujuan Penggunaan</Label>
                                <Textarea
                                    id="purpose"
                                    placeholder="Jelaskan tujuan penggunaan lab"
                                    value={data.purpose}
                                    onChange={(e) => setData('purpose', e.target.value)}
                                    rows={4}
                                />
                                <FormError message={errors.purpose} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Memproses...' : 'Ajukan Reservasi'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </LecturerLayout>
    );
}
