<?php
require '/home/vertexun/sis-backend/vendor/autoload.php';
$app = require_once '/home/vertexun/sis-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

$studentId = '20103555';
$password = '123456789';

// Check if user already exists
$existingUser = DB::table('users')->where('email', $studentId . '@vertex.edu')->first();
if ($existingUser) {
    echo "User already exists, updating password...\n";
    DB::table('users')->where('id', $existingUser->id)->update([
        'password' => Hash::make($password)
    ]);
    $userId = $existingUser->id;
} else {
    echo "User not found, using ID 16...\n";
    $userId = 16;
    DB::table('users')->where('id', $userId)->update([
        'password' => Hash::make($password)
    ]);
}

// Check if student already exists
$existingStudent = DB::table('students')->where('student_id', $studentId)->first();
if ($existingStudent) {
    echo "Student already exists, linking to user...\n";
    DB::table('students')->where('id', $existingStudent->id)->update(['user_id' => $userId]);
    $studentDbId = $existingStudent->id;
} else {
    // Get a program
    $program = DB::table('programs')->first();

    // Create student - use raw insert to avoid validation with unique national_id
    $nationalId = '20103555' . rand(100, 999);
    DB::statement("INSERT INTO students (user_id, student_id, name_en, name_ar, first_name_en, last_name_en,
        first_name_ar, last_name_ar, national_id, date_of_birth, gender, nationality, phone, personal_email,
        university_email, program_id, status, gpa, completed_credits, total_required_credits, level,
        current_semester, admission_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())", [
        $userId, $studentId, 'Test Student', 'طالب تجريبي', 'Test', 'Student', 'طالب', 'تجريبي',
        $nationalId, '2000-01-15', 'male', 'Libyan', '+218912345678', 'test@example.com',
        $studentId . '@vertex.edu', $program->id ?? 1, 'ACTIVE', 3.50, 60, 120, 2, 1, '2023-09-01'
    ]);

    $studentDbId = DB::getPdo()->lastInsertId();
    echo "Created student with ID: {$studentDbId}\n";

    // Add enrollments
    $semester = DB::table('semesters')->where('is_current', true)->first();
    if ($semester) {
        $courses = DB::table('courses')->take(4)->get();
        foreach ($courses as $course) {
            DB::table('enrollments')->insert([
                'student_id' => $studentDbId,
                'course_id' => $course->id,
                'semester_id' => $semester->id,
                'semester' => $semester->name_en,
                'academic_year' => '2025-2026',
                'status' => 'ENROLLED',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        echo "Enrolled in " . $courses->count() . " courses\n";
    }
}

echo "\n=== Login Credentials ===\n";
echo "Student ID: {$studentId}\n";
echo "Password: {$password}\n";
echo "========================\n";
