<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Discipline Actions - الإجراءات التأديبية
     */
    public function up(): void
    {
        Schema::create('discipline_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained('discipline_incidents')->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');

            // Action Details
            $table->enum('action_type', [
                'VERBAL_WARNING',      // إنذار شفهي
                'WRITTEN_WARNING',     // إنذار كتابي
                'PARENT_CONFERENCE',   // اجتماع ولي الأمر
                'DETENTION',           // احتجاز
                'COMMUNITY_SERVICE',   // خدمة مجتمعية
                'SUSPENSION',          // إيقاف
                'PROBATION',           // مراقبة
                'RESTRICTION',         // تقييد امتيازات
                'COUNSELING',          // إرشاد
                'EXPULSION',           // فصل
                'OTHER',               // أخرى
            ]);
            $table->string('action_type_other')->nullable();

            // Action Dates
            $table->date('action_date');
            $table->date('start_date')->nullable(); // For suspension/probation
            $table->date('end_date')->nullable();   // For suspension/probation
            $table->integer('duration_days')->nullable();

            // Description
            $table->text('description');
            $table->text('description_ar')->nullable();

            // Status
            $table->enum('status', [
                'PENDING',     // قيد الانتظار
                'ACTIVE',      // نشط
                'COMPLETED',   // مكتمل
                'CANCELLED',   // ملغي
            ])->default('PENDING');

            // Completion
            $table->text('completion_notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();

            // Guardian Acknowledgement
            $table->boolean('guardian_acknowledged')->default(false);
            $table->timestamp('guardian_acknowledged_at')->nullable();
            $table->string('guardian_signature')->nullable(); // Digital signature path

            // Appeal
            $table->boolean('is_appealable')->default(true);
            $table->date('appeal_deadline')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index(['action_type', 'status']);
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discipline_actions');
    }
};
