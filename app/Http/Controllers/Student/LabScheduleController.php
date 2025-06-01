<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lab;
use App\Models\Schedule;

class LabScheduleController extends Controller
{
    public function index(Request $request)
    {
        $labs = Lab::all();
        $selectedLab = $request->input('lab_id', $labs->first()?->id);

        $schedules = Schedule::with(['lab', 'reservation', 'lecturer', 'reservation.user'])
            ->where('lab_id', $selectedLab)
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Student/LabSchedules/Index', [
            'schedules' => $schedules,
            'labs' => $labs,
            'selectedLab' => $selectedLab,
        ]);
    }
}
