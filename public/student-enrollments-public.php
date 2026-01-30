<?php
/**
 * Public endpoint for fetching student enrollments
 */

// Path to Laravel backend from public_html
require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Student;
use App\Models\Enrollment;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $studentId = $_GET['student_id'] ?? null;

    if (!$studentId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'student_id is required']);
        exit;
    }

    $student = Student::find($studentId);

    if (!$student) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Student not found']);
        exit;
    }

    $enrollments = Enrollment::with(['course', 'semesterRecord'])
        ->where('student_id', $studentId)
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($enrollment) {
            $semesterObj = $enrollment->semesterRecord;
            return [
                'id' => $enrollment->id,
                'student_id' => $enrollment->student_id,
                'course_id' => $enrollment->course_id,
                'semester_id' => $enrollment->semester_id,
                'section' => $enrollment->section,
                'status' => $enrollment->status,
                'created_at' => $enrollment->created_at,
                'course' => $enrollment->course ? [
                    'id' => $enrollment->course->id,
                    'code' => $enrollment->course->code,
                    'name_en' => $enrollment->course->name_en,
                    'name_ar' => $enrollment->course->name_ar,
                    'credits' => $enrollment->course->credits,
                ] : null,
                'semester' => $semesterObj ? [
                    'id' => $semesterObj->id,
                    'name' => $semesterObj->name,
                    'name_en' => $semesterObj->name_en,
                    'name_ar' => $semesterObj->name_ar,
                    'academic_year' => $semesterObj->academic_year,
                    'is_current' => (bool) $semesterObj->is_current,
                ] : [
                    'name_en' => $enrollment->semester ?? 'N/A',
                    'academic_year' => $enrollment->academic_year ?? 'N/A',
                ],
            ];
        });

    // Summary stats
    $enrolled = $enrollments->where('status', 'ENROLLED')->count();
    $completed = $enrollments->where('status', 'COMPLETED')->count();
    $dropped = $enrollments->where('status', 'DROPPED')->count();

    echo json_encode([
        'success' => true,
        'student' => [
            'id' => $student->id,
            'student_id' => $student->student_id,
            'name_en' => $student->name_en,
            'name_ar' => $student->name_ar,
        ],
        'enrollments' => $enrollments,
        'summary' => [
            'total' => $enrollments->count(),
            'enrolled' => $enrolled,
            'completed' => $completed,
            'dropped' => $dropped,
        ],
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
