<?php

namespace Database\Seeders;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RoleAndUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //// 1. Buat Role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $lecturerRole = Role::firstOrCreate(['name' => 'lecturer']);
        $studentRole = Role::firstOrCreate(['name' => 'student']);

        // 2. Buat Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@kampus.ac.id'],
            [
                'name' => 'Admin User',
                'nim_nip' => 'admin001',
                'password' => Hash::make('password123'),
            ]
        );
        $admin->assignRole($adminRole);

        // 3. Buat Dosen
        $lecturer = User::firstOrCreate(
            ['email' => 'dosen@kampus.ac.id'],
            [
                'name' => 'Lecturer User',
                'nim_nip' => 'nip123456',
                'password' => Hash::make('password123'),
            ]
        );
        $lecturer->assignRole($lecturerRole);

        // 4. Buat Mahasiswa
        $student = User::firstOrCreate(
            ['email' => 'mahasiswa@student.kampus.ac.id'],
            [
                'name' => 'Student User',
                'nim_nip' => 'nim2023001',
                'password' => Hash::make('password123'),
            ]
        );
        $student->assignRole($studentRole);
    }
}
