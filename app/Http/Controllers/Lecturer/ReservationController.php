<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Reservation;
use App\Models\Lab;
use App\Models\User;
use App\Notifications\ReservationSubmittedNotification;
use App\Services\ReservationNotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ReservationController extends Controller
{
    /**
     * @var ReservationNotificationService
     */
    protected $notificationService;

    /**
     * Create a new controller instance.
     *
     * @param ReservationNotificationService $notificationService
     */
    public function __construct(ReservationNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    // Menampilkan semua reservasi dosen yang login
    public function index()
    {
        $reservations = Reservation::with('lab')
            ->where('user_id', Auth::id())
            ->where('status', '!=', 'cancelled')
            ->latest()
            ->get();

        return Inertia::render('Lecturer/Reservations/Index', [
            'reservations' => $reservations,
        ]);
    }

    // Form pengajuan reservasi
    public function create()
    {
        $labs = Lab::where('status', 'available')->get();

        return Inertia::render('Lecturer/Reservations/Create', [
            'labs' => $labs,
        ]);
    }

    // Simpan pengajuan reservasi
    public function store(Request $request)
    {
        $request->validate([
            'day'         => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'purpose'     => 'required|string|max:255',
            'lab_id'      => 'required|exists:labs,id',
        ]);

        // Cek bentrok dengan reservasi yang sudah disetujui
        $approvedConflict = Reservation::where('lab_id', $request->lab_id)
            ->where('day', $request->day)
            ->where('status', 'approved')
            ->where(function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('start_time', '<', $request->end_time)
                    ->where('end_time', '>', $request->start_time);
            });
            })
            ->exists();

        if ($approvedConflict) {
            return back()->withErrors([
                'conflict' => 'Slot waktu ini sudah terisi dengan reservasi yang disetujui di lab tersebut.',
            ])->withInput();
        }

        // Cek bentrok dengan reservasi yang masih pending
        $pendingConflict = Reservation::where('lab_id', $request->lab_id)
            ->where('day', $request->day)
            ->where('status', 'pending')
            ->where(function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('start_time', '<', $request->end_time)
                        ->where('end_time', '>', $request->start_time);
                });
            })
            ->first();

        if ($pendingConflict) {
            // Ambil nama dosen yang sudah reservasi
            $pendingUser = User::find($pendingConflict->user_id);
            $dosenName = $pendingUser ? $pendingUser->name : 'Dosen lain';

            return back()->withErrors([
                'pendingConflict' => "Perhatian: {$dosenName} sudah mengajukan reservasi untuk slot waktu ini (status: menunggu persetujuan). Anda tetap dapat melanjutkan, namun hanya satu reservasi yang akan disetujui.",
            ])->withInput()->with('showPendingWarning', true);
        }

        try {
            $reservation = Reservation::create([
                'user_id'    => Auth::id(),
                'day'        => $request->day,
                'date'       => $request->date,
                'start_time' => $request->start_time,
                'end_time'   => $request->end_time,
                'purpose'    => $request->purpose,
                'lab_id'     => $request->lab_id,
                'status'     => 'pending',
            ]);

            // Kirim notifikasi ke admin
            $admins = User::role('admin')->get();

            // Send in-app notifications
            foreach ($admins as $admin) {
                $admin->notify(new ReservationSubmittedNotification($reservation));
            }

            // Send email notifications to admins
            $this->notificationService->sendRequestNotificationsToAdmins($reservation);

            return redirect()->route('lecturer.reservations.index')
                ->with('success', 'Reservasi berhasil diajukan dan menunggu persetujuan.');
        } catch (\Exception $e) {
            Log::error('Error creating reservation', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat membuat reservasi. Silakan coba lagi nanti.'
            ])->withInput();
        }
    }

    // Tampilkan detail reservasi
    public function show(Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        return Inertia::render('Lecturer/Reservations/Show', [
            'reservation' => $reservation->load(['lab', 'user']),
        ]);
    }

    // Edit reservasi
    public function edit(Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        $labs = Lab::where('status', 'available')->get();

        return Inertia::render('Lecturer/Reservations/Edit', [
            'reservation' => $reservation->load(['lab', 'user']),
            'labs' => $labs,
        ]);
    }

    // Update reservasi
    public function update(Request $request, Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        $request->validate([
            'day'         => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'purpose'     => 'required|string|max:255',
            'lab_id'      => 'required|exists:labs,id',
        ]);

        // Cek bentrok di lab dengan reservasi yang disetujui (kecuali dengan reservasi ini sendiri)
        $approvedConflict = Reservation::where('lab_id', $request->lab_id)
            ->where('day', $request->day)
            ->where('id', '!=', $reservation->id)
            ->where('status', 'approved')
            ->where(function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('start_time', '<', $request->end_time)
                    ->where('end_time', '>', $request->start_time);
            });
            })
            ->exists();

        if ($approvedConflict) {
            return back()->withErrors([
                'conflict' => 'Slot waktu ini sudah terisi dengan reservasi yang disetujui di lab tersebut.',
            ])->withInput();
        }

        // Cek bentrok dengan reservasi yang masih pending
        $pendingConflict = Reservation::where('lab_id', $request->lab_id)
            ->where('day', $request->day)
            ->where('id', '!=', $reservation->id)
            ->where('status', 'pending')
            ->where(function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('start_time', '<', $request->end_time)
                        ->where('end_time', '>', $request->start_time);
                });
            })
            ->first();

        if ($pendingConflict) {
            // Ambil nama dosen yang sudah reservasi
            $pendingUser = User::find($pendingConflict->user_id);
            $dosenName = $pendingUser ? $pendingUser->name : 'Dosen lain';

            return back()->withErrors([
                'pendingConflict' => "Perhatian: {$dosenName} sudah mengajukan reservasi untuk slot waktu ini (status: menunggu persetujuan). Anda tetap dapat melanjutkan, namun hanya satu reservasi yang akan disetujui.",
            ])->withInput()->with('showPendingWarning', true);
        }

        try {
            $reservation->update([
                'day'        => $request->day,
                'date'       => $request->date,
                'start_time' => $request->start_time,
                'end_time'   => $request->end_time,
                'purpose'    => $request->purpose,
                'lab_id'     => $request->lab_id,
            ]);

            // Notify admins about the update
            $admins = User::role('admin')->get();

            // Send in-app notifications
            foreach ($admins as $admin) {
                $admin->notify(new ReservationSubmittedNotification($reservation));
            }

            // Send email notifications about the update
            $this->notificationService->sendRequestNotificationsToAdmins($reservation);

            return redirect()->route('lecturer.reservations.index')
                ->with('success', 'Reservasi berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating reservation', [
                'reservation_id' => $reservation->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat memperbarui reservasi.'
            ])->withInput();
        }
    }

    // Batalkan reservasi
    public function destroy(Reservation $reservation)
    {
        abort_if($reservation->user_id !== Auth::id(), 403);

        try {
            // Hapus reservasi secara permanen
            $reservation->delete();

            // Notify admins about the cancellation (optional, maybe change to "deleted")
            // For now, let's keep it simple and just delete.
            // You can add notifications if needed.

            return redirect()->route('lecturer.reservations.index')
                ->with('success', 'Reservasi berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting reservation', [
                'reservation_id' => $reservation->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menghapus reservasi.'
            ]);
        }
    }

    // Generate PDF for lecturer's reservations
    public function generatePdf()
    {
        try {
            // Get current lecturer's reservations
            $reservations = Reservation::with(['lab', 'user'])
                ->where('user_id', Auth::id())
                ->orderBy('date')
                ->orderBy('start_time')
                ->get();

            // Get lecturer name
            $lecturerName = Auth::user()->name;

            // Group reservations by status
            $reservationsByStatus = $reservations->groupBy('status');

            // Define status translations
            $statusTranslations = [
                'pending' => 'Menunggu Persetujuan',
                'approved' => 'Disetujui',
                'rejected' => 'Ditolak',
                'cancelled' => 'Dibatalkan'
            ];

            // Generate HTML
            $html = '<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Daftar Reservasi Laboratorium</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 15px;
                        font-size: 10px;
                        line-height: 1.2;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .header h1 {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 2px 0;
                    }
                    .header h2 {
                        font-size: 12px;
                        font-weight: bold;
                        margin: 2px 0;
                    }
                    .header h3 {
                        font-size: 11px;
                        font-weight: bold;
                        margin: 2px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                        font-size: 9px;
                    }
                    table, th, td {
                        border: 1px solid #000;
                    }
                    th {
                        background-color: #e0e0e0;
                        padding: 4px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 9px;
                    }
                    td {
                        padding: 3px;
                        text-align: left;
                        font-size: 8px;
                        vertical-align: middle;
                    }
                    .status-header {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        font-size: 11px;
                        padding: 6px;
                        margin-top: 15px;
                        margin-bottom: 5px;
                        border: 1px solid #000;
                    }
                    .footer {
                        margin-top: 15px;
                        font-size: 8px;
                        text-align: left;
                    }
                    .no-data {
                        text-align: center;
                        padding: 10px;
                        font-style: italic;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>DAFTAR RESERVASI LABORATORIUM</h1>
                    <h2>UNIVERSITAS UBUDIYAH INDONESIA</h2>
                    <h3>DOSEN: ' . strtoupper($lecturerName) . '</h3>
                    <p>Tanggal Cetak: ' . Carbon::now()->format('d-m-Y H:i') . '</p>
                </div>';

            // If no reservations found
            if ($reservations->isEmpty()) {
                $html .= '<div class="no-data">Tidak ada data reservasi yang tersedia.</div>';
            } else {
                // Loop through each status group
                foreach ($statusTranslations as $status => $statusLabel) {
                    if (isset($reservationsByStatus[$status]) && $reservationsByStatus[$status]->count() > 0) {
                        $html .= '<div class="status-header">' . $statusLabel . ' (' . $reservationsByStatus[$status]->count() . ')</div>';

                        $html .= '<table>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>Waktu</th>
                                <th>Lab</th>
                                <th>Tujuan</th>
                                <th>Status</th>
                            </tr>';

                        $counter = 1;
                        foreach ($reservationsByStatus[$status] as $reservation) {
                            // Format date to Indonesian format
                            $date = Carbon::parse($reservation->date)->format('d-m-Y');
                            $day = Carbon::parse($reservation->date)->locale('id')->isoFormat('dddd');

                            $html .= '<tr>
                                <td style="text-align: center;">' . $counter . '</td>
                                <td>' . $day . ', ' . $date . '</td>
                                <td>' . substr($reservation->start_time, 0, 5) . ' - ' . substr($reservation->end_time, 0, 5) . '</td>
                                <td>' . $reservation->lab->name . '</td>
                                <td>' . $reservation->purpose . '</td>
                                <td style="text-align: center;">' . $statusLabel . '</td>
                            </tr>';

                            $counter++;
                        }

                        $html .= '</table>';
                    }
                }
            }

            $html .= '
                <div class="footer">
                    <p>Catatan: Dokumen ini dicetak secara otomatis dari sistem Reservasi Lab FST-UUI</p>

                    <table style="width: 100%; border: none; margin-top: 50px;">
                        <tr style="border: none;">
                            <td style="width: 60%; border: none;"></td>
                            <td style="width: 40%; border: none; text-align: center;">
                                Banda Aceh, ' . Carbon::now()->format('d-m-Y') . '<br>
                                Mengetahui<br>
                                Kepala Laboratorium FST<br><br><br><br><br>
                                <b><u>MUCHSIN</u></b><br>
                                NIDN. 19283746502
                            </td>
                        </tr>
                    </table>
                </div>
            </body>
            </html>';

            // Configure DomPDF
            $options = new \Dompdf\Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isRemoteEnabled', true);

            $dompdf = new \Dompdf\Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('a4', 'landscape');
            $dompdf->render();

            // Download PDF
            return response($dompdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="Reservasi_Saya.pdf"');
        } catch (\Exception $e) {
            // Log error
            Log::error('Error generating reservation PDF: ' . $e->getMessage());
            return response('Tidak dapat mencetak daftar reservasi. Error: ' . $e->getMessage(), 500);
        }
    }
}
