<?php
require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';
$app = require_once '/home/sisvertexunivers/laravel-backend/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

$hasTable = Schema::hasTable('program_courses');
echo "program_courses table exists: " . ($hasTable ? 'Yes' : 'No') . "\n";

if (!$hasTable) {
    echo "Creating program_courses table...\n";
    Schema::create('program_courses', function ($table) {
        $table->id();
        $table->foreignId('program_id')->constrained()->onDelete('cascade');
        $table->foreignId('course_id')->constrained()->onDelete('cascade');
        $table->integer('semester')->default(1);
        $table->enum('type', ['REQUIRED', 'ELECTIVE', 'UNIVERSITY', 'COLLEGE', 'MAJOR'])->default('MAJOR');
        $table->boolean('is_common')->default(false);
        $table->integer('order')->default(0);
        $table->timestamps();
        $table->unique(['program_id', 'course_id']);
    });
    echo "Table created!\n";
}

echo "Done!\n";
