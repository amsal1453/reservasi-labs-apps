<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use App\Models\Schedule;
use App\Models\Lab;
use App\Notifications\ReservationStatusNotification as ReservationStatusNotificationInApp;
use App\Services\ReservationNotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use App\Models\User;

class ReservationController extends Controller
{
    /**
     * @var ReservationNotificationService
     */
    protected $notificationService;

    /**
     * Create a new controller instance.
     *
     * @param ReservationNotificationService $notificationService
     */
    public function __construct(ReservationNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

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
            // Cek bentrok jadwal dengan detail lebih lengkap
            $conflictingSchedules = Schedule::where('day', $reservation->day)
                ->where('lab_id', $reservation->lab_id)
                ->where(function ($query) use ($reservation) {
                $query->where(function ($q) use ($reservation) {
                    $q->where('start_time', '<', $reservation->end_time)
                        ->where('end_time', '>', $reservation->start_time);
                });
                })
                ->get();

            if ($conflictingSchedules->count() > 0) {
                $conflictMessage = 'Tidak dapat menyetujui reservasi karena jadwal bentrok dengan:';
                foreach ($conflictingSchedules as $schedule) {
                    $conflictMessage .= "\n- " . $schedule->course_name . " ({$schedule->start_time} - {$schedule->end_time})";
                }

                return back()->withErrors([
                    'error' => $conflictMessage
                ]);
            }

            // Cek apakah ada reservasi pending lain dengan waktu yang sama
            $pendingConflicts = Reservation::where('id', '!=', $reservation->id)
                ->where('lab_id', $reservation->lab_id)
                ->where('day', $reservation->day)
                ->where('status', 'pending')
                ->where(function ($query) use ($reservation) {
                    $query->where(function ($q) use ($reservation) {
                        $q->where('start_time', '<', $reservation->end_time)
                            ->where('end_time', '>', $reservation->start_time);
                    });
                })
                ->get();

            if ($pendingConflicts->count() > 0) {
                // Kita tetap setujui, tapi berikan peringatan bahwa ada konflik dengan reservasi pending lain
                $pendingMessage = 'Perhatian: Terdapat ' . $pendingConflicts->count() . ' reservasi pending lain dengan waktu yang sama. ';
                $pendingMessage .= 'Reservasi ini akan disetujui, tetapi perhatikan konflik berikut:';

                foreach ($pendingConflicts as $conflict) {
                    $lecturer = User::find($conflict->user_id);
                    $lecturerName = $lecturer ? $lecturer->name : 'Unknown';
                    $pendingMessage .= "\n- {$lecturerName}: {$conflict->purpose} ({$conflict->start_time} - {$conflict->end_time})";
                }

                // Tolak semua reservasi yang bentrok
                foreach ($pendingConflicts as $conflict) {
                    $conflict->update([
                        'status' => 'rejected',
                        'admin_notes' => 'Ditolak secara otomatis karena bentrok dengan reservasi yang telah disetujui.',
                        'reviewed_by' => Auth::id(),
                        'reviewed_at' => now(),
                    ]);

                    // Notifikasi untuk dosen yang reservasinya ditolak
                    $conflictUser = User::find($conflict->user_id);
                    $rejectMessage = "Reservasi Anda untuk {$conflict->lab->name} ditolak karena bentrok dengan reservasi lain yang telah disetujui.";
                    $conflictUser->notify(new ReservationStatusNotificationInApp($conflict, 'rejected', $rejectMessage));
                    $this->notificationService->sendStatusNotificationToUser($conflict, 'rejected', $rejectMessage);
                }
            }

            // Update status
            $reservation->update([
                'status' => 'approved',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

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

            // Send in-app notification to the user
            $user = $reservation->user;
            $message = "Your reservation for {$reservation->lab->name} has been approved.";
            $user->notify(new ReservationStatusNotificationInApp($reservation, 'approved', $message));

            // Send email notification
            $this->notificationService->sendStatusNotificationToUser($reservation, 'approved', $message);

            DB::commit();

            $successMessage = 'Reservasi berhasil disetujui';
            if (isset($pendingMessage)) {
                $successMessage .= ', namun perhatikan bahwa ada reservasi lain yang ditolak karena bentrok.';
            }

            return Redirect::route('admin.reservations.index')
                ->with('message', $successMessage);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error approving reservation', [
                'reservation_id' => $reservation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menyetujui reservasi.'
            ]);
        }
    }

    // Tolak reservasi
    public function reject(Request $request, Reservation $reservation)
    {
        try {
            // Update status and add rejection notes if provided
            $reservation->update([
                'status' => 'rejected',
                'admin_notes' => $request->notes ?? null,
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

            // Send in-app notification to the user
            $user = $reservation->user;
            $message = "Your reservation for {$reservation->lab->name} has been rejected.";
            if ($request->notes) {
                $message .= " Reason: {$request->notes}";
            }

            $user->notify(new ReservationStatusNotificationInApp($reservation, 'rejected', $message));

            // Send email notification
            $this->notificationService->sendStatusNotificationToUser($reservation, 'rejected', $message);

            return Redirect::route('admin.reservations.index')
                ->with('message', 'Reservasi berhasil ditolak');
        } catch (\Exception $e) {
            Log::error('Error rejecting reservation', [
                'reservation_id' => $reservation->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menolak reservasi.'
            ]);
        }
    }
}
