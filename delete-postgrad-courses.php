<?php
require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';
$app = require_once '/home/sisvertexunivers/laravel-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Master & PhD Programs ===\n";
$programs = App\Models\Program::whereIn('type', ['MASTER', 'PHD', 'DOCTORATE'])->get(['id', 'name_en', 'type']);
foreach($programs as $p) {
    echo $p->id . ' - ' . $p->name_en . ' (' . $p->type . ")\n";
}

$programIds = $programs->pluck('id')->toArray();
echo "\nProgram IDs: " . implode(', ', $programIds) . "\n";

// Check courses directly linked via program_id
echo "\n=== Courses with program_id in these programs ===\n";
$directCourses = App\Models\Course::whereIn('program_id', $programIds)->get(['id', 'code', 'name_en']);
echo "Found " . count($directCourses) . " courses directly linked\n";

// Check program_courses table
echo "\n=== Checking program_courses table ===\n";
$linkedCourses = DB::table('program_courses')->whereIn('program_id', $programIds)->count();
echo "Found $linkedCourses links in program_courses table\n";

// DELETE from both
echo "\n=== DELETING ===\n";

// 1. Delete from program_courses table
$deleted1 = DB::table('program_courses')->whereIn('program_id', $programIds)->delete();
echo "Deleted $deleted1 links from program_courses table\n";

// 2. Delete courses directly linked via program_id (or set program_id to null)
$deleted2 = App\Models\Course::whereIn('program_id', $programIds)->delete();
echo "Deleted $deleted2 courses directly linked via program_id\n";

echo "\n=== DONE ===\n";
