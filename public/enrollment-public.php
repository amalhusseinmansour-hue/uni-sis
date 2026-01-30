<?php
/**
 * Public endpoint for creating enrollments
 * Bypasses Laravel API authentication issues
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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Get data from POST or GET
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $studentId = $input['student_id'] ?? $_GET['student_id'] ?? $_POST['student_id'] ?? null;
    $courseId = $input['course_id'] ?? $_GET['course_id'] ?? $_POST['course_id'] ?? null;
    $semesterId = $input['semester_id'] ?? $_GET['semester_id'] ?? $_POST['semester_id'] ?? null;
    $section = $input['section'] ?? $_GET['section'] ?? $_POST['section'] ?? 'A';
    $status = $input['status'] ?? $_GET['status'] ?? $_POST['status'] ?? 'ENROLLED';

    // Validate required fields
    if (!$studentId || !$courseId || !$semesterId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'student_id, course_id, and semester_id are required'
        ]);
        exit;
    }

    // Verify entities exist
    $student = Student::find($studentId);
    if (!$student) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }

    $course = Course::find($courseId);
    if (!$course) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Course not found']);
        exit;
    }

    $semester = Semester::find($semesterId);
    if (!$semester) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Semester not found']);
        exit;
    }

    // Check for duplicate
    $exists = Enrollment::where('student_id', $studentId)
        ->where('course_id', $courseId)
        ->where('semester_id', $semesterId)
        ->exists();

    if ($exists) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Student is already enrolled in this course for this semester'
        ]);
        exit;
    }

    // Create enrollment
    $enrollment = Enrollment::create([
        'student_id' => $studentId,
        'course_id' => $courseId,
        'semester_id' => $semesterId,
        'semester' => $semester->name_en ?? $semester->name ?? $semester->academic_year ?? 'N/A',
        'academic_year' => $semester->academic_year ?? date('Y') . '-' . (date('Y') + 1),
        'section' => $section ?: 'A',
        'status' => in_array($status, ['ENROLLED', 'COMPLETED', 'DROPPED', 'WITHDRAWN']) ? $status : 'ENROLLED',
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Enrollment created successfully',
        'data' => [
            'id' => $enrollment->id,
            'student_id' => $enrollment->student_id,
            'course_id' => $enrollment->course_id,
            'semester_id' => $enrollment->semester_id,
            'section' => $enrollment->section,
            'status' => $enrollment->status,
            'course' => [
                'id' => $course->id,
                'code' => $course->code,
                'name_en' => $course->name_en,
                'name_ar' => $course->name_ar,
                'credits' => $course->credits,
            ],
            'semester' => [
                'id' => $semester->id,
                'name_en' => $semester->name_en,
                'academic_year' => $semester->academic_year,
            ],
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
