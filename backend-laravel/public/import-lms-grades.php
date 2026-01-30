<?php
/**
 * Import grades from LMS (Moodle) for Fall 2025 semester
 * Matches students by student_code (username) and courses by code
 */

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

// Moodle configuration
$moodleUrl = rtrim(config('services.moodle.url', ''), '/');
$moodleToken = config('services.moodle.token', '');

echo "=== LMS Grades Import for Fall 2025 ===\n\n";
echo "Moodle URL: $moodleUrl\n\n";

// Function to call Moodle API
function callMoodleApi($url, $token, $function, $params = []) {
    $response = Http::timeout(60)->asForm()->post(
        "$url/webservice/rest/server.php",
        array_merge([
            'wstoken' => $token,
            'wsfunction' => $function,
            'moodlewsrestformat' => 'json',
        ], $params)
    );

    if ($response->failed()) {
        throw new Exception("Moodle API request failed: " . $response->status());
    }

    $data = $response->json();

    if (isset($data['exception'])) {
        throw new Exception("Moodle API error: " . ($data['message'] ?? 'Unknown error'));
    }

    return $data;
}

// Function to calculate letter grade from percentage
function calculateGrade($percentage) {
    if ($percentage >= 95) return ['grade' => 'A+', 'points' => 4.0];
    if ($percentage >= 90) return ['grade' => 'A', 'points' => 4.0];
    if ($percentage >= 85) return ['grade' => 'A-', 'points' => 3.7];
    if ($percentage >= 80) return ['grade' => 'B+', 'points' => 3.3];
    if ($percentage >= 75) return ['grade' => 'B', 'points' => 3.0];
    if ($percentage >= 70) return ['grade' => 'B-', 'points' => 2.7];
    if ($percentage >= 65) return ['grade' => 'C+', 'points' => 2.3];
    if ($percentage >= 60) return ['grade' => 'C', 'points' => 2.0];
    if ($percentage >= 55) return ['grade' => 'C-', 'points' => 1.7];
    if ($percentage >= 50) return ['grade' => 'D+', 'points' => 1.3];
    if ($percentage >= 45) return ['grade' => 'D', 'points' => 1.0];
    return ['grade' => 'F', 'points' => 0.0];
}

try {
    // Find Fall 2025 semester
    $semester = DB::table('semesters')
        ->where(function($q) {
            $q->where('name', 'like', '%Fall%2025%')
              ->orWhere('name', 'like', '%fall%2025%')
              ->orWhere('name_en', 'like', '%Fall%2025%')
              ->orWhere('name_ar', 'like', '%خريف%2025%');
        })
        ->first();

    if (!$semester) {
        echo "Fall 2025 semester not found.\n";
        exit(1);
    }

    echo "Found semester: {$semester->name_en} (ID: {$semester->id})\n\n";

    // Step 1: Get all Moodle users
    echo "Fetching users from Moodle...\n";
    $moodleUsers = callMoodleApi($moodleUrl, $moodleToken, 'core_user_get_users', [
        'criteria[0][key]' => 'suspended',
        'criteria[0][value]' => '0',
    ]);

    $users = $moodleUsers['users'] ?? [];
    echo "Found " . count($users) . " users in Moodle\n";

    // Create email and username to Moodle user ID mapping
    $emailToMoodleId = [];
    $usernameToMoodleId = [];
    foreach ($users as $user) {
        if (!empty($user['email'])) {
            $emailToMoodleId[strtolower($user['email'])] = $user['id'];
        }
        if (!empty($user['username'])) {
            $usernameToMoodleId[strtolower($user['username'])] = $user['id'];
        }
    }

    // Step 2: Get all Moodle courses
    echo "Fetching courses from Moodle...\n";
    $moodleCourses = callMoodleApi($moodleUrl, $moodleToken, 'core_course_get_courses', []);
    echo "Found " . count($moodleCourses) . " courses in Moodle\n";

    // Create shortname to Moodle course ID mapping
    $codeToMoodleCourse = [];
    $moodleCourseCodes = [];
    foreach ($moodleCourses as $course) {
        if (!empty($course['shortname'])) {
            $code = strtoupper($course['shortname']);
            $codeToMoodleCourse[$code] = [
                'id' => $course['id'],
                'fullname' => $course['fullname'],
            ];
            $moodleCourseCodes[] = $code;
        }
    }

    echo "Moodle courses: " . count($moodleCourseCodes) . "\n";

    // Debug: Show Moodle course ID mapping
    echo "\nMoodle Course ID Mapping:\n";
    foreach (array_slice($codeToMoodleCourse, 0, 15, true) as $code => $info) {
        echo "  $code => Moodle ID: {$info['id']}\n";
    }
    echo "\n";

    // Step 3: Get all enrollments for Fall 2025
    $enrollments = DB::table('enrollments')
        ->join('students', 'enrollments.student_id', '=', 'students.id')
        ->join('courses', 'enrollments.course_id', '=', 'courses.id')
        ->leftJoin('programs', 'students.program_id', '=', 'programs.id')
        ->where('enrollments.semester_id', $semester->id)
        ->select(
            'enrollments.id as enrollment_id',
            'enrollments.student_id',
            'enrollments.course_id',
            'enrollments.semester_id',
            'students.student_id as student_code',
            'students.name_en as student_name',
            'students.university_email',
            'students.personal_email',
            'courses.code as course_code',
            'courses.name_en as course_name',
            'courses.credits',
            'programs.type as program_type'
        )
        ->get();

    echo "Found " . count($enrollments) . " enrollments for Fall 2025\n\n";


    // Step 4: Process each enrollment
    $imported = 0;
    $noUserMatch = 0;
    $noCourseMatch = 0;
    $noGrade = 0;
    $errors = [];
    $matchedByUsername = 0;
    $matchedByEmail = 0;

    foreach ($enrollments as $enrollment) {
        $moodleUserId = null;

        // Try to match by student_code (SIS) = username (Moodle)
        $studentCode = strtolower($enrollment->student_code ?? '');
        if (isset($usernameToMoodleId[$studentCode])) {
            $moodleUserId = $usernameToMoodleId[$studentCode];
            $matchedByUsername++;
        }

        // Fallback to email matching
        if (!$moodleUserId) {
            $email = strtolower($enrollment->university_email ?? $enrollment->personal_email ?? '');
            if (isset($emailToMoodleId[$email])) {
                $moodleUserId = $emailToMoodleId[$email];
                $matchedByEmail++;
            }
        }

        if (!$moodleUserId) {
            $noUserMatch++;
            continue;
        }

        // Find Moodle course by code
        $courseCode = strtoupper($enrollment->course_code);
        if (!isset($codeToMoodleCourse[$courseCode])) {
            $noCourseMatch++;
            continue;
        }
        $moodleCourseId = $codeToMoodleCourse[$courseCode]['id'];

        try {
            // Try multiple API methods to get grades
            $totalGrade = null;
            $gradeMax = 100;

            // Method 1: Try gradereport_overview_get_course_grades
            try {
                $grades = callMoodleApi($moodleUrl, $moodleToken, 'gradereport_overview_get_course_grades', [
                    'userid' => $moodleUserId,
                ]);

                // Debug: Show raw response for first few
                if ($imported < 3) {
                    echo "DEBUG: Looking for Moodle course ID: $moodleCourseId (SIS code: {$enrollment->course_code})\n";
                    echo "DEBUG API Response for {$enrollment->student_code}:\n";
                    echo json_encode($grades, JSON_PRETTY_PRINT) . "\n\n";
                }

                $courseGrades = $grades['grades'] ?? [];
                foreach ($courseGrades as $cg) {
                    if (($cg['courseid'] ?? 0) == $moodleCourseId) {
                        $totalGrade = $cg['rawgrade'] ?? $cg['grade'] ?? null;
                        $gradeMax = $cg['grademax'] ?? 100;
                        break;
                    }
                }
            } catch (Exception $e1) {
                // Method 2: Try core_grades_get_grades
                try {
                    $grades = callMoodleApi($moodleUrl, $moodleToken, 'core_grades_get_grades', [
                        'courseid' => $moodleCourseId,
                        'userids[0]' => $moodleUserId,
                    ]);

                    $items = $grades['items'] ?? [];
                    foreach ($items as $item) {
                        if (($item['itemtype'] ?? '') === 'course') {
                            $itemGrades = $item['grades'] ?? [];
                            foreach ($itemGrades as $ig) {
                                if (($ig['userid'] ?? 0) == $moodleUserId) {
                                    $totalGrade = $ig['grade'] ?? null;
                                    $gradeMax = $item['grademax'] ?? 100;
                                    break 2;
                                }
                            }
                        }
                    }
                } catch (Exception $e2) {
                    // Method 3: Original method - gradereport_user_get_grade_items
                    $grades = callMoodleApi($moodleUrl, $moodleToken, 'gradereport_user_get_grade_items', [
                        'courseid' => $moodleCourseId,
                        'userid' => $moodleUserId,
                    ]);

                    $userGrades = $grades['usergrades'] ?? [];
                    foreach ($userGrades as $userGrade) {
                        if ($userGrade['userid'] == $moodleUserId) {
                            $gradeItems = $userGrade['gradeitems'] ?? [];
                            foreach ($gradeItems as $item) {
                                if (($item['itemtype'] ?? '') === 'course') {
                                    $totalGrade = $item['graderaw'] ?? null;
                                    $gradeMax = $item['grademax'] ?? 100;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if ($totalGrade === null || $totalGrade === '') {
                $noGrade++;
                continue;
            }

            // Ensure numeric types for calculation
            $totalGrade = floatval($totalGrade);
            $gradeMax = floatval($gradeMax);

            // Calculate percentage and letter grade
            $percentage = ($gradeMax > 0) ? ($totalGrade / $gradeMax) * 100 : 0;
            $gradeInfo = calculateGrade($percentage);

            // Insert or update grade
            DB::table('grades')->updateOrInsert(
                [
                    'enrollment_id' => $enrollment->enrollment_id,
                ],
                [
                    'student_id' => $enrollment->student_id,
                    'course_id' => $enrollment->course_id,
                    'semester_id' => $enrollment->semester_id,
                    'semester' => 'Fall2025',
                    'midterm' => null,
                    'final' => null,
                    'coursework' => null,
                    'total' => round($percentage, 2),
                    'grade' => $gradeInfo['grade'],
                    'points' => $gradeInfo['points'],
                    'status' => 'APPROVED',
                    'remarks' => 'Imported from Moodle LMS',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $imported++;
            echo "✓ {$enrollment->student_code} ({$enrollment->student_name}) - {$enrollment->course_code}: " . round($percentage, 1) . "% ({$gradeInfo['grade']})\n";

        } catch (Exception $e) {
            $errors[] = "{$enrollment->student_code} - {$enrollment->course_code}: " . $e->getMessage();
        }
    }

    echo "\n=== IMPORT COMPLETE ===\n";
    echo "Imported: $imported\n";
    echo "  - Matched by username (student_code): $matchedByUsername\n";
    echo "  - Matched by email: $matchedByEmail\n";
    echo "No user match: $noUserMatch\n";
    echo "No course match (code): $noCourseMatch\n";
    echo "No grade in Moodle: $noGrade\n";
    echo "Errors: " . count($errors) . "\n";

    if (!empty($errors)) {
        echo "\nFirst 5 errors:\n";
        foreach (array_slice($errors, 0, 5) as $error) {
            echo "- $error\n";
        }
    }

    // Sync tables for future use
    echo "\n=== Syncing Moodle Tables ===\n";
    $syncedUsers = 0;
    foreach ($users as $mUser) {
        $email = strtolower($mUser['email'] ?? '');
        if (empty($email)) continue;

        $student = DB::table('students')
            ->whereRaw('LOWER(university_email) = ?', [$email])
            ->orWhereRaw('LOWER(personal_email) = ?', [$email])
            ->first();

        if ($student) {
            DB::table('moodle_users')->updateOrInsert(
                ['student_id' => $student->id],
                [
                    'moodle_user_id' => $mUser['id'],
                    'user_type' => 'student',
                    'username' => $mUser['username'] ?? $email,
                    'sync_status' => 'synced',
                    'last_synced_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
            $syncedUsers++;
        }
    }
    echo "Synced $syncedUsers users to moodle_users table\n";

    $syncedCourses = 0;
    foreach ($moodleCourses as $mCourse) {
        $code = strtoupper($mCourse['shortname'] ?? '');
        if (empty($code)) continue;

        $course = DB::table('courses')
            ->whereRaw('UPPER(code) = ?', [$code])
            ->first();

        if ($course) {
            DB::table('moodle_courses')->updateOrInsert(
                ['course_id' => $course->id],
                [
                    'moodle_course_id' => $mCourse['id'],
                    'shortname' => $mCourse['shortname'],
                    'sync_status' => 'synced',
                    'last_synced_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
            $syncedCourses++;
        }
    }
    echo "Synced $syncedCourses courses to moodle_courses table\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
