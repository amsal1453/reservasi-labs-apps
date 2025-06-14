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

        // Cek bentrok reservasi/lab
        $conflict = Reservation::where('lab_id', $request->lab_id)
            ->where('day', $request->day)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                ->orWhere(function ($q) use ($request) {
                    $q->where('start_time', '<=', $request->start_time)
                        ->where('end_time', '>=', $request->end_time);
                });
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'conflict' => 'Waktu yang dipilih sudah terisi. Silakan pilih slot lain.',
            ])->withInput();
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
}
