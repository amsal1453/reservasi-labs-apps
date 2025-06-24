<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Lab;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalReservations = Reservation::count();
        $todayReservations = Reservation::whereDate('created_at', Carbon::today())->count();
        $totalLabs = Lab::count();
        $totalUsers = User::count();

        $recentReservations = Reservation::with(['user', 'lab'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'user_name' => $r->user->name ?? '-',
                    'lab_name' => $r->lab->name ?? '-',
                    'date' => $r->created_at->format('Y-m-d'),
                    'status' => $r->status,
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalReservations' => $totalReservations,
                'todayReservations' => $todayReservations,
                'totalLabs' => $totalLabs,
                'totalUsers' => $totalUsers,
            ],
            'recentReservations' => $recentReservations,
        ]);
    }
}
