<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enrollment Actions / Registration History - تاريخ التسجيل وإجراءات الطالب
     * Tracks all registration actions: add, drop, section change, semester withdrawal, etc.
     */
    public function up(): void
    {
        Schema::create('enrollment_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->foreignId('enrollment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('course_id')->nullable()->constrained()->onDelete('set null');

            // Action Type
            $table->enum('action_type', [
                'COURSE_ADD',           // إضافة مساق
                'COURSE_DROP',          // سحب مساق
                'SECTION_CHANGE',       // تغيير شعبة
                'SEMESTER_WITHDRAWAL',  // انسحاب من الفصل كاملاً
                'SEMESTER_POSTPONE',    // تأجيل فصل
                'LATE_REGISTRATION',    // تسجيل متأخر
                'COURSE_RETAKE',        // إعادة مساق
                'CREDIT_TRANSFER',      // معادلة ساعات
                'EXEMPTION',            // إعفاء من مساق
                'AUDIT',                // حضور مساق (مستمع)
                'OVERRIDE',             // تجاوز القيود
                'WAITLIST_ADD',         // إضافة لقائمة الانتظار
                'WAITLIST_REMOVE',      // إزالة من قائمة الانتظار
                'CAPACITY_OVERRIDE',    // تجاوز السعة
                'PREREQUISITE_OVERRIDE', // تجاوز المتطلب السابق
                'OTHER'
            ]);

            // Course Details (at time of action)
            $table->string('course_code')->nullable();
            $table->string('course_name')->nullable();
            $table->string('old_section')->nullable();  // For section changes
            $table->string('new_section')->nullable();
            $table->integer('credit_hours')->nullable();

            // Timing
            $table->timestamp('action_date');
            $table->boolean('is_late_action')->default(false);
            $table->string('academic_period')->nullable(); // e.g., "Add/Drop Period", "Late Drop"

            // Credits Impact
            $table->integer('initial_credits')->nullable();     // الساعات المسجلة في البداية
            $table->integer('final_credits')->nullable();       // الساعات بعد العملية

            // Approvals
            $table->enum('approval_status', [
                'PENDING',
                'APPROVED',
                'REJECTED',
                'AUTO_APPROVED'
            ])->default('PENDING');

            $table->foreignId('requested_by')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approval_date')->nullable();

            // Approval Chain (for multi-level approvals)
            $table->json('approval_chain')->nullable();
            /*
             * Format: [
             *   {"level": "ADVISOR", "user_id": 1, "status": "APPROVED", "date": "..."},
             *   {"level": "DEPARTMENT", "user_id": 2, "status": "APPROVED", "date": "..."},
             *   {"level": "DEAN", "user_id": 3, "status": "PENDING", "date": null}
             * ]
             */

            // Reason
            $table->text('reason')->nullable();           // سبب الإجراء
            $table->text('rejection_reason')->nullable(); // سبب الرفض

            // Financial Impact
            $table->boolean('has_financial_impact')->default(false);
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->decimal('fee_amount', 10, 2)->nullable();
            $table->enum('refund_status', [
                'NOT_APPLICABLE',
                'PENDING',
                'PROCESSED',
                'DENIED'
            ])->default('NOT_APPLICABLE');

            // Attachments
            $table->json('supporting_documents')->nullable();

            // Notes
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'semester_id']);
            $table->index(['student_id', 'action_type']);
            $table->index(['semester_id', 'action_type']);
            $table->index('approval_status');
            $table->index('action_date');
        });

        // Semester Summary table to track per-semester registration stats
        Schema::create('student_semester_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');

            // Registration Status
            $table->enum('status', [
                'REGISTERED',           // مسجل
                'POSTPONED',            // مؤجل
                'WITHDRAWN',            // منسحب
                'DISMISSED',            // مفصول
                'NOT_REGISTERED'        // غير مسجل
            ])->default('REGISTERED');

            // Credit Hours
            $table->integer('initial_registered_credits')->default(0);
            $table->integer('final_registered_credits')->default(0);
            $table->integer('dropped_credits')->default(0);
            $table->integer('added_credits')->default(0);

            // GPA
            $table->decimal('term_gpa', 3, 2)->nullable();
            $table->decimal('cumulative_gpa', 3, 2)->nullable();

            // Course Counts
            $table->integer('courses_registered')->default(0);
            $table->integer('courses_dropped')->default(0);
            $table->integer('courses_failed')->default(0);
            $table->integer('courses_passed')->default(0);
            $table->integer('courses_incomplete')->default(0);

            // Academic Standing
            $table->enum('academic_standing', [
                'DEANS_LIST',           // قائمة العميد
                'GOOD_STANDING',        // وضع جيد
                'SATISFACTORY',         // مرضي
                'FIRST_PROBATION',      // إنذار أول
                'SECOND_PROBATION',     // إنذار ثاني
                'FINAL_PROBATION',      // إنذار نهائي
                'DISMISSAL'             // فصل
            ])->nullable();

            // Financial Status
            $table->decimal('semester_fees', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->decimal('balance', 10, 2)->default(0);
            $table->enum('financial_status', [
                'CLEARED',
                'PARTIAL',
                'UNPAID',
                'ON_HOLD'
            ])->default('CLEARED');

            // Attendance
            $table->decimal('overall_attendance_percentage', 5, 2)->nullable();

            // Notes
            $table->text('notes')->nullable();

            $table->timestamps();

            // Unique constraint
            $table->unique(['student_id', 'semester_id']);

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index('academic_standing');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_semester_summaries');
        Schema::dropIfExists('enrollment_actions');
    }
};
