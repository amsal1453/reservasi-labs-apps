import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Printer } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';
import { EventClickArg } from '@fullcalendar/core';
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
    schedule_date: string; // Format YYYY-MM-DD
    start_time: string;
    end_time: string;
    course_name: string;
    lecturer_name?: string;
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
    group_id?: string | null;
    repeat_weeks?: number;
}

interface Props {
    schedules: Schedule[];
    selectedLab?: {
        id: number;
        name: string;
    } | null;
    import_errors?: string[];
    message?: string;
}

interface EventDetails {
    id: number;
    title: string;
    start: string;
    end: string;
    type: 'lecture' | 'reservation';
    lecturer?: string;
    lab?: string;
    group_id?: string | null;
    repeat_weeks?: number;
    current_recurrence?: number;
}

export default function Index({ schedules, selectedLab, import_errors, message }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);

    console.log(selectedLab);

    const { data, setData, post, processing, errors, reset } = useForm({
        day: '',
        schedule_date: '',
        start_time: '',
        end_time: '',
        course_name: '',
        lecturer_name: '',
        type: 'lecture',
        lab_id: '1',
        repeat_weeks: 1,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Lab', href: route('admin.lab-manager.index') },
        { title: 'Jadwal', href: route('admin.schedules.index') },
    ];

    // Convert schedules to FullCalendar event format
    const events = schedules.map(schedule => {
        // Gunakan schedule_date jika tersedia, jika tidak gunakan hari untuk menghitung tanggal
        let dateStr = schedule.schedule_date;

        // Jika tidak ada schedule_date, hitung berdasarkan hari
        if (!dateStr) {
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
            dateStr = scheduleDate.toISOString().split('T')[0];
        }

        return {
            id: schedule.id.toString(),
            title: `${schedule.course_name || 'Reservasi'} - ${schedule.lab.name}`,
            start: `${dateStr}T${schedule.start_time}`,
            end: `${dateStr}T${schedule.end_time}`,
            extendedProps: {
                lecturer: schedule.lecturer?.name || schedule.lecturer_name || '-',
                type: schedule.type,
                lab: schedule.lab.name,
                group_id: schedule.group_id,
                repeat_weeks: schedule.repeat_weeks || 1,
                status: schedule.reservation?.status || null
            },
            backgroundColor: schedule.type === 'lecture' ? '#3b82f6' :
                schedule.reservation?.status === 'approved' ? '#10b981' :
                    schedule.reservation?.status === 'pending' ? '#f59e0b' :
                        schedule.reservation?.status === 'rejected' ? '#ef4444' : '#10b981',
            borderColor: schedule.type === 'lecture' ? '#2563eb' :
                schedule.reservation?.status === 'approved' ? '#059669' :
                    schedule.reservation?.status === 'pending' ? '#d97706' :
                        schedule.reservation?.status === 'rejected' ? '#dc2626' : '#059669'
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

        // Format date as YYYY-MM-DD untuk disimpan di state
        const clickedDateFormatted = info.dateStr.split('T')[0];

        setData({
            day,
            schedule_date: clickedDateFormatted,
            start_time: startTime,
            end_time: endTimeStr,
            course_name: '',
            lecturer_name: '',
            type: 'lecture',
            lab_id: '1',
            repeat_weeks: 1,
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

    const handleEventClick = (info: EventClickArg) => {
        // Get the schedule ID from the event
        const scheduleId = parseInt(info.event.id);

        // Find the schedule in the schedules array
        const schedule = schedules.find(s => s.id === scheduleId);

        if (schedule) {
            setSelectedEvent({
                id: schedule.id,
                title: schedule.type === 'lecture'
                    ? `[Kuliah] ${schedule.course_name}`
                    : `[Reservasi] ${schedule.reservation?.status || ''}`,
                start: schedule.start_time,
                end: schedule.end_time,
                type: schedule.type,
                lecturer: schedule.lecturer?.name || schedule.lecturer_name,
                lab: schedule.lab?.name,
                group_id: schedule.group_id,
                repeat_weeks: schedule.repeat_weeks
            });
            setIsDetailsModalOpen(true);
        }
    };

    const handleEditSchedule = () => {
        if (selectedEvent) {
            router.visit(route('admin.schedules.edit', selectedEvent.id));
        }
    };

    const handleDeleteSchedule = () => {
        if (selectedEvent) {
            if (selectedEvent.group_id && selectedEvent.repeat_weeks && selectedEvent.repeat_weeks > 1) {
                // Konfirmasi penghapusan jadwal dengan group_id
                if (confirm('Jadwal ini adalah bagian dari jadwal berulang. Apakah Anda ingin menghapus semua jadwal dalam seri ini?')) {
                    router.delete(route('admin.schedules.destroy', selectedEvent.id), {
                        data: { delete_all: true },
                        onSuccess: () => {
                            setIsDetailsModalOpen(false);
                        },
                    });
                } else if (confirm('Apakah Anda yakin ingin menghapus hanya jadwal ini saja?')) {
                    router.delete(route('admin.schedules.destroy', selectedEvent.id), {
                        data: { delete_all: false },
                        onSuccess: () => {
                            setIsDetailsModalOpen(false);
                        },
                    });
                }
            } else if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
                router.delete(route('admin.schedules.destroy', selectedEvent.id), {
                    onSuccess: () => {
                        setIsDetailsModalOpen(false);
                    },
                });
            }
        }
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) return;

        const formData = new FormData();
        formData.append('import_file', importFile);

        setIsImporting(true);

        router.post(route('admin.schedules.import'), formData, {
            onSuccess: () => {
                setIsImportModalOpen(false);
                setImportFile(null);
                setIsImporting(false);
            },
            onError: () => {
                setIsImporting(false);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Jadwal" />

            <div className="container py-6">
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        <p>{message}</p>
                    </div>
                )}

                {import_errors && import_errors.length > 0 && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                        <p className="font-bold mb-2">Ada beberapa error saat mengimpor jadwal:</p>
                        <ul className="list-disc pl-5">
                            {import_errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

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
                            <>
                                <Link href={route('admin.lab-manager.index')}>
                                    <Button variant="outline">
                                        Kembali ke Pilihan Lab
                                    </Button>
                                </Link>
                                {/* Link untuk cetak jadwal */}
                                {selectedLab && selectedLab.id && (
                                    <a
                                        href={route('admin.schedules.pdf', { lab_id: selectedLab.id })}
                                        target="_blank"
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 h-10 px-4 py-2"
                                    >
                                        <Printer className="w-4 h-4 mr-2" />
                                        Cetak Jadwal
                                    </a>
                                )}
                            </>
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
                        <div className="flex flex-wrap gap-2 mt-3">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs">Kuliah</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs">Reservasi Disetujui</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-xs">Reservasi Menunggu</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-xs">Reservasi Ditolak</span>
                            </div>
                        </div>
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
                                eventDisplay="block"
                                displayEventEnd={true}
                                editable={false}
                                views={{
                                    timeGridWeek: {
                                        dayMaxEventRows: true
                                    },
                                    dayGridMonth: {
                                        dayMaxEventRows: 3
                                    }
                                }}
                                eventContent={(eventInfo) => {
                                    // Get event information
                                    const title = eventInfo.event.title.split(' - ')[0];
                                    const isMonthView = eventInfo.view.type === 'dayGridMonth';
                                    const groupId = eventInfo.event.extendedProps.group_id;
                                    const isRepeating = groupId && eventInfo.event.extendedProps.repeat_weeks > 1;

                                    // Simplified display for month view
                                    if (isMonthView) {
                                        return (
                                            <div className="text-xs p-1">
                                                <div className="font-medium truncate">
                                                    {title}
                                                </div>
                                                {eventInfo.event.extendedProps.lecturer && (
                                                    <div className="text-xs opacity-75 truncate">
                                                        {eventInfo.event.extendedProps.lecturer}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // Detailed display for week/day view
                                    return (
                                        <div className="p-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-xs">{eventInfo.timeText}</span>
                                                {isRepeating && (
                                                    <span className="text-xs bg-white bg-opacity-25 rounded px-1">
                                                        Berulang
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-medium text-xs truncate">{title}</div>
                                            <div className="text-xs truncate">
                                                {eventInfo.event.extendedProps.lecturer}
                                            </div>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center rounded px-1 py-0.5 text-xs ${eventInfo.event.extendedProps.type === 'lecture'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : eventInfo.event.extendedProps.status === 'approved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : eventInfo.event.extendedProps.status === 'pending'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : eventInfo.event.extendedProps.status === 'rejected'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {eventInfo.event.extendedProps.type === 'lecture' ? 'Kuliah' :
                                                        eventInfo.event.extendedProps.status === 'approved' ? 'Reservasi Disetujui' :
                                                            eventInfo.event.extendedProps.status === 'pending' ? 'Reservasi Menunggu' :
                                                                eventInfo.event.extendedProps.status === 'rejected' ? 'Reservasi Ditolak' : 'Reservasi'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }}
                                eventClick={handleEventClick}
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

                                {/* Hidden input untuk menyimpan tanggal jadwal */}
                                <Input
                                    type="hidden"
                                    id="schedule_date"
                                    value={data.schedule_date}
                                    name="schedule_date"
                                />

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
                                            <Input
                                                id="lecturer_name"
                                                value={data.lecturer_name}
                                                onChange={(e) => setData('lecturer_name', e.target.value)}
                                                placeholder="Masukkan nama dosen"
                                            />
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

                                <div className="grid gap-2">
                                    <Label htmlFor="repeat_weeks">Pengulangan Mingguan</Label>
                                    <Select
                                        value={data.repeat_weeks.toString()}
                                        onValueChange={(value) => setData('repeat_weeks', parseInt(value))}
                                    >
                                        <SelectTrigger id="repeat_weeks">
                                            <SelectValue placeholder="Pilih Jumlah Minggu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 16 }, (_, i) => i + 1).map((weeks) => (
                                                <SelectItem key={weeks} value={weeks.toString()}>
                                                    {weeks === 1 ? '1 minggu (tidak berulang)' : `${weeks} minggu`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.repeat_weeks} />
                                    {data.repeat_weeks > 1 && (
                                        <p className="text-xs text-muted-foreground">
                                            Jadwal akan dibuat untuk {data.repeat_weeks} minggu berturut-turut
                                        </p>
                                    )}
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

                <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Detail Jadwal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {selectedEvent && (
                                <>
                                    <div>
                                        <h3 className="text-lg font-medium">{selectedEvent.title}</h3>
                                        <p className="text-gray-500">{selectedEvent.lab}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Waktu Mulai</p>
                                            <p>{selectedEvent.start}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Waktu Selesai</p>
                                            <p>{selectedEvent.end}</p>
                                        </div>
                                    </div>
                                    {selectedEvent.lecturer && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Dosen</p>
                                            <p>{selectedEvent.lecturer}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tipe</p>
                                        <p className="capitalize">{selectedEvent.type === 'lecture' ? 'Kuliah' : 'Reservasi'}</p>
                                    </div>
                                    {selectedEvent.repeat_weeks && selectedEvent.repeat_weeks > 1 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Pengulangan</p>
                                            <p>Jadwal berulang selama {selectedEvent.repeat_weeks} minggu</p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Jadwal ini adalah bagian dari serangkaian jadwal berulang dengan ID: {selectedEvent.group_id?.substring(0, 8)}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <DialogFooter className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsDetailsModalOpen(false)}
                            >
                                Tutup
                            </Button>
                            {selectedEvent && selectedEvent.type === 'lecture' && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleEditSchedule}
                                        className="flex items-center"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteSchedule}
                                        className="flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Hapus
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>


            </div>
        </AppLayout>
    );
}
