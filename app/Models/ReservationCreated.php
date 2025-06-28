<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationCreated extends Notification implements ShouldQueue
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
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Lab Reservation Request')
            ->line('A new lab reservation request has been submitted.')
            ->line('Purpose: ' . $this->reservation->purpose)
            ->line('Lab: ' . $this->reservation->lab->name)
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
            'reservation_id' => $this->reservation->id,
            'user_name' => $this->reservation->user->name,
            'lab_name' => $this->reservation->lab->name,
            'purpose' => $this->reservation->purpose,
            'message' => 'A new lab reservation request has been submitted',
            'type' => 'reservation_created'
        ];
    }
}
