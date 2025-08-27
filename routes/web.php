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

// Home route with role-based redirection
Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();

        return match (true) {
            $user->hasRole('admin') => redirect()->route('admin.dashboard'),
            $user->hasRole('lecturer') => redirect()->route('lecturer.dashboard'),
            $user->hasRole('student') => redirect()->route('student.dashboard'),
            default => redirect()->route('login')
        };
    }
    return redirect()->route('login');
})->name('home');

// Admin Routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

    // Resource routes
    Route::resource('schedules', ScheduleController::class);
    Route::resource('users', UserController::class);
    Route::resource('labs', LabController::class);

    // Lab Manager
    Route::get('lab-manager', [LabManagerController::class, 'index'])->name('lab-manager.index');

    // Labs PDF - FIX: Added specific route for labs PDF
    Route::get('labs/pdf/{lab_id}', [PdfController::class, 'generateCombinedPdf'])->name('labs.pdf');

    // Reservations
    Route::prefix('reservations')->name('reservations.')->group(function () {
        Route::get('/', [ReservationController::class, 'index'])->name('index');
        Route::get('pdf/{lab_id?}', [PdfController::class, 'generateReservationPdf'])->name('pdf');
        Route::get('{reservation}', [ReservationController::class, 'show'])->name('show');
        Route::post('{reservation}/approve', [ReservationController::class, 'approve'])->name('approve');
        Route::post('{reservation}/reject', [ReservationController::class, 'reject'])->name('reject');
    });

    // PDF Generation
    Route::prefix('pdf')->name('pdf.')->group(function () {
        Route::get('schedules/{lab_id}', [PdfController::class, 'generateSchedulePdf'])->name('schedules');
        Route::get('labs/{lab_id}', [PdfController::class, 'generateCombinedPdf'])->name('labs');
    });

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('{notification}', [NotificationController::class, 'show'])->name('show');
        Route::post('mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('{notification}', [NotificationController::class, 'destroy'])->name('destroy');
    });
});

// Lecturer Routes
Route::middleware(['auth', 'role:lecturer'])->prefix('lecturer')->name('lecturer.')->group(function () {
    // Dashboard
    Route::get('dashboard', [App\Http\Controllers\Lecturer\DashboardController::class, 'index'])->name('dashboard');

    // Reservations
    Route::resource('reservations', App\Http\Controllers\Lecturer\ReservationController::class);

    // Lab Schedules
    Route::get('lab-schedules', [App\Http\Controllers\Lecturer\LabScheduleController::class, 'index'])
        ->name('lab-schedules.index');

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Lecturer\NotificationController::class, 'index'])->name('index');
        Route::get('{notification}', [\App\Http\Controllers\Lecturer\NotificationController::class, 'show'])->name('show');
        Route::post('mark-all-read', [\App\Http\Controllers\Lecturer\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    });
});

// Student Routes
Route::middleware(['auth', 'role:student'])->prefix('student')->name('student.')->group(function () {
    // Dashboard
    Route::get('dashboard', [\App\Http\Controllers\Student\DashboardController::class, 'index'])->name('dashboard');

    // Reservations (limited actions for students)
    Route::resource('reservations', \App\Http\Controllers\Student\ReservationController::class)
        ->only(['index', 'create', 'store', 'show', 'destroy']);

    // Lab Schedules
    Route::get('lab-schedules', [\App\Http\Controllers\Student\LabScheduleController::class, 'index'])
        ->name('lab-schedules.index');

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Student\NotificationController::class, 'index'])->name('index');
        Route::get('{notification}', [\App\Http\Controllers\Student\NotificationController::class, 'show'])->name('show');
    });
});

// Shared API Routes (accessible by all authenticated users)
Route::middleware(['auth'])->prefix('api')->name('api.')->group(function () {
    // Notification API endpoints
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [App\Http\Controllers\NotificationController::class, 'index'])->name('index');
        Route::post('{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('read');
        Route::post('mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('{notification}', [App\Http\Controllers\NotificationController::class, 'destroy'])->name('destroy');
    });
});

// Include additional route files
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
