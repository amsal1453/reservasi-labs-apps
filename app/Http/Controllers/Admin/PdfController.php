<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Lab;
use App\Models\Schedule;
use App\Models\Reservation;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PdfController extends Controller
{
    // Generate PDF jadwal
    public function generateSchedulePdf($labId)
    {
        // Pastikan lab_id adalah nilai numerik
        $labId = intval($labId);

        // Debug: Log lab_id yang diterima
        \Illuminate\Support\Facades\Log::info('Generating PDF for Lab ID: ' . $labId);

        try {
            // Cek apakah lab dengan ID tersebut ada
            $lab = Lab::findOrFail($labId);

            // Ambil jadwal dari tabel Schedule - hanya jadwal kuliah (type = lecture)
            $schedules = Schedule::with(["lab", "lecturer"])
                ->where("lab_id", $labId)
                ->where("type", "lecture") // Hanya ambil jadwal kuliah
                ->orderBy("day")
                ->orderBy("start_time")
                ->get();

            // Definisikan semua hari dalam seminggu
            $days = [
                "Monday" => "SENIN",
                "Tuesday" => "SELASA",
                "Wednesday" => "RABU",
                "Thursday" => "KAMIS",
                "Friday" => "JUMAT",
                "Saturday" => "SABTU",
            ];

            // Buat struktur jadwal berdasarkan slot waktu
            // Kita akan menggunakan slot waktu yang umum
            $timeSlots = [
                '08:00-10:00',
                '10:00-12:00',
                '13:00-15:00',
                '15:00-17:00'
            ];

            // Buat array untuk menyimpan jadwal per slot waktu
            $scheduleMatrix = [];
            foreach ($timeSlots as $slot) {
                $scheduleMatrix[$slot] = [];
                foreach ($days as $dayEn => $dayId) {
                    $scheduleMatrix[$slot][$dayEn] = null;
                }
            }

            // Isi matrix dengan jadwal yang ada
            foreach ($schedules as $schedule) {
                $day = $schedule->day;
                $startTime = substr($schedule->start_time, 0, 5); // ambil HH:MM
                $endTime = substr($schedule->end_time, 0, 5);
                $timeRange = $startTime . '-' . $endTime;

                // Cari slot waktu yang sesuai
                foreach ($timeSlots as $slot) {
                    if ($timeRange === $slot || $this->isTimeInSlot($startTime, $endTime, $slot)) {
                        $scheduleMatrix[$slot][$day] = [
                            'course_name' => $schedule->course_name,
                            'lecturer_name' => $schedule->lecturer_name,
                            'start_time' => $startTime,
                            'end_time' => $endTime
                        ];
                        break;
                    }
                }
            }

            // Log data untuk debugging
            \Illuminate\Support\Facades\Log::info('Schedule Matrix: ' . json_encode($scheduleMatrix));

            // Generate HTML dengan format tabel seperti gambar
            $html = '<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Jadwal Laboratorium</title>
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
                        text-align: center;
                        font-size: 8px;
                        vertical-align: middle;
                        height: 40px;
                    }
                    .time-header {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        width: 12%;
                    }
                    .course-name {
                        font-weight: bold;
                        font-size: 8px;
                        margin-bottom: 2px;
                    }
                    .lecturer-name {
                        font-size: 7px;
                        font-style: italic;
                    }
                    .footer {
                        margin-top: 15px;
                        font-size: 8px;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>JADWAL PENGGUNAAN LABORATORIUM KOMPUTER</h1>
                    <h2>UNIVERSITAS UBUDIYAH INDONESIA</h2>
                    <h3>RUANG: ' . strtoupper($lab->name) . '</h3>
                </div>

                <table>
                    <tr>
                        <th class="time-header">WAKTU</th>
                        <th>SENIN</th>
                        <th>SELASA</th>
                        <th>RABU</th>
                        <th>KAMIS</th>
                        <th>JUMAT</th>
                        <th>SABTU</th>
                    </tr>';

            foreach ($timeSlots as $slot) {
                $html .= '<tr>';
                $html .= '<td class="time-header"><strong>' . $slot . '</strong></td>';

                foreach ($days as $dayEn => $dayId) {
                    $schedule = $scheduleMatrix[$slot][$dayEn] ?? null;

                    if ($schedule) {
                        $html .= '<td>';
                        $html .= '<div class="course-name">' . strtoupper($schedule['course_name']) . '</div>';
                        $html .= '<div class="lecturer-name">' . $schedule['lecturer_name'] . '</div>';
                        $html .= '</td>';
                    } else {
                        $html .= '<td></td>';
                    }
                }

                $html .= '</tr>';
            }

            $html .= '</table>

                <div class="footer">
                    Ket: Penggunaan Lab. Komputer di luar jadwal, agar menghubungi petugas
                </div>
            </body>
            </html>';

            // Log HTML yang dihasilkan untuk debugging
            \Illuminate\Support\Facades\Log::debug('Generated HTML: ' . substr($html, 0, 500) . '...');

            // Konfigurasi DomPDF
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
                ->header('Content-Disposition', 'attachment; filename="Jadwal_Lab_' . $lab->name . '.pdf"');
        } catch (\Exception $e) {
            // Log error
            \Illuminate\Support\Facades\Log::error('Error generating PDF: ' . $e->getMessage());
            return response('Tidak dapat mencetak jadwal. Error: ' . $e->getMessage(), 500);
        }
    }

    // Generate PDF for reservations
    public function generateReservationPdf($labId = null)
    {
        try {
            // Get reservations based on lab_id if provided, otherwise get all
            $query = Reservation::with(['lab', 'user'])
                ->orderBy('date')
                ->orderBy('start_time');

            if ($labId) {
                $labId = intval($labId);
                $query->where('lab_id', $labId);
                $lab = Lab::findOrFail($labId);
                $labName = $lab->name;
            } else {
                $labName = 'Semua Lab';
            }

            $reservations = $query->get();

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
                    <h3>LAB: ' . strtoupper($labName) . '</h3>
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
                                <th>Pemohon</th>
                                <th>Tujuan</th>
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
                                <td>' . $reservation->user->name . '</td>
                                <td>' . $reservation->purpose . '</td>
                            </tr>';

                            $counter++;
                        }

                        $html .= '</table>';
                    }
                }
            }

            $html .= '
                <div class="footer">
                    <p>Diketahui Kepala LAB FST

                    MUCHSIN</p>
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
            $filename = $labId ? "Reservasi_Lab_" . $labName . ".pdf" : "Reservasi_Semua_Lab.pdf";
            return response($dompdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
        } catch (\Exception $e) {
            // Log error
            \Illuminate\Support\Facades\Log::error('Error generating reservation PDF: ' . $e->getMessage());
            return response('Tidak dapat mencetak daftar reservasi. Error: ' . $e->getMessage(), 500);
        }
    }

    // Helper function untuk mengecek apakah waktu masuk dalam slot
    private function isTimeInSlot($startTime, $endTime, $slot)
    {
        list($slotStart, $slotEnd) = explode('-', $slot);

        // Konversi ke format yang bisa dibandingkan
        $startTimeNum = (int)str_replace(':', '', $startTime);
        $endTimeNum = (int)str_replace(':', '', $endTime);
        $slotStartNum = (int)str_replace(':', '', $slotStart);
        $slotEndNum = (int)str_replace(':', '', $slotEnd);

        // Cek apakah jadwal masuk dalam rentang slot waktu
        return ($startTimeNum >= $slotStartNum && $endTimeNum <= $slotEndNum) ||
            ($startTimeNum <= $slotStartNum && $endTimeNum >= $slotEndNum);
    }

    // Generate combined PDF with both schedules and reservations
    public function generateCombinedPdf($labId)
    {
        try {
            // Get lab information
            $labId = intval($labId);
            $lab = Lab::findOrFail($labId);

            // Debug log
            \Illuminate\Support\Facades\Log::info('Generating combined PDF for Lab ID: ' . $labId);

            // First part: Schedule data (similar to generateSchedulePdf)
            $schedules = Schedule::with(["lab", "lecturer"])
                ->where("lab_id", $labId)
                ->where("type", "lecture")
                ->orderBy("day")
                ->orderBy("start_time")
                ->get();

            \Illuminate\Support\Facades\Log::info('Found ' . $schedules->count() . ' schedules');

            // Second part: Reservation data (similar to generateReservationPdf)
            $reservations = Reservation::with(['lab', 'user'])
                ->where('lab_id', $labId)
                ->orderBy('date')
                ->orderBy('start_time')
                ->get();

            \Illuminate\Support\Facades\Log::info('Found ' . $reservations->count() . ' reservations');

            // Group reservations by status
            $reservationsByStatus = $reservations->groupBy('status');

            // Log reservation counts by status
            foreach ($reservationsByStatus as $status => $items) {
                \Illuminate\Support\Facades\Log::info('Status ' . $status . ': ' . $items->count() . ' reservations');
            }

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
                <title>Data Laboratorium ' . $lab->name . '</title>
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
                    .section-header {
                        font-size: 12px;
                        font-weight: bold;
                        margin-top: 20px;
                        margin-bottom: 10px;
                        padding: 5px;
                        background-color: #f0f0f0;
                        border: 1px solid #000;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                        font-size: 9px;
                        page-break-inside: avoid;
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
                        text-align: center;
                        font-size: 8px;
                        vertical-align: middle;
                        height: 30px;
                    }
                    .time-header {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        width: 12%;
                    }
                    .course-name {
                        font-weight: bold;
                        font-size: 8px;
                        margin-bottom: 2px;
                    }
                    .lecturer-name {
                        font-size: 7px;
                        font-style: italic;
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
                    .page-break {
                        page-break-before: always;
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
                    <h1>LAB: ' . strtoupper($lab->name) . '</h1>
                    <p>Tanggal Cetak: ' . Carbon::now()->format('d-m-Y H:i') . '</p>
                </div>';

            // PART 1: SCHEDULE SECTION
            $html .= '<div class="section-header" style="font-size: 14px; background-color: #ddd; padding: 8px;">JADWAL PENGGUNAAN LABORATORIUM</div>';

            // Define days and time slots (same as in generateSchedulePdf)
            $days = [
                "Monday" => "SENIN",
                "Tuesday" => "SELASA",
                "Wednesday" => "RABU",
                "Thursday" => "KAMIS",
                "Friday" => "JUMAT",
                "Saturday" => "SABTU",
            ];

            $timeSlots = [
                '08:00-10:00',
                '10:00-12:00',
                '13:00-15:00',
                '15:00-17:00'
            ];

            // Create schedule matrix
            $scheduleMatrix = [];
            foreach ($timeSlots as $slot) {
                $scheduleMatrix[$slot] = [];
                foreach ($days as $dayEn => $dayId) {
                    $scheduleMatrix[$slot][$dayEn] = null;
                }
            }

            // Fill matrix with schedules
            foreach ($schedules as $schedule) {
                $day = $schedule->day;
                $startTime = substr($schedule->start_time, 0, 5);
                $endTime = substr($schedule->end_time, 0, 5);
                $timeRange = $startTime . '-' . $endTime;

                foreach ($timeSlots as $slot) {
                    if ($timeRange === $slot || $this->isTimeInSlot($startTime, $endTime, $slot)) {
                        $scheduleMatrix[$slot][$day] = [
                            'course_name' => $schedule->course_name,
                            'lecturer_name' => $schedule->lecturer_name,
                            'start_time' => $startTime,
                            'end_time' => $endTime
                        ];
                        break;
                    }
                }
            }

            // Generate schedule table
            $html .= '<table>
                <tr>
                    <th class="time-header">WAKTU</th>
                    <th>SENIN</th>
                    <th>SELASA</th>
                    <th>RABU</th>
                    <th>KAMIS</th>
                    <th>JUMAT</th>
                    <th>SABTU</th>
                </tr>';

            foreach ($timeSlots as $slot) {
                $html .= '<tr>';
                $html .= '<td class="time-header"><strong>' . $slot . '</strong></td>';

                foreach ($days as $dayEn => $dayId) {
                    $schedule = $scheduleMatrix[$slot][$dayEn] ?? null;

                    if ($schedule) {
                        $html .= '<td>';
                        $html .= '<div class="course-name">' . strtoupper($schedule['course_name']) . '</div>';
                        $html .= '<div class="lecturer-name">' . $schedule['lecturer_name'] . '</div>';
                        $html .= '</td>';
                    } else {
                        $html .= '<td></td>';
                    }
                }

                $html .= '</tr>';
            }

            $html .= '</table>';

            // PART 2: RESERVATION SECTION - Start on a new page
            $html .= '<div class="page-break"></div>';
            $html .= '<div class="section-header" style="font-size: 14px; background-color: #ddd; padding: 8px;">DAFTAR RESERVASI LABORATORIUM</div>';

            // If no reservations found
            if ($reservations->isEmpty()) {
                $html .= '<div class="no-data">Tidak ada data reservasi yang tersedia.</div>';
            } else {
                // Get all reservations regardless of status
                $html .= '<table>
                    <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Waktu</th>
                        <th>Pemohon</th>
                        <th>Tujuan</th>
                        <th>Status</th>
                    </tr>';

                $counter = 1;
                foreach ($reservations as $reservation) {
                    // Format date to Indonesian format
                    $date = Carbon::parse($reservation->date)->format('d-m-Y');
                    $day = Carbon::parse($reservation->date)->locale('id')->isoFormat('dddd');

                    // Get status label
                    $statusLabel = $statusTranslations[$reservation->status] ?? $reservation->status;

                    $html .= '<tr>
                        <td style="text-align: center;">' . $counter . '</td>
                        <td>' . $day . ', ' . $date . '</td>
                        <td>' . substr($reservation->start_time, 0, 5) . ' - ' . substr($reservation->end_time, 0, 5) . '</td>
                        <td>' . $reservation->user->name . '</td>
                        <td style="text-align: left;">' . $reservation->purpose . '</td>
                        <td>' . $statusLabel . '</td>
                    </tr>';

                    $counter++;
                }

                $html .= '</table>';
            }

            $html .= '
                <div class="footer">
                    <p>Catatan: Dokumen ini dicetak secara otomatis dari sistem Reservasi Lab FST-UUI</p>
                </div>
            </body>
            </html>';

            // Configure DomPDF
            $options = new \Dompdf\Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isRemoteEnabled', true);
            $options->set('defaultFont', 'Arial');

            $dompdf = new \Dompdf\Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('a4', 'landscape');
            $dompdf->render();

            // Download PDF
            return response($dompdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="Lab_' . $lab->name . '_Data.pdf"');
        } catch (\Exception $e) {
            // Log error
            \Illuminate\Support\Facades\Log::error('Error generating combined PDF: ' . $e->getMessage());
            return response('Tidak dapat mencetak data lab. Error: ' . $e->getMessage(), 500);
        }
    }
}
