<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class TestReservationApprovedNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:reservation-approved {user_id? : The user ID to send to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test reservation approved notification';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get user ID from argument or prompt for it
        $userId = $this->argument('user_id') ?? $this->ask('Enter the user ID to send the notification to:');

        // Find the user
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return 1;
        }

        $this->info("Sending test notification to {$user->name} (ID: {$user->id})");

        // Create a test notification with proper structure
        $notificationData = [
            'title' => 'Reservation Approved',
            'message' => "Your reservation request has been approved by the administrator.\n\nReservation Details:\nLab: Computer Science Lab\nDate: " . now()->addDays(2)->format('Y-m-d') . "\nTime: 10:00 - 12:00\n\nYou can now use the lab at the scheduled time. Please bring your ID card and check in with the lab assistant.",
        ];

        // Send the notification
        $user->notify(new \App\Notifications\TestNotification($notificationData));

        $this->info('Test notification sent successfully!');

        return 0;
    }
}
