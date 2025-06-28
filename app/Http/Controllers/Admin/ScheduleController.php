<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use App\Models\Lab;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class ScheduleController extends Controller
{
    // Tampilkan semua jadwal (kuliah dan reservasi disetujui)
    public function index(Request $request)
    {
        $labs = Lab::all();

        // Ambil ID lab dari request atau gunakan ID lab pertama sebagai default
        $labId = $request->input('lab_id', $labs->first()?->id);

        // Cari objek lab yang sesuai
        $selectedLab = null;
        if ($labId) {
            $selectedLab = Lab::select('id', 'name')->find($labId);
            // Jika lab tidak ditemukan dengan ID yang diberikan, gunakan lab pertama
            if (!$selectedLab && $labs->count() > 0) {
                $selectedLab = $labs->first();
                $labId = $selectedLab->id;
            }
        }

        // Ambil jadwal dari tabel Schedule
        $schedules = Schedule::with(['lab', 'reservation', 'lecturer'])
            ->where('lab_id', $labId)
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        // Ambil reservasi yang disetujui tapi belum ada di jadwal
        $approvedReservations = \App\Models\Reservation::with(['lab', 'user'])
            ->where('status', 'approved')
            ->where('lab_id', $labId)
            ->whereDoesntHave('schedule')
            ->get();

        // Konversi reservasi menjadi format jadwal
        $reservationSchedules = $approvedReservations->map(function ($reservation) {
            // Tentukan hari dari tanggal
            $date = \Carbon\Carbon::parse($reservation->date);
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
                'reservation_id' => $reservation->id,
                'reservation' => $reservation,
                'type' => 'reservation',
                'subject' => $reservation->purpose,
            ];
        });

        // Gabungkan jadwal reguler dengan reservasi
        $allSchedules = $schedules->concat($reservationSchedules);

        return Inertia::render('Admin/Schedules/Index', [
            'schedules' => $allSchedules,
            'selectedLab' => $selectedLab,
            'message' => session('message'),
            'import_errors' => session('import_errors'),
        ]);
    }

    // Form tambah jadwal kuliah
    public function create()
    {
        $labs = Lab::select('id', 'name')->get();

        return Inertia::render('Admin/Schedules/Create', [
            'labs' => $labs
        ]);
    }

    // Simpan jadwal kuliah baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'schedule_date' => 'sometimes|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'course_name' => 'required|string|max:255',
            'lecturer_name' => 'required|string|max:255',
            'lab_id' => 'required|exists:labs,id',
            'repeat_weeks' => 'sometimes|integer|min:1|max:16'
        ]);

        // Default to 1 week if not specified
        $repeat_weeks = $request->input('repeat_weeks', 1);

        // Generate a group ID for related schedules
        $group_id = null;
        if ($repeat_weeks > 1) {
            $group_id = (string) Str::uuid();
        }

        // Tentukan tanggal pertama jadwal
        $firstDate = null;

        // Jika ada schedule_date yang dikirim, gunakan itu sebagai tanggal pertama
        if ($request->filled('schedule_date')) {
            $firstDate = \Carbon\Carbon::parse($request->schedule_date);
        }
        // Jika tidak ada schedule_date, hitung berdasarkan hari
        else {
            // Map day name to day number (0 = Sunday, 1 = Monday, etc.)
            $dayMap = [
                'Sunday' => 0,
                'Monday' => 1,
                'Tuesday' => 2,
                'Wednesday' => 3,
                'Thursday' => 4,
                'Friday' => 5,
                'Saturday' => 6,
            ];

            $dayNumber = $dayMap[$request->day];
            $today = now();

            // Mendapatkan tanggal hari ini
            $currentDayOfWeek = $today->dayOfWeek; // 0 = Sunday, 1 = Monday, etc.

            // Menghitung berapa hari ke depan untuk mencapai hari yang dipilih
            $daysUntilScheduleDay = ($dayNumber - $currentDayOfWeek + 7) % 7;

            // Jika hasilnya 0 (hari yang sama), tetap tambahkan 7 hari ke depan
            if ($daysUntilScheduleDay === 0) {
                $daysUntilScheduleDay = 7;
            }

            // Mendapatkan tanggal pertama jadwal
            $firstDate = $today->copy()->addDays($daysUntilScheduleDay);
        }

        // Cek jadwal bentrok untuk semua minggu
        for ($week = 0; $week < $repeat_weeks; $week++) {
            // Menghitung tanggal aktual untuk minggu ini
            $scheduleDate = $firstDate->copy()->addWeeks($week)->toDateString();

            $conflict = Schedule::where(function($query) use ($request, $scheduleDate) {
                // Cek berdasarkan tanggal jadwal + jam yang sama
                $query->where('schedule_date', $scheduleDate)
                      ->where('lab_id', $request->lab_id)
                      ->where(function ($q) use ($request) {
                          $q->where('start_time', '<', $request->end_time)
                            ->where('end_time', '>', $request->start_time);
                      });
            })->exists();

            if ($conflict) {
                return back()->withErrors([
                    'conflict' => "Jadwal bentrok pada tanggal " . date('d-m-Y', strtotime($scheduleDate))
                ]);
            }
        }

        // Membuat jadwal untuk setiap minggu
        $schedules = [];
        for ($week = 0; $week < $repeat_weeks; $week++) {
            // Menghitung tanggal jadwal untuk minggu ini
            $scheduleDate = $firstDate->copy()->addWeeks($week);
            $dateString = $scheduleDate->toDateString(); // Format: Y-m-d

            // Membuat jadwal di database
            $schedules[] = Schedule::create([
                'day' => $validated['day'],
                'schedule_date' => $dateString,
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'course_name' => $validated['course_name'],
                'lecturer_name' => $validated['lecturer_name'],
                'lab_id' => $validated['lab_id'],
                'type' => 'lecture',
                'repeat_weeks' => $repeat_weeks,
                'group_id' => $group_id
            ]);
        }

        return Redirect::route('admin.schedules.index')
            ->with('message', $repeat_weeks > 1
                ? "Jadwal berhasil ditambahkan untuk {$repeat_weeks} minggu"
                : 'Jadwal berhasil ditambahkan');
    }

    // Edit jadwal
    public function edit(Schedule $schedule)
    {
        $labs = Lab::select('id', 'name')->get();
        return Inertia::render('Admin/Schedules/Edit', [
            'schedule' => [
                'id' => $schedule->id,
                'day' => $schedule->day,
                'schedule_date' => $schedule->schedule_date,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'course_name' => $schedule->course_name,
                'lecturer_name' => $schedule->lecturer_name,
                'lab_id' => $schedule->lab_id,
                'repeat_weeks' => $schedule->repeat_weeks,
                'group_id' => $schedule->group_id,
            ],
            'labs' => $labs
        ]);
    }

    // Update jadwal
    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'course_name' => 'required|string|max:255',
            'lecturer_name' => 'required|string|max:255',
            'lab_id' => 'required|exists:labs,id',
        ]);

        // Cek jadwal bentrok (kecuali dengan jadwal ini sendiri)
        $conflict = Schedule::where('schedule_date', $schedule->schedule_date)
            ->where('lab_id', $request->lab_id)
            ->where('id', '!=', $schedule->id)
            ->where(function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('start_time', '<', $request->end_time)
                    ->where('end_time', '>', $request->start_time);
            });
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'conflict' => 'Jadwal bentrok dengan jadwal yang sudah ada di lab tersebut pada tanggal yang sama.'
            ]);
        }

        $schedule->update($validated);

        // If this schedule is part of a group, update all related schedules with the same group_id
        if ($schedule->group_id && $schedule->repeat_weeks > 1) {
            Schedule::where('group_id', $schedule->group_id)
                ->where('id', '!=', $schedule->id)
                ->update([
                    'day' => $validated['day'],
                    'start_time' => $validated['start_time'],
                    'end_time' => $validated['end_time'],
                    'course_name' => $validated['course_name'],
                    'lecturer_name' => $validated['lecturer_name'],
                    'lab_id' => $validated['lab_id'],
                ]);

            $message = 'Semua jadwal dalam seri berhasil diperbarui';
        } else {
            $message = 'Jadwal berhasil diperbarui';
        }

        return Redirect::route('admin.schedules.index')
            ->with('message', $message);
    }

    // Hapus jadwal
    public function destroy(Schedule $schedule)
    {
        // Check if this is part of a group
        if ($schedule->group_id && $schedule->repeat_weeks > 1) {
            // Ask if user wants to delete all schedules in this group
            $deleteAll = request('delete_all', false);

            if ($deleteAll) {
                // Delete all schedules with the same group_id
                Schedule::where('group_id', $schedule->group_id)->delete();
                $message = 'Semua jadwal dalam seri berhasil dihapus';
            } else {
                // Delete only this schedule
                $schedule->delete();
                $message = 'Jadwal berhasil dihapus';
            }
        } else {
            // Not part of a group, delete just this schedule
            $schedule->delete();
            $message = 'Jadwal berhasil dihapus';
        }

        return Redirect::route('admin.schedules.index')
            ->with('message', $message);
    }

    // Generate PDF jadwal
    public function generatePdf($labId)
    {
        $lab = Lab::findOrFail($labId);

        // Ambil jadwal dari tabel Schedule
        $schedules = Schedule::with(['lab', 'reservation', 'lecturer'])
            ->where('lab_id', $labId)
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        // Ambil reservasi yang disetujui tapi belum ada di jadwal
        $approvedReservations = \App\Models\Reservation::with(['lab', 'user'])
            ->where('status', 'approved')
            ->where('lab_id', $labId)
            ->whereDoesntHave('schedule')
            ->get();

        // Konversi reservasi menjadi format jadwal
        $reservationSchedules = $approvedReservations->map(function ($reservation) {
            $date = \Carbon\Carbon::parse($reservation->date);
            $day = $date->format('l');

            return [
                'id' => $reservation->id,
                'day' => $day,
                'schedule_date' => $reservation->date,
                'start_time' => $reservation->start_time,
                'end_time' => $reservation->end_time,
                'course_name' => $reservation->purpose,
                'lecturer_name' => $reservation->user->name,
                'lab_id' => $reservation->lab_id,
                'type' => 'reservation',
            ];
        });

        // Gabungkan jadwal reguler dengan reservasi
        $allSchedules = $schedules->concat($reservationSchedules);

        // Group jadwal berdasarkan hari
        $schedulesByDay = $allSchedules->groupBy('day');

        // Definisikan semua hari dalam seminggu
        $allDays = [
            'Monday' => 'SENIN',
            'Tuesday' => 'SELASA',
            'Wednesday' => 'RABU',
            'Thursday' => 'KAMIS',
            'Friday' => 'JUMAT',
            'Saturday' => 'SABTU',
        ];

        // Pastikan semua hari ada dalam schedulesByDay, meskipun tidak ada jadwal
        foreach ($allDays as $day => $translation) {
            if (!isset($schedulesByDay[$day])) {
                $schedulesByDay[$day] = collect([]);
            }
        }

        // Urutkan hari sesuai urutan dalam seminggu
        $dayOrder = [
            'Monday' => 1,
            'Tuesday' => 2,
            'Wednesday' => 3,
            'Thursday' => 4,
            'Friday' => 5,
            'Saturday' => 6,
        ];

        $sortedSchedulesByDay = $schedulesByDay->sortBy(function ($item, $key) use ($dayOrder) {
            return $dayOrder[$key] ?? 999;
        });

        // Translate day names to Indonesian
        $dayTranslations = [
            'Monday' => 'SENIN',
            'Tuesday' => 'SELASA',
            'Wednesday' => 'RABU',
            'Thursday' => 'KAMIS',
            'Friday' => 'JUMAT',
            'Saturday' => 'SABTU',
        ];

        // Generate PDF using a view
        $pdf = Pdf::loadView('admin.schedules.pdf', [
            'lab' => $lab,
            'schedulesByDay' => $sortedSchedulesByDay,
            'dayTranslations' => $dayTranslations,
        ]);

        // Set paper to landscape A4
        $pdf->setPaper('a4', 'landscape');

        // Download PDF
        return $pdf->download('Jadwal_Lab_' . $lab->name . '.pdf');
    }
}
