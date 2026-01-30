<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Resetting Passwords ===\n\n";

// Reset admin@vertex.edu
$admin = User::where('email', 'admin@vertex.edu')->first();
if ($admin) {
    $admin->password = Hash::make('admin123');
    $admin->save();
    echo "✓ admin@vertex.edu - password set to: admin123\n";
}

// Reset admin@university.edu
$admin2 = User::where('email', 'admin@university.edu')->first();
if ($admin2) {
    $admin2->password = Hash::make('admin123');
    $admin2->save();
    echo "✓ admin@university.edu - password set to: admin123\n";
}

// Reset student@university.edu
$student = User::where('email', 'student@university.edu')->first();
if ($student) {
    $student->password = Hash::make('student123');
    $student->save();
    echo "✓ student@university.edu - password set to: student123\n";
}

// Reset demo.student@vertexuniversity.edu.eu
$demo = User::where('email', 'demo.student@vertexuniversity.edu.eu')->first();
if ($demo) {
    $demo->password = Hash::make('student123');
    $demo->save();
    echo "✓ demo.student@vertexuniversity.edu.eu - password set to: student123\n";
}

// Reset finance@university.edu
$finance = User::where('email', 'finance@university.edu')->first();
if ($finance) {
    $finance->password = Hash::make('finance123');
    $finance->save();
    echo "✓ finance@university.edu - password set to: finance123\n";
}

// Reset lecturer@university.edu
$lecturer = User::where('email', 'lecturer@university.edu')->first();
if ($lecturer) {
    $lecturer->password = Hash::make('lecturer123');
    $lecturer->save();
    echo "✓ lecturer@university.edu - password set to: lecturer123\n";
}

echo "\n=== All Login Credentials ===\n";
echo "Admin:    admin@vertex.edu / admin123\n";
echo "Admin:    admin@university.edu / admin123\n";
echo "Student:  student@university.edu / student123\n";
echo "Student:  demo.student@vertexuniversity.edu.eu / student123\n";
echo "Finance:  finance@university.edu / finance123\n";
echo "Lecturer: lecturer@university.edu / lecturer123\n";
