<?php
/**
 * Public endpoint for fetching semesters
 * This doesn't require authentication
 */

// Path to Laravel backend from public_html
require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Semester;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $semesters = Semester::orderBy('start_date', 'desc')
        ->get()
        ->map(function ($semester) {
            return [
                'id' => $semester->id,
                'name' => $semester->name,
                'name_en' => $semester->name_en ?? $semester->name ?? $semester->academic_year,
                'name_ar' => $semester->name_ar ?? $semester->name ?? $semester->academic_year,
                'academic_year' => $semester->academic_year,
                'start_date' => $semester->start_date,
                'end_date' => $semester->end_date,
                'is_current' => (bool) $semester->is_current,
                'registration_start' => $semester->registration_start,
                'registration_end' => $semester->registration_end,
            ];
        });

    echo json_encode([
        'success' => true,
        'semesters' => $semesters,
        'current' => $semesters->firstWhere('is_current', true),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
