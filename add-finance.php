<?php
require '/home/vertexun/sis-backend/vendor/autoload.php';
$app = require_once '/home/vertexun/sis-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$studentId = 15; // Ahmed Mohammed

// Add financial records
$existingFinance = DB::table('financial_records')->where('student_id', $studentId)->first();
if (!$existingFinance) {
    // Tuition fee (debit)
    DB::table('financial_records')->insert([
        'student_id' => $studentId,
        'semester_id' => 1,
        'date' => '2025-09-01',
        'due_date' => '2025-10-15',
        'description' => 'Tuition Fee - Fall 2025',
        'fee_category' => 'tuition',
        'amount' => 5000.00,
        'type' => 'DEBIT',
        'status' => 'PENDING',
        'reference_number' => 'INV-2025-001',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Payment (credit)
    DB::table('financial_records')->insert([
        'student_id' => $studentId,
        'semester_id' => 1,
        'date' => '2025-09-15',
        'payment_date' => '2025-09-15',
        'description' => 'Payment - Bank Transfer',
        'fee_category' => 'payment',
        'amount' => 3000.00,
        'type' => 'CREDIT',
        'status' => 'PAID',
        'payment_method' => 'bank_transfer',
        'reference_number' => 'PAY-2025-001',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    echo "Added financial records!\n";
} else {
    echo "Financial records already exist\n";
}

echo "Done!\n";
