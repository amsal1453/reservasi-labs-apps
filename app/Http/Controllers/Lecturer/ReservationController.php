<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Reservation;
use App\Models\Lab;
use App\Models\User;
use App\Notifications\ReservationSubmittedNotification;
use Illuminate\Support\Facades\Auth;

class ReservationController extends Controller
{
    // Menampilkan semua reservasi dosen yang login
    public function index()
    {
        $reservations = Reservation::with('lab')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('Lecturer/Reservations/Index', [
            'reservations' => $reservations,
        ]);
    }

    // Form pengajuan reservasi
    public function create()
    {
        $labs = Lab::where('status', 'available')->get();

        return Inertia::render('Lecturer/Reservations/Create', [
            'labs' => $labs,
        ]);
    }

    // Simpan pengajuan reservasi
    public function store(Request $request)
    {
        $request->validate([
            'day'         => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'purpose'     => 'required|string|max:255',
            'lab_id'      => 'required|exists:labs,id',
        ]);

        // Cek bentrok di lab
        $conflict = Reservation::where('lab_id', $request->lab_id)
            ->where('day', $request->day)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time]);
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'conflict' => 'Slot waktu ini sudah terisi di lab tersebut.',
            ])->withInput();
        }

        $reservation = Reservation::create([
            'user_id'    => Auth::id(),
            'day'        => $request->day,
            'date'       => $request->date,
            'start_time' => $request->start_time,
            'end_time'   => $request->end_time,
            'purpose'    => $request->purpose,
            'lab_id'     => $request->lab_id,
            'status'     => 'pending',
        ]);

        // Kirim notifikasi ke admin
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new ReservationSubmittedNotification($reservation));
        }

        return redirect()->route('lecturer.reservations.index')
            ->with('success', 'Reservasi berhasil diajukan dan menunggu persetujuan.');
    }

    // Tampilkan detail reservasi
    public function show(Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        return Inertia::render('Lecturer/Reservations/Show', [
            'reservation' => $reservation->load(['lab', 'user']),
        ]);
    }

    // Edit reservasi
    public function edit(Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        $labs = Lab::where('status', 'available')->get();

        return Inertia::render('Lecturer/Reservations/Edit', [
            'reservation' => $reservation->load(['lab', 'user']),
            'labs' => $labs,
        ]);
    }

    // Update reservasi
    public function update(Request $request, Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        $request->validate([
            'day'         => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'purpose'     => 'required|string|max:255',
            'lab_id'      => 'required|exists:labs,id',
        ]);

        // Cek bentrok di lab (kecuali dengan reservasi ini sendiri)
        $conflict = Reservation::where('lab_id', $request->lab_id)
            ->where('day', $request->day)
            ->where('id', '!=', $reservation->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time]);
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'conflict' => 'Slot waktu ini sudah terisi di lab tersebut.',
            ])->withInput();
        }

        $reservation->update([
            'day'        => $request->day,
            'date'       => $request->date,
            'start_time' => $request->start_time,
            'end_time'   => $request->end_time,
            'purpose'    => $request->purpose,
            'lab_id'     => $request->lab_id,
        ]);

        // Notify admins about the update
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new ReservationSubmittedNotification($reservation));
        }

        return redirect()->route('lecturer.reservations.index')
            ->with('success', 'Reservasi berhasil diperbarui.');
    }

    // Batalkan reservasi
    public function cancel(Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        if ($reservation->status === 'cancelled') {
            return back()->with('error', 'Reservasi ini sudah dibatalkan sebelumnya.');
        }

        $reservation->update(['status' => 'cancelled']);

        // Notify admins about the cancellation
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new ReservationSubmittedNotification($reservation));
        }

        return redirect()->route('lecturer.reservations.index')
            ->with('success', 'Reservasi berhasil dibatalkan.');
    }
}
