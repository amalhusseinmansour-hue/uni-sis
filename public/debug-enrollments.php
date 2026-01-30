<?php
/**
 * Debug endpoint to check enrollments table
 */

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Get all enrollments
    $enrollments = DB::table('enrollments')
        ->select('enrollments.*', 'students.student_id as student_code', 'students.name_en as student_name', 'courses.code as course_code', 'courses.name_en as course_name')
        ->leftJoin('students', 'enrollments.student_id', '=', 'students.id')
        ->leftJoin('courses', 'enrollments.course_id', '=', 'courses.id')
        ->orderBy('enrollments.created_at', 'desc')
        ->limit(50)
        ->get();

    $total = DB::table('enrollments')->count();

    echo json_encode([
        'success' => true,
        'total_enrollments' => $total,
        'recent_enrollments' => $enrollments,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
