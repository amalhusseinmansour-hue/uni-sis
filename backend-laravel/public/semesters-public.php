<?php
/**
 * Public endpoint for fetching semesters
 * This doesn't require authentication
 */

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
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
    $semesters = Semester::orderBy('year', 'desc')
        ->orderBy('term', 'desc')
        ->get()
        ->map(function ($semester) {
            return [
                'id' => $semester->id,
                'name_en' => $semester->name_en ?? $semester->year . ' - ' . $semester->term,
                'name_ar' => $semester->name_ar ?? $semester->year . ' - ' . $semester->term,
                'year' => $semester->year,
                'term' => $semester->term,
                'start_date' => $semester->start_date,
                'end_date' => $semester->end_date,
                'is_current' => (bool) $semester->is_current,
                'is_active' => (bool) ($semester->is_active ?? true),
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
