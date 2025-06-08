import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';

interface Lab {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Lecturer {
    id: number;
    name: string;
}

interface Reservation {
    id: number;
    purpose: string;
    user_id: number;
    user: User;
    status: string;
}

interface Schedule {
    id: number;
    day: string;
    schedule_date: string; // Format YYYY-MM-DD
    start_time: string;
    end_time: string;
    lab_id: number;
    lab: Lab;
    lecturer_id: number | null;
    lecturer: Lecturer | null;
    reservation_id: number | null;
    reservation: Reservation | null;
    type: string;
    subject: string | null;
    group_id?: string | null;
    repeat_weeks?: number;
}

interface PageProps {
    schedules: Schedule[];
    labs: Lab[];
    selectedLab: number;
}

export default function Index({ schedules, labs, selectedLab }: PageProps) {
    // Convert schedules to FullCalendar events
    const events = schedules.map(schedule => {
        // Use schedule_date if available, otherwise calculate based on day
        let dateStr = schedule.schedule_date;

        // If no schedule_date, calculate based on day
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

        // Create event object
        return {
            id: schedule.id.toString(),
            title: schedule.reservation
                ? `Reservasi: ${schedule.reservation.purpose}`
                : schedule.subject || 'Kuliah',
            start: `${dateStr}T${schedule.start_time}`,
            end: `${dateStr}T${schedule.end_time}`,
            extendedProps: {
                lecturer: schedule.lecturer?.name,
                reservedBy: schedule.reservation?.user?.name,
                type: schedule.reservation ? 'reservation' : 'lecture',
                status: schedule.reservation?.status,
                lab: schedule.lab.name,
                group_id: schedule.group_id,
                repeat_weeks: schedule.repeat_weeks || 1
            },
            backgroundColor: schedule.reservation
                ? schedule.reservation.status === 'approved'
                    ? '#10b981' // green for approved reservations
                    : schedule.reservation.status === 'pending'
                        ? '#f59e0b' // amber for pending reservations
                        : '#ef4444' // red for rejected reservations
                : '#3b82f6', // blue for lectures
            borderColor: schedule.reservation
                ? schedule.reservation.status === 'approved'
                    ? '#059669' // darker green
                    : schedule.reservation.status === 'pending'
                        ? '#d97706' // darker amber
                        : '#dc2626' // darker red
                : '#2563eb', // darker blue
        };
    });

    const handleLabChange = (labId: string) => {
        window.location.href = route('student.lab-schedules.index', { lab_id: labId });
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Jadwal Lab', href: route('student.lab-schedules.index') },
        ]}>
            <Head title="Jadwal Lab" />

            <div className="container py-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Jadwal Laboratorium</h1>
                        {labs.find(lab => lab.id === selectedLab) && (
                            <p className="text-gray-600">
                                Menampilkan jadwal untuk: <span className="font-medium">{labs.find(lab => lab.id === selectedLab)?.name}</span>
                            </p>
                        )}
                    </div>
                    <div className="w-64">
                        <Label htmlFor="lab-select" className="mb-1 block">Pilih Lab</Label>
                        <Select
                            value={String(selectedLab)}
                            onValueChange={handleLabChange}
                        >
                            <SelectTrigger id="lab-select">
                                <SelectValue placeholder="Pilih Lab" />
                            </SelectTrigger>
                            <SelectContent>
                                {labs.map((lab) => (
                                    <SelectItem key={lab.id} value={String(lab.id)}>
                                        {lab.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                    const status = eventInfo.event.extendedProps.status;

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
                                            {eventInfo.event.extendedProps.reservedBy && (
                                                <div className="text-xs truncate">
                                                    Oleh: {eventInfo.event.extendedProps.reservedBy}
                                                </div>
                                            )}
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center rounded px-1 py-0.5 text-xs ${eventInfo.event.extendedProps.type === 'lecture'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : status === 'approved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : status === 'pending'
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {eventInfo.event.extendedProps.type === 'lecture'
                                                        ? 'Kuliah'
                                                        : status === 'approved'
                                                            ? 'Disetujui'
                                                            : status === 'pending'
                                                                ? 'Menunggu'
                                                                : 'Ditolak'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
