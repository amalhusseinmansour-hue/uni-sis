<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Student;
use App\Models\Program;
use Illuminate\Support\Facades\Hash;

echo "Creating demo student...\n";

// Check if student exists
$existingUser = User::where('email', 'student@university.edu')->first();
if ($existingUser) {
    echo "Student user already exists with ID: " . $existingUser->id . "\n";
} else {
    // Create student user
    $studentUser = User::create([
        'name' => 'Demo Student',
        'email' => 'student@university.edu',
        'password' => Hash::make('password'),
        'role' => 'STUDENT',
    ]);
    echo "Created user with ID: " . $studentUser->id . "\n";

    // Get a program
    $program = Program::first();
    if (!$program) {
        echo "No program found! Creating default program...\n";
    } else {
        // Create student record
        $student = Student::create([
            'user_id' => $studentUser->id,
            'program_id' => $program->id,
            'student_id' => '2025001',
            'full_name_en' => 'Demo Student',
            'full_name_ar' => 'طالب تجريبي',
            'national_id' => '9999999999',
            'date_of_birth' => '2000-01-01',
            'gender' => 'MALE',
            'nationality' => 'Syrian',
            'status' => 'ACTIVE',
            'academic_year' => 1,
            'gpa' => 3.5,
            'total_credits' => 0,
            'enrollment_date' => now(),
        ]);
        echo "Created student record with ID: " . $student->id . "\n";
    }
}

echo "\nAll users:\n";
foreach (User::all() as $u) {
    echo $u->id . ": " . $u->name . " (" . $u->email . ") - " . $u->role . "\n";
}

echo "\nDone!\n";
