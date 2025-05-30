<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('is_read', 'asc')
            ->orderBy('sent_at', 'desc')
            ->get();

        return Inertia::render('Admin/Notification/Index', [
            'notifications' => $notifications
        ]);
    }

    // Tampilkan satu notifikasi dan tandai sebagai dibaca
    public function show(Notification $notification)
    {
        // Cegah akses user lain
        abort_if($notification->user_id !== Auth::id(), 403);

        // Tandai sudah dibaca jika belum
        if (!$notification->is_read) {
            $notification->update(['is_read' => true]);
        }

        return Inertia::render('Admin/Notification/Show', [
            'notification' => $notification
        ]);
    }

    // Tandai semua notifikasi sebagai sudah dibaca
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return redirect()->back()->with('success', 'Semua notifikasi ditandai sebagai sudah dibaca.');
    }

    // Hapus notifikasi
    public function destroy(Notification $notification)
    {
        // Cegah akses user lain
        abort_if($notification->user_id !== Auth::id(), 403);

        $notification->delete();

        return redirect()->route('admin.notifications.index')
            ->with('success', 'Notifikasi berhasil dihapus.');
    }
}
