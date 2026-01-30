<?php
/**
 * Public endpoint to get student enrollments with semester information
 * This endpoint is used for viewing student enrollments in admin panel
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

// Get student_id from query string
$studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['error' => 'student_id is required']);
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
    // Get enrollments with course and semester information
    $stmt = $pdo->prepare('
        SELECT
            e.id,
            e.student_id,
            e.course_id,
            e.semester_id,
            e.section,
            e.status,
            e.grade,
            e.grade_points,
            e.created_at,
            e.updated_at,
            c.code as course_code,
            c.name_en as course_name_en,
            c.name_ar as course_name_ar,
            c.credits as course_credits,
            s.name as semester_name,
            s.academic_year as semester_year,
            s.start_date as semester_start_date,
            s.end_date as semester_end_date,
            s.is_current as semester_is_current
        FROM enrollments e
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN semesters s ON e.semester_id = s.id
        WHERE e.student_id = ?
        ORDER BY s.start_date DESC, c.code ASC
    ');
    $stmt->execute([$studentId]);
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the response
    $formattedEnrollments = [];
    foreach ($enrollments as $enrollment) {
        $formattedEnrollments[] = [
            'id' => (int)$enrollment['id'],
            'student_id' => (int)$enrollment['student_id'],
            'course_id' => (int)$enrollment['course_id'],
            'semester_id' => (int)$enrollment['semester_id'],
            'section' => $enrollment['section'],
            'status' => $enrollment['status'],
            'grade' => $enrollment['grade'],
            'grade_points' => $enrollment['grade_points'] ? (float)$enrollment['grade_points'] : null,
            'created_at' => $enrollment['created_at'],
            'updated_at' => $enrollment['updated_at'],
            'course' => [
                'id' => (int)$enrollment['course_id'],
                'code' => $enrollment['course_code'],
                'name_en' => $enrollment['course_name_en'],
                'name_ar' => $enrollment['course_name_ar'],
                'credits' => (int)$enrollment['course_credits'],
            ],
            'semester' => $enrollment['semester_id'] ? [
                'id' => (int)$enrollment['semester_id'],
                'name' => $enrollment['semester_name'],
                'name_en' => $enrollment['semester_name'],
                'name_ar' => $enrollment['semester_name'],
                'year' => $enrollment['semester_year'],
                'academic_year' => $enrollment['semester_year'],
                'start_date' => $enrollment['semester_start_date'],
                'end_date' => $enrollment['semester_end_date'],
                'is_current' => (bool)$enrollment['semester_is_current'],
            ] : null,
            'semester_name' => $enrollment['semester_name'],
            'semester_name_ar' => $enrollment['semester_name'],
            'year' => $enrollment['semester_year'],
        ];
    }

    // Group by semester for summary
    $bySemester = [];
    foreach ($formattedEnrollments as $enrollment) {
        $semId = $enrollment['semester_id'] ?: 0;
        if (!isset($bySemester[$semId])) {
            $bySemester[$semId] = [
                'semester' => $enrollment['semester'],
                'enrollments' => [],
                'total_credits' => 0,
            ];
        }
        $bySemester[$semId]['enrollments'][] = $enrollment;
        $bySemester[$semId]['total_credits'] += $enrollment['course']['credits'];
    }

    echo json_encode([
        'success' => true,
        'student_id' => $studentId,
        'enrollments' => $formattedEnrollments,
        'by_semester' => array_values($bySemester),
        'total_enrollments' => count($formattedEnrollments),
        'total_credits' => array_reduce($formattedEnrollments, function($sum, $e) {
            return $sum + $e['course']['credits'];
        }, 0),
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch enrollments', 'message' => $e->getMessage()]);
}
