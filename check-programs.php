<?php
require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';
$app = require_once '/home/sisvertexunivers/laravel-backend/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Available Programs ===\n\n";

$programs = DB::table('programs')->select('id', 'code', 'name_en', 'college_id')->get();
foreach ($programs as $program) {
    echo "ID: {$program->id}, Code: {$program->code}, Name: {$program->name_en}, College: {$program->college_id}\n";
}

echo "\nTotal programs: " . $programs->count() . "\n";
