<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use App\Models\Schedule;

class ReservationController extends Controller
{
    public function index()
    {
        $reservations = Reservation::with('user')->latest()->get();
        return view('admin.reservations.index', compact('reservations'));
    }

    // Tampilkan detail reservasi
    public function show(Reservation $reservation)
    {
        return view('admin.reservations.show', compact('reservation'));
    }

    // Setujui reservasi dan masukkan ke jadwal
    public function approve(Reservation $reservation)
    {
        DB::beginTransaction();

        try {
            // Cek bentrok jadwal
            $conflict = Schedule::where('day', $reservation->day)
                ->where('room', 'Computer Lab 225') // atau ambil dari request
                ->where(function ($query) use ($reservation) {
                    $query->whereBetween('start_time', [$reservation->start_time, $reservation->end_time])
                        ->orWhereBetween('end_time', [$reservation->start_time, $reservation->end_time]);
                })->exists();

            if ($conflict) {
                return back()->withErrors(['conflict' => 'Slot jadwal bentrok.']);
            }

            // Update status
            $reservation->update(['status' => 'approved']);

            // Tambahkan ke jadwal
            Schedule::create([
                'day'           => $reservation->day,
                'start_time'    => $reservation->start_time,
                'end_time'      => $reservation->end_time,
                'course_name'   => null,
                'lecturer_id'   => null,
                'room'          => 'Computer Lab 225',
                'type'          => 'reservation',
                'reservation_id' => $reservation->id,
            ]);

            DB::commit();

            return redirect()->route('admin.reservations.index')
                ->with('success', 'Reservasi disetujui dan jadwal berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyetujui reservasi: ' . $e->getMessage()]);
        }
    }

    // Tolak reservasi
    public function reject(Reservation $reservation)
    {
        $reservation->update(['status' => 'rejected']);

        return redirect()->route('admin.reservations.index')
            ->with('success', 'Reservasi ditolak.');
    }
}
