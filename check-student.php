<?php
require '/home/vertexun/sis-backend/vendor/autoload.php';
$app = require_once '/home/vertexun/sis-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

$studentId = '20103555';

// Check if student exists
$student = DB::table('students')->where('student_id', $studentId)->first();

if ($student) {
    echo "Student found:\n";
    echo "  ID: {$student->id}\n";
    echo "  Student ID: {$student->student_id}\n";
    echo "  Name: {$student->name_en}\n";
    echo "  User ID: {$student->user_id}\n";

    // Get user
    $user = DB::table('users')->where('id', $student->user_id)->first();
    if ($user) {
        echo "\nUser found:\n";
        echo "  Email: {$user->email}\n";
        echo "  Role: {$user->role}\n";

        // Check password
        if (Hash::check('123456789', $user->password)) {
            echo "  Password '123456789' is CORRECT\n";
        } else {
            echo "  Password '123456789' is INCORRECT\n";
            // Reset password
            DB::table('users')->where('id', $user->id)->update([
                'password' => Hash::make('123456789')
            ]);
            echo "  Password has been reset to '123456789'\n";
        }
    } else {
        echo "\nUser not found! Creating user...\n";
        $userId = DB::table('users')->insertGetId([
            'name' => $student->name_en ?? 'Student',
            'email' => $studentId . '@vertex.edu',
            'password' => Hash::make('123456789'),
            'role' => 'STUDENT',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('students')->where('id', $student->id)->update(['user_id' => $userId]);
        echo "Created user with ID: {$userId}\n";
    }
} else {
    echo "Student with ID {$studentId} not found!\n";
    echo "\nAvailable students:\n";
    $students = DB::table('students')->select('student_id', 'name_en')->take(10)->get();
    foreach ($students as $s) {
        echo "  {$s->student_id} - {$s->name_en}\n";
    }
}
