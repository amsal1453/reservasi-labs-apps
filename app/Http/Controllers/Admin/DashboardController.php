<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Lab;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class DashboardController extends Controller
{
    public function index()
    {
        $totalReservations = Reservation::count();
        $todayReservations = Reservation::whereDate('created_at', Carbon::today())->count();
        $totalLabs = Lab::count();
        $totalUsers = User::count();

        // Recent reservations
        $recentReservations = Reservation::with(['user', 'lab'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'user_name' => $r->user->name ?? '-',
                    'lab_name' => $r->lab->name ?? '-',
                    'date' => $r->created_at->format('Y-m-d'),
                    'status' => $r->status,
                ];
            });

        // Upcoming reservations
        $upcomingReservations = Reservation::with(['user', 'lab'])
            ->where('date', '>=', now()->format('Y-m-d'))
            ->where('status', 'approved')
            ->orderBy('date')
            ->orderBy('start_time')
            ->take(5)
            ->get()
            ->map(function ($r) {
                return [
                    'lab_name' => $r->lab->name,
                    'date' => Carbon::parse($r->date)->format('d-m-Y'),
                    'start_time' => Carbon::parse($r->start_time)->format('H:i'),
                    'end_time' => Carbon::parse($r->end_time)->format('H:i'),
                    'status' => $r->status === 'approved' ? 'disetujui' : ($r->status === 'pending' ? 'tertunda' : 'ditolak')
                ];
            });

        // Latest notifications
        $user = Auth::user();
        $latestNotifications = DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($notification) {
                $data = $notification->data;

                // If data is a string, decode it
                if (is_string($data)) {
                    $data = json_decode($data);
                }

                // Extract message from different possible formats
                $message = '';
                if (isset($data->message)) {
                    $message = $data->message;
                } elseif (isset($data->text)) {
                    $message = $data->text;
                } elseif (isset($data->content)) {
                    $message = $data->content;
                } elseif (is_string($data)) {
                    $message = $data;
                }

                return [
                    'title' => $data->title ?? 'Notification',
                    'body' => $message,
                    'date' => 'Tanggal ' . Carbon::parse($notification->created_at)->format('d F Y'),
                    'is_new' => $notification->read_at === null
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalReservations' => $totalReservations,
                'todayReservations' => $todayReservations,
                'totalLabs' => $totalLabs,
                'totalUsers' => $totalUsers,
            ],
            'recentReservations' => $recentReservations,
            'upcomingReservations' => $upcomingReservations,
            'latestNotifications' => $latestNotifications,
        ]);
    }
}
