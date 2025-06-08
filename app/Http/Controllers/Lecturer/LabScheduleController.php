<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lab;
use App\Models\Schedule;
use App\Models\Reservation;
use Carbon\Carbon;

class LabScheduleController extends Controller
{
    public function index(Request $request)
    {
        $labs = Lab::all();

        $selectedLab = $request->input('lab_id', $labs->first()?->id); // default: lab pertama

        // Ambil jadwal dari tabel Schedule
        $schedules = Schedule::with(['lab', 'reservation', 'lecturer'])
            ->where('lab_id', $selectedLab)
            ->orderBy('day')
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'day' => $schedule->day,
                    'schedule_date' => $schedule->schedule_date,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'lab_id' => $schedule->lab_id,
                    'lab' => $schedule->lab,
                    'lecturer_id' => $schedule->lecturer_id,
                    'lecturer' => $schedule->lecturer,
                    'lecturer_name' => $schedule->lecturer_name,
                    'reservation_id' => $schedule->reservation_id,
                    'reservation' => $schedule->reservation,
                    'type' => $schedule->type,
                    'subject' => $schedule->course_name,
                    'group_id' => $schedule->group_id,
                    'repeat_weeks' => $schedule->repeat_weeks,
                ];
            });

        // Ambil reservasi yang disetujui tapi belum ada di jadwal
        $approvedReservations = Reservation::with(['lab', 'user'])
            ->where('status', 'approved')
            ->where('lab_id', $selectedLab)
            ->whereDoesntHave('schedule')
            ->get();

        // Konversi reservasi menjadi format jadwal
        $reservationSchedules = $approvedReservations->map(function ($reservation) {
            // Tentukan hari dari tanggal
            $date = Carbon::parse($reservation->date);
            $day = $date->format('l'); // Monday, Tuesday, etc.

            return [
                'id' => $reservation->id,
                'day' => $day,
                'schedule_date' => $reservation->date,
                'start_time' => $reservation->start_time,
                'end_time' => $reservation->end_time,
                'lab_id' => $reservation->lab_id,
                'lab' => $reservation->lab,
                'lecturer_id' => null,
                'lecturer' => null,
                'lecturer_name' => null,
                'reservation_id' => $reservation->id,
                'reservation' => [
                    'id' => $reservation->id,
                    'purpose' => $reservation->purpose,
                    'user_id' => $reservation->user_id,
                    'status' => $reservation->status,
                    'user' => $reservation->user,
                ],
                'type' => 'reservation',
                'subject' => $reservation->purpose,
                'group_id' => null,
                'repeat_weeks' => null,
            ];
        });

        // Gabungkan jadwal reguler dengan reservasi
        $allSchedules = $schedules->concat($reservationSchedules);

        return Inertia::render('Lecturer/LabSchedules/Index', [
            'schedules' => $allSchedules,
            'labs' => $labs,
            'selectedLab' => $selectedLab,
        ]);
    }
}
