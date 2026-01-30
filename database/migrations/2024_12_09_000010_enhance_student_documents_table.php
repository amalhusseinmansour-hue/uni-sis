<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enhance Student Documents - المرفقات والوثائق
     * Add more document types, uploader tracking, and verification workflow
     */
    public function up(): void
    {
        Schema::table('student_documents', function (Blueprint $table) {
            // First, we need to modify the enum - in MySQL we need to recreate the column
            // For SQLite (used in development), we'll add a new column and handle migration

            // Drop the old enum column and recreate with more options
            // Note: This approach works with SQLite which doesn't support enum modification
        });

        // Create a new enhanced documents table
        Schema::create('student_documents_v2', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            // Document Classification
            $table->enum('document_category', [
                'IDENTITY',             // وثائق هوية
                'ACADEMIC',             // وثائق أكاديمية
                'FINANCIAL',            // وثائق مالية
                'MEDICAL',              // وثائق طبية
                'PERSONAL',             // وثائق شخصية
                'ADMINISTRATIVE',       // وثائق إدارية
                'OTHER'
            ])->default('OTHER');

            // Document Type (comprehensive list)
            $table->enum('type', [
                // Identity Documents
                'NATIONAL_ID',          // هوية وطنية
                'PASSPORT',             // جواز سفر
                'RESIDENCE_PERMIT',     // إقامة
                'REFUGEE_CARD',         // بطاقة لاجئ
                'BIRTH_CERTIFICATE',    // شهادة ميلاد

                // Academic Documents
                'HIGH_SCHOOL_CERTIFICATE',  // شهادة ثانوية
                'HIGH_SCHOOL_TRANSCRIPT',   // كشف درجات ثانوية
                'BACHELOR_CERTIFICATE',     // شهادة بكالوريوس
                'BACHELOR_TRANSCRIPT',      // كشف درجات بكالوريوس
                'MASTER_CERTIFICATE',       // شهادة ماجستير
                'MASTER_TRANSCRIPT',        // كشف درجات ماجستير
                'PHD_CERTIFICATE',          // شهادة دكتوراه
                'EQUIVALENCY_CERTIFICATE', // شهادة معادلة
                'LANGUAGE_CERTIFICATE',    // شهادة لغة (TOEFL, IELTS)
                'PROFESSIONAL_CERTIFICATE', // شهادة مهنية

                // Photos
                'PERSONAL_PHOTO',       // صورة شخصية
                'FORMAL_PHOTO',         // صورة رسمية

                // Financial Documents
                'SCHOLARSHIP_LETTER',   // كتاب منحة
                'PAYMENT_RECEIPT',      // إيصال دفع
                'BANK_STATEMENT',       // كشف حساب بنكي
                'SPONSOR_LETTER',       // كتاب كفالة

                // Medical Documents
                'MEDICAL_REPORT',       // تقرير طبي
                'DISABILITY_CERTIFICATE', // شهادة إعاقة
                'VACCINATION_RECORD',   // سجل تطعيم

                // Administrative
                'ACCEPTANCE_LETTER',    // كتاب قبول
                'NO_OBJECTION_LETTER',  // كتاب عدم ممانعة
                'RECOMMENDATION_LETTER', // خطاب توصية
                'TRANSFER_LETTER',      // كتاب انتقال
                'CLEARANCE_FORM',       // نموذج مخالصة

                // Other
                'OTHER'                 // أخرى
            ]);
            $table->string('type_other')->nullable(); // If type is OTHER

            // Document Details
            $table->string('name');                    // Document name/title
            $table->string('name_ar')->nullable();     // Arabic name
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_extension')->nullable();
            $table->integer('file_size')->nullable();   // In bytes
            $table->string('mime_type')->nullable();

            // Document Validity
            $table->date('issue_date')->nullable();     // تاريخ الإصدار
            $table->date('expiry_date')->nullable();    // تاريخ الانتهاء
            $table->string('document_number')->nullable(); // رقم الوثيقة
            $table->string('issuing_authority')->nullable(); // الجهة المصدرة

            // Upload Information
            $table->date('upload_date');
            $table->enum('uploaded_by_type', ['STUDENT', 'STAFF', 'SYSTEM'])->default('STUDENT');
            $table->foreignId('uploaded_by')->nullable()->constrained('users');

            // Verification Status
            $table->enum('status', [
                'PENDING',              // بانتظار المراجعة
                'UNDER_REVIEW',         // قيد المراجعة
                'ACCEPTED',             // مقبول
                'REJECTED',             // مرفوض
                'NEEDS_UPDATE',         // يحتاج تحديث
                'EXPIRED'               // منتهي الصلاحية
            ])->default('PENDING');

            // Review Information
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->text('rejection_reason')->nullable();

            // Document Requirements
            $table->boolean('is_required')->default(false);
            $table->boolean('is_original_required')->default(false);
            $table->boolean('original_submitted')->default(false);

            // Visibility
            $table->boolean('visible_to_student')->default(true);
            $table->boolean('visible_to_staff')->default(true);
            $table->boolean('is_confidential')->default(false);

            // Version Control
            $table->integer('version')->default(1);
            $table->foreignId('replaces_document_id')->nullable();

            // Additional
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['student_id', 'type']);
            $table->index(['student_id', 'status']);
            $table->index(['student_id', 'document_category']);
            $table->index('expiry_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_documents_v2');
    }
};
