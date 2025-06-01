<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class LabController extends Controller
{
    /**
     * Display a listing of the labs.
     */
    public function index()
    {
        $labs = Lab::withCount(['schedules', 'reservations'])
            ->orderBy('name')
            ->get()
            ->map(function ($lab) {
                return [
                    'id' => $lab->id,
                    'name' => $lab->name,
                    'capacity' => $lab->capacity,
                    'status' => $lab->status,
                    'schedules_count' => $lab->schedules_count,
                    'reservations_count' => $lab->reservations_count
                ];
            });

        return Inertia::render('Admin/Labs/Index', [
            'labs' => $labs
        ]);
    }

    /**
     * Show the form for creating a new lab.
     */
    public function create()
    {
        return Inertia::render('Admin/Labs/Create');
    }

    /**
     * Store a newly created lab in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:labs',
            'capacity' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['available', 'maintenance'])]
        ]);

        Lab::create($validated);

        return Redirect::route('admin.labs.index')
            ->with('message', 'Lab berhasil ditambahkan');
    }

    /**
     * Display the specified lab.
     */
    public function show(Lab $lab)
    {
        $lab->load(['schedules' => function ($query) {
            $query->with(['lecturer', 'reservation'])
                ->orderBy('day')
                ->orderBy('start_time');
        }]);

        return Inertia::render('Admin/Labs/Show', [
            'lab' => [
                'id' => $lab->id,
                'name' => $lab->name,
                'capacity' => $lab->capacity,
                'description' => $lab->description,
                'status' => $lab->status,
                'created_at' => $lab->created_at->format('d M Y'),
                'schedules' => $lab->schedules->map(function ($schedule) {
                    return [
                        'id' => $schedule->id,
                        'day' => $schedule->day,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'course_name' => $schedule->course_name,
                        'type' => $schedule->type,
                        'lecturer' => $schedule->lecturer ? [
                            'id' => $schedule->lecturer->id,
                            'name' => $schedule->lecturer->name,
                        ] : null,
                        'reservation' => $schedule->reservation ? [
                            'id' => $schedule->reservation->id,
                            'status' => $schedule->reservation->status,
                        ] : null,
                    ];
                }),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified lab.
     */
    public function edit(Lab $lab)
    {
        return Inertia::render('Admin/Labs/Edit', [
            'lab' => [
                'id' => $lab->id,
                'name' => $lab->name,
                'capacity' => $lab->capacity,
                'description' => $lab->description,
                'status' => $lab->status,
            ]
        ]);
    }

    /**
     * Update the specified lab in storage.
     */
    public function update(Request $request, Lab $lab)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('labs')->ignore($lab->id)],
            'capacity' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['available', 'maintenance'])]
        ]);

        $lab->update($validated);

        return Redirect::route('admin.labs.index')
            ->with('message', 'Lab berhasil diperbarui');
    }

    /**
     * Remove the specified lab from storage.
     */
    public function destroy(Lab $lab)
    {
        // Check if lab has any schedules
        $hasSchedules = Schedule::where('lab_id', $lab->id)->exists();

        if ($hasSchedules) {
            return back()->withErrors([
                'error' => 'Lab tidak dapat dihapus karena masih memiliki jadwal terkait.'
            ]);
        }

        $lab->delete();

        return Redirect::route('admin.labs.index')
            ->with('message', 'Lab berhasil dihapus');
    }
}
