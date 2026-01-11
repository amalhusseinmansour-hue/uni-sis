<?php
require '/home/vertexun/sis-backend/vendor/autoload.php';
$app = require_once '/home/vertexun/sis-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$studentId = 3;

// Get enrollments with semester info
$enrollments = DB::table('enrollments')
    ->join('semesters', 'enrollments.semester_id', '=', 'semesters.id')
    ->where('enrollments.student_id', $studentId)
    ->select('enrollments.*', 'semesters.name_en as semester_name')
    ->get();

echo "Found " . $enrollments->count() . " enrollments\n";

$grades = ['A', 'A-', 'B+', 'B', 'B-', 'A'];
$i = 0;

foreach ($enrollments as $enrollment) {
    // Check if grade exists
    $existing = DB::table('grades')
        ->where('student_id', $studentId)
        ->where('course_id', $enrollment->course_id)
        ->where('semester_id', $enrollment->semester_id)
        ->first();

    if (!$existing) {
        $grade = $grades[$i % count($grades)];
        DB::table('grades')->insert([
            'student_id' => $studentId,
            'course_id' => $enrollment->course_id,
            'semester_id' => $enrollment->semester_id,
            'semester' => $enrollment->semester_name,
            'grade' => $grade,
            'status' => 'APPROVED',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "Added grade {$grade} for course {$enrollment->course_id}\n";
    } else {
        echo "Grade already exists for course {$enrollment->course_id}\n";
    }
    $i++;
}

// Update student GPA
$gpaPoints = [
    'A+' => 4.0, 'A' => 4.0, 'A-' => 3.7,
    'B+' => 3.3, 'B' => 3.0, 'B-' => 2.7,
    'C+' => 2.3, 'C' => 2.0, 'C-' => 1.7,
    'D+' => 1.3, 'D' => 1.0, 'F' => 0.0
];

$studentGrades = DB::table('grades')
    ->join('courses', 'grades.course_id', '=', 'courses.id')
    ->where('grades.student_id', $studentId)
    ->where('grades.status', 'APPROVED')
    ->select('grades.grade', 'courses.credits')
    ->get();

$totalPoints = 0;
$totalCredits = 0;

foreach ($studentGrades as $g) {
    $credits = $g->credits ?? 3;
    $points = $gpaPoints[$g->grade] ?? 0;
    $totalPoints += $points * $credits;
    $totalCredits += $credits;
}

$gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;

DB::table('students')
    ->where('id', $studentId)
    ->update([
        'gpa' => $gpa,
        'completed_credits' => $totalCredits,
    ]);

echo "\nStudent GPA updated to: {$gpa}\n";
echo "Completed credits: {$totalCredits}\n";
echo "Done!\n";
