<?php
/**
 * Test endpoint to create an enrollment directly - Fixed version
 */

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Course;
use App\Models\Semester;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $studentId = $_GET['student_id'] ?? null;
    $courseId = $_GET['course_id'] ?? null;
    $semesterId = $_GET['semester_id'] ?? null;

    if (!$studentId || !$courseId || !$semesterId) {
        echo json_encode([
            'success' => false,
            'error' => 'Required: student_id, course_id, semester_id',
            'usage' => '?student_id=20&course_id=181&semester_id=1'
        ]);
        exit;
    }

    $student = Student::find($studentId);
    $course = Course::find($courseId);
    $semester = Semester::find($semesterId);

    if (!$student) {
        echo json_encode(['success' => false, 'error' => 'Student not found']);
        exit;
    }
    if (!$course) {
        echo json_encode(['success' => false, 'error' => 'Course not found']);
        exit;
    }
    if (!$semester) {
        echo json_encode(['success' => false, 'error' => 'Semester not found']);
        exit;
    }

    // Check if already enrolled
    $exists = Enrollment::where('student_id', $studentId)
        ->where('course_id', $courseId)
        ->where('semester_id', $semesterId)
        ->exists();

    if ($exists) {
        echo json_encode([
            'success' => false,
            'error' => 'Student already enrolled in this course'
        ]);
        exit;
    }

    // Create enrollment with ALL required fields
    $enrollment = Enrollment::create([
        'student_id' => $studentId,
        'course_id' => $courseId,
        'semester_id' => $semesterId,
        'semester' => $semester->name_en ?? $semester->name ?? $semester->academic_year ?? 'Winter',
        'academic_year' => $semester->academic_year ?? '2025-2026',
        'section' => $_GET['section'] ?? 'A',
        'status' => 'ENROLLED',
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Enrollment created!',
        'enrollment' => [
            'id' => $enrollment->id,
            'student' => $student->name_en,
            'course' => $course->code . ' - ' . $course->name_en,
            'semester' => $semester->name_en,
            'status' => $enrollment->status,
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ], JSON_PRETTY_PRINT);
}
