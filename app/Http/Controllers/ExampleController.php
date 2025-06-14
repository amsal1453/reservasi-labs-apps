<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\User;
use App\Notifications\ReservationSubmittedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class ExampleController extends Controller
{
    /**
     * Example method showing how to send notifications to all admin users.
     * This is for demonstration purposes only.
     */
    public function sendNotificationToAdmins(Reservation $reservation)
    {
        // Make sure all necessary relationships are loaded
        $reservation->load(['user', 'lab']);

        // Get all users with the 'admin' role using Spatie's permission package
        $admins = User::role('admin')->get();

        // Check if there are any admins to notify
        if ($admins->isEmpty()) {
            return response()->json([
                'message' => 'No admin users found to notify',
            ], 404);
        }

        // Send the notification to all admins at once using the Notification facade
        // This is more efficient than looping through each admin and calling notify()
        Notification::send($admins, new ReservationSubmittedNotification($reservation));

        return response()->json([
            'message' => 'Notification sent to ' . $admins->count() . ' admin users',
            'admin_count' => $admins->count(),
        ]);
    }

    /**
     * Alternative implementation showing different approaches.
     */
    public function alternativeNotificationApproaches(Reservation $reservation)
    {
        // 1. Approach: Using Notification facade with specific channels
        $admins = User::role('admin')->get();
        Notification::send($admins, (new ReservationSubmittedNotification($reservation))->onQueue('notifications'));

        // 2. Approach: Send to specific email addresses (even if they don't have user accounts)
        Notification::route('mail', [
            'admin1@example.com' => 'Admin One',
            'admin2@example.com' => 'Admin Two',
        ])->notify(new ReservationSubmittedNotification($reservation));

        // 3. Approach: Send to a specific admin
        $mainAdmin = User::role('admin')->first();
        if ($mainAdmin) {
            $mainAdmin->notify(new ReservationSubmittedNotification($reservation));
        }

        // 4. Approach: Delay the notification
        $admins = User::role('admin')->get();
        $delay = now()->addMinutes(10);
        Notification::send($admins, (new ReservationSubmittedNotification($reservation))->delay($delay));

        return response()->json([
            'message' => 'Various notification approaches demonstrated',
        ]);
    }
}
