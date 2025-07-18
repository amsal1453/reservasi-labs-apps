<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Jadwal Laboratorium</title>
    <style>
        body { font-family: sans-serif; margin: 20px; font-size: 12px; }
        h1, h2, h3 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        table, th, td { border: 1px solid black; }
        th { background-color: #f0f0f0; padding: 8px; text-align: center; font-weight: bold; }
        td { padding: 6px; text-align: center; }
        .day { background-color: #d0d0d0; font-weight: bold; text-align: center; padding: 5px; margin-top: 15px; }
    </style>
</head>
<body>
    <h1>JADWAL PENGGUNAAN LABORATORIUM KOMPUTER</h1>
    <h2>UNIVERSITAS UBUDIYAH INDONESIA</h2>
    <h3>RUANG: {{ $lab->name }}</h3>

    @foreach($schedulesByDay as $day => $daySchedules)
    <div class="day">{{ $dayTranslations[$day] }}</div>
    <table>
        <tr>
            <th>WAKTU</th>
            <th>MATA KULIAH</th>
            <th>DOSEN</th>
            <th>JENIS</th>
        </tr>
        @if(count($daySchedules) > 0)
            @foreach($daySchedules as $schedule)
            <tr>
                <td>{{ $schedule['start_time'] }} - {{ $schedule['end_time'] }}</td>
                <td>{{ $schedule['course_name'] }}</td>
                <td>{{ $schedule['lecturer_name'] }}</td>
                <td>KULIAH</td>
            </tr>
            @endforeach
        @else
            <tr>
                <td colspan="4" style="text-align: center;">Tidak ada jadwal</td>
            </tr>
        @endif
    </table>
    @endforeach
</body>
</html>
