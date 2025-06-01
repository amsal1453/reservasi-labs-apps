<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\LabController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\ReservationController;
use App\Http\Controllers\Admin\NotificationController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');

    Route::resource('schedules', ScheduleController::class);

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


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
