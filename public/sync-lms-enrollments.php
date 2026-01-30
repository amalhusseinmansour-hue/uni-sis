<?php
/**
 * Sync student enrollments from LMS to SIS
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Student;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\MoodleUser;
use Illuminate\Support\Facades\Http;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $studentId = $_GET['student_id'] ?? 14; // Default to عبد الرحمن علي أحمد حسن
    $moodleUserId = $_GET['moodle_user_id'] ?? null;

    // Get student
    $student = Student::find($studentId);
    if (!$student) {
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }

    // Get Moodle config
    $moodleUrl = config('services.moodle.url');
    $moodleToken = config('services.moodle.token');

    if (!$moodleUrl || !$moodleToken) {
        echo json_encode(['success' => false, 'message' => 'Moodle not configured']);
        exit;
    }

    // Get or find Moodle user ID
    if (!$moodleUserId) {
        // Try to find by username (student_id)
        $wsUrl = rtrim($moodleUrl, '/') . '/webservice/rest/server.php';
        $response = Http::get($wsUrl, [
            'wstoken' => $moodleToken,
            'wsfunction' => 'core_user_get_users',
            'moodlewsrestformat' => 'json',
            'criteria[0][key]' => 'username',
            'criteria[0][value]' => $student->student_id,
        ]);
        $userData = $response->json();

        if (!empty($userData['users'])) {
            $moodleUserId = $userData['users'][0]['id'];
        }
    }

    if (!$moodleUserId) {
        echo json_encode([
            'success' => false,
            'message' => 'Student not found in LMS',
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'name' => $student->name_en,
            ]
        ]);
        exit;
    }

    // Get courses from Moodle
    $wsUrl = rtrim($moodleUrl, '/') . '/webservice/rest/server.php';
    $response = Http::get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_enrol_get_users_courses',
        'moodlewsrestformat' => 'json',
        'userid' => $moodleUserId,
    ]);
    $moodleCourses = $response->json();

    if (isset($moodleCourses['exception'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Moodle API error',
            'error' => $moodleCourses['message'] ?? 'Unknown'
        ]);
        exit;
    }

    // Get current semester
    $currentSemester = Semester::where('is_current', true)->first();
    if (!$currentSemester) {
        $currentSemester = Semester::orderBy('id', 'desc')->first();
    }

    $results = [
        'student' => [
            'id' => $student->id,
            'student_id' => $student->student_id,
            'name_ar' => $student->name_ar,
            'name_en' => $student->name_en,
            'moodle_id' => $moodleUserId,
        ],
        'courses_found' => count($moodleCourses),
        'enrollments_created' => 0,
        'enrollments_skipped' => 0,
        'courses_created' => 0,
        'errors' => [],
        'enrollments' => [],
    ];

    foreach ($moodleCourses as $moodleCourse) {
        try {
            // Find or create course in SIS
            $course = Course::where('code', $moodleCourse['shortname'])->first();

            if (!$course) {
                // Create the course
                $course = Course::create([
                    'code' => $moodleCourse['shortname'],
                    'name_en' => $moodleCourse['fullname'],
                    'name_ar' => $moodleCourse['fullname'],
                    'credits' => 3, // Default
                    'is_active' => true,
                    'moodle_id' => $moodleCourse['id'],
                ]);
                $results['courses_created']++;
            } else {
                // Update moodle_id if not set
                if (!$course->moodle_id) {
                    $course->update(['moodle_id' => $moodleCourse['id']]);
                }
            }

            // Check if enrollment already exists
            $existingEnrollment = Enrollment::where('student_id', $student->id)
                ->where('course_id', $course->id)
                ->where('semester_id', $currentSemester->id)
                ->first();

            if ($existingEnrollment) {
                $results['enrollments_skipped']++;
                $results['enrollments'][] = [
                    'course_code' => $course->code,
                    'course_name' => $course->name_en,
                    'status' => 'skipped',
                    'reason' => 'Already enrolled',
                ];
                continue;
            }

            // Create enrollment
            $enrollment = Enrollment::create([
                'student_id' => $student->id,
                'course_id' => $course->id,
                'semester_id' => $currentSemester->id,
                'semester' => $currentSemester->name_en ?? $currentSemester->academic_year ?? 'Spring 2025',
                'academic_year' => $currentSemester->academic_year ?? '2024-2025',
                'section' => 'A',
                'status' => 'ENROLLED',
            ]);

            $results['enrollments_created']++;
            $results['enrollments'][] = [
                'id' => $enrollment->id,
                'course_code' => $course->code,
                'course_name' => $course->name_en,
                'status' => 'created',
            ];

        } catch (Exception $e) {
            $results['errors'][] = [
                'course' => $moodleCourse['shortname'],
                'error' => $e->getMessage(),
            ];
        }
    }

    $results['success'] = true;
    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
