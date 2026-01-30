<?php
header('Content-Type: application/json');

try {
    require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';

    $dotenv = Dotenv\Dotenv::createImmutable('/home/sisvertexunivers/laravel-backend');
    $dotenv->load();

    $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
    $database = $_ENV['DB_DATABASE'] ?? 'forge';
    $username = $_ENV['DB_USERNAME'] ?? 'forge';
    $password = $_ENV['DB_PASSWORD'] ?? '';

    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if user exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute(['registrar@vertex.edu']);
    $existing = $stmt->fetch();

    if ($existing) {
        echo json_encode([
            'success' => true,
            'message' => 'User already exists',
            'credentials' => [
                'email' => 'registrar@vertex.edu',
                'password' => 'registrar123',
                'role' => 'REGISTRAR'
            ]
        ], JSON_PRETTY_PRINT);
        exit;
    }

    // Create user
    $hashedPassword = password_hash('registrar123', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute(['Academic Affairs Officer', 'registrar@vertex.edu', $hashedPassword, 'REGISTRAR']);

    echo json_encode([
        'success' => true,
        'message' => 'User created successfully!',
        'credentials' => [
            'email' => 'registrar@vertex.edu',
            'password' => 'registrar123',
            'role' => 'REGISTRAR'
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
