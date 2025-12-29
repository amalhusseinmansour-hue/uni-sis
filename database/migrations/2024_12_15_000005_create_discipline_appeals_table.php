<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Discipline Appeals - استئنافات المخالفات
     */
    public function up(): void
    {
        Schema::create('discipline_appeals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->nullable()->constrained('discipline_incidents')->nullOnDelete();
            $table->foreignId('action_id')->nullable()->constrained('discipline_actions')->nullOnDelete();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade'); // Student or Guardian

            // Appeal Details
            $table->string('appeal_number')->unique();
            $table->enum('appeal_type', [
                'INCIDENT_DISPUTE',    // نزاع على المخالفة
                'ACTION_REDUCTION',    // تخفيف الإجراء
                'POINTS_REDUCTION',    // تخفيف النقاط
                'FULL_DISMISSAL',      // إلغاء كامل
            ]);

            // Appeal Content
            $table->text('reason'); // Why they're appealing
            $table->text('reason_ar')->nullable();
            $table->json('supporting_documents')->nullable(); // Evidence files

            // Status
            $table->enum('status', [
                'SUBMITTED',    // تم التقديم
                'UNDER_REVIEW', // قيد المراجعة
                'APPROVED',     // موافق عليه
                'PARTIALLY_APPROVED', // موافق عليه جزئياً
                'REJECTED',     // مرفوض
                'WITHDRAWN',    // تم السحب
            ])->default('SUBMITTED');

            // Review
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->text('review_notes_ar')->nullable();

            // Decision
            $table->text('decision')->nullable();
            $table->text('decision_ar')->nullable();
            $table->integer('points_reduced')->default(0); // If points were reduced
            $table->boolean('action_modified')->default(false);
            $table->text('modified_action_details')->nullable();

            // Deadlines
            $table->date('submission_deadline');
            $table->boolean('submitted_on_time')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index('appeal_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discipline_appeals');
    }
};
