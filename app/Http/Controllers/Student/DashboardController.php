<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Reservation;
use App\Models\Schedule;
use App\Models\Lab;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Notifications\DatabaseNotification;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        try {
            // Get upcoming reservations
            $upcomingReservations = Reservation::where('user_id', $user->id)
                ->with('lab')
                ->where('date', '>=', now()->format('Y-m-d'))
                ->whereIn('status', ['pending', 'approved'])
                ->orderBy('date')
                ->orderBy('start_time')
                ->limit(5)
                ->get()
                ->map(function ($reservation) {
                    return [
                        'id' => $reservation->id,
                        'purpose' => $reservation->purpose,
                        'status' => $reservation->status,
                    'date' => Carbon::parse($reservation->date)->format('d M Y') . ' ' .
                        Carbon::parse($reservation->start_time)->format('H:i'),
                        'lab' => [
                            'name' => $reservation->lab->name,
                        ],
                    ];
                });

            // Get today's schedules
            $today = Carbon::now()->format('l'); // e.g., "Monday"
            $todaySchedules = Schedule::where('day', $today)
                ->with('lab')
                ->orderBy('start_time')
                ->limit(5)
                ->get()
                ->map(function ($schedule) {
                    return [
                        'id' => $schedule->id,
                        'day' => $schedule->day,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'lab' => [
                        'name' => $schedule->lab->name ?? 'Unknown Lab',
                        ],
                    ];
                });

            // Get unread notifications
            $unreadNotifications = DatabaseNotification::where('notifiable_type', get_class($user))
                ->where('notifiable_id', $user->id)
                ->whereNull('read_at')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($notification) {
                $data = $notification->data;

                // If data is a string, decode it
                if (is_string($data)) {
                    $data = json_decode($data);
                }

                // Extract message from different possible formats
                $message = '';
                if (isset($data->message)) {
                    $message = $data->message;
                } elseif (isset($data->text)) {
                    $message = $data->text;
                } elseif (isset($data->content)) {
                    $message = $data->content;
                } elseif (is_string($data)) {
                    $message = $data;
                }

                return [
                        'id' => $notification->id,
                    'title' => $data->title ?? 'Notification',
                    'is_read' => false,
                    'sent_at' => Carbon::parse($notification->created_at)->diffForHumans(),
                    ];
                });

            // Get reservation stats
            $stats = [
                'totalReservations' => Reservation::where('user_id', $user->id)->count(),
                'pendingReservations' => Reservation::where('user_id', $user->id)->where('status', 'pending')->count(),
                'approvedReservations' => Reservation::where('user_id', $user->id)->where('status', 'approved')->count(),
                'rejectedReservations' => Reservation::where('user_id', $user->id)->where('status', 'rejected')->count(),
            ];

            // If there's no data, create some sample reservations for demonstration
            if ($upcomingReservations->isEmpty() && env('APP_ENV') !== 'production') {
                $labs = Lab::all();
                if ($labs->count() > 0) {
                    $lab = $labs->first();

                    // Create sample reservations
                    $sampleReservations = [
                        [
                            'id' => 9999,
                            'purpose' => 'Praktikum Basis Data',
                            'status' => 'approved',
                            'date' => Carbon::now()->addDays(1)->format('d M Y') . ' 09:00',
                            'lab' => ['name' => $lab->name],
                        ],
                        [
                            'id' => 9998,
                            'purpose' => 'Praktikum Pemrograman Web',
                            'status' => 'pending',
                            'date' => Carbon::now()->addDays(2)->format('d M Y') . ' 13:00',
                            'lab' => ['name' => $lab->name],
                        ],
                    ];

                    $upcomingReservations = collect($sampleReservations);
                }

                // Create sample schedules
                $sampleSchedules = [
                    [
                        'id' => 9997,
                        'day' => Carbon::now()->format('l'),
                        'start_time' => '10:00:00',
                        'end_time' => '12:00:00',
                        'lab' => ['name' => 'Lab Komputer 1'],
                    ],
                    [
                        'id' => 9996,
                        'day' => Carbon::now()->format('l'),
                        'start_time' => '13:00:00',
                        'end_time' => '15:00:00',
                        'lab' => ['name' => 'Lab Komputer 2'],
                    ],
                ];

                $todaySchedules = collect($sampleSchedules);

                // Create sample notifications
                $sampleNotifications = [
                    [
                        'id' => 9995,
                        'title' => 'Reservasi Disetujui',
                        'is_read' => false,
                        'sent_at' => '5 menit yang lalu',
                    ],
                    [
                        'id' => 9994,
                        'title' => 'Perubahan Jadwal Lab',
                        'is_read' => false,
                        'sent_at' => '2 jam yang lalu',
                    ],
                ];

                $unreadNotifications = collect($sampleNotifications);

                // Update stats
                $stats = [
                    'totalReservations' => 5,
                    'pendingReservations' => 2,
                    'approvedReservations' => 3,
                    'rejectedReservations' => 0,
                ];
            }

            // For debugging
            \Illuminate\Support\Facades\Log::info('Student dashboard data', [
                'user_id' => $user->id,
                'reservations_count' => $upcomingReservations->count(),
                'schedules_count' => $todaySchedules->count(),
                'notifications_count' => $unreadNotifications->count(),
                'stats' => $stats
            ]);

            return Inertia::render('Student/Dashboard', [
                'upcomingReservations' => $upcomingReservations,
                'todaySchedules' => $todaySchedules,
                'unreadNotifications' => $unreadNotifications,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            // Log the error
            \Illuminate\Support\Facades\Log::error('Student dashboard error: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());

            // Return a simplified dashboard with empty data
            return Inertia::render('Student/Dashboard', [
                'upcomingReservations' => [],
                'todaySchedules' => [],
                'unreadNotifications' => [],
                'stats' => [
                    'totalReservations' => 0,
                    'pendingReservations' => 0,
                    'approvedReservations' => 0,
                    'rejectedReservations' => 0,
                ],
                'error' => 'There was an error loading your dashboard. Please try again later.'
            ]);
        }
    }
}
