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

class ReservationStatusNotification extends Notification implements ShouldBroadcast, ShouldQueue
{
    use Queueable;

    protected $reservation;
    protected $status;
    protected $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Reservation $reservation, string $status, string $message = null)
    {
        $this->reservation = $reservation;
        $this->status = $status;
        $this->message = $message ?? $this->getDefaultMessage($status);
    }

    /**
     * Get default message based on status.
     */
    protected function getDefaultMessage(string $status): string
    {
        return match ($status) {
            'approved' => 'Your lab reservation has been approved.',
            'rejected' => 'Your lab reservation has been rejected.',
            'cancelled' => 'Your lab reservation has been cancelled.',
            default => 'Your lab reservation status has been updated.',
        };
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
        $mail = (new MailMessage)
            ->subject('Lab Reservation Status Update')
            ->line($this->message)
            ->line('Lab: ' . $this->reservation->lab->name)
            ->line('Date: ' . $this->reservation->date)
            ->line('Time: ' . substr($this->reservation->start_time, 0, 5) . ' - ' . substr($this->reservation->end_time, 0, 5))
            ->action('View Reservation', $this->getUrl($notifiable));

        if ($this->status === 'rejected') {
            $mail->line('If you have any questions, please contact the administrator.');
        }

        return $mail;
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
            'title' => 'Reservation ' . ucfirst($this->status),
            'message' => $this->message,
            'reservation_id' => $this->reservation->id,
            'lab_name' => $this->reservation->lab->name,
            'status' => $this->status,
            'url' => $this->getUrl($notifiable),
            'created_at' => now()->toISOString(),
            'read_at' => null,
            'type' => 'reservation_status'
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'title' => 'Reservation ' . ucfirst($this->status),
            'message' => $this->message,
            'reservation_id' => $this->reservation->id,
            'lab_name' => $this->reservation->lab->name,
            'status' => $this->status,
            'url' => $this->getUrl($notifiable),
            'created_at' => now()->toISOString(),
            'read_at' => null,
            'type' => 'reservation_status'
        ]);
    }

    /**
     * Get the URL based on user role.
     */
    protected function getUrl(object $notifiable): string
    {
        $role = $notifiable->roles->first()->name ?? 'student';

        return match ($role) {
            'admin' => route('admin.reservations.show', $this->reservation->id),
            'lecturer' => route('lecturer.reservations.show', $this->reservation->id),
            default => route('student.reservations.show', $this->reservation->id),
        };
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
