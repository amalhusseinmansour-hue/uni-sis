<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Graduation Tracking - تتبّع التخرج
     * Comprehensive tracking of graduation requirements and application status
     */
    public function up(): void
    {
        // Student's Study Plan Progress - track each course in student's study plan
        Schema::create('student_study_plan_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');

            // Study Plan Info
            $table->string('study_plan_code')->nullable();
            $table->integer('plan_year')->nullable();     // Which year in the plan
            $table->integer('plan_semester')->nullable(); // Which semester in the plan

            // Course Classification
            $table->enum('course_type', [
                'UNIVERSITY_REQUIRED',   // متطلب جامعة إجباري
                'UNIVERSITY_ELECTIVE',   // متطلب جامعة اختياري
                'COLLEGE_REQUIRED',      // متطلب كلية إجباري
                'COLLEGE_ELECTIVE',      // متطلب كلية اختياري
                'MAJOR_REQUIRED',        // متطلب تخصص إجباري
                'MAJOR_ELECTIVE',        // متطلب تخصص اختياري
                'SPECIALIZATION',        // تخصص دقيق
                'FREE_ELECTIVE',         // اختياري حر
                'GRADUATION_PROJECT',    // مشروع تخرج
                'INTERNSHIP',            // تدريب ميداني
                'THESIS',                // رسالة
                'OTHER'
            ]);

            // Course Status
            $table->enum('status', [
                'NOT_TAKEN',        // لم يدرس
                'IN_PROGRESS',      // قيد الدراسة
                'COMPLETED',        // مكتمل
                'FAILED',           // راسب
                'EXEMPT',           // معفى
                'TRANSFERRED',      // معادل
                'WITHDRAWN',        // منسحب
                'INCOMPLETE'        // غير مكتمل
            ])->default('NOT_TAKEN');

            // Completion Details
            $table->foreignId('semester_id')->nullable()->constrained();
            $table->string('grade')->nullable();
            $table->decimal('grade_points', 3, 2)->nullable();
            $table->integer('credit_hours')->default(0);
            $table->integer('attempt_count')->default(0);

            // Transfer/Exemption Details
            $table->string('transfer_source')->nullable();
            $table->string('transfer_course_code')->nullable();
            $table->string('exemption_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index(['student_id', 'course_type']);
            $table->unique(['student_id', 'course_id']);
        });

        // Graduation Requirements Summary
        Schema::create('graduation_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            // Overall Credit Requirements
            $table->integer('total_credits_required')->default(0);
            $table->integer('total_credits_completed')->default(0);
            $table->integer('total_credits_in_progress')->default(0);
            $table->integer('total_credits_remaining')->default(0);
            $table->decimal('completion_percentage', 5, 2)->default(0);

            // University Requirements
            $table->integer('university_required_credits')->default(0);
            $table->integer('university_required_completed')->default(0);
            $table->integer('university_elective_credits')->default(0);
            $table->integer('university_elective_completed')->default(0);

            // College Requirements
            $table->integer('college_required_credits')->default(0);
            $table->integer('college_required_completed')->default(0);
            $table->integer('college_elective_credits')->default(0);
            $table->integer('college_elective_completed')->default(0);

            // Major Requirements
            $table->integer('major_required_credits')->default(0);
            $table->integer('major_required_completed')->default(0);
            $table->integer('major_elective_credits')->default(0);
            $table->integer('major_elective_completed')->default(0);

            // Free Electives
            $table->integer('free_elective_credits')->default(0);
            $table->integer('free_elective_completed')->default(0);

            // Special Requirements
            $table->boolean('internship_required')->default(false);
            $table->boolean('internship_completed')->default(false);
            $table->integer('internship_hours_required')->nullable();
            $table->integer('internship_hours_completed')->nullable();

            $table->boolean('graduation_project_required')->default(false);
            $table->boolean('graduation_project_completed')->default(false);

            $table->boolean('thesis_required')->default(false);
            $table->boolean('thesis_completed')->default(false);

            $table->boolean('comprehensive_exam_required')->default(false);
            $table->boolean('comprehensive_exam_passed')->default(false);

            // Language Requirements
            $table->boolean('english_requirement_met')->default(false);
            $table->string('english_test_type')->nullable(); // TOEFL, IELTS, etc.
            $table->string('english_test_score')->nullable();

            $table->boolean('arabic_requirement_met')->default(false);

            // GPA Requirements
            $table->decimal('minimum_gpa_required', 3, 2)->default(2.0);
            $table->boolean('gpa_requirement_met')->default(false);

            // Deficiencies
            $table->json('missing_required_courses')->nullable();
            $table->json('deficiencies')->nullable();
            $table->text('notes')->nullable();

            // Eligibility
            $table->boolean('is_eligible_to_graduate')->default(false);
            $table->timestamp('eligibility_checked_at')->nullable();
            $table->foreignId('eligibility_checked_by')->nullable()->constrained('users');

            $table->timestamps();

            $table->unique('student_id');
        });

        // Graduation Applications
        Schema::create('graduation_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->nullable()->constrained();

            // Application Info
            $table->date('application_date');
            $table->string('graduation_term')->nullable(); // e.g., "2024/2025 - First Semester"

            // Application Status
            $table->enum('status', [
                'SUBMITTED',            // تم التقديم
                'UNDER_REVIEW',         // قيد المراجعة
                'PENDING_DOCUMENTS',    // بانتظار مستندات
                'PENDING_FEES',         // بانتظار رسوم
                'APPROVED',             // موافق عليه
                'REJECTED',             // مرفوض
                'GRADUATED',            // تخرّج
                'CANCELLED'             // ملغي
            ])->default('SUBMITTED');

            // Review Process
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();

            // Approval
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();

            // Rejection
            $table->text('rejection_reason')->nullable();
            $table->json('missing_requirements')->nullable();

            // Graduation Details (filled after graduation)
            $table->date('graduation_date')->nullable();
            $table->string('graduation_ceremony')->nullable();
            $table->string('diploma_number')->nullable();
            $table->decimal('final_gpa', 3, 2)->nullable();
            $table->string('honors')->nullable(); // امتياز، جيد جداً
            $table->integer('class_rank')->nullable();
            $table->integer('total_graduates')->nullable();

            // Documents
            $table->boolean('transcript_issued')->default(false);
            $table->boolean('diploma_issued')->default(false);
            $table->boolean('certificate_issued')->default(false);
            $table->json('documents_issued')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index('graduation_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graduation_applications');
        Schema::dropIfExists('graduation_requirements');
        Schema::dropIfExists('student_study_plan_courses');
    }
};
