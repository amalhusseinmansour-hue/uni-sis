<?php
/**
 * Simple test for enrollment
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';
    $app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

    use App\Models\Enrollment;
    use App\Models\Semester;

    $studentId = $_GET['student_id'] ?? null;
    $courseId = $_GET['course_id'] ?? null;
    $semesterId = $_GET['semester_id'] ?? null;

    if (!$studentId || !$courseId || !$semesterId) {
        echo json_encode(['error' => 'Need student_id, course_id, semester_id']);
        exit;
    }

    // Check duplicate
    $exists = Enrollment::where('student_id', $studentId)
        ->where('course_id', $courseId)
        ->where('semester_id', $semesterId)
        ->exists();

    if ($exists) {
        echo json_encode(['error' => 'Already enrolled']);
        exit;
    }

    $semester = Semester::find($semesterId);

    $enrollment = Enrollment::create([
        'student_id' => $studentId,
        'course_id' => $courseId,
        'semester_id' => $semesterId,
        'semester' => $semester->name_en ?? $semester->name ?? 'N/A',
        'academic_year' => $semester->academic_year ?? '2025-2026',
        'section' => 'A',
        'status' => 'ENROLLED',
    ]);

    echo json_encode([
        'success' => true,
        'enrollment_id' => $enrollment->id,
        'message' => 'Created!'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'line' => $e->getLine()
    ]);
}
