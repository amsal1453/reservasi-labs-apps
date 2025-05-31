<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $filter = $request->input('filter', 'all'); // all, read, unread

        $query = Notification::where('user_id', Auth::id())
            ->orderBy('is_read', 'asc')
            ->orderBy('sent_at', 'desc');

        if ($filter === 'read') {
            $query->where('is_read', true);
        } elseif ($filter === 'unread') {
            $query->where('is_read', false);
        }

        $notifications = $query->paginate($perPage)
            ->through(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'sent_at' => Carbon::parse($notification->sent_at)->format('Y-m-d H:i:s'),
                    'is_read' => (bool) $notification->is_read,
                    'user_id' => $notification->user_id,
                ];
            });

        $unreadCount = Notification::where('user_id', Auth::id())
            ->where('is_read', false)
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

    public function show(Notification $notification)
    {
        abort_if($notification->user_id !== Auth::id(), 403);

        if (!$notification->is_read) {
            $notification->update(['is_read' => true]);
        }

        return Inertia::render('Lecturer/Notifications/Show', [
            'notification' => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'sent_at' => Carbon::parse($notification->sent_at)->format('Y-m-d H:i:s'),
                'is_read' => (bool) $notification->is_read,
                'user_id' => $notification->user_id,
            ],
        ]);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return redirect()->back();
    }
}
