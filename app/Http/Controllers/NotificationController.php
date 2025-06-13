<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();
        $notifications = DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->latest()
            ->paginate(10);

        $unreadCount = DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'notifications' => $notifications->items(),
            'unread_count' => $unreadCount,
            'pagination' => [
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($id)
    {
        $notification = DatabaseNotification::findOrFail($id);

        // Check if the notification belongs to the authenticated user
        if ($notification->notifiable_id !== Auth::id() || $notification->notifiable_type !== get_class(Auth::user())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification.
     */
    public function destroy($id)
    {
        $notification = DatabaseNotification::findOrFail($id);

        // Check if the notification belongs to the authenticated user
        if ($notification->notifiable_id !== Auth::id() || $notification->notifiable_type !== get_class(Auth::user())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * API endpoints for the notification system
     */

    // Return notifications for the current user
    public function apiIndex()
    {
        $user = Auth::user();
        $notifications = DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $unreadCount = $notifications->whereNull('read_at')->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    // Mark a notification as read
    public function apiMarkAsRead(DatabaseNotification $notification)
    {
        // Ensure the notification belongs to the current user
        abort_if($notification->notifiable_id !== Auth::id(), 403);

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    // Mark all notifications as read
    public function apiMarkAllAsRead()
    {
        $user = Auth::user();
        DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}
