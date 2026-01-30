<?php
/**
 * Update student profile with sample data
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\User;

header('Content-Type: application/json');

try {
    // Find the test student (20103555)
    $student = Student::where('student_id', '20103555')->first();

    if (!$student) {
        echo json_encode(['error' => 'Student not found']);
        exit;
    }

    // Update with comprehensive sample data
    $student->update([
        // Arabic Name Parts
        'first_name_ar' => 'أحمد',
        'middle_name_ar' => 'محمد',
        'last_name_ar' => 'المنصور',
        'name_ar' => 'أحمد محمد المنصور',

        // English Name Parts
        'first_name_en' => 'Ahmed',
        'middle_name_en' => 'Mohammed',
        'last_name_en' => 'Al-Mansour',
        'name_en' => 'Ahmed Mohammed Al-Mansour',

        // Personal Data
        'national_id' => '1234567890',
        'id_type' => 'NATIONAL_ID',
        'date_of_birth' => '2000-05-15',
        'birth_city' => 'الرياض',
        'birth_country' => 'السعودية',
        'gender' => 'MALE',
        'nationality' => 'سعودي',
        'marital_status' => 'SINGLE',
        'religion' => 'مسلم',
        'primary_language' => 'العربية',

        // Contact Information
        'phone' => '+966501234567',
        'alternative_phone' => '+966509876543',
        'personal_email' => 'ahmed.mansour@gmail.com',
        'university_email' => 'ahmed.mansour@vertex.edu.sa',

        // Address
        'address_country' => 'السعودية',
        'address_region' => 'منطقة الرياض',
        'address_city' => 'الرياض',
        'address_street' => 'شارع الملك فهد',
        'address_neighborhood' => 'حي العليا',
        'postal_code' => '12345',

        // Guardian Info
        'guardian_name' => 'محمد أحمد المنصور',
        'guardian_relationship' => 'FATHER',
        'guardian_phone' => '+966505551234',
        'guardian_email' => 'mohammed.mansour@gmail.com',
        'guardian_occupation' => 'مهندس',
        'guardian_workplace' => 'شركة أرامكو',

        // Mother Info
        'mother_name' => 'فاطمة عبدالله',
        'mother_phone' => '+966505559876',

        // Academic Data
        'status' => 'ACTIVE',
        'level' => 3,
        'current_semester' => 1,
        'gpa' => 3.45,
        'term_gpa' => 3.60,
        'total_required_credits' => 132,
        'completed_credits' => 75,
        'registered_credits' => 15,
        'remaining_credits' => 42,
        'academic_status' => 'GOOD_STANDING',
        'admission_date' => '2022-09-01',
        'cohort' => '2022',
        'first_enrollment_term' => 'Fall 2022',

        // Previous Education
        'high_school_certificate_type' => 'TAWJIHI',
        'high_school_track' => 'SCIENTIFIC',
        'high_school_country' => 'السعودية',
        'high_school_name' => 'ثانوية الملك فيصل',
        'high_school_graduation_year' => 2022,
        'high_school_gpa' => 95.5,

        // Financial Summary
        'total_fees' => 45000.00,
        'paid_amount' => 35000.00,
        'current_balance' => 10000.00,
        'financial_status' => 'PARTIALLY_PAID',

        // System Accounts
        'sis_username' => '20103555',
        'lms_username' => 'ahmed.mansour',
        'sis_account_status' => 'ACTIVE',
        'lms_account_status' => 'ACTIVE',
        'last_login' => now(),
    ]);

    // Also update the user record
    $user = User::find($student->user_id);
    if ($user) {
        $user->update([
            'name' => 'أحمد محمد المنصور',
            'phone' => '+966501234567',
        ]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Student profile updated successfully',
        'student' => [
            'id' => $student->id,
            'student_id' => $student->student_id,
            'name_ar' => $student->name_ar,
            'name_en' => $student->name_en,
            'gpa' => $student->gpa,
            'level' => $student->level,
            'status' => $student->status,
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
