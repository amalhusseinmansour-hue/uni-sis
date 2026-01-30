<?php
/**
 * Fix semester values for program_courses based on course codes
 * This assigns proper semester numbers (1-8) based on course level
 */

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Course;

header('Content-Type: application/json');

try {
    $results = [
        'updated' => 0,
        'details' => []
    ];

    // Get all program_courses entries
    $programCourses = DB::table('program_courses')
        ->join('courses', 'courses.id', '=', 'program_courses.course_id')
        ->select('program_courses.id', 'program_courses.program_id', 'program_courses.course_id',
                 'program_courses.semester as current_semester', 'program_courses.type',
                 'courses.code', 'courses.name_en')
        ->get();

    foreach ($programCourses as $pc) {
        $courseCode = strtolower($pc->code);
        $newSemester = 1;

        // Determine semester based on course code number pattern
        // e.g., BUS101 = level 1, BUS201 = level 2, etc.
        if (preg_match('/(\d)(\d{2})$/', $courseCode, $matches)) {
            $level = (int)$matches[1];
            $subCode = (int)$matches[2];

            // Level 1 (100-199) = semesters 1-2
            // Level 2 (200-299) = semesters 3-4
            // Level 3 (300-399) = semesters 5-6
            // Level 4 (400-499) = semesters 7-8

            if ($level == 1) {
                $newSemester = ($subCode < 50) ? 1 : 2;
            } elseif ($level == 2) {
                $newSemester = ($subCode < 50) ? 3 : 4;
            } elseif ($level == 3) {
                $newSemester = ($subCode < 50) ? 5 : 6;
            } elseif ($level == 4) {
                $newSemester = ($subCode < 50) ? 7 : 8;
            }
        }

        // University requirements usually in early semesters
        if (preg_match('/^(univ|ge|ur|eng|arab|isls)/i', $courseCode)) {
            if (preg_match('/1\d{2}$/', $courseCode)) {
                $newSemester = 1;
            } elseif (preg_match('/2\d{2}$/', $courseCode)) {
                $newSemester = 2;
            }
        }

        // Update if different
        if ($pc->current_semester != $newSemester) {
            DB::table('program_courses')
                ->where('id', $pc->id)
                ->update(['semester' => $newSemester, 'updated_at' => now()]);

            $results['details'][] = [
                'course' => $pc->code . ' - ' . $pc->name_en,
                'old_semester' => $pc->current_semester,
                'new_semester' => $newSemester
            ];
            $results['updated']++;
        }
    }

    // Also get summary of semesters per program
    $semesterSummary = DB::table('program_courses')
        ->join('programs', 'programs.id', '=', 'program_courses.program_id')
        ->select('programs.code as program_code', 'programs.name_en as program_name',
                 DB::raw('COUNT(*) as total_courses'),
                 DB::raw('GROUP_CONCAT(DISTINCT program_courses.semester ORDER BY program_courses.semester) as semesters'))
        ->groupBy('programs.id', 'programs.code', 'programs.name_en')
        ->get();

    echo json_encode([
        'success' => true,
        'message' => 'Semesters updated successfully',
        'results' => $results,
        'semester_summary' => $semesterSummary
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
