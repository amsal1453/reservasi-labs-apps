<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $filter = $request->input('filter', 'all'); // all, read, unread

        $user = Auth::user();
        $query = DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id);

        if ($filter === 'read') {
            $query->whereNotNull('read_at');
        } elseif ($filter === 'unread') {
            $query->whereNull('read_at');
        }

        $notifications = $query->orderByRaw('CASE WHEN read_at IS NULL THEN 0 ELSE 1 END')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->through(function ($notification) {
            // Process notification data - handle both object and array formats
            $data = $notification->data;

            // If data is already an array or object, use it directly
            // Otherwise, attempt to decode it if it's a string
            if (is_string($data)) {
                $data = json_decode($data);
            }

            // Extract the message, handling different formats
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
                'sent_at' => Carbon::parse($notification->created_at)->format('Y-m-d H:i:s'),
                'is_read' => $notification->read_at !== null,
                'data' => $data,
                ];
            });

        $unreadCount = DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Lecturer/Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'filters' => [
                'filter' => $filter,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function show(DatabaseNotification $notification)
    {
        abort_if($notification->notifiable_id !== Auth::id(), 403);

        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        // Process notification data - handle both object and array formats
        $data = $notification->data;

        // If data is already an array or object, use it directly
        // Otherwise, attempt to decode it if it's a string
        if (is_string($data)) {
            $data = json_decode($data);
        }

        // Extract the message, handling different formats
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

        return Inertia::render('Lecturer/Notifications/Show', [
            'notification' => [
                'id' => $notification->id,
                'title' => $data->title ?? 'Notification',
                'message' => $message,
                'sent_at' => Carbon::parse($notification->created_at)->format('Y-m-d H:i:s'),
                'is_read' => $notification->read_at !== null,
                'data' => $data,
            ],
        ]);
    }

    public function markAllAsRead()
    {
        $user = Auth::user();
        DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return redirect()->back();
    }
}
