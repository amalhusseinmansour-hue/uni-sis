<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Scholarship;
use App\Models\StudentScholarship;
use App\Models\Student;
use Carbon\Carbon;

class ScholarshipSeeder extends Seeder
{
    public function run(): void
    {
        // Create scholarship types
        $scholarships = [
            [
                'code' => 'MERIT-2024',
                'name_en' => 'Academic Excellence Scholarship',
                'name_ar' => 'منحة التفوق الأكاديمي',
                'type' => 'MERIT',
                'coverage_type' => 'PERCENTAGE',
                'coverage_value' => 50,
                'min_gpa' => 3.5,
                'max_recipients' => 20,
                'is_renewable' => true,
                'max_semesters' => 8,
                'is_active' => true,
                'eligibility_criteria' => 'Minimum GPA of 3.5, full-time student',
                'application_start' => Carbon::now()->subMonths(2),
                'application_end' => Carbon::now()->addMonths(1),
            ],
            [
                'code' => 'NEED-2024',
                'name_en' => 'Financial Aid Scholarship',
                'name_ar' => 'منحة المساعدة المالية',
                'type' => 'NEED_BASED',
                'coverage_type' => 'PERCENTAGE',
                'coverage_value' => 75,
                'min_gpa' => 2.5,
                'max_recipients' => 30,
                'is_renewable' => true,
                'max_semesters' => 8,
                'is_active' => true,
                'eligibility_criteria' => 'Financial need demonstrated, minimum GPA of 2.5',
                'application_start' => Carbon::now()->subMonths(2),
                'application_end' => Carbon::now()->addMonths(1),
            ],
            [
                'code' => 'FULL-2024',
                'name_en' => 'Full Tuition Scholarship',
                'name_ar' => 'منحة كاملة للرسوم الدراسية',
                'type' => 'FULL',
                'coverage_type' => 'PERCENTAGE',
                'coverage_value' => 100,
                'min_gpa' => 3.8,
                'max_recipients' => 5,
                'is_renewable' => true,
                'max_semesters' => 8,
                'is_active' => true,
                'eligibility_criteria' => 'Exceptional academic performance, GPA 3.8+',
                'application_start' => Carbon::now()->subMonths(2),
                'application_end' => Carbon::now()->addMonths(1),
            ],
            [
                'code' => 'ATHLETIC-2024',
                'name_en' => 'Athletic Achievement Scholarship',
                'name_ar' => 'منحة التميز الرياضي',
                'type' => 'ATHLETIC',
                'coverage_type' => 'PERCENTAGE',
                'coverage_value' => 40,
                'min_gpa' => 2.0,
                'max_recipients' => 15,
                'is_renewable' => true,
                'max_semesters' => 8,
                'is_active' => true,
                'eligibility_criteria' => 'Member of university sports team, minimum GPA 2.0',
                'application_start' => Carbon::now()->subMonths(2),
                'application_end' => Carbon::now()->addMonths(1),
            ],
            [
                'code' => 'PARTIAL-2024',
                'name_en' => 'Partial Tuition Support',
                'name_ar' => 'دعم جزئي للرسوم الدراسية',
                'type' => 'PARTIAL',
                'coverage_type' => 'FIXED_AMOUNT',
                'coverage_value' => 2000,
                'min_gpa' => 2.5,
                'max_recipients' => 50,
                'is_renewable' => false,
                'max_semesters' => 2,
                'is_active' => true,
                'eligibility_criteria' => 'Good academic standing',
                'application_start' => Carbon::now()->subMonths(2),
                'application_end' => Carbon::now()->addMonths(1),
            ],
        ];

        foreach ($scholarships as $data) {
            Scholarship::updateOrCreate(
                ['code' => $data['code']],
                $data
            );
        }

        $this->command->info('Created ' . count($scholarships) . ' scholarships');

        // Assign some scholarships to random students
        $students = Student::inRandomOrder()->limit(8)->get();
        $scholarshipModels = Scholarship::all();

        foreach ($students as $index => $student) {
            $scholarship = $scholarshipModels->random();

            StudentScholarship::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'scholarship_id' => $scholarship->id,
                ],
                [
                    'status' => $index < 5 ? 'ACTIVE' : 'PENDING',
                    'start_date' => Carbon::now()->subMonths(rand(0, 3)),
                    'awarded_amount' => $scholarship->coverage_type === 'FIXED_AMOUNT'
                        ? $scholarship->coverage_value
                        : rand(2000, 5000),
                    'disbursed_amount' => $index < 5 ? rand(1000, 3000) : 0,
                    'semesters_used' => $index < 5 ? rand(1, 3) : 0,
                    'approved_at' => $index < 5 ? Carbon::now()->subMonths(rand(1, 2)) : null,
                ]
            );
        }

        $this->command->info('Assigned scholarships to ' . $students->count() . ' students');
    }
}
