<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('enrollment_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('semester');
            $table->decimal('midterm', 5, 2)->nullable();
            $table->decimal('final', 5, 2)->nullable();
            $table->decimal('coursework', 5, 2)->nullable();
            $table->decimal('total', 5, 2)->nullable();
            $table->string('grade')->nullable(); // A, B+, B, C+, C, D+, D, F
            $table->decimal('points', 3, 2)->nullable(); // 4.0, 3.5, 3.0, etc.
            $table->timestamps();

            $table->unique(['student_id', 'course_id', 'semester'], 'unique_grade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
