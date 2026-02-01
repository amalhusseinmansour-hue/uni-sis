import { Client } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
  readyTimeout: 30000,
};

const client = new Client();

client.on('ready', () => {
  console.log('=== Running Data Fix ===\n');

  // Create and execute the fix script directly via PHP
  const phpScript = `
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Data Cleanup ===\\n";

// Database connection
$dbHost = 'localhost';
$dbName = 'sisvertexunivers_sis';
$dbUser = 'sisvertexunivers_admin';
$dbPass = 'SisAdmin2024@@';

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Database connected.\\n\\n";
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// 1. Find orphan student users
echo "=== Finding Orphan Student Users ===\\n";
$stmt = $pdo->query("
    SELECT u.id, u.name, u.email, u.role
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    WHERE u.role = 'STUDENT' AND s.id IS NULL
");
$orphans = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Found " . count($orphans) . " orphan users\\n";

// 2. Update orphan users to INACTIVE
if (count($orphans) > 0) {
    $ids = array_column($orphans, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("UPDATE users SET role = 'INACTIVE' WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    echo "Updated " . $stmt->rowCount() . " users to INACTIVE\\n";

    echo "\\nOrphan users fixed:\\n";
    foreach ($orphans as $o) {
        echo "  - " . $o['name'] . " (" . $o['email'] . ")\\n";
    }
}

// 3. Fix users with empty role
echo "\\n=== Fixing Empty Role Users ===\\n";
$stmt = $pdo->prepare("UPDATE users SET role = 'INACTIVE' WHERE role = '' OR role IS NULL");
$stmt->execute();
echo "Fixed " . $stmt->rowCount() . " users with empty role\\n";

// 4. Show final statistics
echo "\\n=== Final User Statistics ===\\n";
$stmt = $pdo->query("SELECT role, COUNT(*) as cnt FROM users GROUP BY role ORDER BY cnt DESC");
$stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($stats as $s) {
    echo "  " . $s['role'] . ": " . $s['cnt'] . "\\n";
}

// 5. Check for any remaining data issues
echo "\\n=== Remaining Data Checks ===\\n";

// Check enrollments without semester
$stmt = $pdo->query("SELECT COUNT(*) FROM enrollments WHERE semester_id IS NULL");
$count = $stmt->fetchColumn();
echo "Enrollments without semester: $count\\n";

// Check grades with 0 total
$stmt = $pdo->query("SELECT COUNT(*) FROM grades WHERE total = 0 OR total IS NULL");
$count = $stmt->fetchColumn();
echo "Grades with 0 or NULL total: $count\\n";

// Check students without user
$stmt = $pdo->query("SELECT COUNT(*) FROM students WHERE user_id IS NULL");
$count = $stmt->fetchColumn();
echo "Students without user account: $count\\n";

echo "\\n=== Cleanup Complete! ===\\n";
`;

  const cmd = `php -r '${phpScript.replace(/'/g, "'\\''")}'`;

  client.exec(cmd, (err, stream) => {
    if (err) {
      console.log('ERROR:', err.message);
      client.end();
      return;
    }

    stream.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    stream.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    stream.on('close', () => {
      console.log('\n=== Done ===');
      client.end();
    });
  });
});

client.on('error', (err) => {
  console.log('Connection error:', err.message);
});

client.connect(config);
