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
        // جدول المحاضرات الرئيسي
        Schema::create('lectures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('lecturer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('semester_id')->nullable()->constrained()->onDelete('set null');

            // معلومات المحاضرة الأساسية
            $table->string('title_en');
            $table->string('title_ar');
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();

            // التوقيت والمكان
            $table->date('lecture_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration_minutes')->default(60);
            $table->string('room')->nullable();
            $table->string('building')->nullable();

            // نوع المحاضرة
            $table->enum('type', ['REGULAR', 'MAKEUP', 'EXTRA', 'EXAM_REVIEW', 'WORKSHOP', 'LAB', 'ONLINE'])->default('REGULAR');
            $table->enum('mode', ['IN_PERSON', 'ONLINE', 'HYBRID'])->default('IN_PERSON');

            // روابط للمحاضرات الإلكترونية
            $table->string('online_meeting_url')->nullable();
            $table->string('online_meeting_id')->nullable();
            $table->string('online_meeting_password')->nullable();
            $table->string('recording_url')->nullable();

            // الحالة
            $table->enum('status', ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])->default('SCHEDULED');
            $table->text('cancellation_reason')->nullable();
            $table->date('rescheduled_to')->nullable();

            // ملاحظات ومواضيع
            $table->text('topics_covered')->nullable();
            $table->text('notes')->nullable();
            $table->text('homework_assigned')->nullable();

            // ترتيب المحاضرة في المقرر
            $table->integer('lecture_number')->default(1);
            $table->integer('week_number')->nullable();

            // إحصائيات
            $table->integer('expected_students')->nullable();
            $table->integer('actual_attendance')->default(0);

            $table->timestamps();

            // فهارس للبحث السريع
            $table->index(['course_id', 'lecture_date']);
            $table->index(['lecturer_id', 'lecture_date']);
            $table->index(['status', 'lecture_date']);
            $table->index('semester_id');
        });

        // جدول مواد المحاضرة (ملفات، روابط، إلخ)
        Schema::create('lecture_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecture_id')->constrained()->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');

            // نوع المادة
            $table->enum('type', ['SLIDES', 'PDF', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LINK', 'IMAGE', 'CODE', 'OTHER'])->default('DOCUMENT');

            // معلومات الملف
            $table->string('title_en');
            $table->string('title_ar');
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('external_url')->nullable();

            // الرؤية والتحميل
            $table->boolean('is_downloadable')->default(true);
            $table->boolean('is_visible_to_students')->default(true);
            $table->integer('download_count')->default(0);
            $table->integer('view_count')->default(0);

            // ترتيب العرض
            $table->integer('order')->default(0);

            $table->timestamps();

            $table->index(['lecture_id', 'type']);
        });

        // جدول حضور المحاضرات
        Schema::create('lecture_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecture_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('enrollment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');

            // حالة الحضور
            $table->enum('status', ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'LEFT_EARLY'])->default('ABSENT');

            // التوقيت
            $table->timestamp('check_in_time')->nullable();
            $table->timestamp('check_out_time')->nullable();
            $table->integer('minutes_late')->default(0);
            $table->integer('minutes_present')->nullable();

            // للحضور الإلكتروني
            $table->string('ip_address')->nullable();
            $table->string('device_info')->nullable();
            $table->boolean('verified_by_qr')->default(false);
            $table->boolean('verified_by_location')->default(false);

            // ملاحظات
            $table->text('notes')->nullable();
            $table->text('excuse_reason')->nullable();
            $table->string('excuse_document_path')->nullable();

            $table->timestamps();

            // منع التكرار
            $table->unique(['lecture_id', 'student_id']);
            $table->index(['student_id', 'status']);
        });

        // جدول تعليقات/نقاشات المحاضرة
        Schema::create('lecture_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecture_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('lecture_comments')->onDelete('cascade');

            $table->text('content');
            $table->boolean('is_question')->default(false);
            $table->boolean('is_answered')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_anonymous')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['lecture_id', 'created_at']);
        });

        // جدول تقييم المحاضرات
        Schema::create('lecture_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecture_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            // التقييمات
            $table->tinyInteger('overall_rating')->unsigned(); // 1-5
            $table->tinyInteger('content_rating')->unsigned()->nullable(); // 1-5
            $table->tinyInteger('delivery_rating')->unsigned()->nullable(); // 1-5
            $table->tinyInteger('materials_rating')->unsigned()->nullable(); // 1-5

            $table->text('feedback')->nullable();
            $table->boolean('is_anonymous')->default(true);

            $table->timestamps();

            $table->unique(['lecture_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lecture_ratings');
        Schema::dropIfExists('lecture_comments');
        Schema::dropIfExists('lecture_attendance');
        Schema::dropIfExists('lecture_materials');
        Schema::dropIfExists('lectures');
    }
};
