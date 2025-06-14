<?php

namespace App\Jobs;

use App\Mail\ReservationRequestNotification;
use App\Mail\ReservationStatusNotification;
use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendReservationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 60;

    /**
     * The reservation instance.
     *
     * @var \App\Models\Reservation
     */
    protected $reservation;

    /**
     * The email type (request or status).
     *
     * @var string
     */
    protected $type;

    /**
     * The recipient email.
     *
     * @var string
     */
    protected $email;

    /**
     * Optional status for status notifications.
     *
     * @var string|null
     */
    protected $status;

    /**
     * Optional custom message.
     *
     * @var string|null
     */
    protected $message;

    /**
     * Create a new job instance.
     *
     * @param \App\Models\Reservation $reservation
     * @param string $email
     * @param string $type
     * @param string|null $status
     * @param string|null $message
     */
    public function __construct(Reservation $reservation, string $email, string $type = 'request', ?string $status = null, ?string $message = null)
    {
        $this->reservation = $reservation;
        $this->email = $email;
        $this->type = $type;
        $this->status = $status;
        $this->message = $message;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            if ($this->type === 'request') {
                Mail::to($this->email)->send(new ReservationRequestNotification($this->reservation));
                Log::info('Reservation request email sent', [
                    'reservation_id' => $this->reservation->id,
                    'recipient' => $this->email
                ]);
            } else {
                Mail::to($this->email)->send(new ReservationStatusNotification(
                    $this->reservation,
                    $this->status ?? 'updated',
                    $this->message
                ));
                Log::info('Reservation status email sent', [
                    'reservation_id' => $this->reservation->id,
                    'status' => $this->status,
                    'recipient' => $this->email
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send reservation email', [
                'reservation_id' => $this->reservation->id,
                'type' => $this->type,
                'email' => $this->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw the exception to trigger retries
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('Reservation email job failed after retries', [
            'reservation_id' => $this->reservation->id,
            'type' => $this->type,
            'email' => $this->email,
            'error' => $exception->getMessage()
        ]);
    }
}
