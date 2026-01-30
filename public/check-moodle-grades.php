<?php
/**
 * Check available grade methods in Moodle
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

    // Test student - عبد الرحمن
    $moodleUserId = 28;
    // Test course - Fundamentals of AI
    $courseId = 27;

    $results = [];

    // Method 1: gradereport_user_get_grade_items
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'gradereport_user_get_grade_items',
        'moodlewsrestformat' => 'json',
        'courseid' => $courseId,
        'userid' => $moodleUserId,
    ]);
    $results['gradereport_user_get_grade_items'] = $response->json();

    // Method 2: gradereport_overview_get_course_grades
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'gradereport_overview_get_course_grades',
        'moodlewsrestformat' => 'json',
        'userid' => $moodleUserId,
    ]);
    $results['gradereport_overview_get_course_grades'] = $response->json();

    // Method 3: core_grades_get_grades (deprecated but might work)
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_grades_get_grades',
        'moodlewsrestformat' => 'json',
        'courseid' => $courseId,
        'userids[0]' => $moodleUserId,
    ]);
    $results['core_grades_get_grades'] = $response->json();

    // Method 4: mod_assign_get_grades (for assignments)
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'mod_assign_get_grades',
        'moodlewsrestformat' => 'json',
        'assignmentids[0]' => 1,
    ]);
    $results['mod_assign_get_grades'] = $response->json();

    // Method 5: Get course activities and grades
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_completion_get_activities_completion_status',
        'moodlewsrestformat' => 'json',
        'courseid' => $courseId,
        'userid' => $moodleUserId,
    ]);
    $results['core_completion_get_activities_completion_status'] = $response->json();

    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
