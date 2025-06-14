<?php

namespace App\Services;

use App\Jobs\SendReservationEmail;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ReservationNotificationService
{
    /**
     * Send reservation request notifications to all admins
     *
     * @param Reservation $reservation
     * @return void
     */
    public function sendRequestNotificationsToAdmins(Reservation $reservation): void
    {
        try {
            $admins = User::role('admin')->get();

            foreach ($admins as $admin) {
                $this->sendReservationRequestEmail($reservation, $admin->email);
            }

            Log::info('Admin notification emails have been queued', [
                'reservation_id' => $reservation->id,
                'admin_count' => $admins->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error queuing admin notification emails', [
                'reservation_id' => $reservation->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send a status update notification to the reservation owner
     *
     * @param Reservation $reservation
     * @param string $status
     * @param string|null $message
     * @return void
     */
    public function sendStatusNotificationToUser(Reservation $reservation, string $status, ?string $message = null): void
    {
        try {
            $user = $reservation->user;
            $this->sendReservationStatusEmail($reservation, $user->email, $status, $message);

            Log::info('Status update email has been queued', [
                'reservation_id' => $reservation->id,
                'user_id' => $user->id,
                'status' => $status
            ]);
        } catch (\Exception $e) {
            Log::error('Error queuing status update email', [
                'reservation_id' => $reservation->id,
                'status' => $status,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send a reservation request email
     *
     * @param Reservation $reservation
     * @param string $email
     * @return void
     */
    private function sendReservationRequestEmail(Reservation $reservation, string $email): void
    {
        SendReservationEmail::dispatch($reservation, $email, 'request');
    }

    /**
     * Send a reservation status email
     *
     * @param Reservation $reservation
     * @param string $email
     * @param string $status
     * @param string|null $message
     * @return void
     */
    private function sendReservationStatusEmail(Reservation $reservation, string $email, string $status, ?string $message = null): void
    {
        SendReservationEmail::dispatch($reservation, $email, 'status', $status, $message);
    }
}
