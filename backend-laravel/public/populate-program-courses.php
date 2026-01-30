<?php
/**
 * Populate program_courses pivot table with existing courses
 * This links courses to their respective programs
 */

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Program;
use App\Models\Course;

header('Content-Type: application/json');

try {
    // Get all programs
    $programs = Program::all();
    $courses = Course::all();

    $results = [
        'programs_processed' => 0,
        'courses_linked' => 0,
        'details' => []
    ];

    foreach ($programs as $program) {
        $programCode = strtolower($program->code);
        $linkedCount = 0;

        foreach ($courses as $course) {
            $courseCode = strtolower($course->code);
            $courseName = strtolower($course->name_en);
            $courseType = 'MAJOR'; // Default type - will be overridden based on course code

            // Determine if this course belongs to this program
            $shouldLink = false;
            $pivotType = 'MAJOR';
            $semester = 1;

            // University requirements (UNIV, GE, UR courses) - link to all bachelor programs
            if (preg_match('/^(univ|ge|ur|eng|arab|isls)\d/i', $courseCode)) {
                if ($program->type === 'BACHELOR') {
                    $shouldLink = true;
                    $pivotType = 'UNIVERSITY';
                    // Assign semesters based on course code
                    if (preg_match('/1\d{2}$/i', $courseCode)) {
                        $semester = 1;
                    } elseif (preg_match('/2\d{2}$/i', $courseCode)) {
                        $semester = 2;
                    } else {
                        $semester = 1;
                    }
                }
            }

            // Business Administration courses
            elseif ($programCode === 'bba' || strpos($programCode, 'business') !== false || strpos($programCode, 'ba') !== false) {
                if (preg_match('/^(bus|acc|mkt|fin|mgmt|ba|mgt|hrm)\d/i', $courseCode) ||
                    strpos($courseName, 'business') !== false ||
                    strpos($courseName, 'management') !== false ||
                    strpos($courseName, 'accounting') !== false ||
                    strpos($courseName, 'marketing') !== false ||
                    strpos($courseName, 'finance') !== false) {
                    $shouldLink = true;
                    $pivotType = 'MAJOR';
                }
            }

            // Artificial Intelligence courses
            elseif (strpos($programCode, 'ai') !== false || strpos($programCode, 'artificial') !== false) {
                if (preg_match('/^(ai|ml|cs|csc|se|comp|it)\d/i', $courseCode) ||
                    strpos($courseName, 'artificial') !== false ||
                    strpos($courseName, 'intelligence') !== false ||
                    strpos($courseName, 'machine') !== false ||
                    strpos($courseName, 'learning') !== false ||
                    strpos($courseName, 'computer') !== false ||
                    strpos($courseName, 'programming') !== false ||
                    strpos($courseName, 'algorithm') !== false ||
                    strpos($courseName, 'data') !== false) {
                    $shouldLink = true;
                    $pivotType = 'MAJOR';
                }
            }

            // Computer Science courses
            elseif (strpos($programCode, 'cs') !== false || strpos($programCode, 'computer') !== false) {
                if (preg_match('/^(cs|csc|se|comp|it|cis)\d/i', $courseCode) ||
                    strpos($courseName, 'computer') !== false ||
                    strpos($courseName, 'software') !== false ||
                    strpos($courseName, 'programming') !== false ||
                    strpos($courseName, 'algorithm') !== false ||
                    strpos($courseName, 'database') !== false) {
                    $shouldLink = true;
                    $pivotType = 'MAJOR';
                }
            }

            // Information Technology courses
            elseif (strpos($programCode, 'it') !== false || strpos($programCode, 'information') !== false) {
                if (preg_match('/^(it|cis|cs|net|sec)\d/i', $courseCode) ||
                    strpos($courseName, 'information') !== false ||
                    strpos($courseName, 'network') !== false ||
                    strpos($courseName, 'security') !== false ||
                    strpos($courseName, 'system') !== false) {
                    $shouldLink = true;
                    $pivotType = 'MAJOR';
                }
            }

            // Health Administration courses
            elseif (strpos($programCode, 'health') !== false || strpos($programCode, 'hsa') !== false || strpos($programCode, 'ha') !== false) {
                if (preg_match('/^(ha|hs|hsa|hlt|hm|ph)\d/i', $courseCode) ||
                    strpos($courseName, 'health') !== false ||
                    strpos($courseName, 'hospital') !== false ||
                    strpos($courseName, 'healthcare') !== false ||
                    strpos($courseName, 'medical') !== false) {
                    $shouldLink = true;
                    $pivotType = 'MAJOR';
                }
            }

            // Link the course if it should be linked
            if ($shouldLink) {
                // Check if already linked
                $exists = DB::table('program_courses')
                    ->where('program_id', $program->id)
                    ->where('course_id', $course->id)
                    ->exists();

                if (!$exists) {
                    // Determine semester based on course code
                    $codeNum = preg_replace('/[^0-9]/', '', $courseCode);
                    if (strlen($codeNum) >= 3) {
                        $level = (int)substr($codeNum, 0, 1);
                        $semester = $level * 2 - 1; // Level 1 = sem 1-2, Level 2 = sem 3-4, etc.
                        if ($semester > 8) $semester = 8;
                        if ($semester < 1) $semester = 1;
                    }

                    DB::table('program_courses')->insert([
                        'program_id' => $program->id,
                        'course_id' => $course->id,
                        'semester' => $semester,
                        'type' => $pivotType,
                        'is_common' => ($pivotType === 'UNIVERSITY'),
                        'order' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $linkedCount++;
                    $results['courses_linked']++;
                }
            }
        }

        if ($linkedCount > 0) {
            $results['details'][] = [
                'program' => $program->code . ' - ' . $program->name_en,
                'courses_linked' => $linkedCount
            ];
            $results['programs_processed']++;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Program courses populated successfully',
        'results' => $results
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
