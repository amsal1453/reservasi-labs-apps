<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
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

        return Inertia::render('Admin/Notification/Index', [
            'notifications' => $notifications
        ]);
    }

    // Tampilkan satu notifikasi dan tandai sebagai dibaca
    public function show(DatabaseNotification $notification)
    {
        // Cegah akses user lain
        abort_if($notification->notifiable_id !== Auth::id(), 403);

        // Tandai sudah dibaca jika belum
        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return Inertia::render('Admin/Notification/Show', [
            'notification' => $notification
        ]);
    }

    // Tandai semua notifikasi sebagai sudah dibaca
    public function markAllAsRead()
    {
        $user = Auth::user();
        DatabaseNotification::where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return redirect()->back()->with('success', 'Semua notifikasi ditandai sebagai sudah dibaca.');
    }

    // Hapus notifikasi
    public function destroy(DatabaseNotification $notification)
    {
        // Cegah akses user lain
        abort_if($notification->notifiable_id !== Auth::id(), 403);

        $notification->delete();

        return redirect()->route('admin.notifications.index')
            ->with('success', 'Notifikasi berhasil dihapus.');
    }
}
