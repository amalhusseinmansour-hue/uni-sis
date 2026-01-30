<?php
/**
 * Sync grades from LMS (Moodle) to SIS for first semester
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
set_time_limit(600);

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Student;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\Grade;
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

    // First semester (Fall 2025)
    $semester1 = Semester::find(2);
    if (!$semester1) {
        echo json_encode(['success' => false, 'message' => 'Semester not found']);
        exit;
    }

    // Get all active students
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

    // Get all Moodle courses
    $response = Http::timeout(60)->get($wsUrl, [
        'wstoken' => $moodleToken,
        'wsfunction' => 'core_course_get_courses',
        'moodlewsrestformat' => 'json',
    ]);
    $moodleCourses = $response->json();

    $courseMap = [];
    foreach ($moodleCourses as $mc) {
        $courseMap[$mc['id']] = $mc;
    }

    // Letter grade conversion
    function scoreToLetterGrade($score) {
        if ($score >= 95) return ['letter' => 'A+', 'points' => 4.0];
        if ($score >= 90) return ['letter' => 'A', 'points' => 4.0];
        if ($score >= 85) return ['letter' => 'A-', 'points' => 3.7];
        if ($score >= 80) return ['letter' => 'B+', 'points' => 3.3];
        if ($score >= 75) return ['letter' => 'B', 'points' => 3.0];
        if ($score >= 70) return ['letter' => 'B-', 'points' => 2.7];
        if ($score >= 65) return ['letter' => 'C+', 'points' => 2.3];
        if ($score >= 60) return ['letter' => 'C', 'points' => 2.0];
        if ($score >= 55) return ['letter' => 'C-', 'points' => 1.7];
        if ($score >= 50) return ['letter' => 'D+', 'points' => 1.3];
        if ($score >= 45) return ['letter' => 'D', 'points' => 1.0];
        return ['letter' => 'F', 'points' => 0.0];
    }

    // Check if course is first semester (odd last digit)
    function isFirstSemesterCourse($courseCode) {
        if (preg_match('/(\d)$/', $courseCode, $matches)) {
            return (int)$matches[1] % 2 == 1;
        }
        return true; // Default to first semester
    }

    $results = [
        'semester' => [
            'id' => $semester1->id,
            'name' => $semester1->name_en,
            'name_ar' => $semester1->name_ar,
        ],
        'total_students' => $students->count(),
        'students_processed' => 0,
        'students_with_grades' => 0,
        'grades_created' => 0,
        'grades_updated' => 0,
        'grade_details' => [],
        'errors' => [],
    ];

    foreach ($students as $student) {
        $results['students_processed']++;
        $moodleUserId = $moodleUserMap[$student->student_id] ?? null;

        if (!$moodleUserId) continue;

        // Get grades using gradereport_overview_get_course_grades
        $response = Http::timeout(30)->get($wsUrl, [
            'wstoken' => $moodleToken,
            'wsfunction' => 'gradereport_overview_get_course_grades',
            'moodlewsrestformat' => 'json',
            'userid' => $moodleUserId,
        ]);
        $gradeData = $response->json();

        if (isset($gradeData['exception']) || empty($gradeData['grades'])) continue;

        $hasGrades = false;

        foreach ($gradeData['grades'] as $courseGrade) {
            // Skip if no grade
            if ($courseGrade['rawgrade'] === null || $courseGrade['grade'] === '-') continue;

            $moodleCourseId = $courseGrade['courseid'];
            $rawGrade = (float)$courseGrade['rawgrade'];

            // Get course info
            $moodleCourse = $courseMap[$moodleCourseId] ?? null;
            if (!$moodleCourse) continue;

            $courseCode = $moodleCourse['shortname'];

            // Only first semester courses
            if (!isFirstSemesterCourse($courseCode)) continue;

            $hasGrades = true;

            // Find or create SIS course
            $sisCourse = Course::where('code', $courseCode)->first();
            if (!$sisCourse) {
                $sisCourse = Course::create([
                    'code' => $courseCode,
                    'name_en' => $moodleCourse['fullname'],
                    'name_ar' => $moodleCourse['fullname'],
                    'credits' => 3,
                    'is_active' => true,
                    'moodle_id' => $moodleCourseId,
                ]);
            }

            // Get letter grade
            $letterInfo = scoreToLetterGrade($rawGrade);

            // Check existing grade
            $existingGrade = Grade::where('student_id', $student->id)
                ->where('course_id', $sisCourse->id)
                ->where('semester_id', $semester1->id)
                ->first();

            $gradeRecord = [
                'student_id' => $student->id,
                'course_id' => $sisCourse->id,
                'semester_id' => $semester1->id,
                'semester' => $semester1->name_en ?? 'Fall 2025',
                'total' => $rawGrade,
                'grade' => $letterInfo['letter'],
                'points' => $letterInfo['points'],
                'status' => 'APPROVED',
            ];

            try {
                if ($existingGrade) {
                    $existingGrade->update($gradeRecord);
                    $results['grades_updated']++;
                } else {
                    Grade::create($gradeRecord);
                    $results['grades_created']++;
                }

                $results['grade_details'][] = [
                    'student_id' => $student->student_id,
                    'student_name' => $student->name_en ?? $student->name_ar,
                    'course_code' => $courseCode,
                    'course_name' => $moodleCourse['fullname'],
                    'total' => $rawGrade,
                    'letter' => $letterInfo['letter'],
                    'gpa_points' => $letterInfo['points'],
                ];
            } catch (Exception $e) {
                $results['errors'][] = [
                    'student' => $student->student_id,
                    'course' => $courseCode,
                    'error' => $e->getMessage(),
                ];
            }
        }

        if ($hasGrades) {
            $results['students_with_grades']++;
        }
    }

    // Limit output
    if (count($results['grade_details']) > 100) {
        $results['grade_details'] = array_slice($results['grade_details'], 0, 100);
        $results['note'] = 'Showing first 100 grades only.';
    }

    $results['success'] = true;
    $results['total_grades'] = $results['grades_created'] + $results['grades_updated'];

    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
