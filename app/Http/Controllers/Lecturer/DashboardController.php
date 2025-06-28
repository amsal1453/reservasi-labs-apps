<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Reservation;
use App\Models\Lab;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get upcoming reservations
        $upcomingReservations = Reservation::with('lab')
            ->where('user_id', $user->id)
            ->where('date', '>=', now()->format('Y-m-d'))
            ->orderBy('date')
            ->orderBy('start_time')
            ->take(5)
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'lab' => $reservation->lab->name,
                    'date' => Carbon::parse($reservation->date)->format('d M Y'),
                    'time' => Carbon::parse($reservation->start_time)->format('H:i') . ' - ' .
                        Carbon::parse($reservation->end_time)->format('H:i'),
                    'status' => $reservation->status
                ];
            });

        // Get recent notifications
        $recentNotifications = DatabaseNotification::where('notifiable_type', get_class($user))
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
                    'id' => $notification->id,
                    'title' => $data->title ?? 'Notification',
                    'message' => $message,
                    'date' => Carbon::parse($notification->created_at)->format('d M Y'),
                    'read' => $notification->read_at !== null
                ];
            });

        // Get stats
        $totalReservations = Reservation::where('user_id', $user->id)->count();
        $pendingReservations = Reservation::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();
        $labsAvailable = Lab::where('status', 'available')->count();

        $stats = [
            'totalReservations' => $totalReservations,
            'pendingReservations' => $pendingReservations,
            'labsAvailable' => $labsAvailable
        ];

        return Inertia::render('Lecturer/Dashboard', [
            'upcomingReservations' => $upcomingReservations,
            'recentNotifications' => $recentNotifications,
            'stats' => $stats
        ]);
    }
}
