<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\LabController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\ReservationController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\LabManagerController;
use App\Http\Controllers\Admin\PdfController;
use App\Models\User;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\Reservation;



Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

    Route::resource('schedules', ScheduleController::class);

    Route::get('lab-manager', [LabManagerController::class, 'index'])->name('lab-manager.index');

    Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservations/pdf/{lab_id?}', [PdfController::class, 'generateReservationPdf'])->name('reservations.pdf');
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show'])->name('reservations.show');
    Route::post('/reservations/{reservation}/approve', [ReservationController::class, 'approve'])->name('reservations.approve');
    Route::post('/reservations/{reservation}/reject', [ReservationController::class, 'reject'])->name('reservations.reject');
    Route::get('schedules/pdf/{lab_id}', [PdfController::class, 'generateSchedulePdf'])->name('schedules.pdf');
    Route::get('labs/pdf/{lab_id}', [PdfController::class, 'generateCombinedPdf'])->name('labs.pdf');

    Route::resource('users', UserController::class);

    Route::resource('labs', LabController::class);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/{notification}', [NotificationController::class, 'show'])->name('notifications.show');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

Route::middleware(['auth', 'role:lecturer'])->prefix('lecturer')->name('lecturer.')->group(function () {

    Route::get('dashboard', [App\Http\Controllers\Lecturer\DashboardController::class, 'index'])->name('dashboard');

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
    Route::delete('/reservations/{reservation}', [App\Http\Controllers\Lecturer\ReservationController::class, 'destroy'])->name('reservations.destroy');

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
        'show',
        'destroy'
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



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
