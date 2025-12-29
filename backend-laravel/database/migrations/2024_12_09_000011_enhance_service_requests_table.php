<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enhanced Service Requests - طلبات الخدمات
     * Comprehensive student request system covering all academic, financial, and administrative requests
     */
    public function up(): void
    {
        // Create enhanced service requests table
        Schema::create('student_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->nullable()->constrained();

            // Request Identification
            $table->string('request_number')->unique(); // Auto-generated: REQ-2024-00001
            $table->date('request_date');

            // ==========================================
            // Request Category & Type
            // ==========================================
            $table->enum('category', [
                'REGISTRATION',     // طلبات التسجيل
                'SEMESTER',         // طلبات الفصل
                'ACADEMIC',         // طلبات أكاديمية
                'FINANCIAL',        // طلبات مالية
                'GRADUATION',       // طلبات التخرج
                'DOCUMENTS',        // طلبات شهادات ووثائق
                'OTHER'             // أخرى
            ]);

            $table->enum('request_type', [
                // Registration Requests - طلبات التسجيل
                'SECTION_CHANGE',           // تغيير شعبة
                'LATE_REGISTRATION',        // تسجيل متأخر
                'EXCEPTIONAL_REGISTRATION', // تسجيل استثنائي
                'OVERLOAD_REQUEST',         // طلب زيادة ساعات
                'UNDERLOAD_REQUEST',        // طلب تخفيض ساعات

                // Semester Requests - طلبات الفصل
                'SEMESTER_POSTPONE',        // تأجيل فصل
                'SEMESTER_WITHDRAWAL',      // انسحاب من فصل كامل
                'STUDY_FREEZE',             // تجميد دراسة
                'RE_ENROLLMENT',            // إعادة قيد

                // Academic Requests - طلبات أكاديمية
                'COURSE_EQUIVALENCY',       // معادلة مواد
                'EXAM_RETAKE',              // طلب إعادة امتحان
                'GRADE_REVIEW',             // طلب مراجعة علامة
                'GRADE_APPEAL',             // طلب استئناف درجة
                'GRADUATION_PROJECT',       // طلب مشروع تخرج
                'MAJOR_CHANGE',             // تغيير تخصص
                'STUDY_PLAN_CHANGE',        // تغيير خطة دراسية
                'COURSE_WITHDRAWAL',        // انسحاب من مادة
                'INCOMPLETE_EXTENSION',     // تمديد غير مكتمل
                'ACADEMIC_EXCUSE',          // عذر أكاديمي

                // Financial Requests - طلبات مالية
                'FEE_INSTALLMENT',          // تقسيط الرسوم
                'SCHOLARSHIP_REQUEST',      // طلب منحة
                'DISCOUNT_REQUEST',         // طلب خصم
                'FINANCIAL_STATEMENT',      // طلب كشف حساب مالي
                'REFUND_REQUEST',           // طلب استرداد
                'PAYMENT_EXTENSION',        // تمديد موعد الدفع

                // Graduation Requests - طلبات التخرج
                'GRADUATION_APPLICATION',   // طلب تخرج
                'CREDIT_CALCULATION',       // طلب احتساب ساعات التخرج
                'GRADUATION_CERTIFICATE',   // طلب شهادة تخرج
                'WHOM_IT_MAY_CONCERN',      // طلب شهادة لمن يهمه الأمر

                // Document Requests - طلبات شهادات ووثائق
                'OFFICIAL_TRANSCRIPT',      // طلب كشف درجات رسمي
                'ENROLLMENT_CERTIFICATE',   // طلب شهادة قيد
                'STUDENT_ID_CARD',          // طلب بطاقة طالب
                'CERTIFIED_COPY',           // طلب ختم صورة طبق الأصل
                'RECOMMENDATION_LETTER',    // طلب خطاب توصية
                'EXPERIENCE_LETTER',        // طلب خطاب خبرة

                // Other
                'OTHER'                     // أخرى
            ]);

            $table->string('request_type_other')->nullable();

            // ==========================================
            // Request Details
            // ==========================================
            $table->text('description')->nullable();
            $table->text('reason');                     // سبب الطلب
            $table->json('request_data')->nullable();   // Flexible JSON for type-specific data

            /*
             * request_data examples:
             * SECTION_CHANGE: {"course_id": 1, "from_section": "A", "to_section": "B"}
             * COURSE_EQUIVALENCY: {"courses": [{"external_code": "CS101", "internal_code": "COMP101"}]}
             * GRADE_REVIEW: {"course_id": 1, "current_grade": "C", "exam_type": "FINAL"}
             * FEE_INSTALLMENT: {"total_amount": 5000, "installments": 3, "first_payment_date": "2024-01-01"}
             */

            // Related Course (for course-specific requests)
            $table->foreignId('course_id')->nullable()->constrained();
            $table->string('section')->nullable();

            // ==========================================
            // Workflow Status
            // ==========================================
            $table->enum('status', [
                'DRAFT',                // مسودة
                'SUBMITTED',            // تم التقديم
                'UNDER_REVIEW',         // قيد المراجعة
                'PENDING_DOCUMENTS',    // بانتظار مستندات
                'PENDING_PAYMENT',      // بانتظار الدفع
                'PENDING_APPROVAL',     // بانتظار الموافقة
                'APPROVED',             // موافق عليه
                'PARTIALLY_APPROVED',   // موافق جزئياً
                'REJECTED',             // مرفوض
                'CANCELLED',            // ملغي
                'COMPLETED',            // مكتمل
                'ON_HOLD'               // موقوف
            ])->default('SUBMITTED');

            // ==========================================
            // Approval Workflow
            // ==========================================
            // Level 1: Academic Advisor / Instructor
            $table->foreignId('advisor_reviewed_by')->nullable()->constrained('users');
            $table->timestamp('advisor_reviewed_at')->nullable();
            $table->enum('advisor_decision', ['APPROVED', 'REJECTED', 'FORWARDED'])->nullable();
            $table->text('advisor_notes')->nullable();

            // Level 2: Department Head
            $table->foreignId('department_reviewed_by')->nullable()->constrained('users');
            $table->timestamp('department_reviewed_at')->nullable();
            $table->enum('department_decision', ['APPROVED', 'REJECTED', 'FORWARDED'])->nullable();
            $table->text('department_notes')->nullable();

            // Level 3: Dean / Registration
            $table->foreignId('dean_reviewed_by')->nullable()->constrained('users');
            $table->timestamp('dean_reviewed_at')->nullable();
            $table->enum('dean_decision', ['APPROVED', 'REJECTED'])->nullable();
            $table->text('dean_notes')->nullable();

            // Final Decision
            $table->foreignId('final_decision_by')->nullable()->constrained('users');
            $table->timestamp('final_decision_at')->nullable();
            $table->text('final_notes')->nullable();
            $table->text('rejection_reason')->nullable();

            // ==========================================
            // Priority & Urgency
            // ==========================================
            $table->enum('priority', [
                'LOW',
                'NORMAL',
                'HIGH',
                'URGENT'
            ])->default('NORMAL');

            $table->date('deadline')->nullable();       // موعد نهائي للمعالجة
            $table->boolean('is_urgent')->default(false);

            // ==========================================
            // Supporting Documents
            // ==========================================
            $table->json('attachments')->nullable();    // Array of file paths
            $table->boolean('documents_required')->default(false);
            $table->json('required_documents')->nullable();
            $table->boolean('documents_complete')->default(true);

            // ==========================================
            // Financial Impact
            // ==========================================
            $table->boolean('has_fee')->default(false);
            $table->decimal('fee_amount', 10, 2)->nullable();
            $table->boolean('fee_paid')->default(false);
            $table->string('payment_reference')->nullable();

            // ==========================================
            // Execution Details
            // ==========================================
            $table->foreignId('executed_by')->nullable()->constrained('users');
            $table->timestamp('executed_at')->nullable();
            $table->text('execution_notes')->nullable();
            $table->json('execution_result')->nullable();

            // ==========================================
            // Communication
            // ==========================================
            $table->boolean('student_notified')->default(false);
            $table->timestamp('notification_sent_at')->nullable();
            $table->text('student_feedback')->nullable();

            // ==========================================
            // Tracking
            // ==========================================
            $table->integer('days_pending')->default(0);
            $table->integer('reminder_count')->default(0);
            $table->timestamp('last_reminder_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index(['student_id', 'category']);
            $table->index(['category', 'request_type']);
            $table->index(['status', 'created_at']);
            $table->index('request_number');
            $table->index('priority');
        });

        // Request workflow log for audit trail
        Schema::create('student_request_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained();

            $table->string('action');               // SUBMITTED, REVIEWED, APPROVED, REJECTED, etc.
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->text('notes')->nullable();
            $table->json('changes')->nullable();    // What was changed

            $table->timestamps();

            $table->index(['student_request_id', 'created_at']);
        });

        // Request comments/messages for communication
        Schema::create('student_request_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained();

            $table->text('comment');
            $table->boolean('is_internal')->default(false);  // Internal = not visible to student
            $table->boolean('is_from_student')->default(false);
            $table->json('attachments')->nullable();

            $table->timestamps();

            $table->index(['student_request_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_request_comments');
        Schema::dropIfExists('student_request_logs');
        Schema::dropIfExists('student_requests');
    }
};
