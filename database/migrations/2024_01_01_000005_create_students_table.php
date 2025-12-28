<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->engine = 'InnoDB ROW_FORMAT=DYNAMIC';
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('advisor_id')->nullable()->constrained()->onDelete('set null');

            // Student Card Info
            $table->string('student_id')->unique();
            $table->string('name_ar');
            $table->string('name_en');
            $table->enum('status', ['ACTIVE', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN'])->default('ACTIVE');
            $table->enum('program_type', ['BACHELOR', 'MASTER', 'PHD'])->default('BACHELOR');

            // Personal Data
            $table->string('national_id')->unique();
            $table->string('passport_number')->nullable();
            $table->date('date_of_birth');
            $table->string('birth_city')->nullable();
            $table->string('birth_country')->nullable();
            $table->enum('gender', ['MALE', 'FEMALE']);
            $table->string('nationality');
            $table->enum('marital_status', ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'])->default('SINGLE');
            $table->date('admission_date');

            // Contact Information
            $table->string('phone');
            $table->string('alternative_phone')->nullable();
            $table->string('personal_email');
            $table->string('university_email')->unique();

            // Address
            $table->string('address_country')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_street')->nullable();
            $table->string('postal_code')->nullable();

            // Guardian Information
            $table->string('guardian_name')->nullable();
            $table->enum('guardian_relationship', ['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'SPOUSE', 'GUARDIAN', 'OTHER'])->nullable();
            $table->string('guardian_phone')->nullable();
            $table->string('guardian_email')->nullable();
            $table->string('guardian_address')->nullable();

            // Emergency Contact
            $table->string('emergency_name')->nullable();
            $table->string('emergency_phone')->nullable();
            $table->enum('emergency_relationship', ['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'SPOUSE', 'GUARDIAN', 'OTHER'])->nullable();

            // Academic Information
            $table->string('college')->nullable();
            $table->string('department')->nullable();
            $table->string('major')->nullable();
            $table->string('degree')->nullable();
            $table->string('study_plan_code')->nullable();
            $table->string('study_plan_name')->nullable();
            $table->string('cohort')->nullable();
            $table->integer('level')->default(1);
            $table->string('current_semester')->nullable();
            $table->enum('academic_status', ['REGULAR', 'ON_PROBATION', 'DISMISSED', 'COMPLETED_REQUIREMENTS'])->default('REGULAR');

            // Academic Summary
            $table->integer('total_required_credits')->default(0);
            $table->integer('completed_credits')->default(0);
            $table->integer('registered_credits')->default(0);
            $table->integer('remaining_credits')->default(0);
            $table->decimal('term_gpa', 3, 2)->default(0);
            $table->decimal('gpa', 3, 2)->default(0);

            // Financial Summary
            $table->decimal('total_fees', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->decimal('current_balance', 10, 2)->default(0);
            $table->decimal('previous_balance', 10, 2)->default(0);
            $table->decimal('scholarships', 10, 2)->default(0);
            $table->enum('financial_status', ['CLEARED', 'ON_HOLD'])->default('CLEARED');

            // Systems & Accounts
            $table->string('sis_username')->nullable();
            $table->string('lms_username')->nullable();
            $table->enum('account_status', ['ACTIVE', 'LOCKED'])->default('ACTIVE');
            $table->timestamp('last_login')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
