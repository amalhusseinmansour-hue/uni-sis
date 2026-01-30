<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * إضافة حقول جديدة لجدول طلبات القبول
     */
    public function up(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            // معلومات الإقامة
            if (!Schema::hasColumn('admission_applications', 'country')) {
                $table->string('country')->nullable()->after('nationality');
            }
            if (!Schema::hasColumn('admission_applications', 'city')) {
                $table->string('city')->nullable()->after('country');
            }
            if (!Schema::hasColumn('admission_applications', 'residence')) {
                $table->string('residence')->nullable()->after('city');
            }

            // المعلومات الأكاديمية
            if (!Schema::hasColumn('admission_applications', 'college')) {
                $table->string('college')->nullable()->after('program_id');
            }
            if (!Schema::hasColumn('admission_applications', 'degree')) {
                $table->string('degree')->nullable()->after('college');
            }

            // معلومات المنحة والدفع
            if (!Schema::hasColumn('admission_applications', 'scholarship_percentage')) {
                $table->decimal('scholarship_percentage', 5, 2)->nullable()->default(0)->after('registration_fee');
            }
            if (!Schema::hasColumn('admission_applications', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('scholarship_percentage');
            }

            // مصدر الطلب والبيانات الوصفية
            if (!Schema::hasColumn('admission_applications', 'source')) {
                $table->string('source')->nullable()->default('direct')->after('notes');
            }
            if (!Schema::hasColumn('admission_applications', 'metadata')) {
                $table->json('metadata')->nullable()->after('source');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            $columns = ['country', 'city', 'residence', 'college', 'degree',
                       'scholarship_percentage', 'payment_method', 'source', 'metadata'];

            foreach ($columns as $column) {
                if (Schema::hasColumn('admission_applications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
