<?php
require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Semester;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$semesters = Semester::orderBy('id')->get(['id', 'name', 'name_en', 'name_ar', 'academic_year', 'is_current']);
echo json_encode(['semesters' => $semesters], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
