import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Jadwal" />

            <div className="container py-6">
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
            </div>
        </AppLayout>
    );
}
