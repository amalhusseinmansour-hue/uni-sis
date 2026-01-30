<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_request_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('request_number')->unique(); // رقم الطلب التسلسلي

            // نوع الطلب
            $table->enum('request_type', [
                'EXCEPTIONAL_REGISTRATION',  // طلب تسجيل استثنائي / متأخر
                'SEMESTER_POSTPONE',         // طلب تأجيل فصل
                'SEMESTER_FREEZE',           // طلب تجميد فصل
                'SEMESTER_WITHDRAWAL',       // الانسحاب من فصل كامل
                'RE_ENROLLMENT',             // إعادة القيد
                'COURSE_EQUIVALENCY',        // طلب معادلة مواد
                'EXAM_RETAKE',               // طلب إعادة امتحان
                'GRADE_REVIEW',              // طلب مراجعة علامة
                'MAJOR_CHANGE',              // طلب تغيير تخصص
                'STUDY_PLAN_EXTENSION',      // طلب تمديد فصول دراسية
            ]);

            // البيانات الأساسية المشتركة
            $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('semester_id')->nullable()->constrained()->nullOnDelete(); // الفصل المعني بالطلب
            $table->string('phone')->nullable();
            $table->text('reason')->nullable(); // سبب الطلب

            // حقول طلب التسجيل الاستثنائي / المتأخر
            $table->json('requested_courses')->nullable(); // المساقات المطلوب تسجيلها
            $table->boolean('fees_paid')->nullable(); // هل تم دفع الرسوم؟

            // حقول طلب التأجيل / التجميد
            $table->integer('previous_postponements_count')->nullable(); // عدد مرات التأجيل السابقة
            $table->enum('postponement_reason_type', [
                'MEDICAL', 'SOCIAL', 'FINANCIAL', 'MILITARY', 'WORK', 'OTHER'
            ])->nullable();

            // حقول الانسحاب من فصل
            $table->integer('previous_withdrawals_count')->nullable(); // عدد الانسحابات السابقة
            $table->boolean('return_next_semester')->nullable(); // هل يرغب بالعودة الفصل القادم؟

            // حقول إعادة القيد
            $table->date('postponement_date')->nullable(); // تاريخ التأجيل / التجميد
            $table->foreignId('return_semester_id')->nullable()->constrained('semesters')->nullOnDelete();

            // حقول معادلة المواد
            $table->json('courses_to_equate')->nullable(); // قائمة المواد المطلوب معادلتها
            $table->string('previous_institution')->nullable(); // الجامعة/الجهة التي درس بها سابقًا

            // حقول إعادة الامتحان
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('exam_type', ['QUIZ', 'FIRST', 'MIDTERM', 'FINAL'])->nullable();
            $table->text('absence_reason')->nullable(); // سبب عدم التقديم

            // حقول مراجعة العلامة
            $table->text('objection_reason')->nullable(); // سبب الاعتراض

            // حقول تغيير التخصص
            $table->foreignId('current_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('requested_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->integer('earned_credits')->nullable(); // عدد الساعات المكتسبة
            $table->decimal('current_gpa', 3, 2)->nullable(); // المعدل الحالي

            // حقول تمديد الخطة الدراسية
            $table->string('current_study_plan')->nullable(); // الخطة الحالية
            $table->string('requested_study_plan')->nullable(); // الخطة المطلوبة

            // حالة الطلب
            $table->enum('status', [
                'DRAFT',           // مسودة
                'SUBMITTED',       // مقدم
                'UNDER_REVIEW',    // قيد المراجعة
                'PENDING_DEPT',    // بانتظار القسم
                'PENDING_DEAN',    // بانتظار العميد
                'PENDING_ACADEMIC', // بانتظار الشؤون الأكاديمية
                'PENDING_FINANCE', // بانتظار المالية
                'PENDING_STUDENT_AFFAIRS', // بانتظار شؤون الطلبة
                'PENDING_ADMISSIONS', // بانتظار القبول والتسجيل
                'APPROVED',        // موافق عليه
                'REJECTED',        // مرفوض
                'CANCELLED',       // ملغي
                'COMPLETED',       // منجز
            ])->default('DRAFT');

            // مراحل الموافقة
            $table->json('approval_workflow')->nullable(); // تدفق الموافقات المطلوب
            $table->integer('current_approval_step')->default(0);

            // ملاحظات
            $table->text('student_notes')->nullable(); // ملاحظات الطالب
            $table->text('admin_notes')->nullable(); // ملاحظات الإدارة
            $table->text('rejection_reason')->nullable(); // سبب الرفض

            // المراجع
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            // التواريخ
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['student_id', 'request_type']);
            $table->index(['status']);
            $table->index(['request_type', 'status']);
        });

        // جدول مرفقات الطلبات
        Schema::create('student_request_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_request_form_id')->constrained()->onDelete('cascade');

            $table->enum('attachment_type', [
                'INSTRUCTOR_SUPPORT_LETTER',  // كتاب من المدرس
                'DEPARTMENT_SUPPORT_LETTER',  // كتاب من القسم
                'PAYMENT_RECEIPT',            // إيصال دفع
                'MEDICAL_REPORT',             // تقرير طبي
                'OFFICIAL_DOCUMENT',          // وثيقة رسمية
                'TRANSCRIPT',                 // كشف درجات
                'COURSE_DESCRIPTION',         // وصف مساقات
                'ID_COPY',                    // صورة هوية
                'OTHER',                      // أخرى
            ]);

            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();

            $table->timestamps();
        });

        // جدول سجل الموافقات
        Schema::create('student_request_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_request_form_id')->constrained()->onDelete('cascade');

            $table->integer('step_number'); // رقم الخطوة في تدفق الموافقات
            $table->string('approver_role'); // دور المعتمد (dept_head, dean, academic_affairs, etc.)
            $table->string('approver_title_ar')->nullable(); // المسمى بالعربية
            $table->string('approver_title_en')->nullable(); // المسمى بالإنجليزية

            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('status', [
                'PENDING',   // بانتظار المراجعة
                'APPROVED',  // موافق
                'REJECTED',  // مرفوض
                'RETURNED',  // مرجع للتعديل
                'SKIPPED',   // تم تخطيه
            ])->default('PENDING');

            $table->text('comments')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('action_at')->nullable();

            $table->timestamps();

            $table->index(['student_request_form_id', 'step_number'], 'sra_form_step_idx');
        });

        // جدول المساقات المطلوب تسجيلها (للتسجيل الاستثنائي)
        Schema::create('student_request_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_request_form_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('section')->nullable(); // الشعبة
            $table->text('reason')->nullable(); // سبب تسجيل هذا المساق
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        // جدول المواد المطلوب معادلتها
        Schema::create('student_request_equivalencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_request_form_id')->constrained()->onDelete('cascade');

            // المساق المطلوب معادلته
            $table->foreignId('target_course_id')->constrained('courses')->onDelete('cascade');

            // المساق من الجامعة السابقة
            $table->string('source_course_code'); // رمز المساق
            $table->string('source_course_name_ar')->nullable();
            $table->string('source_course_name_en')->nullable();
            $table->integer('source_credits')->nullable(); // الساعات المعتمدة
            $table->string('source_grade')->nullable(); // العلامة

            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_request_equivalencies');
        Schema::dropIfExists('student_request_courses');
        Schema::dropIfExists('student_request_approvals');
        Schema::dropIfExists('student_request_attachments');
        Schema::dropIfExists('student_request_forms');
    }
};
