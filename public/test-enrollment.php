<?php
/**
 * Test endpoint to create an enrollment directly
 */

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Course;
use App\Models\Semester;
use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Get parameters
    $studentId = $_GET['student_id'] ?? $_POST['student_id'] ?? null;
    $courseId = $_GET['course_id'] ?? $_POST['course_id'] ?? null;
    $semesterId = $_GET['semester_id'] ?? $_POST['semester_id'] ?? null;
    $action = $_GET['action'] ?? 'info';

    // Get info about available data
    if ($action === 'info') {
        $students = Student::select('id', 'student_id', 'name_en')->limit(10)->get();
        $courses = Course::select('id', 'code', 'name_en')->limit(10)->get();
        $semesters = Semester::select('id', 'name_en', 'academic_year', 'is_current')->get();
        $enrollments = DB::table('enrollments')->count();

        echo json_encode([
            'success' => true,
            'info' => [
                'total_enrollments' => $enrollments,
                'sample_students' => $students,
                'sample_courses' => $courses,
                'semesters' => $semesters,
            ],
            'usage' => 'Add ?action=create&student_id=X&course_id=Y&semester_id=Z to create enrollment',
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'create') {
        if (!$studentId || !$courseId || !$semesterId) {
            echo json_encode([
                'success' => false,
                'error' => 'Missing required parameters: student_id, course_id, semester_id'
            ]);
            exit;
        }

        // Verify entities exist
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
                'error' => 'Student is already enrolled in this course for this semester'
            ]);
            exit;
        }

        // Create enrollment with required semester info
        $enrollment = Enrollment::create([
            'student_id' => $studentId,
            'course_id' => $courseId,
            'semester_id' => $semesterId,
            'semester' => $semester->name_en ?? $semester->name ?? $semester->academic_year ?? 'N/A',
            'academic_year' => $semester->academic_year ?? date('Y') . '-' . (date('Y') + 1),
            'section' => $_GET['section'] ?? 'A',
            'status' => 'ENROLLED',
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Enrollment created successfully',
            'enrollment' => $enrollment->load(['student', 'course', 'semester']),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
