<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Discipline Incidents - سجل المخالفات السلوكية
     */
    public function up(): void
    {
        Schema::create('discipline_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade'); // Staff member who reported
            $table->foreignId('semester_id')->nullable()->constrained()->nullOnDelete();

            // Incident Details
            $table->string('incident_number')->unique(); // Auto-generated reference number
            $table->enum('type', [
                'TARDINESS',           // تأخر
                'ABSENCE',             // غياب غير مبرر
                'ACADEMIC_DISHONESTY', // غش أكاديمي
                'MISCONDUCT',          // سوء سلوك
                'DRESS_CODE',          // مخالفة الزي
                'PROPERTY_DAMAGE',     // إتلاف ممتلكات
                'BULLYING',            // تنمر
                'SUBSTANCE_ABUSE',     // استخدام مواد محظورة
                'VIOLENCE',            // عنف
                'HARASSMENT',          // تحرش
                'THEFT',               // سرقة
                'OTHER',               // أخرى
            ]);
            $table->string('type_other')->nullable(); // If type is OTHER

            // Severity and Points
            $table->enum('severity', [
                'MINOR',     // بسيطة (1-5 نقاط)
                'MODERATE',  // متوسطة (5-10 نقاط)
                'MAJOR',     // كبيرة (10-20 نقاط)
                'SEVERE',    // خطيرة (20+ نقاط)
            ]);
            $table->integer('points')->default(0); // Discipline points assigned

            // Incident Information
            $table->date('incident_date');
            $table->time('incident_time')->nullable();
            $table->string('location')->nullable(); // Where it happened
            $table->text('description'); // Detailed description
            $table->text('description_ar')->nullable(); // Arabic description

            // Witnesses and Evidence
            $table->json('witnesses')->nullable(); // Array of witness names/IDs
            $table->json('evidence')->nullable(); // Array of evidence file paths

            // Status
            $table->enum('status', [
                'REPORTED',      // تم الإبلاغ
                'INVESTIGATING', // قيد التحقيق
                'CONFIRMED',     // مؤكد
                'DISMISSED',     // مرفوض
                'RESOLVED',      // تم الحل
                'APPEALED',      // تم الاستئناف
            ])->default('REPORTED');

            // Guardian Notification
            $table->boolean('guardian_notified')->default(false);
            $table->timestamp('guardian_notified_at')->nullable();
            $table->enum('guardian_notification_method', ['EMAIL', 'SMS', 'BOTH', 'PHONE_CALL'])->nullable();

            // Follow-up
            $table->text('investigation_notes')->nullable();
            $table->foreignId('investigated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('investigation_completed_at')->nullable();

            // Resolution
            $table->text('resolution_notes')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index(['type', 'severity']);
            $table->index('incident_date');
            $table->index('incident_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discipline_incidents');
    }
};
