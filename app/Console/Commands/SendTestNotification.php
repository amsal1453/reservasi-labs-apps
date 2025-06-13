<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\TestNotification;

class SendTestNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notification:test {userId : The ID of the user to send the notification to} {--role= : Filter users by role}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test notification to a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('userId');
        $role = $this->option('role');

        $query = User::query();

        if ($userId) {
            $query->where('id', $userId);
        }

        if ($role) {
            $query->where('role', $role);
        }

        $users = $query->get();

        if ($users->isEmpty()) {
            $this->error('No users found');
            return 1;
        }

        foreach ($users as $user) {
            $user->notify(new TestNotification([
                'title' => 'Test Notification',
                'message' => '<p>This is a test notification content. It can contain <strong>HTML</strong> formatting.</p><p>Second paragraph with more details about what this notification is for.</p>',
                'action' => [
                    'text' => 'View Details',
                    'url' => '/lecturer/dashboard',
                ],
            ]));
        }

        $this->info('Test notification sent to ' . $users->count() . ' users');

        return 0;
    }
}
