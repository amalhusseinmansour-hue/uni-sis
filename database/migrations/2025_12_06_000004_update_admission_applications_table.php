<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            // Add additional fields for API compatibility
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->string('gender')->nullable()->after('date_of_birth'); // MALE, FEMALE
            $table->string('nationality')->nullable()->after('gender');
            $table->text('address')->nullable()->after('nationality');
            $table->string('high_school_name')->nullable()->after('address');
            $table->integer('high_school_year')->nullable()->after('high_school_score');
            $table->json('documents')->nullable()->after('high_school_year');
            $table->string('emergency_contact_name')->nullable()->after('documents');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            $table->text('reviewer_notes')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'gender',
                'nationality',
                'address',
                'high_school_name',
                'high_school_year',
                'documents',
                'emergency_contact_name',
                'emergency_contact_phone',
                'reviewer_notes'
            ]);
        });
    }
};
