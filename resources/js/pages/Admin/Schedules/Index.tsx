import { Head, Link, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

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

interface Lecturer {
    id: number;
    name: string;
}

interface Props {
    schedules: Schedule[];
    lecturers?: Lecturer[];
    selectedLab?: {
        id: number;
        name: string;
    } | null;
}

export default function Index({ schedules, lecturers, selectedLab }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        day: '',
        start_time: '',
        end_time: '',
        course_name: '',
        lecturer_name: '',
        type: 'lecture',
        lab_id: '1',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Lab', href: route('admin.lab-manager.index') },   
        { title: 'Jadwal', href: route('admin.schedules.index') },
    ];

    // Convert schedules to FullCalendar event format
    const events = schedules.map(schedule => {
        // Map day name to day number (0 = Sunday, 1 = Monday, etc.)
        const dayMap: Record<string, number> = {
            'Sunday': 0,
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5,
            'Saturday': 6
        };

        // Create a date for the current week with the day of the schedule
        const dayNumber = dayMap[schedule.day];
        const today = new Date();
        const currentDayOfWeek = today.getDay();
        const daysUntilScheduleDay = (dayNumber - currentDayOfWeek + 7) % 7;
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + daysUntilScheduleDay);

        // Format the date as YYYY-MM-DD
        const dateStr = scheduleDate.toISOString().split('T')[0];

        return {
            id: schedule.id.toString(),
            title: `${schedule.course_name || 'Reservasi'} - ${schedule.lab.name}`,
            start: `${dateStr}T${schedule.start_time}`,
            end: `${dateStr}T${schedule.end_time}`,
            extendedProps: {
                lecturer: schedule.lecturer?.name || '-',
                type: schedule.type,
                lab: schedule.lab.name
            },
            backgroundColor: schedule.type === 'lecture' ? '#3b82f6' : '#10b981',
            borderColor: schedule.type === 'lecture' ? '#2563eb' : '#059669'
        };
    });

    const handleDateClick = (info: { date: Date; dateStr: string }) => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const clickedDate = new Date(info.date);
        const day = dayNames[clickedDate.getDay()];
        const startTime = info.dateStr.split('T')[1].slice(0, 5);
        // Calculate end time (1 hour later)
        const endTime = new Date(clickedDate.getTime() + 60 * 60 * 1000);
        const endTimeStr = endTime.toTimeString().slice(0, 5);

        setData({
            day,
            start_time: startTime,
            end_time: endTimeStr,
            course_name: '',
            lecturer_name: '',
            type: 'lecture',
            lab_id: '1',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.schedules.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Jadwal" />

            <div className="container py-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Kelola Jadwal</h1>
                        {selectedLab && (
                            <p className="text-gray-600">
                                Menampilkan jadwal untuk: <span className="font-medium">{selectedLab.name}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {selectedLab && (
                            <Link href={route('admin.lab-manager.index')}>
                                <Button variant="outline">
                                    Kembali ke Pilihan Lab
                                </Button>
                            </Link>
                        )}
                        <Link href={route('admin.schedules.create')}>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Jadwal
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Jadwal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[700px]">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                events={events}
                                locale={idLocale}
                                allDaySlot={false}
                                slotMinTime="07:00:00"
                                slotMaxTime="21:00:00"
                                height="100%"
                                dateClick={handleDateClick}
                                eventTimeFormat={{
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }}
                                eventContent={(eventInfo) => {
                                    return (
                                        <>
                                            <b>{eventInfo.timeText}</b>
                                            <div className="fc-event-title font-medium">{eventInfo.event.title}</div>
                                            <div className="text-xs">
                                                {eventInfo.event.extendedProps.lecturer}
                                            </div>
                                            <div className="text-xs mt-1">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${eventInfo.event.extendedProps.type === 'lecture'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {eventInfo.event.extendedProps.type === 'lecture' ? 'Kuliah' : 'Reservasi'}
                                                </span>
                                            </div>
                                        </>
                                    );
                                }}
                                eventClick={(info) => {
                                    const scheduleId = info.event.id;
                                    const scheduleType = info.event.extendedProps.type;

                                    if (scheduleType === 'lecture') {
                                        window.location.href = route('admin.schedules.edit', scheduleId);
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Jadwal Baru</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Tipe Jadwal</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value as 'lecture' | 'reservation')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe jadwal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lecture">Kuliah</SelectItem>
                                            <SelectItem value="reservation">Reservasi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>

                                {data.type === 'lecture' && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="course_name">Nama Mata Kuliah</Label>
                                            <Input
                                                id="course_name"
                                                value={data.course_name}
                                                onChange={(e) => setData('course_name', e.target.value)}
                                                placeholder="Masukkan nama mata kuliah"
                                            />
                                            <InputError message={errors.course_name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="lecturer_name">Nama Dosen</Label>
                                            {lecturers && lecturers.length > 0 ? (
                                                <Select
                                                    value={data.lecturer_name}
                                                    onValueChange={(value) => setData('lecturer_name', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih dosen" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {lecturers.map((lecturer) => (
                                                            <SelectItem key={lecturer.id} value={lecturer.name}>
                                                                {lecturer.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    id="lecturer_name"
                                                    value={data.lecturer_name}
                                                    onChange={(e) => setData('lecturer_name', e.target.value)}
                                                    placeholder="Masukkan nama dosen"
                                                />
                                            )}
                                            <InputError message={errors.lecturer_name} />
                                        </div>
                                    </>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="start_time">Waktu Mulai</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                    />
                                    <InputError message={errors.start_time} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="end_time">Waktu Selesai</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                    />
                                    <InputError message={errors.end_time} />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
