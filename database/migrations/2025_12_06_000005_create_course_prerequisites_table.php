<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_prerequisites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('prerequisite_id')->constrained('courses')->onDelete('cascade');
            $table->string('min_grade')->nullable(); // Minimum grade required (e.g., 'C', 'D')
            $table->boolean('is_required')->default(true); // Required or recommended
            $table->timestamps();

            // Prevent duplicate prerequisites
            $table->unique(['course_id', 'prerequisite_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_prerequisites');
    }
};
