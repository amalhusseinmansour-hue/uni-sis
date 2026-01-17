<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Soft deletes for archiving
            if (!Schema::hasColumn('students', 'deleted_at')) {
                $table->softDeletes();
            }

            // Archive metadata
            if (!Schema::hasColumn('students', 'archive_reason')) {
                $table->string('archive_reason')->nullable()->after('deleted_at');
            }
            if (!Schema::hasColumn('students', 'archived_by')) {
                $table->unsignedBigInteger('archived_by')->nullable()->after('archive_reason');
            }
            if (!Schema::hasColumn('students', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('archived_by');
            }

            // Admission type
            if (!Schema::hasColumn('students', 'admission_type')) {
                $table->enum('admission_type', [
                    'DIRECT',           // قبول مباشر
                    'TRANSFER',         // تحويل من جامعة أخرى
                    'POSTGRADUATE',     // دراسات عليا
                    'SCHOLARSHIP',      // منحة
                    'BRIDGE',           // برنامج جسر
                    'READMISSION',      // إعادة قيد
                    'VISITING',         // طالب زائر
                ])->default('DIRECT')->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['archive_reason', 'archived_by', 'archived_at', 'admission_type']);
        });
    }
};
