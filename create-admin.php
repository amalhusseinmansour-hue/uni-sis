<?php
/**
 * Admin User Setup Script
 * IMPORTANT: Delete this file immediately after use!
 */

// Admin User Configuration
$adminEmail = 'admin@university.edu';
$adminPassword = 'password';
$adminName = 'Admin User';

// Check if form submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: text/plain; charset=utf-8');

    $dbHost = trim($_POST['db_host'] ?? '');
    $dbName = trim($_POST['db_name'] ?? '');
    $dbUser = trim($_POST['db_user'] ?? '');
    $dbPass = $_POST['db_pass'] ?? '';

    echo "=== Admin User Setup Script ===\n\n";

    try {
        echo "Connecting to database...\n";
        echo "Host: $dbHost\n";
        echo "Database: $dbName\n";
        echo "User: $dbUser\n\n";

        $pdo = new PDO(
            "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4",
            $dbUser,
            $dbPass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
        echo "Connected successfully!\n\n";

        // Check if admin user already exists
        echo "Checking if admin user exists...\n";
        $stmt = $pdo->prepare("SELECT id, email FROM users WHERE email = ?");
        $stmt->execute([$adminEmail]);
        $existingUser = $stmt->fetch();

        if ($existingUser) {
            echo "Admin user already exists with ID: {$existingUser['id']}\n";
            echo "Updating password...\n";

            $hashedPassword = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);
            $updateStmt = $pdo->prepare("UPDATE users SET password = ?, role = 'ADMIN' WHERE id = ?");
            $updateStmt->execute([$hashedPassword, $existingUser['id']]);

            echo "Password updated successfully!\n";
        } else {
            echo "Creating new admin user...\n";

            $hashedPassword = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);

            $insertStmt = $pdo->prepare("
                INSERT INTO users (name, email, password, role, created_at, updated_at)
                VALUES (?, ?, ?, 'ADMIN', NOW(), NOW())
            ");
            $insertStmt->execute([$adminName, $adminEmail, $hashedPassword]);

            $newId = $pdo->lastInsertId();
            echo "Admin user created successfully with ID: $newId\n";
        }

        echo "\n=== ADMIN CREDENTIALS ===\n";
        echo "Email: $adminEmail\n";
        echo "Password: $adminPassword\n";
        echo "=========================\n\n";

        echo "SUCCESS! You can now login to the system.\n";
        echo "IMPORTANT: DELETE THIS FILE IMMEDIATELY!\n";

    } catch (PDOException $e) {
        echo "Database Error: " . $e->getMessage() . "\n";
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Setup</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { background: white; border-radius: 16px; padding: 40px; max-width: 450px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        h1 { color: #1e293b; font-size: 24px; margin-bottom: 8px; text-align: center; }
        .subtitle { color: #64748b; font-size: 14px; text-align: center; margin-bottom: 30px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 24px; }
        label { display: block; color: #374151; font-size: 14px; font-weight: 500; margin-bottom: 6px; }
        input { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px; transition: border-color 0.2s; margin-bottom: 16px; }
        input:focus { outline: none; border-color: #667eea; }
        button { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(102, 126, 234, 0.5); }
        .info { background: #eff6ff; border: 1px solid #3b82f6; color: #1e40af; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 20px; }
        .credentials { background: #f0fdf4; border: 1px solid #22c55e; color: #166534; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Admin User Setup</h1>
        <p class="subtitle">Enter database credentials to create admin account</p>

        <div class="warning">
            <strong>Security Warning:</strong> Delete this file immediately after creating the admin user!
        </div>

        <form method="POST">
            <label for="db_host">Database Host</label>
            <input type="text" id="db_host" name="db_host" value="localhost" placeholder="localhost or IP address" required>

            <label for="db_name">Database Name</label>
            <input type="text" id="db_name" name="db_name" placeholder="e.g., sisvertex_sis" required>

            <label for="db_user">Database Username</label>
            <input type="text" id="db_user" name="db_user" placeholder="e.g., sisvertex_user" required>

            <label for="db_pass">Database Password</label>
            <input type="password" id="db_pass" name="db_pass" placeholder="Your database password" required>

            <button type="submit">Create Admin User</button>
        </form>

        <div class="credentials">
            <strong>Admin credentials after creation:</strong><br>
            Email: admin@university.edu<br>
            Password: password
        </div>

        <div class="info">
            <strong>Note:</strong> Get your database credentials from cPanel > MySQL Databases on the server where your Laravel backend is running (sistest.vertexuniversity.edu.eu).
        </div>
    </div>
</body>
</html>
