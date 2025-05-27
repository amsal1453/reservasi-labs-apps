import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import * as React from 'react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

interface Lecturer {
    id: number;
    name: string;
}

interface Props {
    lecturers: Lecturer[];
    errors: Partial<Record<keyof FormData | 'conflict', string>>
}

interface FormData {
    day: string;
    start_time: string;
    end_time: string;
    course_name: string;
    lecturer_id: string;
    room: string;
    [key: string]: string | number | boolean | File | null | undefined;
}

export default function Create({ lecturers, errors: initialErrors }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        day: 'Monday',
        start_time: '' /* e.g., 08:00 */,
        end_time: '' /* e.g., 10:00 */,
        course_name: '' /* e.g., Pemrograman Web Lanjut */,
        lecturer_id: '' /* e.g., 1 */,
        room: '' /* e.g., Lab Komputer 1 */,
    });

    React.useEffect(() => {
        if (initialErrors) {
            const initialErrorKeys = Object.keys(initialErrors) as Array<keyof typeof initialErrors>;
            initialErrorKeys.forEach((key) => {
                if (key in data || key === 'conflict') {
                    setData(key as keyof FormData, initialErrors[key] as string);
                }
            });
        }
    }, [initialErrors, setData]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Schedules', href: route('admin.schedules.index') },
        { title: 'Create New Schedule', href: route('admin.schedules.create') },
    ];

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('admin.schedules.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Schedule" />

            <div className="container py-12">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('admin.schedules.index')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Create New Schedule</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>New Schedule Details</CardTitle>
                        <CardDescription>Fill in the form below to add a new lecture schedule.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="day">Day</Label>
                                    <Select
                                        value={data.day}
                                        onValueChange={(value) => setData('day', value)}
                                    >
                                        <SelectTrigger id="day" className="w-full">
                                            <SelectValue placeholder="Select day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {daysOfWeek.map((day) => (
                                                <SelectItem key={day} value={day}>
                                                    {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.day} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="room">Room</Label>
                                    <Input
                                        id="room"
                                        type="text"
                                        value={data.room}
                                        onChange={(e) => setData('room', e.target.value)}
                                        placeholder="e.g., Computer Lab 101"
                                        required
                                    />
                                    <InputError message={errors.room} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Start Time</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.start_time} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time">End Time</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.end_time} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="course_name">Course Name</Label>
                                <Input
                                    id="course_name"
                                    type="text"
                                    value={data.course_name}
                                    onChange={(e) => setData('course_name', e.target.value)}
                                    placeholder="e.g., Web Programming"
                                    required
                                />
                                <InputError message={errors.course_name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lecturer_id">Lecturer</Label>
                                <Select
                                    value={data.lecturer_id}
                                    onValueChange={(value) => setData('lecturer_id', value)}
                                >
                                    <SelectTrigger id="lecturer_id" className="w-full">
                                        <SelectValue placeholder="Select lecturer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lecturers.map((lecturer) => (
                                            <SelectItem key={lecturer.id} value={String(lecturer.id)}>
                                                {lecturer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.lecturer_id} />
                            </div>

                            <InputError message={errors.conflict} className="mt-2" />

                            <div className="flex justify-end gap-2 mt-8">
                                <Link href={route('admin.schedules.index')}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="animate-spin h-4 w-4 mr-2" />}
                                    Create Schedule
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
