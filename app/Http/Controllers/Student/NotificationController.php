<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('is_read', 'asc')
            ->orderBy('sent_at', 'desc')
            ->get();

        return Inertia::render('Student/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function show(Notification $notification)
    {
        abort_if($notification->user_id !== Auth::id(), 403);

        if (!$notification->is_read) {
            $notification->update(['is_read' => true]);
        }

        return Inertia::render('Student/Notifications/Show', [
            'notification' => $notification,
        ]);
    }
}
