<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FeeStructure;
use App\Models\Program;
use Carbon\Carbon;

class FeeStructureSeeder extends Seeder
{
    public function run(): void
    {
        $fees = [
            [
                'fee_type' => 'TUITION',
                'name_en' => 'Tuition Fee',
                'name_ar' => 'الرسوم الدراسية',
                'amount' => 5000.00,
                'is_mandatory' => true,
                'is_recurring' => true,
                'applies_to' => 'ALL',
                'effective_from' => Carbon::now()->startOfYear(),
                'description' => 'Semester tuition fees',
            ],
            [
                'fee_type' => 'REGISTRATION',
                'name_en' => 'Registration Fee',
                'name_ar' => 'رسوم التسجيل',
                'amount' => 500.00,
                'is_mandatory' => true,
                'is_recurring' => true,
                'applies_to' => 'ALL',
                'effective_from' => Carbon::now()->startOfYear(),
                'description' => 'Semester registration fee',
            ],
            [
                'fee_type' => 'LAB',
                'name_en' => 'Laboratory Fee',
                'name_ar' => 'رسوم المختبر',
                'amount' => 300.00,
                'is_mandatory' => false,
                'is_recurring' => true,
                'applies_to' => 'ALL',
                'effective_from' => Carbon::now()->startOfYear(),
                'description' => 'Laboratory usage fee for science courses',
            ],
            [
                'fee_type' => 'LIBRARY',
                'name_en' => 'Library Fee',
                'name_ar' => 'رسوم المكتبة',
                'amount' => 150.00,
                'is_mandatory' => true,
                'is_recurring' => true,
                'applies_to' => 'ALL',
                'effective_from' => Carbon::now()->startOfYear(),
                'description' => 'Library access and resources',
            ],
            [
                'fee_type' => 'TECHNOLOGY',
                'name_en' => 'Technology Fee',
                'name_ar' => 'رسوم التقنية',
                'amount' => 200.00,
                'is_mandatory' => true,
                'is_recurring' => true,
                'applies_to' => 'ALL',
                'effective_from' => Carbon::now()->startOfYear(),
                'description' => 'Computer labs and IT services',
            ],
            [
                'fee_type' => 'INSURANCE',
                'name_en' => 'Health Insurance',
                'name_ar' => 'التأمين الصحي',
                'amount' => 400.00,
                'is_mandatory' => false,
                'is_recurring' => true,
                'applies_to' => 'ALL',
                'effective_from' => Carbon::now()->startOfYear(),
                'description' => 'Student health insurance coverage',
            ],
            [
                'fee_type' => 'SPORTS',
                'name_en' => 'Sports & Recreation',
                'name_ar' => 'رسوم الرياضة والترفيه',
                'amount' => 100.00,
                'is_mandatory' => false,
                'is_recurring' => true,
                'applies_to' => 'ALL',
                'effective_from' => Carbon::now()->startOfYear(),
                'description' => 'Access to sports facilities',
            ],
            [
                'fee_type' => 'ACTIVITIES',
                'name_en' => 'Student Activities',
                'name_ar' => 'الأنشطة الطلابية',
                'amount' => 75.00,
                'is_mandatory' => false,
                'is_recurring' => true,
                'applies_to' => 'ALL',
                'effective_from' => Carbon::now()->startOfYear(),
                'description' => 'Student clubs and activities',
            ],
        ];

        foreach ($fees as $fee) {
            FeeStructure::updateOrCreate(
                ['fee_type' => $fee['fee_type'], 'name_en' => $fee['name_en']],
                array_merge($fee, ['is_active' => true])
            );
        }

        $this->command->info('Created ' . count($fees) . ' fee structures');
    }
}
