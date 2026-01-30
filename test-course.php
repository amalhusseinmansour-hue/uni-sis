<?php
require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';
$app = require_once '/home/sisvertexunivers/laravel-backend/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Course;
use Illuminate\Support\Facades\DB;

echo "=== Testing Course System ===\n\n";

// 1. Check courses table structure
echo "1. Courses table columns:\n";
$columns = DB::select("SHOW COLUMNS FROM courses");
foreach ($columns as $col) {
    echo "   - {$col->Field} ({$col->Type})\n";
}

// 2. Check program_courses table structure
echo "\n2. Program_courses table columns:\n";
$columns = DB::select("SHOW COLUMNS FROM program_courses");
foreach ($columns as $col) {
    echo "   - {$col->Field} ({$col->Type})\n";
}

// 3. Get last 5 courses
echo "\n3. Last 5 courses:\n";
$courses = Course::with('programs')->orderBy('id', 'desc')->take(5)->get();
foreach ($courses as $course) {
    echo "   ID: {$course->id}, Code: {$course->code}, Name: {$course->name_en}\n";
    echo "      College ID: {$course->college_id}\n";
    if ($course->programs->count() > 0) {
        echo "      Programs:\n";
        foreach ($course->programs as $program) {
            echo "         - {$program->name_en} (Type: {$program->pivot->type})\n";
        }
    } else {
        echo "      Programs: None\n";
    }
}

// 4. Check program_courses entries
echo "\n4. Last 10 program_courses entries:\n";
$entries = DB::table('program_courses')->orderBy('id', 'desc')->take(10)->get();
foreach ($entries as $entry) {
    echo "   Course ID: {$entry->course_id}, Program ID: {$entry->program_id}, Type: {$entry->type}\n";
}

echo "\n=== Done ===\n";
