<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Guardian & Family Info - ولي الأمر والعائلة
     * Supports multiple guardians per student with full contact details
     */
    public function up(): void
    {
        Schema::create('student_guardians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            // Guardian Identification
            $table->boolean('is_primary')->default(false); // Primary guardian indicator

            // Guardian Personal Info
            $table->string('name_ar');
            $table->string('name_en')->nullable();
            $table->enum('relationship', [
                'FATHER', 'MOTHER', 'BROTHER', 'SISTER',
                'UNCLE', 'AUNT', 'GRANDFATHER', 'GRANDMOTHER',
                'SPOUSE', 'LEGAL_GUARDIAN', 'OTHER'
            ]);
            $table->string('relationship_other')->nullable(); // If relationship is OTHER

            // Contact Information
            $table->string('phone')->nullable();
            $table->string('alternative_phone')->nullable();
            $table->string('landline')->nullable();
            $table->string('email')->nullable();

            // Professional Info
            $table->string('occupation')->nullable();
            $table->string('workplace')->nullable();
            $table->string('work_phone')->nullable();

            // Address (if different from student)
            $table->boolean('same_address_as_student')->default(true);
            $table->string('address_country')->nullable();
            $table->string('address_region')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_street')->nullable();
            $table->string('address_neighborhood')->nullable();
            $table->text('address_description')->nullable();
            $table->string('postal_code')->nullable();

            // Additional Info
            $table->string('national_id')->nullable();
            $table->decimal('monthly_income', 10, 2)->nullable(); // For scholarship assessment
            $table->boolean('is_alive')->default(true);
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'is_primary']);
            $table->index('relationship');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_guardians');
    }
};
