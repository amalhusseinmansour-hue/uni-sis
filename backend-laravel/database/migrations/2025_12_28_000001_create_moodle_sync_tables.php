<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // جدول مزامنة المستخدمين مع Moodle (طلاب + محاضرين)
        Schema::create('moodle_users', function (Blueprint $table) {
            $table->id();
            $table->enum('user_type', ['STUDENT', 'LECTURER']);
            $table->foreignId('student_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // للمحاضرين (Users with role=LECTURER)
            $table->unsignedInteger('moodle_user_id')->nullable();
            $table->string('username', 100);
            $table->enum('sync_status', ['PENDING', 'SYNCED', 'FAILED', 'UPDATED'])->default('PENDING');
            $table->timestamp('last_synced_at')->nullable();
            $table->text('sync_error')->nullable();
            $table->timestamps();

            $table->unique('student_id');
            $table->unique('user_id');
            $table->index('moodle_user_id');
            $table->index('sync_status');
        });

        // جدول مزامنة المساقات مع Moodle
        Schema::create('moodle_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('moodle_course_id')->nullable();
            $table->string('shortname', 100);
            $table->unsignedInteger('category_id')->nullable();
            $table->enum('sync_status', ['PENDING', 'SYNCED', 'FAILED'])->default('PENDING');
            $table->timestamp('last_synced_at')->nullable();
            $table->text('sync_error')->nullable();
            $table->timestamps();

            $table->unique('course_id');
            $table->index('moodle_course_id');
            $table->index('sync_status');
        });

        // جدول مزامنة التسجيلات مع Moodle
        Schema::create('moodle_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('moodle_user_id');
            $table->unsignedInteger('moodle_course_id');
            $table->string('role', 50)->default('student'); // student, editingteacher
            $table->enum('sync_status', ['PENDING', 'SYNCED', 'FAILED', 'UNENROLLED'])->default('PENDING');
            $table->timestamp('last_synced_at')->nullable();
            $table->text('sync_error')->nullable();
            $table->timestamps();

            $table->unique('enrollment_id');
            $table->index(['moodle_user_id', 'moodle_course_id'], 'moodle_enroll_user_course');
            $table->index('sync_status');
        });

        // جدول العلامات المستلمة من Moodle
        Schema::create('moodle_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('moodle_user_id');
            $table->unsignedInteger('moodle_course_id');
            $table->decimal('moodle_grade', 8, 2)->nullable();
            $table->decimal('moodle_grade_max', 8, 2)->default(100);
            $table->enum('completion_status', ['IN_PROGRESS', 'COMPLETED', 'FAILED'])->default('IN_PROGRESS');
            $table->timestamp('completed_at')->nullable();
            $table->boolean('synced_to_sis')->default(false);
            $table->timestamp('received_at')->nullable();
            $table->json('grade_items')->nullable(); // تفاصيل عناصر التقييم
            $table->timestamps();

            $table->unique('enrollment_id');
            $table->index(['moodle_user_id', 'moodle_course_id'], 'moodle_grades_user_course');
            $table->index('synced_to_sis');
            $table->index('completion_status');
        });

        // جدول سجل المزامنة
        Schema::create('moodle_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('sync_type', ['USER', 'COURSE', 'ENROLLMENT', 'GRADE']);
            $table->enum('direction', ['TO_MOODLE', 'FROM_MOODLE']);
            $table->morphs('syncable'); // polymorphic relation
            $table->enum('status', ['SUCCESS', 'FAILED']);
            $table->json('request_data')->nullable();
            $table->json('response_data')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('synced_at');
            $table->timestamps();

            $table->index(['sync_type', 'status']);
            $table->index('synced_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moodle_sync_logs');
        Schema::dropIfExists('moodle_grades');
        Schema::dropIfExists('moodle_enrollments');
        Schema::dropIfExists('moodle_courses');
        Schema::dropIfExists('moodle_users');
    }
};
