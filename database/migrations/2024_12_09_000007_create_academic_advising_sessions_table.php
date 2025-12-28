<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Academic Advising Sessions - الإرشاد الأكاديمي
     * Tracks advisor-student meetings and recommendations
     */
    public function up(): void
    {
        Schema::create('academic_advising_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('advisor_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->nullable()->constrained()->onDelete('set null');

            // Session Details
            $table->date('session_date');
            $table->time('session_time')->nullable();
            $table->integer('duration_minutes')->nullable(); // Session duration

            // Session Type
            $table->enum('session_type', [
                'IN_PERSON',        // حضوري
                'ONLINE',           // أونلاين
                'PHONE',            // هاتفي
                'EMAIL',            // بريد إلكتروني
                'DROP_IN',          // زيارة عفوية
                'SCHEDULED',        // مجدولة
                'GROUP'             // جماعي
            ])->default('IN_PERSON');

            // Meeting Purpose
            $table->enum('purpose', [
                'REGISTRATION',     // تسجيل
                'ACADEMIC_PLAN',    // خطة دراسية
                'GRADE_REVIEW',     // مراجعة درجات
                'PROBATION',        // إنذار أكاديمي
                'COURSE_SELECTION', // اختيار مواد
                'CAREER',           // إرشاد مهني
                'GRADUATION',       // تخرج
                'DROP_ADD',         // سحب وإضافة
                'GENERAL',          // عام
                'FOLLOW_UP',        // متابعة
                'COMPLAINT',        // شكوى
                'OTHER'
            ])->default('GENERAL');

            // Session Status
            $table->enum('status', [
                'SCHEDULED',        // مجدول
                'COMPLETED',        // مكتمل
                'CANCELLED',        // ملغي
                'NO_SHOW',          // لم يحضر
                'RESCHEDULED'       // أعيد جدولته
            ])->default('SCHEDULED');

            // Session Content
            $table->text('topics_discussed')->nullable();    // ما تم مناقشته
            $table->text('summary')->nullable();             // ملخص الجلسة
            $table->text('agreements')->nullable();          // ما تم الاتفاق عليه

            // Recommendations
            $table->text('recommendations')->nullable();     // التوصيات
            $table->boolean('recommend_reduce_load')->default(false);  // تخفيف العبء
            $table->boolean('recommend_tutoring')->default(false);     // دروس تقوية
            $table->boolean('recommend_counseling')->default(false);   // إرشاد نفسي
            $table->json('courses_recommended')->nullable(); // Courses recommended to take
            $table->json('courses_not_recommended')->nullable(); // Courses to avoid

            // Follow-up
            $table->date('next_session_date')->nullable();
            $table->text('follow_up_notes')->nullable();

            // Student Acknowledgment
            $table->boolean('student_acknowledged')->default(false);
            $table->timestamp('acknowledged_at')->nullable();
            $table->text('student_comments')->nullable();

            // Attachments
            $table->json('attachments')->nullable();

            // Privacy
            $table->boolean('is_confidential')->default(false);

            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'session_date']);
            $table->index(['advisor_id', 'session_date']);
            $table->index(['student_id', 'status']);
            $table->index('session_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_advising_sessions');
    }
};
