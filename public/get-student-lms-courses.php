<?php
/**
 * Get student courses from LMS (Moodle)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Student;
use App\Models\MoodleUser;
use Illuminate\Support\Facades\Http;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $searchName = $_GET['name'] ?? '';
    $studentId = $_GET['student_id'] ?? '';

    // Find student
    $student = null;

    if ($studentId) {
        $student = Student::find($studentId);
    } elseif ($searchName) {
        $student = Student::where('name_ar', 'LIKE', "%{$searchName}%")
            ->orWhere('name_en', 'LIKE', "%{$searchName}%")
            ->orWhere('first_name_ar', 'LIKE', "%{$searchName}%")
            ->orWhere('last_name_ar', 'LIKE', "%{$searchName}%")
            ->first();
    }

    if (!$student) {
        // List available students for debugging
        $students = Student::select('id', 'student_id', 'full_name_ar', 'full_name_en')
            ->limit(20)
            ->get();

        echo json_encode([
            'success' => false,
            'message' => 'Student not found',
            'search' => $searchName ?: $studentId,
            'available_students' => $students
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Get Moodle configuration
    $moodleUrl = config('services.moodle.url');
    $moodleToken = config('services.moodle.token');

    if (!$moodleUrl || !$moodleToken) {
        echo json_encode([
            'success' => false,
            'message' => 'Moodle not configured',
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'name_ar' => $student->name_ar,
                'name_en' => $student->name_en,
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Get Moodle user for this student
    $moodleUser = MoodleUser::where('student_id', $student->id)->first();

    // If no MoodleUser record, try to find by username pattern
    if (!$moodleUser || !$moodleUser->moodle_id) {
        // Generate expected username
        $username = strtolower(str_replace(' ', '.', $student->name_en ?? ''));
        if (empty($username)) {
            $username = 'student' . $student->student_id;
        }

        // Try to find user in Moodle by email or username
        $findUserUrl = rtrim($moodleUrl, '/') . '/webservice/rest/server.php';

        $response = Http::get($findUserUrl, [
            'wstoken' => $moodleToken,
            'wsfunction' => 'core_user_get_users',
            'moodlewsrestformat' => 'json',
            'criteria[0][key]' => 'email',
            'criteria[0][value]' => $student->email ?? '',
        ]);

        $userData = $response->json();

        if (empty($userData['users'])) {
            // Try by ID pattern
            $response = Http::get($findUserUrl, [
                'wstoken' => $moodleToken,
                'wsfunction' => 'core_user_get_users',
                'moodlewsrestformat' => 'json',
                'criteria[0][key]' => 'idnumber',
                'criteria[0][value]' => $student->student_id,
            ]);
            $userData = $response->json();
        }

        if (!empty($userData['users'])) {
            $moodleUserId = $userData['users'][0]['id'];

            // Save for future use
            if (!$moodleUser) {
                $moodleUser = MoodleUser::create([
                    'student_id' => $student->id,
                    'moodle_id' => $moodleUserId,
                    'username' => $userData['users'][0]['username'] ?? $username,
                    'user_type' => 'STUDENT',
                    'sync_status' => 'SYNCED',
                ]);
            } else {
                $moodleUser->update([
                    'moodle_id' => $moodleUserId,
                    'sync_status' => 'SYNCED',
                ]);
            }
        }
    }

    if (!$moodleUser || !$moodleUser->moodle_id) {
        echo json_encode([
            'success' => false,
            'message' => 'Student not found in LMS',
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'name_ar' => $student->name_ar,
                'name_en' => $student->name_en,
                'email' => $student->email,
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Get courses from Moodle
    $coursesUrl = rtrim($moodleUrl, '/') . '/webservice/rest/server.php';

    $response = Http::get($coursesUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_enrol_get_users_courses',
        'moodlewsrestformat' => 'json',
        'userid' => $moodleUser->moodle_id,
    ]);

    $courses = $response->json();

    if (isset($courses['exception'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Moodle API error: ' . ($courses['message'] ?? 'Unknown error'),
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'name_ar' => $student->name_ar,
                'moodle_id' => $moodleUser->moodle_id,
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Format courses
    $formattedCourses = [];
    foreach ($courses as $course) {
        $formattedCourses[] = [
            'moodle_id' => $course['id'],
            'shortname' => $course['shortname'] ?? '',
            'fullname' => $course['fullname'] ?? '',
            'displayname' => $course['displayname'] ?? $course['fullname'] ?? '',
            'category' => $course['category'] ?? null,
            'progress' => $course['progress'] ?? 0,
            'completed' => $course['completed'] ?? false,
            'startdate' => isset($course['startdate']) ? date('Y-m-d', $course['startdate']) : null,
            'enddate' => isset($course['enddate']) && $course['enddate'] > 0 ? date('Y-m-d', $course['enddate']) : null,
        ];
    }

    echo json_encode([
        'success' => true,
        'student' => [
            'id' => $student->id,
            'student_id' => $student->student_id,
            'name_ar' => $student->name_ar,
            'name_en' => $student->name_en,
            'moodle_id' => $moodleUser->moodle_id,
        ],
        'total_courses' => count($formattedCourses),
        'courses' => $formattedCourses,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
