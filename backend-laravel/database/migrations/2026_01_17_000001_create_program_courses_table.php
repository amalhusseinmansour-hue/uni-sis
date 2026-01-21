<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->integer('semester')->default(1); // Which semester in the study plan (1-8 for bachelor)
            $table->enum('type', ['REQUIRED', 'ELECTIVE', 'UNIVERSITY', 'COLLEGE', 'MAJOR'])->default('REQUIRED');
            $table->boolean('is_common')->default(false); // True for courses common to all programs
            $table->integer('order')->default(0); // Display order within the semester
            $table->timestamps();

            // Ensure a course can only be added once per program
            $table->unique(['program_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_courses');
    }
};
