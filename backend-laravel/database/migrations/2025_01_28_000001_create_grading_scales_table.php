<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('grading_scales', function (Blueprint $table) {
            $table->id();
            $table->string('letter_grade', 5);
            $table->decimal('min_score', 5, 2);
            $table->decimal('max_score', 5, 2);
            $table->decimal('grade_points', 3, 2);
            $table->string('description_en')->nullable();
            $table->string('description_ar')->nullable();
            $table->boolean('is_passing')->default(true);
            $table->boolean('is_active')->default(true);
            $table->enum('program_type', ['BACHELOR', 'GRADUATE'])->default('BACHELOR');
            $table->timestamps();

            // Index for faster lookups
            $table->index(['program_type', 'is_active']);
            $table->index(['min_score', 'max_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grading_scales');
    }
};
