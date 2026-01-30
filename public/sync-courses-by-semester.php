<?php
/**
 * Sync courses from LMS and categorize by semester (1st or 2nd)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
set_time_limit(300);

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Student;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Semester;
use Illuminate\Support\Facades\Http;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $moodleUrl = config('services.moodle.url');
    $moodleToken = config('services.moodle.token');

    if (!$moodleUrl || !$moodleToken) {
        echo json_encode(['success' => false, 'message' => 'Moodle not configured']);
        exit;
    }

    $wsUrl = rtrim($moodleUrl, '/') . '/webservice/rest/server.php';

    // Use existing semesters
    // Fall = First Semester (الفصل الأول)
    // Winter/Spring = Second Semester (الفصل الثاني)
    $semester1 = Semester::find(2); // Fall2025
    $semester2 = Semester::find(1); // Winter 2026 (current)

    if (!$semester1 || !$semester2) {
        echo json_encode([
            'success' => false,
            'message' => 'Semesters not found. Expected Fall and Winter semesters.',
        ]);
        exit;
    }

    // Course categorization by course code pattern
    // Odd last digit = Semester 1, Even last digit = Semester 2
    function determineSemester($courseCode) {
        // Extract last 2 digits from course code
        if (preg_match('/(\d)(\d)$/', $courseCode, $matches)) {
            $lastDigit = (int)$matches[2];
            // Odd = Semester 1 (01, 03, 05), Even = Semester 2 (02, 04, 06)
            return ($lastDigit % 2 == 1) ? 1 : 2;
        }
        // Default to semester 1
        return 1;
    }

    // First clear previous enrollments to re-sync properly
    // Enrollment::truncate(); // Uncomment if you want to clear all

    $students = Student::where('status', 'ACTIVE')->get();

    // Get all Moodle users
    $response = Http::timeout(60)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_user_get_users',
        'moodlewsrestformat' => 'json',
        'criteria[0][key]' => 'auth',
        'criteria[0][value]' => 'manual',
    ]);
    $allMoodleUsers = $response->json()['users'] ?? [];

    $moodleUserMap = [];
    foreach ($allMoodleUsers as $mu) {
        $moodleUserMap[$mu['username']] = $mu['id'];
    }

    $results = [
        'total_students' => $students->count(),
        'students_processed' => 0,
        'students_with_courses' => 0,
        'semester_1' => [
            'id' => $semester1->id,
            'name' => $semester1->name_en,
            'name_ar' => $semester1->name_ar ?? 'الفصل الأول',
            'enrollments_created' => 0,
            'courses' => [],
        ],
        'semester_2' => [
            'id' => $semester2->id,
            'name' => $semester2->name_en,
            'name_ar' => $semester2->name_ar ?? 'الفصل الثاني',
            'enrollments_created' => 0,
            'courses' => [],
        ],
        'courses_created' => 0,
        'errors' => [],
    ];

    foreach ($students as $student) {
        $results['students_processed']++;
        $moodleUserId = $moodleUserMap[$student->student_id] ?? null;

        if (!$moodleUserId) continue;

        $response = Http::timeout(30)->get($wsUrl, [
            'wstoken' => $moodleToken,
            'wsfunction' => 'core_enrol_get_users_courses',
            'moodlewsrestformat' => 'json',
            'userid' => $moodleUserId,
        ]);
        $moodleCourses = $response->json();

        if (isset($moodleCourses['exception']) || empty($moodleCourses)) continue;

        $results['students_with_courses']++;

        foreach ($moodleCourses as $moodleCourse) {
            $courseCode = $moodleCourse['shortname'];
            $semesterNum = determineSemester($courseCode);
            $targetSemester = ($semesterNum == 1) ? $semester1 : $semester2;
            $semesterKey = ($semesterNum == 1) ? 'semester_1' : 'semester_2';

            // Track course
            if (!isset($results[$semesterKey]['courses'][$courseCode])) {
                $results[$semesterKey]['courses'][$courseCode] = [
                    'code' => $courseCode,
                    'name' => $moodleCourse['fullname'],
                    'moodle_id' => $moodleCourse['id'],
                    'students_count' => 0,
                ];
            }
            $results[$semesterKey]['courses'][$courseCode]['students_count']++;

            try {
                // Find or create course
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
                    $results['courses_created']++;
                }

                // Check existing enrollment
                $exists = Enrollment::where('student_id', $student->id)
                    ->where('course_id', $course->id)
                    ->where('semester_id', $targetSemester->id)
                    ->exists();

                if (!$exists) {
                    Enrollment::create([
                        'student_id' => $student->id,
                        'course_id' => $course->id,
                        'semester_id' => $targetSemester->id,
                        'semester' => $targetSemester->name_en,
                        'academic_year' => $targetSemester->academic_year ?? '2025-2026',
                        'section' => 'A',
                        'status' => 'ENROLLED',
                    ]);
                    $results[$semesterKey]['enrollments_created']++;
                }
            } catch (Exception $e) {
                $results['errors'][] = [
                    'student' => $student->student_id,
                    'course' => $courseCode,
                    'error' => $e->getMessage(),
                ];
            }
        }
    }

    // Convert courses to arrays and sort
    $results['semester_1']['courses'] = array_values($results['semester_1']['courses']);
    $results['semester_2']['courses'] = array_values($results['semester_2']['courses']);
    $results['semester_1']['total_courses'] = count($results['semester_1']['courses']);
    $results['semester_2']['total_courses'] = count($results['semester_2']['courses']);

    usort($results['semester_1']['courses'], fn($a, $b) => $b['students_count'] - $a['students_count']);
    usort($results['semester_2']['courses'], fn($a, $b) => $b['students_count'] - $a['students_count']);

    $results['success'] = true;
    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
