<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Lab;
use App\Models\Schedule;
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
}
