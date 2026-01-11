<?php
require '/home/vertexun/sis-backend/vendor/autoload.php';
$app = require_once '/home/vertexun/sis-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

// Get the student
$student = DB::table('students')->where('user_id', 7)->first();
if (!$student) {
    echo "Student not found!\n";
    exit;
}
echo "Student: {$student->id} - {$student->name_en}\n";

// Get current semester
$semester = DB::table('semesters')->where('is_current', true)->first();
if (!$semester) {
    echo "No current semester found!\n";
    exit;
}
echo "Using semester: {$semester->id} - {$semester->name_en}\n";

// Get courses
$courses = DB::table('courses')->take(6)->get();
echo "Found " . $courses->count() . " courses\n";

// Enroll student in courses
$enrolled = 0;
foreach ($courses as $course) {
    // Check if already enrolled
    $existing = DB::table('enrollments')
        ->where('student_id', $student->id)
        ->where('course_id', $course->id)
        ->where('semester_id', $semester->id)
        ->first();

    if (!$existing) {
        DB::table('enrollments')->insert([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'semester_id' => $semester->id,
            'semester' => $semester->name_en,
            'academic_year' => '2025-2026',
            'status' => 'ENROLLED',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "Enrolled in: {$course->code} - {$course->name_en}\n";
        $enrolled++;
    } else {
        echo "Already enrolled in: {$course->code}\n";
    }
}

echo "\nTotal new enrollments: {$enrolled}\n";
echo "Done!\n";
