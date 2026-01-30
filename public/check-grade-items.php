<?php
/**
 * Check grade items structure in Moodle for a test student
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Http;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $moodleUrl = config('services.moodle.url');
    $moodleToken = config('services.moodle.token');
    $wsUrl = rtrim($moodleUrl, '/') . '/webservice/rest/server.php';

    // Test student - عبد الرحمن (Moodle ID 28)
    $moodleUserId = 28;

    // Get all courses for this user first
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_enrol_get_users_courses',
        'moodlewsrestformat' => 'json',
        'userid' => $moodleUserId,
    ]);
    $courses = $response->json();

    $results = [
        'student_moodle_id' => $moodleUserId,
        'courses' => [],
    ];

    // For each course, get grade items
    foreach (array_slice($courses, 0, 3) as $course) { // Limit to 3 courses for testing
        $courseId = $course['id'];
        $courseCode = $course['shortname'];

        // Method 1: gradereport_user_get_grade_items
        $response = Http::timeout(30)->get($wsUrl, [
            'wstoken' => $moodleToken,
            'wsfunction' => 'gradereport_user_get_grade_items',
            'moodlewsrestformat' => 'json',
            'courseid' => $courseId,
            'userid' => $moodleUserId,
        ]);
        $gradeItems = $response->json();

        $results['courses'][] = [
            'course_id' => $courseId,
            'course_code' => $courseCode,
            'course_name' => $course['fullname'],
            'grade_items' => $gradeItems,
        ];
    }

    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
