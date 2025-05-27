<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    // Tampilkan semua jadwal (kuliah dan reservasi disetujui)
    public function index()
    {
        $schedules = Schedule::with(['lecturer', 'reservation'])
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Admin/Schedules/Index', [
            'schedules' => $schedules
        ]);
    }

    // Form tambah jadwal kuliah
    public function create()
    {
        $lecturers = User::role('lecturer')->get();
        return Inertia::render('Admin/Schedules/Create', [
            'lecturers' => $lecturers
        ]);
    }

    // Simpan jadwal kuliah baru
    public function store(Request $request)
    {
        $request->validate([
            'day'          => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'start_time'   => 'required|date_format:H:i',
            'end_time'     => 'required|date_format:H:i|after:start_time',
            'course_name'  => 'required|string',
            'lecturer_id'  => 'required|exists:users,id',
            'room'         => 'required|string'
        ]);

        // Validasi bentrok waktu di ruangan yang sama
        $conflict = Schedule::where('day', $request->day)
            ->where('room', $request->room)
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time]);
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors(['conflict' => 'Jadwal bentrok dengan yang sudah ada.']);
        }

        Schedule::create([
            'day'           => $request->day,
            'start_time'    => $request->start_time,
            'end_time'      => $request->end_time,
            'course_name'   => $request->course_name,
            'lecturer_id'   => $request->lecturer_id,
            'room'          => $request->room,
            'type'          => 'lecture',
        ]);

        return redirect()->route('admin.schedules.index')->with('success', 'Jadwal berhasil ditambahkan.');
    }

    // Edit jadwal
    public function edit(Schedule $schedule)
    {
        $lecturers = User::role('lecturer')->get();
        return Inertia::render('Admin/Schedules/Edit', [
            'schedule' => $schedule,
            'lecturers' => $lecturers
        ]);
    }

    // Update jadwal
    public function update(Request $request, Schedule $schedule)
    {
        $request->validate([
            'day'          => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'start_time'   => 'required|date_format:H:i',
            'end_time'     => 'required|date_format:H:i|after:start_time',
            'course_name'  => 'required|string',
            'lecturer_id'  => 'required|exists:users,id',
            'room'         => 'required|string'
        ]);

        // Validasi bentrok waktu di ruangan yang sama
        $conflict = Schedule::where('day', $request->day)
            ->where('room', $request->room)
            ->where('id', '!=', $schedule->id)
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time]);
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors(['conflict' => 'Jadwal bentrok dengan yang sudah ada.']);
        }

        $schedule->update([
            'day'           => $request->day,
            'start_time'    => $request->start_time,
            'end_time'      => $request->end_time,
            'course_name'   => $request->course_name,
            'lecturer_id'   => $request->lecturer_id,
            'room'          => $request->room,
        ]);

        return redirect()->route('admin.schedules.index')->with('success', 'Jadwal berhasil diperbarui.');
    }

    // Hapus jadwal
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return redirect()->route('admin.schedules.index')->with('success', 'Jadwal berhasil dihapus.');
    }
}
