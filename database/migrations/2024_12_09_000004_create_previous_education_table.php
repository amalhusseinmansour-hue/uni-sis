<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Previous Education - التعليم السابق
     * Stores all previous education history for students
     * Supports high school, bachelor's, master's, and other qualifications
     */
    public function up(): void
    {
        Schema::create('previous_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            // Education Level/Type
            $table->enum('education_level', [
                'HIGH_SCHOOL',      // ثانوية عامة
                'DIPLOMA',          // دبلوم
                'BACHELOR',         // بكالوريوس
                'MASTER',           // ماجستير
                'PHD',              // دكتوراه
                'PROFESSIONAL',     // شهادة مهنية
                'OTHER'             // أخرى
            ]);

            // For High School
            $table->enum('certificate_type', [
                'TAWJIHI',          // توجيهي
                'EQUIVALENT',       // معادلة
                'INTERNATIONAL',    // دولية (IB, SAT, etc.)
                'GED',              // General Educational Development
                'BRITISH',          // British System (IGCSE, A-Levels)
                'AMERICAN',         // American High School Diploma
                'OTHER'
            ])->nullable();

            $table->enum('high_school_track', [
                'SCIENTIFIC',       // علمي
                'LITERARY',         // أدبي
                'RELIGIOUS',        // شرعي
                'TECHNOLOGY',       // تكنولوجيا
                'COMMERCIAL',       // تجاري
                'INDUSTRIAL',       // صناعي
                'AGRICULTURAL',     // زراعي
                'NURSING',          // تمريض
                'HOTEL_MANAGEMENT', // إدارة فندقية
                'OTHER'
            ])->nullable();

            // Institution Info
            $table->string('country');
            $table->string('city')->nullable();
            $table->string('institution_name');        // School/University name
            $table->string('institution_name_en')->nullable();

            // Program/Specialization (for higher education)
            $table->string('specialization')->nullable();  // Major/Field of Study
            $table->string('specialization_en')->nullable();

            // Graduation Info
            $table->year('graduation_year');
            $table->date('graduation_date')->nullable();
            $table->string('seat_number')->nullable();     // رقم الجلوس (for Tawjihi)
            $table->string('certificate_number')->nullable();

            // Grades/Scores
            $table->decimal('gpa', 5, 2)->nullable();      // GPA or percentage
            $table->enum('gpa_scale', ['4.0', '5.0', '100', 'OTHER'])->default('100');
            $table->string('grade_letter')->nullable();     // A, B, C or امتياز، جيد جداً
            $table->integer('total_score')->nullable();     // Total marks obtained
            $table->integer('max_score')->nullable();       // Maximum possible marks
            $table->string('class_rank')->nullable();       // الترتيب على الدفعة

            // Document Verification
            $table->enum('verification_status', [
                'PENDING',
                'VERIFIED',
                'REJECTED',
                'NOT_REQUIRED'
            ])->default('PENDING');
            $table->date('verification_date')->nullable();
            $table->string('verified_by')->nullable();

            // Additional Info
            $table->boolean('is_primary')->default(false);  // Main qualification for admission
            $table->text('notes')->nullable();
            $table->json('additional_info')->nullable();    // For any extra fields

            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'education_level']);
            $table->index(['student_id', 'is_primary']);
            $table->index('verification_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('previous_education');
    }
};
