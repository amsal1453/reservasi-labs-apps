<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('admin.dashboard');
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
