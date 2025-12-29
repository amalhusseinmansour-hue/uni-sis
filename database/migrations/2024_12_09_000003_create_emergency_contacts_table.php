<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Emergency Contacts - جهات الاتصال للطوارئ
     * Flexible structure for multiple emergency contacts with priority ordering
     */
    public function up(): void
    {
        Schema::create('emergency_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            // Priority and Identification
            $table->integer('priority')->default(1); // 1 = first contact, 2 = second, etc.

            // Contact Person Info
            $table->string('name_ar');
            $table->string('name_en')->nullable();
            $table->enum('relationship', [
                'FATHER', 'MOTHER', 'BROTHER', 'SISTER',
                'UNCLE', 'AUNT', 'GRANDFATHER', 'GRANDMOTHER',
                'SPOUSE', 'FRIEND', 'NEIGHBOR', 'COLLEAGUE',
                'LEGAL_GUARDIAN', 'OTHER'
            ]);
            $table->string('relationship_other')->nullable();

            // Contact Methods
            $table->string('phone');
            $table->string('alternative_phone')->nullable();
            $table->string('landline')->nullable();
            $table->string('email')->nullable();

            // Location
            $table->string('address')->nullable();
            $table->string('work_address')->nullable();
            $table->string('work_phone')->nullable();

            // Notes
            $table->text('notes')->nullable(); // e.g., "Preferred contact", "Available evenings only"
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'priority']);
            $table->index(['student_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_contacts');
    }
};
