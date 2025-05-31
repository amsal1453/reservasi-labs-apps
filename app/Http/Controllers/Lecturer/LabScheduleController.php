<?php

namespace App\Http\Controllers\Lecturer;

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

        $selectedLab = $request->input('lab_id', $labs->first()?->id); // default: lab pertama

        $schedules = Schedule::with(['lab', 'reservation', 'lecturer'])
            ->where('lab_id', $selectedLab)
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Lecturer/LabSchedules/Index', [
            'schedules' => $schedules,
            'labs' => $labs,
            'selectedLab' => $selectedLab,
        ]);
    }
}
