<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Special Needs & Medical Info - الاحتياجات الخاصة / المعلومات الطبية
     * Stores disability information, medical conditions, and required accommodations
     */
    public function up(): void
    {
        Schema::create('student_special_needs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            // ==========================================
            // Disability/Special Needs Section
            // ==========================================
            $table->boolean('has_special_needs')->default(false);

            // Type of Special Need
            $table->enum('special_need_type', [
                'HEARING',          // سمعي
                'VISUAL',           // بصري
                'MOBILITY',         // حركي
                'COGNITIVE',        // إدراكي
                'PSYCHOLOGICAL',    // نفسي
                'SPEECH',           // نطقي
                'CHRONIC_ILLNESS',  // مرض مزمن
                'LEARNING',         // صعوبات تعلم
                'AUTISM',           // طيف التوحد
                'MULTIPLE',         // متعدد
                'OTHER'             // أخرى
            ])->nullable();
            $table->string('special_need_type_other')->nullable();

            // Severity Level
            $table->enum('severity_level', [
                'MILD',             // خفيف
                'MODERATE',         // متوسط
                'SEVERE',           // شديد
                'PROFOUND'          // عميق
            ])->nullable();

            // Description
            $table->text('condition_description')->nullable();

            // ==========================================
            // Medical Information Section
            // ==========================================
            $table->boolean('has_chronic_illness')->default(false);
            $table->text('chronic_illnesses')->nullable(); // Comma-separated or JSON

            $table->boolean('has_allergies')->default(false);
            $table->text('allergies')->nullable(); // Medication allergies, food allergies

            $table->string('blood_type')->nullable();
            $table->text('current_medications')->nullable();

            // Emergency Medical Info
            $table->text('medical_notes')->nullable();
            $table->string('emergency_medical_contact')->nullable();
            $table->string('preferred_hospital')->nullable();

            // ==========================================
            // Accommodations Required
            // ==========================================
            $table->boolean('requires_accommodations')->default(false);

            // Exam Accommodations
            $table->boolean('needs_extra_time')->default(false);
            $table->integer('extra_time_percentage')->nullable(); // e.g., 25%, 50%
            $table->boolean('needs_separate_room')->default(false);
            $table->boolean('needs_reader')->default(false);       // قارئ
            $table->boolean('needs_scribe')->default(false);       // كاتب
            $table->boolean('needs_enlarged_text')->default(false);
            $table->boolean('needs_braille')->default(false);
            $table->boolean('needs_audio_exam')->default(false);
            $table->boolean('needs_computer')->default(false);
            $table->boolean('needs_rest_breaks')->default(false);
            $table->integer('rest_break_frequency')->nullable();   // Every X minutes

            // Classroom Accommodations
            $table->boolean('needs_front_seat')->default(false);
            $table->boolean('needs_wheelchair_access')->default(false);
            $table->boolean('needs_elevator_access')->default(false);
            $table->boolean('needs_sign_interpreter')->default(false);
            $table->boolean('needs_note_taker')->default(false);
            $table->boolean('needs_recording_permission')->default(false);
            $table->boolean('needs_priority_registration')->default(false);

            // Other Accommodations
            $table->text('other_accommodations')->nullable();

            // ==========================================
            // Documentation & Verification
            // ==========================================
            $table->enum('documentation_status', [
                'NOT_SUBMITTED',
                'PENDING_REVIEW',
                'APPROVED',
                'REJECTED',
                'EXPIRED'
            ])->default('NOT_SUBMITTED');
            $table->date('documentation_date')->nullable();
            $table->date('documentation_expiry')->nullable();
            $table->string('approved_by')->nullable();
            $table->date('approval_date')->nullable();

            // ==========================================
            // Privacy & Disclosure
            // ==========================================
            $table->boolean('disclose_to_instructors')->default(true);
            $table->boolean('disclose_to_staff')->default(true);
            $table->text('disclosure_notes')->nullable();

            // Administrative
            $table->text('internal_notes')->nullable(); // Staff notes
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'has_special_needs']);
            $table->index('special_need_type');
            $table->index('documentation_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_special_needs');
    }
};
