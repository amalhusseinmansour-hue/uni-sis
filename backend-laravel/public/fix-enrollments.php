<?php
/**
 * Public endpoint to diagnose and fix enrollment semesters
 */

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Enrollment;
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

$action = $_GET['action'] ?? 'diagnose';

try {
    switch ($action) {
        case 'diagnose':
            // Get all semesters
            $semesters = Semester::orderBy('start_date')->get(['id', 'name', 'name_en', 'name_ar', 'academic_year', 'is_current']);

            // Get all enrollments with details
            $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;

            $query = DB::table('enrollments')
                ->leftJoin('students', 'enrollments.student_id', '=', 'students.id')
                ->leftJoin('courses', 'enrollments.course_id', '=', 'courses.id')
                ->leftJoin('semesters', 'enrollments.semester_id', '=', 'semesters.id')
                ->select([
                    'enrollments.id as enrollment_id',
                    'enrollments.student_id',
                    'enrollments.course_id',
                    'enrollments.semester_id',
                    'enrollments.status',
                    'students.student_id as student_number',
                    'students.name_en as student_name',
                    'courses.code as course_code',
                    'courses.name_en as course_name',
                    'semesters.name as semester_name',
                    'semesters.academic_year'
                ]);

            if ($studentId) {
                $query->where('enrollments.student_id', $studentId);
            }

            $enrollments = $query->orderBy('students.student_id')
                ->orderBy('enrollments.semester_id')
                ->orderBy('courses.code')
                ->limit(500)
                ->get();

            echo json_encode([
                'success' => true,
                'semesters' => $semesters,
                'enrollments' => $enrollments,
                'total' => count($enrollments),
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            break;

        case 'fix':
            // Fix a single enrollment's semester
            $enrollmentId = (int)($_GET['enrollment_id'] ?? $_POST['enrollment_id'] ?? 0);
            $newSemesterId = (int)($_GET['new_semester_id'] ?? $_POST['new_semester_id'] ?? 0);

            if (!$enrollmentId || !$newSemesterId) {
                echo json_encode(['error' => 'enrollment_id and new_semester_id are required']);
                exit;
            }

            DB::table('enrollments')
                ->where('id', $enrollmentId)
                ->update(['semester_id' => $newSemesterId, 'updated_at' => now()]);

            echo json_encode([
                'success' => true,
                'message' => 'Enrollment updated',
                'message_ar' => 'تم تحديث التسجيل',
                'enrollment_id' => $enrollmentId,
                'new_semester_id' => $newSemesterId,
            ]);
            break;

        case 'bulk-fix':
            // Move all enrollments from one semester to another for a specific course
            $courseId = (int)($_GET['course_id'] ?? $_POST['course_id'] ?? 0);
            $fromSemesterId = isset($_GET['from_semester_id']) || isset($_POST['from_semester_id'])
                ? (int)($_GET['from_semester_id'] ?? $_POST['from_semester_id'])
                : null;
            $toSemesterId = (int)($_GET['to_semester_id'] ?? $_POST['to_semester_id'] ?? 0);

            if (!$courseId || !$toSemesterId) {
                echo json_encode(['error' => 'course_id and to_semester_id are required']);
                exit;
            }

            $query = DB::table('enrollments')->where('course_id', $courseId);
            if ($fromSemesterId) {
                $query->where('semester_id', $fromSemesterId);
            }

            $count = $query->update(['semester_id' => $toSemesterId, 'updated_at' => now()]);

            echo json_encode([
                'success' => true,
                'message' => "Updated $count enrollments",
                'message_ar' => "تم تحديث $count تسجيل",
                'updated_count' => $count,
            ]);
            break;

        case 'fix-student':
            // Move all enrollments for a student from one semester to another
            $studentId = (int)($_GET['student_id'] ?? 0);
            $fromSemesterId = (int)($_GET['from_semester_id'] ?? 0);
            $toSemesterId = (int)($_GET['to_semester_id'] ?? 0);

            if (!$studentId || !$fromSemesterId || !$toSemesterId) {
                echo json_encode(['error' => 'student_id, from_semester_id, and to_semester_id are required']);
                exit;
            }

            $count = DB::table('enrollments')
                ->where('student_id', $studentId)
                ->where('semester_id', $fromSemesterId)
                ->update(['semester_id' => $toSemesterId, 'updated_at' => now()]);

            echo json_encode([
                'success' => true,
                'message' => "Moved $count enrollments to new semester",
                'message_ar' => "تم نقل $count تسجيل للفصل الجديد",
                'updated_count' => $count,
            ]);
            break;

        default:
            echo json_encode(['error' => 'Unknown action. Use: diagnose, fix, bulk-fix, or fix-student']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Operation failed', 'message' => $e->getMessage()]);
}
