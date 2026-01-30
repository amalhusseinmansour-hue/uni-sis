<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Discipline Points - سجل النقاط السلوكية
     * Tracks cumulative discipline points per student per semester
     */
    public function up(): void
    {
        Schema::create('discipline_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->nullable()->constrained()->nullOnDelete();

            // Points Summary
            $table->integer('total_points')->default(0);
            $table->integer('active_points')->default(0); // Points that haven't expired
            $table->integer('expired_points')->default(0);
            $table->integer('reduced_points')->default(0); // Points reduced through good behavior/appeal

            // Thresholds Tracking
            $table->boolean('warning_1_issued')->default(false); // 10 points
            $table->timestamp('warning_1_issued_at')->nullable();
            $table->boolean('warning_2_issued')->default(false); // 20 points
            $table->timestamp('warning_2_issued_at')->nullable();
            $table->boolean('suspension_issued')->default(false); // 30 points
            $table->timestamp('suspension_issued_at')->nullable();
            $table->boolean('expulsion_recommended')->default(false); // 50 points
            $table->timestamp('expulsion_recommended_at')->nullable();

            // Status
            $table->enum('status', [
                'GOOD_STANDING',  // وضع جيد (0-9 نقاط)
                'WARNING_1',      // إنذار أول (10-19 نقاط)
                'WARNING_2',      // إنذار ثاني (20-29 نقاط)
                'PROBATION',      // مراقبة (30-49 نقاط)
                'CRITICAL',       // حرج (50+ نقاط)
            ])->default('GOOD_STANDING');

            // Notes
            $table->text('notes')->nullable();

            $table->timestamps();

            // Unique constraint - one record per student per semester
            $table->unique(['student_id', 'semester_id']);

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index('total_points');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discipline_points');
    }
};
