<?php
header('Content-Type: application/json');

require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';
$app = require_once '/home/sisvertexunivers/laravel-backend/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$result = [];

// Check if registrar already exists
$existing = User::where('email', 'registrar@vertex.edu')->first();
if ($existing) {
    $result = [
        'success' => true,
        'message' => 'Registrar user already exists!',
        'credentials' => [
            'email' => 'registrar@vertex.edu',
            'password' => 'registrar123',
            'role' => 'REGISTRAR'
        ]
    ];
} else {
    // Create Registrar user
    $user = User::create([
        'name' => 'Academic Affairs Officer',
        'email' => 'registrar@vertex.edu',
        'password' => Hash::make('registrar123'),
        'role' => 'REGISTRAR',
    ]);

    $result = [
        'success' => true,
        'message' => 'Registrar user created successfully!',
        'credentials' => [
            'email' => 'registrar@vertex.edu',
            'password' => 'registrar123',
            'role' => 'REGISTRAR'
        ]
    ];
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
