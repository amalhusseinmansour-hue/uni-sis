<?php
/**
 * Check different grade methods in Moodle
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
    $courseId = 27; // Fundamentals of AI

    $results = [];

    // Method 1: Get course contents (modules/activities)
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_course_get_contents',
        'moodlewsrestformat' => 'json',
        'courseid' => $courseId,
    ]);
    $results['course_contents'] = $response->json();

    // Method 2: Get assignments in the course
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'mod_assign_get_assignments',
        'moodlewsrestformat' => 'json',
        'courseids[0]' => $courseId,
    ]);
    $assignmentsData = $response->json();
    $results['assignments'] = $assignmentsData;

    // Method 3: If we have assignments, get grades for them
    if (isset($assignmentsData['courses'][0]['assignments'])) {
        $assignmentIds = array_column($assignmentsData['courses'][0]['assignments'], 'id');

        if (!empty($assignmentIds)) {
            $params = [
                'wstoken' => $moodleToken,
                'wsfunction' => 'mod_assign_get_grades',
                'moodlewsrestformat' => 'json',
            ];
            foreach ($assignmentIds as $i => $aid) {
                $params["assignmentids[$i]"] = $aid;
            }
            $response = Http::timeout(30)->get($wsUrl, $params);
            $results['assignment_grades'] = $response->json();
        }
    }

    // Method 4: Get quizzes in the course
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'mod_quiz_get_quizzes_by_courses',
        'moodlewsrestformat' => 'json',
        'courseids[0]' => $courseId,
    ]);
    $results['quizzes'] = $response->json();

    // Method 5: core_grades_get_grades (might be deprecated but try)
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_grades_get_grades',
        'moodlewsrestformat' => 'json',
        'courseid' => $courseId,
        'userids[0]' => $moodleUserId,
    ]);
    $results['core_grades'] = $response->json();

    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
