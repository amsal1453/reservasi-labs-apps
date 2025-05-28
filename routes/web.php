<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\LabController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\ReservationController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('schedules', ScheduleController::class);

    Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show'])->name('reservations.show');
    Route::post('/reservations/{reservation}/approve', [ReservationController::class, 'approve'])->name('reservations.approve');
    Route::post('/reservations/{reservation}/reject', [ReservationController::class, 'reject'])->name('reservations.reject');

    Route::resource('users', UserController::class);

    Route::resource('labs', LabController::class);
});

Route::middleware(['auth', 'role:lecturer'])->prefix('lecturer')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('lecturer.dashboard');
});

Route::middleware(['auth', 'role:student'])->prefix('student')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('student.dashboard');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
