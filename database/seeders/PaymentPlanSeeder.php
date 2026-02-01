<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentPlan;
use App\Models\Student;
use App\Models\Semester;
use Carbon\Carbon;

class PaymentPlanSeeder extends Seeder
{
    public function run(): void
    {
        $currentSemester = Semester::where('is_current', true)->first();
        $students = Student::inRandomOrder()->limit(10)->get();

        if ($students->isEmpty()) {
            $this->command->info('No students found. Skipping payment plans seeding.');
            return;
        }

        foreach ($students as $student) {
            // Create a payment plan for each selected student
            $totalAmount = rand(3000, 8000);
            $downPayment = rand(500, 1500);
            $installmentsCount = rand(3, 6);

            $plan = PaymentPlan::create([
                'student_id' => $student->id,
                'semester_id' => $currentSemester?->id,
                'total_amount' => $totalAmount,
                'down_payment' => $downPayment,
                'number_of_installments' => $installmentsCount,
                'frequency' => 'MONTHLY',
                'start_date' => Carbon::now()->subMonths(rand(0, 2)),
                'end_date' => Carbon::now()->addMonths($installmentsCount),
                'status' => PaymentPlan::STATUS_ACTIVE,
                'notes' => 'Auto-generated payment plan for semester fees',
            ]);

            // Generate installments
            $plan->generateInstallments();

            // Randomly mark some installments as paid
            $paidCount = rand(0, min(2, $installmentsCount - 1));
            $installments = $plan->installments()->orderBy('installment_number')->limit($paidCount)->get();

            foreach ($installments as $installment) {
                $installment->update([
                    'status' => 'PAID',
                    'paid_amount' => $installment->amount,
                    'paid_date' => Carbon::now()->subDays(rand(7, 30)),
                ]);
                $plan->recordPayment($installment->amount);
            }

            $this->command->info("Created payment plan for student: {$student->full_name_en}");
        }

        $this->command->info('Payment plans seeded successfully!');
    }
}
