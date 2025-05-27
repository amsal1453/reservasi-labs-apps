<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Menampilkan semua user (dosen & mahasiswa)
    public function index()
    {
        $users = User::with('roles')->whereIn('role', ['lecturer', 'student'])->get();
        return view('admin.users.index', compact('users'));
    }

    // Form tambah user
    public function create()
    {
        return view('admin.users.create');
    }

    // Simpan user baru
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'nim_nip'  => 'required|string|unique:users,nim_nip',
            'password' => 'required|string|min:6|confirmed',
            'role'     => 'required|in:lecturer,student',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'nim_nip'  => $request->nim_nip,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        $user->assignRole($request->role); // Spatie: tetapkan role

        return redirect()->route('admin.users.index')->with('success', 'User berhasil ditambahkan.');
    }

    // Form edit user
    public function edit(User $user)
    {
        return view('admin.users.edit', compact('user'));
    }

    // Update user
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $user->id,
            'nim_nip'  => 'required|string|unique:users,nim_nip,' . $user->id,
            'role'     => 'required|in:lecturer,student',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $user->update([
            'name'     => $request->name,
            'email'    => $request->email,
            'nim_nip'  => $request->nim_nip,
            'role'     => $request->role,
            'password' => $request->password ? Hash::make($request->password) : $user->password,
        ]);

        $user->syncRoles([$request->role]); // update role via Spatie

        return redirect()->route('admin.users.index')->with('success', 'User berhasil diperbarui.');
    }

    // Hapus user
    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('admin.users.index')->with('success', 'User berhasil dihapus.');
    }
}
