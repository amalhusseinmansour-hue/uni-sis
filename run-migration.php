<?php
require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';
$app = require_once '/home/sisvertexunivers/laravel-backend/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Check if program_id column exists
$hasProgramId = Schema::hasColumn('courses', 'program_id');
echo "program_id column exists: " . ($hasProgramId ? 'Yes' : 'No') . "\n";

if (!$hasProgramId) {
    echo "Adding program_id column...\n";
    try {
        Schema::table('courses', function ($table) {
            $table->foreignId('program_id')->nullable()->after('department_id')->constrained()->onDelete('set null');
        });
        echo "program_id column added successfully!\n";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

echo "\nClearing cache...\n";
Artisan::call('cache:clear');
echo Artisan::output();

Artisan::call('config:clear');
echo Artisan::output();

echo "Done!\n";
