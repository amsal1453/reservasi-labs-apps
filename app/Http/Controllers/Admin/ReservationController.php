<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use App\Models\Schedule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ReservationController extends Controller
{
    public function index()
    {
        $reservations = Reservation::with(['user', 'schedule'])
            ->latest()
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'purpose' => $reservation->purpose,
                    'day' => $reservation->day,
                    'start_time' => $reservation->start_time,
                    'end_time' => $reservation->end_time,
                    'status' => $reservation->status,
                    'created_at' => $reservation->created_at->format('d M Y H:i'),
                    'user' => [
                        'id' => $reservation->user->id,
                        'name' => $reservation->user->name,
                        'nim_nip' => $reservation->user->nim_nip,
                    ],
                    'schedule' => $reservation->schedule ? [
                        'id' => $reservation->schedule->id,
                        'room' => $reservation->schedule->room,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Reservations/Index', [
            'reservations' => $reservations
        ]);
    }

    // Tampilkan detail reservasi
    public function show(Reservation $reservation)
    {
        $reservation->load(['user', 'schedule']);

        return Inertia::render('Admin/Reservations/Show', [
            'reservation' => [
                'id' => $reservation->id,
                'purpose' => $reservation->purpose,
                'day' => $reservation->day,
                'start_time' => $reservation->start_time,
                'end_time' => $reservation->end_time,
                'status' => $reservation->status,
                'created_at' => $reservation->created_at->format('d M Y H:i'),
                'user' => [
                    'id' => $reservation->user->id,
                    'name' => $reservation->user->name,
                    'nim_nip' => $reservation->user->nim_nip,
                    'email' => $reservation->user->email,
                ],
                'schedule' => $reservation->schedule ? [
                    'id' => $reservation->schedule->id,
                    'room' => $reservation->schedule->room,
                ] : null,
            ]
        ]);
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
                return back()->withErrors([
                    'error' => 'Tidak dapat menyetujui reservasi karena jadwal bentrok.'
                ]);
            }

            // Update status
            $reservation->update(['status' => 'approved']);

            // Tambahkan ke jadwal
            Schedule::create([
                'day' => $reservation->day,
                'start_time' => $reservation->start_time,
                'end_time' => $reservation->end_time,
                'course_name' => $reservation->purpose,
                'lecturer_id' => null,
                'room' => 'Computer Lab 225',
                'type' => 'reservation',
                'reservation_id' => $reservation->id,
            ]);

            DB::commit();

            return Redirect::route('admin.reservations.index')
                ->with('message', 'Reservasi berhasil disetujui');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menyetujui reservasi.'
            ]);
        }
    }

    // Tolak reservasi
    public function reject(Reservation $reservation)
    {
        $reservation->update(['status' => 'rejected']);

        return Redirect::route('admin.reservations.index')
            ->with('message', 'Reservasi berhasil ditolak');
    }
}
