<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lab;
use App\Models\Reservation;
use App\Models\Schedule;
use App\Models\User;
use App\Notifications\ReservationSubmittedNotification;
use App\Services\ReservationNotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

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
        $reservations = Reservation::with('lab')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('Student/Reservations/Index', [
            'reservations' => $reservations,
        ]);
    }

    // Form pengajuan reservasi
    public function create()
    {
        $labs = Lab::where('status', 'available')->get();

        return Inertia::render('Student/Reservations/Create', [
            'labs' => $labs,
        ]);
    }

    // Simpan reservasi baru
    public function store(Request $request)
    {
        $request->validate([
            'day'           => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'date'          => 'required|date|date_format:Y-m-d',
            'start_time'    => 'required|date_format:H:i',
            'end_time'      => 'required|date_format:H:i|after:start_time',
            'purpose'       => 'required|string|max:255',
            'lab_id'        => 'required|exists:labs,id',
        ]);

        // Cek bentrok dengan reservasi yang sudah disetujui
        $approvedConflict = Reservation::where('lab_id', $request->lab_id)
            ->where('day', $request->day)
            ->where('status', 'approved')
            ->where(function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('start_time', '<', $request->end_time)
                    ->where('end_time', '>', $request->start_time);
                });
            })
            ->exists();

        if ($approvedConflict) {
            return back()->withErrors([
                'conflict' => 'Slot waktu ini sudah terisi dengan reservasi yang disetujui di lab tersebut.',
            ])->withInput();
        }

        // Cek bentrok dengan reservasi yang masih pending
        $pendingConflict = Reservation::where('lab_id', $request->lab_id)
            ->where('day', $request->day)
            ->where('status', 'pending')
            ->where(function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('start_time', '<', $request->end_time)
                        ->where('end_time', '>', $request->start_time);
                });
            })
            ->first();

        if ($pendingConflict) {
            // Ambil nama user yang sudah reservasi
            $pendingUser = User::find($pendingConflict->user_id);
            $userName = $pendingUser ? $pendingUser->name : 'User lain';

            return back()->withErrors([
                'pendingConflict' => "Perhatian: {$userName} sudah mengajukan reservasi untuk slot waktu ini (status: menunggu persetujuan). Anda tetap dapat melanjutkan, namun hanya satu reservasi yang akan disetujui.",
            ])->withInput()->with('showPendingWarning', true);
        }

        try {
            // Buat reservasi baru
            $reservation = Reservation::create([
                'user_id'       => Auth::id(),
                'day'           => $request->day,
                'date'          => $request->date,
                'start_time'    => $request->start_time,
                'end_time'      => $request->end_time,
                'purpose'       => $request->purpose,
                'lab_id'        => $request->lab_id,
                'status'        => 'pending',
            ]);

            // Kirim notifikasi ke admin
            $admins = User::role('admin')->get();

            // Send in-app notifications
            foreach ($admins as $admin) {
                $admin->notify(new ReservationSubmittedNotification($reservation));
            }

            // Send email notifications to admins
            $this->notificationService->sendRequestNotificationsToAdmins($reservation);

            return redirect()->route('student.reservations.index')
                ->with('success', 'Reservasi berhasil dikirim dan menunggu persetujuan.');
        } catch (\Exception $e) {
            Log::error('Error creating reservation', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat membuat reservasi. Silakan coba lagi nanti.'
            ])->withInput();
        }
    }

    // Detail reservasi
    public function show(Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        return Inertia::render('Student/Reservations/Show', [
            'reservation' => $reservation->load('lab'),
        ]);
    }

    /**
     * Hapus reservasi
     *
     * @param Reservation $reservation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Reservation $reservation)
    {
        // Cek apakah reservasi milik user yang login
        abort_if($reservation->user_id !== Auth::id(), 403);

        // Hanya bisa menghapus reservasi dengan status pending
        if ($reservation->status !== 'pending') {
            return redirect()->route('student.reservations.index')
                ->with('error', 'Hanya reservasi dengan status menunggu persetujuan yang dapat dihapus.');
        }

        try {
            $reservation->delete();

            return redirect()->route('student.reservations.index')
                ->with('success', 'Reservasi berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting reservation', [
                'user_id' => Auth::id(),
                'reservation_id' => $reservation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('student.reservations.index')
                ->with('error', 'Terjadi kesalahan saat menghapus reservasi.');
        }
    }
}
