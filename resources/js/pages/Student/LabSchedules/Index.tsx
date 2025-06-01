import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventContentArg } from '@fullcalendar/core';

interface Lab {
    id: number;
    name: string;
    location: string;
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
}

interface PageProps {
    schedules: Schedule[];
    labs: Lab[];
    selectedLab: number;
}

interface CustomEventExtendedProps {
    lecturer?: string;
    reservedBy?: string;
    type: 'reservation' | 'class' | string;
    status?: string;
}

export default function Index({ schedules, labs, selectedLab }: PageProps) {
    const [calendarView, setCalendarView] = useState<'timeGridWeek' | 'dayGridMonth'>('timeGridWeek');

    // Convert schedules to FullCalendar events
    const calendarEvents = schedules.map(schedule => {
        // Extract date part from the day name (assuming we need to map to current week)
        const today = new Date();
        const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(schedule.day);
        const currentDayIndex = today.getDay();
        const diff = dayIndex - currentDayIndex;

        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + diff);

        // Format the date as YYYY-MM-DD
        const dateStr = eventDate.toISOString().split('T')[0];

        // Create event object
        return {
            id: String(schedule.id),
            title: schedule.reservation
                ? `Reservasi: ${schedule.reservation.purpose}`
                : schedule.type === 'class'
                    ? `Kelas: ${schedule.subject}`
                    : schedule.type,
            start: `${dateStr}T${schedule.start_time}`,
            end: `${dateStr}T${schedule.end_time}`,
            extendedProps: {
                lecturer: schedule.lecturer?.name,
                reservedBy: schedule.reservation?.user?.name,
                type: schedule.reservation ? 'reservation' : schedule.type,
                status: schedule.reservation?.status
            },
            backgroundColor: schedule.reservation
                ? schedule.reservation.status === 'approved'
                    ? '#93c5fd' // blue-300 for approved reservations
                    : schedule.reservation.status === 'pending'
                        ? '#fde68a' // amber-200 for pending reservations
                        : '#fca5a5' // red-300 for rejected reservations
                : schedule.type === 'class'
                    ? '#86efac' // green-300 for regular classes
                    : '#d1d5db', // gray-300 for other types
            borderColor: schedule.reservation
                ? schedule.reservation.status === 'approved'
                    ? '#3b82f6' // blue-500
                    : schedule.reservation.status === 'pending'
                        ? '#f59e0b' // amber-500
                        : '#ef4444' // red-500
                : schedule.type === 'class'
                    ? '#22c55e' // green-500
                    : '#6b7280', // gray-500
            textColor: '#1e293b', // slate-800
        };
    });

    const handleLabChange = (labId: string) => {
        window.location.href = route('student.lab-schedules.index', { lab_id: labId });
    };

    const handleEventContent = (eventInfo: EventContentArg) => {
        const extendedProps = eventInfo.event.extendedProps as CustomEventExtendedProps;

        return (
            <div className="p-1 text-xs">
                <div className="font-semibold">{eventInfo.event.title}</div>
                <div className="mt-1">
                    {eventInfo.timeText}
                </div>
                {extendedProps.lecturer && (
                    <div className="text-xs">
                        Dosen: {extendedProps.lecturer}
                    </div>
                )}
                {extendedProps.reservedBy && (
                    <div className="text-xs">
                        Oleh: {extendedProps.reservedBy}
                    </div>
                )}
                {extendedProps.type === 'reservation' && extendedProps.status && (
                    <div className="text-xs mt-1">
                        <Badge className={`text-[10px] ${extendedProps.status === 'approved' ? 'bg-green-500' :
                            extendedProps.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                            {extendedProps.status === 'approved' ? 'Disetujui' :
                                extendedProps.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                        </Badge>
                    </div>
                )}
            </div>
        );
    };

    return (
        <StudentLayout breadcrumbs={[
            { title: 'Dashboard', href: route('student.dashboard') },
            { title: 'Jadwal Lab', href: route('student.lab-schedules.index') },
        ]}>
            <Head title="Jadwal Lab" />

            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h1 className="text-xl font-semibold">Jadwal Laboratorium</h1>

                    <div className="w-full sm:w-64">
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
                                        {lab.name} - {lab.location}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>
                            {labs.find(lab => lab.id === selectedLab)?.name} -
                            {labs.find(lab => lab.id === selectedLab)?.location}
                        </CardTitle>
                        <div className="flex space-x-2 mt-2">
                            <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800 cursor-pointer"
                                onClick={() => setCalendarView('timeGridWeek')}
                            >
                                Tampilan Mingguan
                            </Badge>
                            <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 cursor-pointer"
                                onClick={() => setCalendarView('dayGridMonth')}
                            >
                                Tampilan Bulanan
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                                <span className="text-xs">Reservasi Disetujui</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-yellow-200"></div>
                                <span className="text-xs">Reservasi Menunggu</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-300"></div>
                                <span className="text-xs">Reservasi Ditolak</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-300"></div>
                                <span className="text-xs">Kelas Reguler</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[600px]">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView={calendarView}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'timeGridWeek,dayGridMonth'
                                }}
                                events={calendarEvents}
                                eventContent={handleEventContent}
                                slotMinTime="07:00:00"
                                slotMaxTime="18:00:00"
                                allDaySlot={false}
                                weekends={true}
                                height="100%"
                                locale="id"
                                firstDay={1} // Monday as first day
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
