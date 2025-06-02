<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use App\Models\Lab;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ScheduleController extends Controller
{
    // Tampilkan semua jadwal (kuliah dan reservasi disetujui)
    public function index(Request $request)
    {
        // Get lab_id from request if provided
        $labId = $request->input('lab_id');

        // Get lab name if lab_id is provided
        $selectedLab = null;
        if ($labId) {
            $selectedLab = Lab::find($labId);
        }

        // Query builder for schedules
        $query = Schedule::with(['reservation', 'lab']);

        // Filter by lab_id if provided
        if ($labId) {
            $query->where('lab_id', $labId);
        }

        $schedules = $query->orderBy('day')
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'course_name' => $schedule->course_name,
                'lab' => $schedule->lab ? [
                    'id' => $schedule->lab->id,
                    'name' => $schedule->lab->name,
                ] : null,
                    'type' => $schedule->type,
                'lecturer' => $schedule->lecturer_id ? [
                    'id' => $schedule->lecturer_id,
                    'name' => $schedule->lecturer ? $schedule->lecturer->name : $schedule->lecturer_name,
                ] : [
                    'id' => null,
                    'name' => $schedule->lecturer_name,
                ],
                    'reservation' => $schedule->reservation ? [
                        'id' => $schedule->reservation->id,
                        'status' => $schedule->reservation->status,
                    ] : null,
                ];
            });

        $lecturers = User::role('lecturer')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Schedules/Index', [
            'schedules' => $schedules,
            'lecturers' => $lecturers,
            'selectedLab' => $selectedLab ? [
                'id' => $selectedLab->id,
                'name' => $selectedLab->name
            ] : null
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
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'course_name' => 'required|string|max:255',
            'lecturer_name' => 'required|string|max:255',
            'lab_id' => 'required|exists:labs,id'
        ]);

        // Cek jadwal bentrok
        $conflict = Schedule::where('day', $request->day)
            ->where('lab_id', $request->lab_id)
            ->where(function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('start_time', '<', $request->end_time)
                    ->where('end_time', '>', $request->start_time);
            });
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'conflict' => 'Jadwal bentrok dengan jadwal yang sudah ada di lab tersebut.'
            ]);
        }

        Schedule::create([
            'day' => $validated['day'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'course_name' => $validated['course_name'],
            'lecturer_name' => $validated['lecturer_name'],
            'lab_id' => $validated['lab_id'],
            'type' => 'lecture'
        ]);

        return Redirect::route('admin.schedules.index')
            ->with('message', 'Jadwal berhasil ditambahkan');
    }

    // Edit jadwal
    public function edit(Schedule $schedule)
    {
        $labs = Lab::select('id', 'name')->get();
        return Inertia::render('Admin/Schedules/Edit', [
            'schedule' => [
                'id' => $schedule->id,
                'day' => $schedule->day,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'course_name' => $schedule->course_name,
                'lecturer_name' => $schedule->lecturer_name,
                'lab_id' => $schedule->lab_id,
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
            'lab_id' => 'required|exists:labs,id'
        ]);

        // Cek jadwal bentrok (kecuali dengan jadwal ini sendiri)
        $conflict = Schedule::where('day', $request->day)
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
                'conflict' => 'Jadwal bentrok dengan jadwal yang sudah ada di lab tersebut.'
            ]);
        }

        $schedule->update($validated);

        return Redirect::route('admin.schedules.index')
            ->with('message', 'Jadwal berhasil diperbarui');
    }

    // Hapus jadwal
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return Redirect::route('admin.schedules.index')
            ->with('message', 'Jadwal berhasil dihapus');
    }
}
