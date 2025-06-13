<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use App\Models\Schedule;
use App\Models\Lab;
use App\Notifications\ReservationStatusNotification;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ReservationController extends Controller
{
    public function index()
    {
        $reservations = Reservation::with(['user', 'schedule', 'lab'])
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
                'lab' => [
                    'id' => $reservation->lab->id,
                    'name' => $reservation->lab->name,
                ],
                    'schedule' => $reservation->schedule ? [
                    'id' => $reservation->schedule->id,
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
        $reservation->load(['user', 'schedule', 'lab']);

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
                'lab' => [
                    'id' => $reservation->lab->id,
                    'name' => $reservation->lab->name,
                ],
                'schedule' => $reservation->schedule ? [
                    'id' => $reservation->schedule->id,
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
                ->where('lab_id', $reservation->lab_id)
                ->where(function ($query) use ($reservation) {
                $query->where(function ($q) use ($reservation) {
                    $q->where('start_time', '<', $reservation->end_time)
                        ->where('end_time', '>', $reservation->start_time);
                });
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
                'lab_id' => $reservation->lab_id,
                'type' => 'reservation',
                'reservation_id' => $reservation->id,
            ]);

            // Send notification to the user
            $user = $reservation->user;
            $message = "Your reservation for {$reservation->lab->name} has been approved.";
            $user->notify(new ReservationStatusNotification($reservation, 'approved', $message));

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

        // Send notification to the user
        $user = $reservation->user;
        $message = "Your reservation for {$reservation->lab->name} has been rejected.";
        $user->notify(new ReservationStatusNotification($reservation, 'rejected', $message));

        return Redirect::route('admin.reservations.index')
            ->with('message', 'Reservasi berhasil ditolak');
    }
}
