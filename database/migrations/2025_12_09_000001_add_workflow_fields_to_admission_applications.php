<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            // تحديث حقل الحالة ليشمل الحالات الجديدة للـ workflow
            // PENDING → تم التقديم
            // UNDER_REVIEW → قيد المراجعة من القبول والتسجيل
            // DOCUMENTS_VERIFIED → تم التحقق من المستندات
            // PENDING_PAYMENT → في انتظار دفع رسوم التسجيل
            // PAYMENT_RECEIVED → تم استلام الدفع
            // APPROVED → تمت الموافقة النهائية
            // REJECTED → مرفوض
            // WAITLISTED → قائمة الانتظار

            // إضافة حقول جديدة للـ workflow
            $table->string('student_id')->nullable()->after('id'); // الرقم الجامعي بعد القبول النهائي
            $table->decimal('registration_fee', 10, 2)->default(0)->after('reviewer_notes'); // رسوم التسجيل
            $table->timestamp('documents_verified_at')->nullable()->after('registration_fee'); // تاريخ التحقق من المستندات
            $table->timestamp('payment_requested_at')->nullable()->after('documents_verified_at'); // تاريخ طلب الدفع
            $table->timestamp('payment_received_at')->nullable()->after('payment_requested_at'); // تاريخ استلام الدفع
            $table->timestamp('approved_at')->nullable()->after('payment_received_at'); // تاريخ الموافقة النهائية
            $table->string('acceptance_letter_path')->nullable()->after('approved_at'); // مسار خطاب القبول
            $table->string('university_card_path')->nullable()->after('acceptance_letter_path'); // مسار بطاقة الجامعة
            $table->foreignId('reviewed_by')->nullable()->after('university_card_path')->constrained('users')->onDelete('set null'); // من قام بالمراجعة
            $table->foreignId('approved_by')->nullable()->after('reviewed_by')->constrained('users')->onDelete('set null'); // من قام بالموافقة
        });
    }

    public function down(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'student_id',
                'registration_fee',
                'documents_verified_at',
                'payment_requested_at',
                'payment_received_at',
                'approved_at',
                'acceptance_letter_path',
                'university_card_path',
                'reviewed_by',
                'approved_by',
            ]);
        });
    }
};
