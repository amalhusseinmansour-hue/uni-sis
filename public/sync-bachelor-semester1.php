<?php
/**
 * Sync first semester courses for all bachelor students from LMS
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
set_time_limit(300); // 5 minutes

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Student;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\Program;
use Illuminate\Support\Facades\Http;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    // Get Moodle config
    $moodleUrl = config('services.moodle.url');
    $moodleToken = config('services.moodle.token');

    if (!$moodleUrl || !$moodleToken) {
        echo json_encode(['success' => false, 'message' => 'Moodle not configured']);
        exit;
    }

    $wsUrl = rtrim($moodleUrl, '/') . '/webservice/rest/server.php';

    // Get current semester
    $currentSemester = Semester::where('is_current', true)->first();
    if (!$currentSemester) {
        $currentSemester = Semester::orderBy('id', 'desc')->first();
    }

    // Get all bachelor programs
    $bachelorPrograms = Program::where('type', 'BACHELOR')
        ->orWhere('name_en', 'LIKE', '%Bachelor%')
        ->orWhere('code', 'LIKE', 'B%')
        ->pluck('id')
        ->toArray();

    // Get all active students (we'll filter to bachelor from LMS data)
    $students = Student::where('status', 'ACTIVE')->get();

    // First semester course codes pattern (level 1 courses)
    // Courses ending in 01, 02, 03 or starting with 1 in the number portion
    $firstSemesterPatterns = [
        '/^[A-Z]{4}[12][0-9]0[1-5]$/',  // e.g., BVTU2101, BVTU2102
        '/^[A-Z]{4}1[0-9]{3}$/',         // e.g., BBAC1305
        '/^[A-Z]{4}0[0-9]{3}$/',         // e.g., VUTR0002
    ];

    $results = [
        'total_students' => $students->count(),
        'students_processed' => 0,
        'students_with_courses' => 0,
        'total_enrollments_created' => 0,
        'total_courses_created' => 0,
        'first_semester_courses' => [],
        'all_lms_courses' => [],
        'students_data' => [],
        'errors' => [],
    ];

    // Get all Moodle users first
    $response = Http::timeout(60)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_user_get_users',
        'moodlewsrestformat' => 'json',
        'criteria[0][key]' => 'auth',
        'criteria[0][value]' => 'manual',
    ]);
    $allMoodleUsers = $response->json()['users'] ?? [];

    // Create username to moodle_id map
    $moodleUserMap = [];
    foreach ($allMoodleUsers as $mu) {
        $moodleUserMap[$mu['username']] = $mu['id'];
    }

    foreach ($students as $student) {
        $results['students_processed']++;

        // Find Moodle user ID
        $moodleUserId = $moodleUserMap[$student->student_id] ?? null;

        if (!$moodleUserId) {
            continue;
        }

        // Get courses from Moodle
        $response = Http::timeout(30)->get($wsUrl, [
            'wstoken' => $moodleToken,
            'wsfunction' => 'core_enrol_get_users_courses',
            'moodlewsrestformat' => 'json',
            'userid' => $moodleUserId,
        ]);
        $moodleCourses = $response->json();

        if (isset($moodleCourses['exception']) || empty($moodleCourses)) {
            continue;
        }

        $results['students_with_courses']++;
        $studentEnrollments = [];

        foreach ($moodleCourses as $moodleCourse) {
            $courseCode = $moodleCourse['shortname'];

            // Track all LMS courses
            if (!isset($results['all_lms_courses'][$courseCode])) {
                $results['all_lms_courses'][$courseCode] = [
                    'code' => $courseCode,
                    'name' => $moodleCourse['fullname'],
                    'moodle_id' => $moodleCourse['id'],
                    'students_count' => 0,
                ];
            }
            $results['all_lms_courses'][$courseCode]['students_count']++;

            // Check if this is a first semester course
            $isFirstSemester = false;
            foreach ($firstSemesterPatterns as $pattern) {
                if (preg_match($pattern, $courseCode)) {
                    $isFirstSemester = true;
                    break;
                }
            }

            // Also check by course number (if 4th digit is 1 or 2, it's likely first year)
            if (!$isFirstSemester && preg_match('/^[A-Z]{4}(\d)/', $courseCode, $matches)) {
                if (in_array($matches[1], ['0', '1', '2'])) {
                    $isFirstSemester = true;
                }
            }

            // Skip non-first semester courses
            if (!$isFirstSemester) {
                continue;
            }

            // Track first semester courses
            if (!isset($results['first_semester_courses'][$courseCode])) {
                $results['first_semester_courses'][$courseCode] = [
                    'code' => $courseCode,
                    'name' => $moodleCourse['fullname'],
                    'moodle_id' => $moodleCourse['id'],
                    'students_count' => 0,
                ];
            }
            $results['first_semester_courses'][$courseCode]['students_count']++;

            try {
                // Find or create course in SIS
                $course = Course::where('code', $courseCode)->first();

                if (!$course) {
                    $course = Course::create([
                        'code' => $courseCode,
                        'name_en' => $moodleCourse['fullname'],
                        'name_ar' => $moodleCourse['fullname'],
                        'credits' => 3,
                        'is_active' => true,
                        'moodle_id' => $moodleCourse['id'],
                    ]);
                    $results['total_courses_created']++;
                }

                // Check if enrollment exists
                $existingEnrollment = Enrollment::where('student_id', $student->id)
                    ->where('course_id', $course->id)
                    ->where('semester_id', $currentSemester->id)
                    ->exists();

                if (!$existingEnrollment) {
                    Enrollment::create([
                        'student_id' => $student->id,
                        'course_id' => $course->id,
                        'semester_id' => $currentSemester->id,
                        'semester' => $currentSemester->name_en ?? 'Winter 2026',
                        'academic_year' => $currentSemester->academic_year ?? '2025-2026',
                        'section' => 'A',
                        'status' => 'ENROLLED',
                    ]);
                    $results['total_enrollments_created']++;

                    $studentEnrollments[] = [
                        'course_code' => $courseCode,
                        'course_name' => $moodleCourse['fullname'],
                    ];
                }

            } catch (Exception $e) {
                $results['errors'][] = [
                    'student' => $student->student_id,
                    'course' => $courseCode,
                    'error' => $e->getMessage(),
                ];
            }
        }

        if (!empty($studentEnrollments)) {
            $results['students_data'][] = [
                'student_id' => $student->student_id,
                'name_ar' => $student->name_ar,
                'name_en' => $student->name_en,
                'moodle_id' => $moodleUserId,
                'enrollments' => $studentEnrollments,
            ];
        }
    }

    // Convert to arrays for JSON
    $results['first_semester_courses'] = array_values($results['first_semester_courses']);
    $results['all_lms_courses'] = array_values($results['all_lms_courses']);
    $results['success'] = true;

    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
        'file' => $e->getFile(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
