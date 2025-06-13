<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;

class ReservationSubmittedNotification extends Notification implements ShouldBroadcast, ShouldQueue
{
    use Queueable;

    protected $reservation;

    /**
     * Create a new notification instance.
     */
    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Lab Reservation Request')
            ->line('A new lab reservation request has been submitted.')
            ->line('User: ' . $this->reservation->user->name)
            ->line('Lab: ' . $this->reservation->lab->name)
            ->line('Purpose: ' . $this->reservation->purpose)
            ->action('View Reservation', url(route('admin.reservations.show', $this->reservation->id)))
            ->line('Please review this reservation request.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'title' => 'New Reservation Request',
            'message' => 'New reservation request from ' . $this->reservation->user->name,
            'reservation_id' => $this->reservation->id,
            'user_name' => $this->reservation->user->name,
            'lab_name' => $this->reservation->lab->name,
            'purpose' => $this->reservation->purpose,
            'url' => route('admin.reservations.show', $this->reservation->id),
            'created_at' => now()->toISOString(),
            'read_at' => null,
            'type' => 'reservation_submitted'
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'title' => 'New Reservation Request',
            'message' => 'New reservation request from ' . $this->reservation->user->name,
            'reservation_id' => $this->reservation->id,
            'user_name' => $this->reservation->user->name,
            'lab_name' => $this->reservation->lab->name,
            'url' => route('admin.reservations.show', $this->reservation->id),
            'created_at' => now()->toISOString(),
            'read_at' => null,
            'type' => 'reservation_submitted'
        ]);
    }

    /**
     * Get the channels the notification should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('users.' . $this->reservation->user_id)];
    }
}
