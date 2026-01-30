<?php
/**
 * Public endpoint to get program courses with semester information
 * This endpoint is used for viewing study plans without authentication
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get program_id from query string
$programId = isset($_GET['program_id']) ? (int)$_GET['program_id'] : 0;

if (!$programId) {
    http_response_code(400);
    echo json_encode(['error' => 'program_id is required']);
    exit;
}

// Database connection
$host = getenv('DB_HOST') ?: '127.0.0.1';
$dbname = getenv('DB_DATABASE') ?: 'sis';
$username = getenv('DB_USERNAME') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';
$port = getenv('DB_PORT') ?: '3306';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

try {
    // Get program info
    $stmt = $pdo->prepare('SELECT id, code, name_en, name_ar, type, total_credits FROM programs WHERE id = ?');
    $stmt->execute([$programId]);
    $program = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$program) {
        http_response_code(404);
        echo json_encode(['error' => 'Program not found']);
        exit;
    }

    // Get courses with pivot data (semester, type, etc.)
    $stmt = $pdo->prepare('
        SELECT
            c.id,
            c.code,
            c.name_en,
            c.name_ar,
            c.credits,
            c.description,
            pc.semester,
            pc.type,
            pc.is_common,
            pc.`order`
        FROM courses c
        INNER JOIN program_courses pc ON c.id = pc.course_id
        WHERE pc.program_id = ?
        ORDER BY pc.semester ASC, pc.`order` ASC, c.code ASC
    ');
    $stmt->execute([$programId]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert numeric fields
    foreach ($courses as &$course) {
        $course['id'] = (int)$course['id'];
        $course['credits'] = (int)$course['credits'];
        $course['semester'] = (int)$course['semester'];
        $course['is_common'] = (bool)$course['is_common'];
        $course['order'] = (int)$course['order'];
    }

    // Group by semester
    $bySemester = [];
    foreach ($courses as $course) {
        $sem = $course['semester'];
        if (!isset($bySemester[$sem])) {
            $bySemester[$sem] = [];
        }
        $bySemester[$sem][] = $course;
    }
    ksort($bySemester);

    // Calculate totals
    $totalCredits = array_reduce($courses, function($sum, $c) {
        return $sum + $c['credits'];
    }, 0);

    echo json_encode([
        'success' => true,
        'program' => [
            'id' => (int)$program['id'],
            'code' => $program['code'],
            'name_en' => $program['name_en'],
            'name_ar' => $program['name_ar'],
            'type' => $program['type'],
            'total_credits' => (int)$program['total_credits'],
        ],
        'courses' => $courses,
        'by_semester' => $bySemester,
        'total_courses' => count($courses),
        'total_credits' => $totalCredits,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch program courses', 'message' => $e->getMessage()]);
}
