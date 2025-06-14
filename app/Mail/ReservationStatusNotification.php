<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class ReservationStatusNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Reservation $reservation,
        public string $status,
        public ?string $message = null
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match ($this->status) {
            'approved' => 'Your Lab Reservation Has Been Approved',
            'rejected' => 'Your Lab Reservation Has Been Rejected',
            default => 'Lab Reservation Status Update',
        };

        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-status',
            with: [
                'reservation' => $this->reservation,
                'status' => $this->status,
                'message' => $this->message ?? $this->getDefaultMessage(),
            ],
        );
    }

    /**
     * Get default message based on status.
     */
    protected function getDefaultMessage(): string
    {
        return match ($this->status) {
            'approved' => 'Your lab reservation has been approved.',
            'rejected' => 'Your lab reservation has been rejected.',
            'cancelled' => 'Your lab reservation has been cancelled.',
            default => 'Your lab reservation status has been updated.',
        };
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
