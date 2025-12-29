<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Student Notes & Classifications - ملاحظات وتصنيفات
     * Administrative notes from various departments
     * Tags and classifications for students
     */
    public function up(): void
    {
        Schema::create('student_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');

            // Source Department
            $table->enum('source_department', [
                'ADMISSION',        // عمادة القبول والتسجيل
                'STUDENT_AFFAIRS',  // شؤون الطلبة
                'ACADEMIC_ADVISOR', // المرشد الأكاديمي
                'FINANCE',          // الشؤون المالية
                'DEAN',             // العمادة
                'DEPARTMENT',       // القسم
                'IT',               // تقنية المعلومات
                'SECURITY',         // الأمن
                'COUNSELING',       // الإرشاد النفسي
                'CAREER',           // الإرشاد المهني
                'HOUSING',          // السكن
                'LIBRARY',          // المكتبة
                'OTHER'             // أخرى
            ]);

            // Note Type
            $table->enum('note_type', [
                'GENERAL',          // ملاحظة عامة
                'ACADEMIC',         // أكاديمية
                'BEHAVIORAL',       // سلوكية
                'FINANCIAL',        // مالية
                'DISCIPLINARY',     // تأديبية
                'MEDICAL',          // طبية
                'FOLLOW_UP',        // متابعة
                'RECOMMENDATION',   // توصية
                'WARNING',          // تحذير
                'ACHIEVEMENT',      // إنجاز
                'COMPLAINT',        // شكوى
                'INQUIRY',          // استفسار
                'OTHER'
            ])->default('GENERAL');

            // Priority Level
            $table->enum('priority', [
                'LOW',
                'NORMAL',
                'HIGH',
                'URGENT'
            ])->default('NORMAL');

            // Note Content
            $table->string('title');
            $table->text('content');
            $table->json('attachments')->nullable(); // Array of file paths

            // Visibility
            $table->boolean('visible_to_student')->default(false);
            $table->boolean('visible_to_advisor')->default(true);
            $table->boolean('visible_to_all_staff')->default(false);
            $table->json('visible_to_departments')->nullable(); // Array of department codes

            // Follow-up
            $table->boolean('requires_follow_up')->default(false);
            $table->date('follow_up_date')->nullable();
            $table->foreignId('follow_up_assigned_to')->nullable()->constrained('users');
            $table->enum('follow_up_status', [
                'PENDING',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED'
            ])->nullable();

            // Status
            $table->enum('status', [
                'ACTIVE',
                'ARCHIVED',
                'DELETED'
            ])->default('ACTIVE');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index(['student_id', 'source_department']);
            $table->index(['student_id', 'note_type']);
            $table->index(['requires_follow_up', 'follow_up_status']);
        });

        // Student Tags table for flexible tagging
        Schema::create('student_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            // Tag Information
            $table->string('tag_name');       // e.g., "متفوق", "محتاج", "منحة"
            $table->string('tag_name_en')->nullable();
            $table->enum('tag_category', [
                'ACADEMIC',         // أكاديمي
                'FINANCIAL',        // مالي
                'SPECIAL_NEEDS',    // احتياجات خاصة
                'SCHOLARSHIP',      // منحة
                'BEHAVIORAL',       // سلوكي
                'ACHIEVEMENT',      // إنجاز
                'RISK',             // خطر
                'CLUB',             // نادي/نشاط
                'ATHLETE',          // رياضي
                'INTERNATIONAL',    // دولي
                'OTHER'
            ])->default('OTHER');

            $table->string('tag_color')->nullable(); // For UI display
            $table->text('description')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->boolean('is_active')->default(true);

            $table->foreignId('added_by')->constrained('users');
            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'is_active']);
            $table->index(['student_id', 'tag_category']);
            $table->index('tag_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_tags');
        Schema::dropIfExists('student_notes');
    }
};
