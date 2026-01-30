<?php
require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';
$app = require_once '/home/sisvertexunivers/laravel-backend/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Fixing ENUM ===\n\n";

// Add GRADUATION to enum
try {
    DB::statement("ALTER TABLE program_courses MODIFY COLUMN type ENUM('REQUIRED','ELECTIVE','UNIVERSITY','COLLEGE','MAJOR','GRADUATION') DEFAULT 'MAJOR'");
    echo "GRADUATION added to enum successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Verify
$columns = DB::select("SHOW COLUMNS FROM program_courses WHERE Field = 'type'");
echo "\nUpdated enum values: " . $columns[0]->Type . "\n";

echo "\n=== Done ===\n";
