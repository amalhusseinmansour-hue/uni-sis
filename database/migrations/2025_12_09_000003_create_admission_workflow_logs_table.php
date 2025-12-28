<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // جدول لتتبع سجل workflow طلب القبول
        Schema::create('admission_workflow_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_application_id')->constrained()->onDelete('cascade');
            $table->string('from_status')->nullable(); // الحالة السابقة
            $table->string('to_status'); // الحالة الجديدة
            $table->string('action'); // الإجراء المتخذ
            $table->foreignId('performed_by')->nullable()->constrained('users')->onDelete('set null'); // من قام بالإجراء
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // بيانات إضافية
            $table->timestamps();

            $table->index(['admission_application_id', 'created_at'], 'awl_app_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admission_workflow_logs');
    }
};
