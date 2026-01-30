<?php
require '/home/vertexun/sis-backend/vendor/autoload.php';
$app = require_once '/home/vertexun/sis-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$studentId = '20103555';

// Get student
$student = DB::table('students')->where('student_id', $studentId)->first();
if (!$student) {
    echo "Student not found!\n";
    exit;
}

echo "Student: {$student->name_en} (ID: {$student->id})\n";

// Check financial_records columns
$columns = Schema::getColumnListing('financial_records');
echo "\nFinancial records columns:\n";
print_r($columns);

// Add financial records with correct columns
$existingFinance = DB::table('financial_records')->where('student_id', $student->id)->first();
if (!$existingFinance) {
    $semester = DB::table('semesters')->where('is_current', true)->first();

    // Check an existing record to see the structure
    $sampleRecord = DB::table('financial_records')->first();
    if ($sampleRecord) {
        echo "\nSample record structure:\n";
        print_r((array)$sampleRecord);
    }
}

// Just update student financial summary
DB::table('students')->where('id', $student->id)->update([
    'total_fees' => 5000.00,
    'paid_amount' => 3000.00,
    'current_balance' => 2000.00,
]);

echo "\n=== Student Data ===\n";
$student = DB::table('students')->where('student_id', $studentId)->first();
echo "Name: {$student->name_en}\n";
echo "GPA: {$student->gpa}\n";
echo "Credits: {$student->completed_credits}/{$student->total_required_credits}\n";
echo "Balance: {$student->current_balance} LYD\n";
