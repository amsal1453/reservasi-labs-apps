<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $notifications = DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->orderByRaw('CASE WHEN read_at IS NULL THEN 0 ELSE 1 END')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Student/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function show(DatabaseNotification $notification)
    {
        abort_if($notification->notifiable_id !== Auth::id(), 403);

        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return Inertia::render('Student/Notifications/Show', [
            'notification' => $notification,
        ]);
    }
}
