<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Program;
use Illuminate\Support\Facades\DB;

echo "Creating student record...\n";

// Get the user ID for student@university.edu
$userId = DB::table('users')->where('email', 'student@university.edu')->value('id');
if (!$userId) {
    echo "Student user not found!\n";
    exit(1);
}
echo "Found user ID: $userId\n";

// Get a program
$program = Program::first();
if (!$program) {
    echo "No program found!\n";
    exit(1);
}
echo "Found program: " . $program->name_en . " (ID: " . $program->id . ")\n";

// Check if student record exists
$existing = DB::table('students')->where('user_id', $userId)->first();
if ($existing) {
    echo "Student record already exists with ID: " . $existing->id . "\n";
} else {
    // Insert with correct column names
    $studentId = DB::table('students')->insertGetId([
        'user_id' => $userId,
        'program_id' => $program->id,
        'student_id' => '2025001',
        'name_en' => 'Demo Student',
        'name_ar' => 'طالب تجريبي',
        'national_id' => '9999999999',
        'date_of_birth' => '2000-01-01',
        'gender' => 'MALE',
        'nationality' => 'Syrian',
        'status' => 'ACTIVE',
        'phone' => '+963999888777',
        'personal_email' => 'demo.student@gmail.com',
        'university_email' => 'student@university.edu',
        'admission_date' => '2025-01-01',
        'level' => 1,
        'gpa' => 3.50,
        'term_gpa' => 3.50,
        'academic_status' => 'REGULAR',
        'administrative_status' => 'ACTIVE',
        'financial_status' => 'CLEARED',
        'program_type' => 'BACHELOR',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    echo "Created student record with ID: $studentId\n";
}

echo "\nAll students:\n";
$students = DB::table('students')
    ->join('users', 'students.user_id', '=', 'users.id')
    ->select('students.id', 'students.student_id', 'students.name_en', 'users.email', 'students.status')
    ->get();

foreach ($students as $s) {
    echo $s->id . ": " . $s->student_id . " - " . $s->name_en . " (" . $s->email . ") - " . $s->status . "\n";
}

echo "\nDone!\n";
