<?php
require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';
$app = require_once '/home/sisvertexunivers/laravel-backend/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Course;
use Illuminate\Support\Facades\DB;

echo "=== Testing Course Creation ===\n\n";

// Create a test course
$courseData = [
    'code' => 'TEST-' . rand(1000, 9999),
    'name_en' => 'Test Course with Programs',
    'name_ar' => 'مادة تجريبية مع برامج',
    'description' => 'This is a test course',
    'credits' => 3,
    'capacity' => 30,
    'college_id' => 1,
    'is_active' => true,
];

echo "1. Creating course...\n";
$course = Course::create($courseData);
echo "   Course created with ID: {$course->id}, Code: {$course->code}\n";

// Attach real programs (IDs 1, 3, 5 - from College 1)
$programIds = [1, 3, 5];
$courseType = 'UNIVERSITY';

echo "\n2. Attaching programs IDs: " . implode(', ', $programIds) . " with type: {$courseType}\n";
$course->programs()->attach($programIds, ['type' => $courseType, 'semester' => 1]);

// Verify
$course->load('programs');
echo "\n3. Verification - Course programs:\n";
foreach ($course->programs as $program) {
    echo "   - ID: {$program->id}, Code: {$program->code}, Name: {$program->name_en}, Type: {$program->pivot->type}\n";
}

// Check in database directly
echo "\n4. Direct DB check - program_courses entries for course {$course->id}:\n";
$entries = DB::table('program_courses')->where('course_id', $course->id)->get();
foreach ($entries as $entry) {
    echo "   - Program ID: {$entry->program_id}, Type: {$entry->type}, Semester: {$entry->semester}\n";
}

echo "\n=== Test Complete - SUCCESS ===\n";
