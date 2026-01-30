<?php
/**
 * Check detailed grade information from Moodle
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

    // Get grades using gradereport_overview_get_course_grades (the one that works)
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'gradereport_overview_get_course_grades',
        'moodlewsrestformat' => 'json',
        'userid' => $moodleUserId,
    ]);
    $gradeData = $response->json();

    // Show full grade data structure
    $results = [
        'student_moodle_id' => $moodleUserId,
        'full_grade_response' => $gradeData,
    ];

    // Also check site functions to see what's available
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_webservice_get_site_info',
        'moodlewsrestformat' => 'json',
    ]);
    $siteInfo = $response->json();

    // Filter grade-related functions
    $gradeFunctions = [];
    if (isset($siteInfo['functions'])) {
        foreach ($siteInfo['functions'] as $func) {
            if (stripos($func['name'], 'grade') !== false ||
                stripos($func['name'], 'assign') !== false ||
                stripos($func['name'], 'quiz') !== false) {
                $gradeFunctions[] = $func['name'];
            }
        }
    }
    $results['available_grade_functions'] = $gradeFunctions;

    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
