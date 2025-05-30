<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Reservation;
use App\Models\Lab;
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

        Reservation::create([
            'user_id'    => Auth::id(),
            'day'        => $request->day,
            'start_time' => $request->start_time,
            'end_time'   => $request->end_time,
            'purpose'    => $request->purpose,
            'lab_id'     => $request->lab_id,
            'status'     => 'pending',
        ]);

        return redirect()->route('lecturer.reservations.index')
            ->with('success', 'Reservasi berhasil diajukan dan menunggu persetujuan.');
    }

    // Tampilkan detail reservasi
    public function show(Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        return Inertia::render('Lecturer/Reservations/Show', [
            'reservation' => $reservation->load('lab'),
        ]);
    }

    // Edit reservasi
    public function edit(Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        $labs = Lab::where('status', 'available')->get();

        return Inertia::render('Lecturer/Reservations/Edit', [
            'reservation' => $reservation->load('lab'),
            'labs' => $labs,
        ]);
    }

    // Update reservasi
    public function update(Request $request, Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        $request->validate([
            'day'         => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
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
            'start_time' => $request->start_time,
            'end_time'   => $request->end_time,
            'purpose'    => $request->purpose,
            'lab_id'     => $request->lab_id,
        ]);

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

        return redirect()->route('lecturer.reservations.index')
            ->with('success', 'Reservasi berhasil dibatalkan.');
    }
}
