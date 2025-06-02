<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabManagerController extends Controller
{
    public function index()
    {
        // Get all labs
        $labs = Lab::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/LabManager', [
            'labs' => $labs
        ]);
    }
}
