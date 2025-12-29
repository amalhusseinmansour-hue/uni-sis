<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change row format to DYNAMIC to allow more columns
        DB::statement('ALTER TABLE students ROW_FORMAT=DYNAMIC');

        Schema::table('students', function (Blueprint $table) {
            // ==========================================
            // Student Header / Profile Card Fields
            // ==========================================
            $table->string('profile_picture', 150)->nullable()->after('name_en');
            $table->string('qr_code', 150)->nullable()->after('profile_picture');
            $table->string('barcode', 100)->nullable()->after('qr_code');

            // ==========================================
            // Enhanced Personal Information
            // ==========================================
            // Arabic Name Parts
            $table->string('first_name_ar', 100)->nullable()->after('name_ar');
            $table->string('middle_name_ar', 100)->nullable()->after('first_name_ar');
            $table->string('last_name_ar', 100)->nullable()->after('middle_name_ar');
            $table->string('fourth_name_ar', 100)->nullable()->after('last_name_ar');

            // English Name Parts
            $table->string('first_name_en', 100)->nullable()->after('name_en');
            $table->string('middle_name_en', 100)->nullable()->after('first_name_en');
            $table->string('last_name_en', 100)->nullable()->after('middle_name_en');
            $table->string('fourth_name_en', 100)->nullable()->after('last_name_en');

            // ID Document Info
            $table->enum('id_type', ['NATIONAL_ID', 'PASSPORT', 'REFUGEE_CARD', 'OTHER'])->default('NATIONAL_ID')->after('passport_number');
            $table->date('id_expiry_date')->nullable()->after('id_type');
            $table->date('passport_expiry_date')->nullable()->after('id_expiry_date');

            // Additional Personal Info
            $table->string('secondary_nationality', 100)->nullable()->after('nationality');
            $table->string('religion', 50)->nullable()->after('secondary_nationality');
            $table->enum('primary_language', ['ARABIC', 'ENGLISH', 'FRENCH', 'SPANISH', 'OTHER'])->default('ARABIC')->after('religion');

            // ==========================================
            // Legal & Residency Info
            // ==========================================
            $table->enum('residency_type', ['CITIZEN', 'RESIDENT', 'REFUGEE', 'FOREIGNER', 'OTHER'])->nullable()->after('primary_language');
            $table->string('residency_number', 50)->nullable()->after('residency_type');
            $table->string('refugee_card_number', 50)->nullable()->after('residency_number');
            $table->string('current_residence_country', 100)->nullable()->after('refugee_card_number');
            $table->date('residency_expiry_date')->nullable()->after('current_residence_country');

            // ==========================================
            // Enhanced Contact Information
            // ==========================================
            $table->string('landline_phone', 30)->nullable()->after('alternative_phone');
            $table->string('linkedin_profile', 150)->nullable()->after('university_email');
            $table->string('telegram_username', 100)->nullable()->after('linkedin_profile');

            // ==========================================
            // Enhanced Address Information
            // ==========================================
            $table->string('address_region', 100)->nullable()->after('address_country');
            $table->string('address_neighborhood', 100)->nullable()->after('address_street');
            $table->text('address_description')->nullable()->after('address_neighborhood');

            // Current Address (if different from permanent)
            $table->string('current_address_country', 100)->nullable()->after('postal_code');
            $table->string('current_address_region', 100)->nullable()->after('current_address_country');
            $table->string('current_address_city', 100)->nullable()->after('current_address_region');
            $table->string('current_address_street', 150)->nullable()->after('current_address_city');
            $table->string('current_address_neighborhood', 100)->nullable()->after('current_address_street');
            $table->text('current_address_description')->nullable()->after('current_address_neighborhood');
            $table->string('current_postal_code', 20)->nullable()->after('current_address_description');

            // ==========================================
            // Enhanced Guardian Information
            // ==========================================
            $table->string('guardian_occupation', 100)->nullable()->after('guardian_address');
            $table->string('guardian_workplace', 150)->nullable()->after('guardian_occupation');
            $table->string('guardian_alternative_phone', 30)->nullable()->after('guardian_phone');

            // Mother Information
            $table->string('mother_name', 150)->nullable()->after('guardian_workplace');
            $table->string('mother_phone', 30)->nullable()->after('mother_name');

            // Family Details
            $table->integer('family_members_count')->nullable()->after('mother_phone');
            $table->integer('siblings_in_university')->nullable()->after('family_members_count');

            // ==========================================
            // Enhanced Emergency Contact
            // ==========================================
            $table->text('emergency_notes')->nullable()->after('emergency_relationship');

            // Second Emergency Contact
            $table->string('emergency2_name', 150)->nullable()->after('emergency_notes');
            $table->string('emergency2_phone', 30)->nullable()->after('emergency2_name');
            $table->enum('emergency2_relationship', ['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'SPOUSE', 'GUARDIAN', 'UNCLE', 'AUNT', 'FRIEND', 'OTHER'])->nullable()->after('emergency2_phone');
            $table->text('emergency2_notes')->nullable()->after('emergency2_relationship');

            // ==========================================
            // Previous Education (Basic - detailed in separate table)
            // ==========================================
            $table->enum('high_school_certificate_type', ['TAWJIHI', 'EQUIVALENT', 'INTERNATIONAL', 'OTHER'])->nullable()->after('degree');
            $table->enum('high_school_track', ['SCIENTIFIC', 'LITERARY', 'RELIGIOUS', 'TECHNOLOGY', 'COMMERCIAL', 'NURSING', 'OTHER'])->nullable()->after('high_school_certificate_type');
            $table->string('high_school_country', 100)->nullable()->after('high_school_track');
            $table->string('high_school_name', 150)->nullable()->after('high_school_country');
            $table->year('high_school_graduation_year')->nullable()->after('high_school_name');
            $table->decimal('high_school_gpa', 5, 2)->nullable()->after('high_school_graduation_year');
            $table->string('high_school_seat_number', 50)->nullable()->after('high_school_gpa');

            // ==========================================
            // System Accounts Enhanced
            // ==========================================
            $table->enum('lms_account_status', ['ACTIVE', 'LOCKED', 'NOT_CREATED'])->default('NOT_CREATED')->after('lms_username');
            $table->enum('sis_account_status', ['ACTIVE', 'LOCKED', 'NOT_CREATED'])->default('NOT_CREATED')->after('lms_account_status');

            // ==========================================
            // Notes and Classifications
            // ==========================================
            $table->json('tags')->nullable()->after('last_login');
            $table->text('admission_notes')->nullable()->after('tags');
            $table->text('student_affairs_notes')->nullable()->after('admission_notes');
            $table->text('advisor_notes')->nullable()->after('student_affairs_notes');

            // ==========================================
            // Academic Enhancements
            // ==========================================
            $table->integer('academic_warnings_count')->default(0)->after('gpa');
            $table->enum('administrative_status', ['ACTIVE', 'SUSPENDED', 'WITHDRAWN', 'GRADUATED', 'POSTPONED'])->default('ACTIVE')->after('academic_status');
            $table->string('first_enrollment_term', 50)->nullable()->after('cohort');

            // ==========================================
            // Graduation Tracking
            // ==========================================
            $table->boolean('has_completed_required_credits')->default(false)->after('remaining_credits');
            $table->boolean('has_completed_core_courses')->default(false)->after('has_completed_required_credits');
            $table->boolean('has_completed_electives')->default(false)->after('has_completed_core_courses');
            $table->enum('graduation_application_status', ['NOT_APPLIED', 'PENDING', 'APPROVED', 'GRADUATED'])->default('NOT_APPLIED')->after('has_completed_electives');

            // Graduation Project
            $table->string('graduation_project_title', 200)->nullable()->after('graduation_application_status');
            $table->string('graduation_project_supervisor', 150)->nullable()->after('graduation_project_title');
            $table->enum('graduation_project_status', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_REQUIRED'])->default('NOT_REQUIRED')->after('graduation_project_supervisor');
            $table->decimal('graduation_project_grade', 5, 2)->nullable()->after('graduation_project_status');

            // Internship
            $table->string('internship_organization', 150)->nullable()->after('graduation_project_grade');
            $table->integer('internship_hours')->nullable()->after('internship_organization');
            $table->enum('internship_status', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_REQUIRED'])->default('NOT_REQUIRED')->after('internship_hours');
        });

        // Update emergency_relationship enum to include more options
        // Note: This is handled by creating the new column above with expanded options
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Profile Card
            $table->dropColumn([
                'profile_picture', 'qr_code', 'barcode',
                // Arabic Name Parts
                'first_name_ar', 'middle_name_ar', 'last_name_ar', 'fourth_name_ar',
                // English Name Parts
                'first_name_en', 'middle_name_en', 'last_name_en', 'fourth_name_en',
                // ID Info
                'id_type', 'id_expiry_date', 'passport_expiry_date',
                // Additional Personal
                'secondary_nationality', 'religion', 'primary_language',
                // Residency
                'residency_type', 'residency_number', 'refugee_card_number', 'current_residence_country', 'residency_expiry_date',
                // Contact
                'landline_phone', 'linkedin_profile', 'telegram_username',
                // Address
                'address_region', 'address_neighborhood', 'address_description',
                'current_address_country', 'current_address_region', 'current_address_city', 'current_address_street',
                'current_address_neighborhood', 'current_address_description', 'current_postal_code',
                // Guardian
                'guardian_occupation', 'guardian_workplace', 'guardian_alternative_phone',
                'mother_name', 'mother_phone', 'family_members_count', 'siblings_in_university',
                // Emergency
                'emergency_notes', 'emergency2_name', 'emergency2_phone', 'emergency2_relationship', 'emergency2_notes',
                // Previous Education
                'high_school_certificate_type', 'high_school_track', 'high_school_country',
                'high_school_name', 'high_school_graduation_year', 'high_school_gpa', 'high_school_seat_number',
                // System Accounts
                'lms_account_status', 'sis_account_status',
                // Notes
                'tags', 'admission_notes', 'student_affairs_notes', 'advisor_notes',
                // Academic
                'academic_warnings_count', 'administrative_status', 'first_enrollment_term',
                // Graduation
                'has_completed_required_credits', 'has_completed_core_courses', 'has_completed_electives',
                'graduation_application_status', 'graduation_project_title', 'graduation_project_supervisor',
                'graduation_project_status', 'graduation_project_grade',
                'internship_organization', 'internship_hours', 'internship_status'
            ]);
        });
    }
};
