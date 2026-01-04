<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Current Users ===\n";
$users = User::all();
if ($users->isEmpty()) {
    echo "No users found in database!\n\n";
} else {
    foreach ($users as $u) {
        echo $u->id . ": " . $u->email . " (" . $u->role . ")\n";
    }
    echo "\n";
}

// Create admin user if not exists
$admin = User::where('email', 'admin@vertexuniversity.edu.eu')->first();
if (!$admin) {
    echo "Creating admin user...\n";
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@vertexuniversity.edu.eu',
        'password' => Hash::make('admin123'),
        'role' => 'ADMIN',
        'email_verified_at' => now(),
    ]);
    echo "Admin created: " . $admin->email . "\n";
} else {
    echo "Admin already exists: " . $admin->email . "\n";
    // Reset password
    $admin->password = Hash::make('admin123');
    $admin->save();
    echo "Password reset to: admin123\n";
}

// Create student user if not exists
$student = User::where('email', 'student@university.edu')->first();
if (!$student) {
    echo "\nCreating student user...\n";
    $student = User::create([
        'name' => 'Demo Student',
        'email' => 'student@university.edu',
        'password' => Hash::make('student123'),
        'role' => 'STUDENT',
        'email_verified_at' => now(),
    ]);
    echo "Student created: " . $student->email . "\n";
} else {
    echo "\nStudent already exists: " . $student->email . "\n";
    $student->password = Hash::make('student123');
    $student->save();
    echo "Password reset to: student123\n";
}

echo "\n=== Login Credentials ===\n";
echo "Admin: admin@vertexuniversity.edu.eu / admin123\n";
echo "Student: student@university.edu / student123\n";
