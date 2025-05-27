<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    // Menampilkan semua user (dosen & mahasiswa)
    public function index(Request $request)
    {
        $users = User::with('roles')
            ->latest()
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'nim_nip' => $user->nim_nip,
                    'roles' => $user->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                        ];
                    }),
                    'created_at' => $user->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    // Form tambah user
    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => [
                ['value' => 'admin', 'label' => 'Admin'],
                ['value' => 'lecturer', 'label' => 'Lecturer'],
                ['value' => 'student', 'label' => 'Student'],
            ]
        ]);
    }

    // Simpan user baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nim_nip' => 'nullable|string|unique:users,nim_nip|max:100',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,lecturer,student',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'nim_nip' => $validated['nim_nip'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return Redirect::route('admin.users.index')
            ->with('message', 'User berhasil ditambahkan.');
    }

    // Form edit user
    public function edit(User $user)
    {
        $user->load('roles');
        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nim_nip' => $user->nim_nip,
                'role' => $user->roles->first() ? $user->roles->first()->name : null,
            ],
            'roles' => [
                ['value' => 'admin', 'label' => 'Admin'],
                ['value' => 'lecturer', 'label' => 'Lecturer'],
                ['value' => 'student', 'label' => 'Student'],
            ]
        ]);
    }

    // Update user
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'nim_nip' => 'nullable|string|unique:users,nim_nip,' . $user->id . '|max:100',
            'role' => 'required|in:admin,lecturer,student',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'nim_nip' => $validated['nim_nip'],
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);
        $user->syncRoles([$validated['role']]);

        return Redirect::route('admin.users.index')
            ->with('message', 'User berhasil diperbarui.');
    }

    // Hapus user
    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return Redirect::back()->withErrors(['error' => 'Anda tidak dapat menghapus akun Anda sendiri.']);
        }
        $user->delete();
        return Redirect::route('admin.users.index')
            ->with('message', 'User berhasil dihapus.');
    }
}
