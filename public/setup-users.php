<?php
/**
 * Temporary script to create test users
 * Upload this file to: public/setup-users.php
 * Access via: https://sistest.vertexuniversity.edu.eu/setup-users.php
 * DELETE THIS FILE AFTER USE!
 */

// Load Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Student;
use App\Models\Program;
use App\Models\Department;
use App\Models\College;
use Illuminate\Support\Facades\Hash;

header('Content-Type: application/json');

try {
    $created = [];

    // Create Admin
    $admin = User::updateOrCreate(
        ['email' => 'admin@vertexuniversity.edu.eu'],
        [
            'name' => 'Admin User',
            'password' => Hash::make('admin123'),
            'role' => 'ADMIN',
            'email_verified_at' => now(),
        ]
    );
    $created[] = ['email' => 'admin@vertexuniversity.edu.eu', 'password' => 'admin123', 'role' => 'ADMIN'];

    // Create Student User
    $studentUser = User::updateOrCreate(
        ['email' => 'student@university.edu'],
        [
            'name' => 'Demo Student',
            'password' => Hash::make('student123'),
            'role' => 'STUDENT',
            'email_verified_at' => now(),
        ]
    );

    // Ensure we have a program
    $program = Program::first();
    if (!$program) {
        $department = Department::first();
        if (!$department) {
            $college = College::first();
            if (!$college) {
                $college = College::create([
                    'code' => 'COE',
                    'name_en' => 'College of Engineering',
                    'name_ar' => 'كلية الهندسة',
                    'is_active' => true,
                ]);
            }
            $department = Department::create([
                'college_id' => $college->id,
                'code' => 'CS',
                'name_en' => 'Computer Science',
                'name_ar' => 'علوم الحاسوب',
                'is_active' => true,
            ]);
        }
        $program = Program::create([
            'department_id' => $department->id,
            'code' => 'BSCS',
            'name_en' => 'Bachelor of Computer Science',
            'name_ar' => 'بكالوريوس علوم الحاسوب',
            'degree' => 'BACHELOR',
            'duration_years' => 4,
            'total_credits' => 132,
            'is_active' => true,
        ]);
    }

    // Create Student Profile
    if ($program) {
        $studentRecord = Student::updateOrCreate(
            ['user_id' => $studentUser->id],
            [
                'program_id' => $program->id,
                'student_id' => 'STU-' . str_pad($studentUser->id, 6, '0', STR_PAD_LEFT),
                'full_name_en' => 'Demo Student',
                'full_name_ar' => 'طالب تجريبي',
                'national_id' => '1234567890',
                'date_of_birth' => '2000-01-15',
                'gender' => 'MALE',
                'nationality' => 'Syrian',
                'status' => 'ACTIVE',
                'academic_year' => 1,
                'gpa' => 3.50,
                'total_credits' => 30,
                'enrollment_date' => now()->subMonths(6),
            ]
        );
        $created[] = [
            'email' => 'student@university.edu',
            'password' => 'student123',
            'role' => 'STUDENT',
            'student_id' => $studentRecord->student_id,
            'has_profile' => true
        ];
    }

    // Create Finance
    User::updateOrCreate(
        ['email' => 'finance@university.edu'],
        [
            'name' => 'Finance User',
            'password' => Hash::make('finance123'),
            'role' => 'FINANCE',
            'email_verified_at' => now(),
        ]
    );
    $created[] = ['email' => 'finance@university.edu', 'password' => 'finance123', 'role' => 'FINANCE'];

    // Create Lecturer
    User::updateOrCreate(
        ['email' => 'lecturer@university.edu'],
        [
            'name' => 'Demo Lecturer',
            'password' => Hash::make('lecturer123'),
            'role' => 'LECTURER',
            'email_verified_at' => now(),
        ]
    );
    $created[] = ['email' => 'lecturer@university.edu', 'password' => 'lecturer123', 'role' => 'LECTURER'];

    echo json_encode([
        'success' => true,
        'message' => 'Test users created successfully!',
        'users' => $created,
        'programs_count' => Program::count(),
        'warning' => 'DELETE THIS FILE (setup-users.php) AFTER USE!'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
