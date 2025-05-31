import React from 'react';
import { Head } from '@inertiajs/react';
import LecturerLayout from '@/layouts/LecturerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Lab {
    id: number;
    name: string;
    location: string;
}

interface Lecturer {
    id: number;
    name: string;
}

interface Reservation {
    id: number;
    purpose: string;
    user_id: number;
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

export default function Index({ schedules, labs, selectedLab }: PageProps) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = generateTimeSlots();

    // Group schedules by day and time
    const schedulesByDay: Record<string, Record<string, Schedule[]>> = {};

    days.forEach(day => {
        schedulesByDay[day] = {};
        timeSlots.forEach(slot => {
            schedulesByDay[day][slot] = [];
        });
    });

    schedules.forEach(schedule => {
        const startTime = schedule.start_time.substring(0, 5); // Format HH:MM
        const endTime = schedule.end_time.substring(0, 5); // Format HH:MM

        // Find all time slots that this schedule spans
        const slots = timeSlots.filter(slot => {
            return slot >= startTime && slot < endTime;
        });

        slots.forEach(slot => {
            if (!schedulesByDay[schedule.day]) {
                schedulesByDay[schedule.day] = {};
            }

            if (!schedulesByDay[schedule.day][slot]) {
                schedulesByDay[schedule.day][slot] = [];
            }

            schedulesByDay[schedule.day][slot].push(schedule);
        });
    });

    const handleLabChange = (labId: string) => {
        window.location.href = route('lecturer.lab-schedules.index', { lab_id: labId });
    };

    function generateTimeSlots() {
        const slots = [];
        for (let hour = 7; hour < 18; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }

    const getScheduleType = (schedule: Schedule) => {
        if (schedule.reservation) {
            return (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Reservasi: {schedule.reservation.purpose}
                </Badge>
            );
        } else if (schedule.type === 'class') {
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                    Kelas: {schedule.subject}
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    {schedule.type}
                </Badge>
            );
        }
    };

    return (
        <LecturerLayout breadcrumbs={[
            { title: 'Dashboard', href: route('lecturer.dashboard') },
            { title: 'Jadwal Lab', href: route('lecturer.lab-schedules.index') },
        ]}>
            <Head title="Jadwal Lab" />

            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold">Jadwal Laboratorium</h1>

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
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border p-2 bg-gray-50 w-20">Jam</th>
                                        {days.map(day => (
                                            <th key={day} className="border p-2 bg-gray-50">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map((timeSlot, index) => (
                                        <tr key={timeSlot} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border p-2 text-center font-medium">
                                                {timeSlot}
                                            </td>
                                            {days.map(day => (
                                                <td key={`${day}-${timeSlot}`} className="border p-2 min-h-[60px]">
                                                    {schedulesByDay[day][timeSlot]?.map((schedule, idx) => (
                                                        <div
                                                            key={`${schedule.id}-${idx}`}
                                                            className="mb-1 p-1 rounded text-xs"
                                                        >
                                                            {getScheduleType(schedule)}
                                                            <div className="mt-1 text-xs">
                                                                {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                                            </div>
                                                            {schedule.lecturer && (
                                                                <div className="text-xs text-gray-600">
                                                                    Dosen: {schedule.lecturer.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </LecturerLayout>
    );
}
