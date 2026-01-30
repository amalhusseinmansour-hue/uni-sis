<?php
/**
 * Check Moodle for a student and get their courses
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

    if (!$moodleUrl || !$moodleToken) {
        echo json_encode([
            'success' => false,
            'message' => 'Moodle not configured',
            'url_configured' => !empty($moodleUrl),
            'token_configured' => !empty($moodleToken),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Search for student in Moodle
    $searchName = $_GET['name'] ?? 'عبد الرحمن';
    $email = $_GET['email'] ?? '';
    $idNumber = $_GET['idnumber'] ?? '';

    $wsUrl = rtrim($moodleUrl, '/') . '/webservice/rest/server.php';

    // Try different search methods
    $results = [];

    // Search by email if provided
    if ($email) {
        $response = Http::get($wsUrl, [
            'wstoken' => $moodleToken,
            'wsfunction' => 'core_user_get_users',
            'moodlewsrestformat' => 'json',
            'criteria[0][key]' => 'email',
            'criteria[0][value]' => $email,
        ]);
        $results['by_email'] = $response->json();
    }

    // Search by idnumber if provided
    if ($idNumber) {
        $response = Http::get($wsUrl, [
            'wstoken' => $moodleToken,
            'wsfunction' => 'core_user_get_users',
            'moodlewsrestformat' => 'json',
            'criteria[0][key]' => 'idnumber',
            'criteria[0][value]' => $idNumber,
        ]);
        $results['by_idnumber'] = $response->json();
    }

    // Search by lastname (Arabic name search)
    $response = Http::get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_user_get_users',
        'moodlewsrestformat' => 'json',
        'criteria[0][key]' => 'lastname',
        'criteria[0][value]' => '%' . $searchName . '%',
    ]);
    $results['by_lastname'] = $response->json();

    // Get all enrolled students (first 100)
    $response = Http::timeout(30)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_user_get_users',
        'moodlewsrestformat' => 'json',
        'criteria[0][key]' => 'auth',
        'criteria[0][value]' => 'manual',
    ]);
    $allUsers = $response->json();

    // Filter users that might match
    $matchingUsers = [];
    if (isset($allUsers['users'])) {
        foreach ($allUsers['users'] as $user) {
            $fullname = ($user['firstname'] ?? '') . ' ' . ($user['lastname'] ?? '');
            if (stripos($fullname, $searchName) !== false ||
                stripos($user['email'] ?? '', $searchName) !== false ||
                stripos($user['username'] ?? '', 'abdulrahman') !== false ||
                stripos($user['firstname'] ?? '', 'abdulrahman') !== false ||
                stripos($user['lastname'] ?? '', 'abdulrahman') !== false) {
                $matchingUsers[] = $user;
            }
        }
    }

    // If we found a user, get their courses
    $userCourses = [];
    if (!empty($matchingUsers)) {
        foreach ($matchingUsers as $user) {
            $coursesResponse = Http::get($wsUrl, [
                'wstoken' => $moodleToken,
                'wsfunction' => 'core_enrol_get_users_courses',
                'moodlewsrestformat' => 'json',
                'userid' => $user['id'],
            ]);
            $courses = $coursesResponse->json();

            if (!isset($courses['exception'])) {
                $userCourses[$user['id']] = [
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'firstname' => $user['firstname'],
                        'lastname' => $user['lastname'],
                        'fullname' => $user['fullname'] ?? ($user['firstname'] . ' ' . $user['lastname']),
                    ],
                    'courses' => $courses,
                ];
            }
        }
    }

    echo json_encode([
        'success' => true,
        'moodle_url' => $moodleUrl,
        'search_name' => $searchName,
        'total_moodle_users' => count($allUsers['users'] ?? []),
        'matching_users' => $matchingUsers,
        'user_courses' => $userCourses,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
