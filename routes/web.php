<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\LabController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\ReservationController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\LabManagerController;
use App\Models\User;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\Reservation;

// Test notification route
Route::get('/test-notif', function () {
    $user = User::find(1);
    if ($user) {
        $user->notify(new TestNotification());
        return 'Test notification sent to user ID 1';
    }
    return 'User with ID 1 not found';
});

Route::get('/test-notification', function () {
    $user = Auth::user();
    if ($user) {
        Log::info('Sending test notification to user: ' . $user->id);
        $user->notify(new TestNotification());
        return 'Test notification sent!';
    }
    return 'User not logged in!';
});

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');

    Route::resource('schedules', ScheduleController::class);
    Route::post('schedules/import', [ScheduleController::class, 'import'])->name('schedules.import');
    Route::get('schedules/template/download', [ScheduleController::class, 'downloadTemplate'])->name('schedules.template.download');

    Route::get('lab-manager', [LabManagerController::class, 'index'])->name('lab-manager.index');

    Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show'])->name('reservations.show');
    Route::post('/reservations/{reservation}/approve', [ReservationController::class, 'approve'])->name('reservations.approve');
    Route::post('/reservations/{reservation}/reject', [ReservationController::class, 'reject'])->name('reservations.reject');

    Route::resource('users', UserController::class);

    Route::resource('labs', LabController::class);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/{notification}', [NotificationController::class, 'show'])->name('notifications.show');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

Route::middleware(['auth', 'role:lecturer'])->prefix('lecturer')->name('lecturer.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('Lecturer/Dashboard');
    })->name('dashboard');

    // Reservation routes
    Route::get('/reservations', [App\Http\Controllers\Lecturer\ReservationController::class, 'index'])
        ->name('reservations.index');
    Route::get('/reservations/create', [App\Http\Controllers\Lecturer\ReservationController::class, 'create'])
        ->name('reservations.create');
    Route::post('/reservations', [App\Http\Controllers\Lecturer\ReservationController::class, 'store'])
        ->name('reservations.store');
    Route::get('/reservations/{reservation}', [App\Http\Controllers\Lecturer\ReservationController::class, 'show'])
        ->name('reservations.show');
    Route::get('/reservations/{reservation}/edit', [App\Http\Controllers\Lecturer\ReservationController::class, 'edit'])
        ->name('reservations.edit');
    Route::put('/reservations/{reservation}', [App\Http\Controllers\Lecturer\ReservationController::class, 'update'])
        ->name('reservations.update');
    Route::post('/reservations/{reservation}/cancel', [App\Http\Controllers\Lecturer\ReservationController::class, 'cancel'])
        ->name('reservations.cancel');

    Route::get('/lab-schedules', [App\Http\Controllers\Lecturer\LabScheduleController::class, 'index'])
        ->name('lab-schedules.index');

    // Notification routes
    Route::get('notifications', [\App\Http\Controllers\Lecturer\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/{notification}', [\App\Http\Controllers\Lecturer\NotificationController::class, 'show'])->name('notifications.show');
    Route::post('notifications/mark-all-read', [\App\Http\Controllers\Lecturer\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
});

Route::middleware(['auth', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\Student\DashboardController::class, 'index'])->name('dashboard');

    Route::resource('reservations', \App\Http\Controllers\Student\ReservationController::class)->only([
        'index',
        'create',
        'store',
        'show'
    ]);

    Route::get('/lab-schedules', [\App\Http\Controllers\Student\LabScheduleController::class, 'index'])
        ->name('lab-schedules.index');

    Route::get('/notifications', [\App\Http\Controllers\Student\NotificationController::class, 'index'])
        ->name('notifications.index');
    Route::get('/notifications/{notification}', [\App\Http\Controllers\Student\NotificationController::class, 'show'])
        ->name('notifications.show');
});

// Notification API routes
Route::middleware(['auth'])->group(function () {
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [App\Http\Controllers\NotificationController::class, 'destroy']);
});

// Notification API endpoints
Route::middleware('auth')->group(function () {
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'apiIndex']);
    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'apiMarkAsRead']);
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'apiMarkAllAsRead']);
});


// Route untuk test email sederhana
Route::get('/test-email-simple', function () {
    try {
        Mail::raw('Halo! Ini adalah test email dari Laravel Lab Reservation System.', function ($message) {
            $message->to('kunamsaldasilva@gmail.com')
                ->subject('Test Email dari Lab Reservation System')
                ->from('amsalpawang@gmail.com', 'Reservasi Labs');
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Email berhasil dikirim ke kunamsaldasilva@gmail.com! Silakan cek inbox.',
            'sent_to' => 'kunamsaldasilva@gmail.com',
            'sent_from' => 'amsalpawang@gmail.com'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Gagal mengirim email: ' . $e->getMessage()
        ]);
    }
});

// Route untuk test email dengan HTML template
Route::get('/test-email-html', function () {
    try {
        $htmlContent = '
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4f46e5; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Test Email Lab Reservation System</h1>
                </div>
                <div class="content">
                    <p>Halo,</p>
                    <p>Ini adalah test email dari sistem reservasi lab komputer.</p>

                    <div class="info-box">
                        <h3>Detail Test:</h3>
                        <p><strong>Pengirim:</strong> amsalpawang@gmail.com</p>
                        <p><strong>Sistem:</strong> Laravel Lab Reservation</p>
                        <p><strong>Waktu:</strong> ' . now()->format('d/m/Y H:i:s') . '</p>
                    </div>

                    <p>Jika Anda menerima email ini, berarti konfigurasi email sudah berfungsi dengan baik!</p>

                    <p>Terima kasih,<br>Tim Lab Komputer</p>
                </div>
            </div>
        </body>
        </html>';

        Mail::send([], [], function ($message) use ($htmlContent) {
            $message->to('kunamsaldasilva@gmail.com')
                ->subject('Test HTML Email - Lab Reservation System')
                ->from('amsalpawang@gmail.com', 'Reservasi Labs')
                ->setBody($htmlContent, 'text/html');
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Email HTML berhasil dikirim ke kunamsaldasilva@gmail.com!',
            'sent_to' => 'kunamsaldasilva@gmail.com',
            'sent_at' => now()->format('d/m/Y H:i:s')
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Gagal mengirim email HTML: ' . $e->getMessage()
        ]);
    }
});

// Route untuk test email notification (jika sudah ada data reservasi)
Route::get('/test-email-notification', function () {
    try {
        // Cek apakah ada data reservasi
        $reservation = Reservation::with(['user', 'lab'])->first();

        if (!$reservation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada data reservasi untuk testing. Buat reservasi dulu atau gunakan test-email-simple.'
            ]);
        }

        // Jika sudah ada Mailable class, gunakan ini
        // Mail::to('kunamsaldasilva@gmail.com')->send(new ReservationRequestNotification($reservation));

        // Alternatif manual tanpa Mailable class
        $emailContent = "
        <h2>Test Notifikasi Reservasi Lab</h2>
        <p><strong>Pemohon:</strong> {$reservation->user->name}</p>
        <p><strong>Lab:</strong> {$reservation->lab->name}</p>
        <p><strong>Tanggal:</strong> {$reservation->date}</p>
        <p><strong>Waktu:</strong> {$reservation->start_time} - {$reservation->end_time}</p>
        <p><strong>Keperluan:</strong> {$reservation->purpose}</p>
        <p>Ini adalah test email notification menggunakan data reservasi asli.</p>
        ";

        Mail::send([], [], function ($message) use ($emailContent) {
            $message->to('kunamsaldasilva@gmail.com')
                ->subject('Test Notification - Reservasi Lab')
                ->from('amsalpawang@gmail.com', 'Reservasi Labs')
                ->setBody($emailContent, 'text/html');
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Email notification test berhasil dikirim!',
            'reservation_id' => $reservation->id,
            'sent_to' => 'kunamsaldasilva@gmail.com'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Gagal mengirim test notification: ' . $e->getMessage()
        ]);
    }
});

// Route untuk test multiple emails (admin notification simulation)
Route::get('/test-email-multiple', function () {
    try {
        $recipients = [
            'kunamsaldasilva@gmail.com',
            'amsalpawang@gmail.com' // CC ke diri sendiri
        ];

        $successCount = 0;
        $errors = [];

        foreach ($recipients as $email) {
            try {
                Mail::raw("Test email ke multiple recipients.\n\nEmail ini dikirim ke: {$email}\nWaktu: " . now()->format('d/m/Y H:i:s'), function ($message) use ($email) {
                    $message->to($email)
                        ->subject('Test Multiple Email - Lab Reservation')
                        ->from('amsalpawang@gmail.com', 'Reservasi Labs');
                });
                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Gagal kirim ke {$email}: " . $e->getMessage();
            }
        }

        return response()->json([
            'status' => $successCount > 0 ? 'success' : 'error',
            'message' => "Berhasil kirim {$successCount} dari " . count($recipients) . " email",
            'recipients' => $recipients,
            'errors' => $errors
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error general: ' . $e->getMessage()
        ]);
    }
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
