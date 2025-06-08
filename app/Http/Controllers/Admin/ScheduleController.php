<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use App\Models\Lab;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ScheduleController extends Controller
{
    // Tampilkan semua jadwal (kuliah dan reservasi disetujui)
    public function index(Request $request)
    {
        $labs = Lab::all();

        $selectedLab = $request->input('lab_id', $labs->first()?->id); // default: lab pertama

        // Ambil jadwal dari tabel Schedule
        $schedules = Schedule::with(['lab', 'reservation', 'lecturer'])
            ->where('lab_id', $selectedLab)
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        // Ambil reservasi yang disetujui tapi belum ada di jadwal
        $approvedReservations = \App\Models\Reservation::with(['lab', 'user'])
            ->where('status', 'approved')
            ->where('lab_id', $selectedLab)
            ->whereDoesntHave('schedule')
            ->get();

        // Konversi reservasi menjadi format jadwal
        $reservationSchedules = $approvedReservations->map(function ($reservation) {
            // Tentukan hari dari tanggal
            $date = \Carbon\Carbon::parse($reservation->date);
            $day = $date->format('l'); // Monday, Tuesday, etc.

            return [
                'id' => $reservation->id,
                'day' => $day,
                'schedule_date' => $reservation->date,
                'start_time' => $reservation->start_time,
                'end_time' => $reservation->end_time,
                'lab_id' => $reservation->lab_id,
                'lab' => $reservation->lab,
                'lecturer_id' => null,
                'lecturer' => null,
                'reservation_id' => $reservation->id,
                'reservation' => $reservation,
                'type' => 'reservation',
                'subject' => $reservation->purpose,
            ];
        });

        // Gabungkan jadwal reguler dengan reservasi
        $allSchedules = $schedules->concat($reservationSchedules);

        return Inertia::render('Admin/Schedules/Index', [
            'schedules' => $allSchedules,
            'selectedLab' => $selectedLab,
            'message' => session('message'),
            'import_errors' => session('import_errors'),
        ]);
    }

    // Form tambah jadwal kuliah
    public function create()
    {
        $labs = Lab::select('id', 'name')->get();

        return Inertia::render('Admin/Schedules/Create', [
            'labs' => $labs
        ]);
    }

    // Simpan jadwal kuliah baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'schedule_date' => 'sometimes|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'course_name' => 'required|string|max:255',
            'lecturer_name' => 'required|string|max:255',
            'lab_id' => 'required|exists:labs,id',
            'repeat_weeks' => 'sometimes|integer|min:1|max:16'
        ]);

        // Default to 1 week if not specified
        $repeat_weeks = $request->input('repeat_weeks', 1);

        // Generate a group ID for related schedules
        $group_id = null;
        if ($repeat_weeks > 1) {
            $group_id = (string) Str::uuid();
        }

        // Tentukan tanggal pertama jadwal
        $firstDate = null;

        // Jika ada schedule_date yang dikirim, gunakan itu sebagai tanggal pertama
        if ($request->filled('schedule_date')) {
            $firstDate = \Carbon\Carbon::parse($request->schedule_date);
        }
        // Jika tidak ada schedule_date, hitung berdasarkan hari
        else {
            // Map day name to day number (0 = Sunday, 1 = Monday, etc.)
            $dayMap = [
                'Sunday' => 0,
                'Monday' => 1,
                'Tuesday' => 2,
                'Wednesday' => 3,
                'Thursday' => 4,
                'Friday' => 5,
                'Saturday' => 6,
            ];

            $dayNumber = $dayMap[$request->day];
            $today = now();

            // Mendapatkan tanggal hari ini
            $currentDayOfWeek = $today->dayOfWeek; // 0 = Sunday, 1 = Monday, etc.

            // Menghitung berapa hari ke depan untuk mencapai hari yang dipilih
            $daysUntilScheduleDay = ($dayNumber - $currentDayOfWeek + 7) % 7;

            // Jika hasilnya 0 (hari yang sama), tetap tambahkan 7 hari ke depan
            if ($daysUntilScheduleDay === 0) {
                $daysUntilScheduleDay = 7;
            }

            // Mendapatkan tanggal pertama jadwal
            $firstDate = $today->copy()->addDays($daysUntilScheduleDay);
        }

        // Cek jadwal bentrok untuk semua minggu
        for ($week = 0; $week < $repeat_weeks; $week++) {
            // Menghitung tanggal aktual untuk minggu ini
            $scheduleDate = $firstDate->copy()->addWeeks($week)->toDateString();

            $conflict = Schedule::where(function($query) use ($request, $scheduleDate) {
                // Cek berdasarkan tanggal jadwal + jam yang sama
                $query->where('schedule_date', $scheduleDate)
                      ->where('lab_id', $request->lab_id)
                      ->where(function ($q) use ($request) {
                          $q->where('start_time', '<', $request->end_time)
                            ->where('end_time', '>', $request->start_time);
                      });
            })->exists();

            if ($conflict) {
                return back()->withErrors([
                    'conflict' => "Jadwal bentrok pada tanggal " . date('d-m-Y', strtotime($scheduleDate))
                ]);
            }
        }

        // Membuat jadwal untuk setiap minggu
        $schedules = [];
        for ($week = 0; $week < $repeat_weeks; $week++) {
            // Menghitung tanggal jadwal untuk minggu ini
            $scheduleDate = $firstDate->copy()->addWeeks($week);
            $dateString = $scheduleDate->toDateString(); // Format: Y-m-d

            // Membuat jadwal di database
            $schedules[] = Schedule::create([
                'day' => $validated['day'],
                'schedule_date' => $dateString,
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'course_name' => $validated['course_name'],
                'lecturer_name' => $validated['lecturer_name'],
                'lab_id' => $validated['lab_id'],
                'type' => 'lecture',
                'repeat_weeks' => $repeat_weeks,
                'group_id' => $group_id
            ]);
        }

        return Redirect::route('admin.schedules.index')
            ->with('message', $repeat_weeks > 1
                ? "Jadwal berhasil ditambahkan untuk {$repeat_weeks} minggu"
                : 'Jadwal berhasil ditambahkan');
    }

    // Edit jadwal
    public function edit(Schedule $schedule)
    {
        $labs = Lab::select('id', 'name')->get();
        return Inertia::render('Admin/Schedules/Edit', [
            'schedule' => [
                'id' => $schedule->id,
                'day' => $schedule->day,
                'schedule_date' => $schedule->schedule_date,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'course_name' => $schedule->course_name,
                'lecturer_name' => $schedule->lecturer_name,
                'lab_id' => $schedule->lab_id,
                'repeat_weeks' => $schedule->repeat_weeks,
                'group_id' => $schedule->group_id,
            ],
            'labs' => $labs
        ]);
    }

    // Update jadwal
    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'course_name' => 'required|string|max:255',
            'lecturer_name' => 'required|string|max:255',
            'lab_id' => 'required|exists:labs,id',
        ]);

        // Cek jadwal bentrok (kecuali dengan jadwal ini sendiri)
        $conflict = Schedule::where('schedule_date', $schedule->schedule_date)
            ->where('lab_id', $request->lab_id)
            ->where('id', '!=', $schedule->id)
            ->where(function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('start_time', '<', $request->end_time)
                    ->where('end_time', '>', $request->start_time);
            });
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'conflict' => 'Jadwal bentrok dengan jadwal yang sudah ada di lab tersebut pada tanggal yang sama.'
            ]);
        }

        $schedule->update($validated);

        // If this schedule is part of a group, update all related schedules with the same group_id
        if ($schedule->group_id && $schedule->repeat_weeks > 1) {
            Schedule::where('group_id', $schedule->group_id)
                ->where('id', '!=', $schedule->id)
                ->update([
                    'day' => $validated['day'],
                    'start_time' => $validated['start_time'],
                    'end_time' => $validated['end_time'],
                    'course_name' => $validated['course_name'],
                    'lecturer_name' => $validated['lecturer_name'],
                    'lab_id' => $validated['lab_id'],
                ]);

            $message = 'Semua jadwal dalam seri berhasil diperbarui';
        } else {
            $message = 'Jadwal berhasil diperbarui';
        }

        return Redirect::route('admin.schedules.index')
            ->with('message', $message);
    }

    // Hapus jadwal
    public function destroy(Schedule $schedule)
    {
        // Check if this is part of a group
        if ($schedule->group_id && $schedule->repeat_weeks > 1) {
            // Ask if user wants to delete all schedules in this group
            $deleteAll = request('delete_all', false);

            if ($deleteAll) {
                // Delete all schedules with the same group_id
                Schedule::where('group_id', $schedule->group_id)->delete();
                $message = 'Semua jadwal dalam seri berhasil dihapus';
            } else {
                // Delete only this schedule
                $schedule->delete();
                $message = 'Jadwal berhasil dihapus';
            }
        } else {
            // Not part of a group, delete just this schedule
            $schedule->delete();
            $message = 'Jadwal berhasil dihapus';
        }

        return Redirect::route('admin.schedules.index')
            ->with('message', $message);
    }

    // Import jadwal dari Excel
    public function import(Request $request)
    {
        $request->validate([
            'import_file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        $file = $request->file('import_file');
        $spreadsheet = IOFactory::load($file->getPathname());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        // Hapus baris header dan instruksi
        if (count($rows) > 0) array_shift($rows); // Header
        if (count($rows) > 0) array_shift($rows); // Instruksi

        $successCount = 0;
        $errorMessages = [];

        // Get valid lab IDs
        $validLabIds = Lab::pluck('id')->toArray();

        // Valid days
        $validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        foreach ($rows as $index => $row) {
            // Skip if empty row
            if (empty(array_filter($row))) {
                continue;
            }

            $rowNum = $index + 3; // +3 because we removed header and instruction rows

            // Prepare data with basic cleanup
            $day = trim($row[0] ?? '');
            $scheduleDate = trim($row[1] ?? '');
            $startTime = trim($row[2] ?? '');
            $endTime = trim($row[3] ?? '');
            $courseName = trim($row[4] ?? '');
            $lecturerName = trim($row[5] ?? '');
            $labId = isset($row[6]) ? intval($row[6]) : null;
            $repeatWeeks = isset($row[7]) ? intval($row[7]) : 1;

            // Custom validation
            $rowErrors = [];

            // Validate day
            if (!in_array($day, $validDays)) {
                $rowErrors[] = "Hari tidak valid. Gunakan: " . implode(', ', $validDays);
            }

            // Validate date
            if (!empty($scheduleDate)) {
                try {
                    $date = \Carbon\Carbon::createFromFormat('Y-m-d', $scheduleDate);
                    if (!$date || $date->format('Y-m-d') !== $scheduleDate) {
                        $rowErrors[] = "Format tanggal harus YYYY-MM-DD (contoh: 2023-10-15)";
                    }
                } catch (\Exception $e) {
                    $rowErrors[] = "Format tanggal harus YYYY-MM-DD (contoh: 2023-10-15)";
                }
            } else {
                $rowErrors[] = "Tanggal tidak boleh kosong";
            }

            // Validate start time
            if (empty($startTime) || !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $startTime)) {
                $rowErrors[] = "Format waktu mulai harus HH:MM (contoh: 08:00)";
            }

            // Validate end time
            if (empty($endTime) || !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $endTime)) {
                $rowErrors[] = "Format waktu selesai harus HH:MM (contoh: 09:30)";
            }

            // Validate end time > start time
            if (
                !empty($startTime) && !empty($endTime) &&
                preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $startTime) &&
                preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $endTime)
            ) {

                if ($startTime >= $endTime) {
                    $rowErrors[] = "Waktu selesai harus lebih besar dari waktu mulai";
                }
            }

            // Validate course name
            if (empty($courseName)) {
                $rowErrors[] = "Nama mata kuliah tidak boleh kosong";
            }

            // Validate lecturer name
            if (empty($lecturerName)) {
                $rowErrors[] = "Nama dosen tidak boleh kosong";
            }

            // Validate lab ID
            if (!in_array($labId, $validLabIds)) {
                $rowErrors[] = "Lab ID tidak valid. Gunakan ID yang tersedia pada daftar lab";
            }

            // Validate repeat weeks
            if ($repeatWeeks < 1 || $repeatWeeks > 16) {
                $rowErrors[] = "Jumlah minggu berulang harus antara 1-16";
            }

            // If there are validation errors, add them to the error messages and skip this row
            if (!empty($rowErrors)) {
                $errorMessages[] = "Baris {$rowNum}: " . implode(", ", $rowErrors);
                continue;
            }

            // Prepare data for database
            $data = [
                'day' => $day,
                'schedule_date' => $scheduleDate,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'course_name' => $courseName,
                'lecturer_name' => $lecturerName,
                'lab_id' => $labId,
                'repeat_weeks' => $repeatWeeks
            ];

            // Generate a group ID for related schedules
            $group_id = null;
            if ($repeatWeeks > 1) {
                $group_id = (string) Str::uuid();
            }

            // Set first date
            $firstDate = \Carbon\Carbon::parse($scheduleDate);

            // Cek jadwal bentrok untuk semua minggu
            $hasConflict = false;

            for ($week = 0; $week < $repeatWeeks; $week++) {
                // Menghitung tanggal aktual untuk minggu ini
                $scheduleDate = $firstDate->copy()->addWeeks($week)->toDateString();

                $conflict = Schedule::where(function ($query) use ($data, $scheduleDate) {
                    // Cek berdasarkan tanggal jadwal + jam yang sama
                    $query->where('schedule_date', $scheduleDate)
                        ->where('lab_id', $data['lab_id'])
                        ->where(function ($q) use ($data) {
                            $q->where('start_time', '<', $data['end_time'])
                            ->where('end_time', '>', $data['start_time']);
                        });
                })->exists();

                if ($conflict) {
                    $hasConflict = true;
                    $errorMessages[] = "Baris {$rowNum}: Jadwal bentrok pada tanggal " . date('d-m-Y', strtotime($scheduleDate));
                    break;
                }
            }

            // Jika ada konflik, lewati jadwal ini
            if ($hasConflict) {
                continue;
            }

            // Membuat jadwal untuk setiap minggu
            for ($week = 0; $week < $repeatWeeks; $week++) {
                // Menghitung tanggal jadwal untuk minggu ini
                $scheduleDate = $firstDate->copy()->addWeeks($week);
                $dateString = $scheduleDate->toDateString(); // Format: Y-m-d

                // Membuat jadwal di database
                Schedule::create([
                    'day' => $data['day'],
                    'schedule_date' => $dateString,
                    'start_time' => $data['start_time'],
                    'end_time' => $data['end_time'],
                    'course_name' => $data['course_name'],
                    'lecturer_name' => $data['lecturer_name'],
                    'lab_id' => $data['lab_id'],
                    'type' => 'lecture',
                    'repeat_weeks' => $repeatWeeks,
                    'group_id' => $group_id
                ]);

                $successCount++;
            }
        }

        if (count($errorMessages) > 0) {
            return redirect()->route('admin.schedules.index')
                ->with('message', "Berhasil mengimpor {$successCount} jadwal")
                ->with('import_errors', $errorMessages);
        }

        return redirect()->route('admin.schedules.index')
            ->with('message', "Berhasil mengimpor {$successCount} jadwal");
    }

    // Download template Excel untuk import jadwal
    // Download template Excel untuk import jadwal (IMPROVED VERSION)
    public function downloadTemplate()
    {
        // Create new spreadsheet
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set sheet title
        $sheet->setTitle('Template Import Jadwal');

        // Set headers with better descriptions
        $headers = [
            'Hari',
            'Tanggal',
            'Waktu Mulai',
            'Waktu Selesai',
            'Nama Mata Kuliah',
            'Nama Dosen',
            'Lab ID',
            'Jumlah Minggu'
        ];

        // Apply headers with styling
        for ($i = 0; $i < count($headers); $i++) {
            $column = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
            $sheet->setCellValue($column . '1', $headers[$i]);

            // Style headers
            $sheet->getStyle($column . '1')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4472C4']
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER
                ]
            ]);

            // Set column width
            $sheet->getColumnDimension($column)->setWidth(20);
        }

        // Get current date for realistic examples
        $today = now();
        $nextMonday = $today->copy()->next('Monday');

        // Get valid lab data
        $labs = Lab::select('id', 'name')->get();
        $firstLabId = $labs->first()->id ?? 1;
        $secondLabId = $labs->count() > 1 ? $labs->skip(1)->first()->id : $firstLabId;

        // Add realistic sample data with correct format
        $sampleData = [
            [
                'Monday',
                $nextMonday->format('Y-m-d'),
                '08:00',
                '09:30',
                'Pemrograman Web',
                'Dr. John Doe',
                $firstLabId,
                1
            ],
            [
                'Tuesday',
                $nextMonday->copy()->addDay()->format('Y-m-d'),
                '10:00',
                '11:30',
                'Algoritma dan Struktur Data',
                'Dr. Jane Smith',
                $secondLabId,
                1
            ],
            [
                'Wednesday',
                $nextMonday->copy()->addDays(2)->format('Y-m-d'),
                '13:00',
                '14:30',
                'Basis Data',
                'Prof. Robert Johnson',
                $firstLabId,
                2
            ],
            [
                'Thursday',
                $nextMonday->copy()->addDays(3)->format('Y-m-d'),
                '15:00',
                '16:30',
                'Jaringan Komputer',
                'Dr. Michael Brown',
                $secondLabId,
                1
            ]
        ];

        // Add sample data with styling
        $row = 2;
        foreach ($sampleData as $dataIndex => $data) {
            for ($i = 0; $i < count($data); $i++) {
                $column = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
                $sheet->setCellValue($column . $row, $data[$i]);

                // Apply alternating row colors for better readability
                $fillColor = $dataIndex % 2 == 0 ? 'F2F2F2' : 'FFFFFF';
                $sheet->getStyle($column . $row)->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setRGB($fillColor);
            }
            $row++;
        }

        // Add data validation for Day column (A:A)
        $dayValidation = $sheet->getCell('A2')->getDataValidation();
        $dayValidation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
        $dayValidation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_STOP);
        $dayValidation->setAllowBlank(false);
        $dayValidation->setShowInputMessage(true);
        $dayValidation->setShowErrorMessage(true);
        $dayValidation->setShowDropDown(true);
        $dayValidation->setErrorTitle('Input Error');
        $dayValidation->setError('Pilih hari yang valid dari dropdown');
        $dayValidation->setPromptTitle('Pilih Hari');
        $dayValidation->setPrompt('Pilih salah satu hari dari dropdown');
        $dayValidation->setFormula1('"Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"');

        // Apply validation to range A2:A1000
        for ($i = 2; $i <= 1000; $i++) {
            $validation = $sheet->getCell('A' . $i)->getDataValidation();
            $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
            $validation->setFormula1('"Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"');
            $validation->setShowDropDown(true);
        }

        // Set date format for column B (Date column)
        $sheet->getStyle('B:B')->getNumberFormat()->setFormatCode('yyyy-mm-dd');

        // Set time format for columns C and D (Time columns)
        $sheet->getStyle('C:C')->getNumberFormat()->setFormatCode('hh:mm');
        $sheet->getStyle('D:D')->getNumberFormat()->setFormatCode('hh:mm');

        // Add instructions section
        $instructionRow = $row + 2;

        // Instructions title
        $sheet->setCellValue('A' . $instructionRow, 'PETUNJUK PENGISIAN:');
        $sheet->getStyle('A' . $instructionRow)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 14,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E74C3C']
            ]
        ]);
        $sheet->mergeCells('A' . $instructionRow . ':H' . $instructionRow);

        // Add detailed instructions
        $instructions = [
            '1. HARI: Pilih dari dropdown (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)',
            '2. TANGGAL: Format YYYY-MM-DD (contoh: 2024-06-15). Jangan gunakan format DD/MM/YYYY!',
            '3. WAKTU MULAI: Format HH:MM dalam 24 jam (contoh: 08:00, 14:30). Jangan gunakan format 12 jam!',
            '4. WAKTU SELESAI: Format HH:MM, harus lebih besar dari waktu mulai',
            '5. NAMA MATA KULIAH: Tulis nama lengkap mata kuliah',
            '6. NAMA DOSEN: Tulis nama lengkap dosen pengampu',
            '7. LAB ID: Gunakan ID lab yang valid (lihat daftar di bawah)',
            '8. JUMLAH MINGGU: Angka 1-16 untuk jadwal berulang'
        ];

        $instructionRow++;
        foreach ($instructions as $instruction) {
            $sheet->setCellValue('A' . $instructionRow, $instruction);
            $sheet->getStyle('A' . $instructionRow)->applyFromArray([
                'font' => ['bold' => false],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'FFF2CC']
                ]
            ]);
            $sheet->mergeCells('A' . $instructionRow . ':H' . $instructionRow);
            $instructionRow++;
        }

        // Add labs reference section
        $labRow = $instructionRow + 2;

        // Labs title
        $sheet->setCellValue('A' . $labRow, 'DAFTAR LAB YANG TERSEDIA:');
        $sheet->getStyle('A' . $labRow)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2ECC71']
            ]
        ]);
        $sheet->mergeCells('A' . $labRow . ':H' . $labRow);

        // Labs header
        $labRow++;
        $sheet->setCellValue('A' . $labRow, 'ID');
        $sheet->setCellValue('B' . $labRow, 'Nama Lab');
        $sheet->getStyle('A' . $labRow . ':B' . $labRow)->applyFromArray([
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'D5DBDB']
            ]
        ]);

        // Add lab data
        foreach ($labs as $lab) {
            $labRow++;
            $sheet->setCellValue('A' . $labRow, $lab->id);
            $sheet->setCellValue('B' . $labRow, $lab->name);

            // Alternate colors for lab list
            $fillColor = ($labRow % 2 == 0) ? 'F8F9FA' : 'FFFFFF';
            $sheet->getStyle('A' . $labRow . ':B' . $labRow)->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setRGB($fillColor);
        }

        // Add important notes
        $noteRow = $labRow + 3;
        $sheet->setCellValue('A' . $noteRow, '⚠️ PENTING - KESALAHAN YANG SERING TERJADI:');
        $sheet->getStyle('A' . $noteRow)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E67E22']
            ]
        ]);
        $sheet->mergeCells('A' . $noteRow . ':H' . $noteRow);

        $commonErrors = [
            '❌ SALAH: Menggunakan "Senin" → ✅ BENAR: Gunakan "Monday"',
            '❌ SALAH: Format tanggal "15/10/2023" → ✅ BENAR: Gunakan "2023-10-15"',
            '❌ SALAH: Format waktu "8:00" atau "2:30 PM" → ✅ BENAR: Gunakan "08:00" atau "14:30"',
            '❌ SALAH: Lab ID yang tidak ada → ✅ BENAR: Gunakan ID dari daftar di atas',
            '❌ SALAH: Waktu selesai sama/lebih kecil dari waktu mulai → ✅ BENAR: Waktu selesai > waktu mulai'
        ];

        $noteRow++;
        foreach ($commonErrors as $error) {
            $sheet->setCellValue('A' . $noteRow, $error);
            $sheet->getStyle('A' . $noteRow)->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setRGB('FADBD8');
            $sheet->mergeCells('A' . $noteRow . ':H' . $noteRow);
            $noteRow++;
        }

        // Freeze the header row
        $sheet->freezePane('A2');

        // Set row height for better readability
        $sheet->getDefaultRowDimension()->setRowHeight(20);
        $sheet->getRowDimension('1')->setRowHeight(30);

        // Create writer
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);

        // Set headers for download
        $filename = 'Template_Import_Jadwal_' . date('Y-m-d_H-i-s') . '.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        header('Cache-Control: max-age=1');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
        header('Cache-Control: cache, must-revalidate');
        header('Pragma: public');

        // Save file to output
        $writer->save('php://output');
        exit;
    }
}
