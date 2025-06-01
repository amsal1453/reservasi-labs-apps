<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Reservation;
use App\Models\Schedule;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get upcoming reservations - using day and start_time instead of date
        $upcomingReservations = Reservation::where('user_id', $user->id)
            ->with('lab:id,name')
            ->where('status', '!=', 'rejected') // Only show pending and approved
            ->orderBy('day', 'asc')
            ->orderBy('start_time', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'purpose' => $reservation->purpose,
                    'status' => $reservation->status,
                    'date' => $reservation->day . ' ' . Carbon::parse($reservation->start_time)->format('H:i'),
                    'lab' => [
                        'name' => $reservation->lab->name,
                    ],
                ];
            });

        // Get today's schedules
        $today = Carbon::now()->format('l'); // e.g., "Monday"
        $todaySchedules = Schedule::where('day', $today)
            ->with('lab:id,name')
            ->orderBy('start_time', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'lab' => [
                        'name' => $schedule->lab->name,
                    ],
                ];
            });

        // Get unread notifications
        $unreadNotifications = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->orderBy('sent_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'is_read' => (bool) $notification->is_read,
                    'sent_at' => Carbon::parse($notification->sent_at)->diffForHumans(),
                ];
            });

        // Get reservation stats
        $stats = [
            'totalReservations' => Reservation::where('user_id', $user->id)->count(),
            'pendingReservations' => Reservation::where('user_id', $user->id)->where('status', 'pending')->count(),
            'approvedReservations' => Reservation::where('user_id', $user->id)->where('status', 'approved')->count(),
            'rejectedReservations' => Reservation::where('user_id', $user->id)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Student/Dashboard', [
            'upcomingReservations' => $upcomingReservations,
            'todaySchedules' => $todaySchedules,
            'unreadNotifications' => $unreadNotifications,
            'stats' => $stats,
        ]);
    }
}
