import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError } from '@/components/form-error';
import InputError from '@/components/input-error';

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
        date: '',
        start_time: '',
        end_time: '',
        purpose: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('student.reservations.store'));
    };

    // Function to convert English day names to Indonesian
    const translateDayToIndonesian = (day: string): string => {
        const dayTranslations: Record<string, string> = {
            'Monday': 'Senin',
            'Tuesday': 'Selasa',
            'Wednesday': 'Rabu',
            'Thursday': 'Kamis',
            'Friday': 'Jumat',
            'Saturday': 'Sabtu',
            'Sunday': 'Minggu',
        };
        return dayTranslations[day] || day;
    };

    // Function to handle date change and automatically set day
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        setData('date', dateValue);

        if (dateValue) {
            const selectedDate = new Date(dateValue);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[selectedDate.getDay()];
            setData('day', dayName);
        }
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Reservasi', href: route('student.reservations.index') },
            { title: 'Buat Reservasi', href: route('student.reservations.create') },
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

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="date">Tanggal</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={handleDateChange}
                                        className="block w-full"
                                    />
                                    <InputError message={errors.date} />
                                </div>

                                <div>
                                    <Label htmlFor="day">Hari (Otomatis)</Label>
                                    <Input
                                        id="day_display"
                                        type="text"
                                        value={data.day ? translateDayToIndonesian(data.day) : ''}
                                        readOnly
                                        className="block w-full bg-gray-50"
                                    />
                                    <input type="hidden" id="day" value={data.day} />
                                    <InputError message={errors.day} />
                                </div>
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
        </StudentLayout>
    );
}
