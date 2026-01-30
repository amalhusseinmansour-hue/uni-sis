<?php
/**
 * Test the enrollment API directly
 */

require_once __DIR__ . '/../laravel-backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Simulate a POST request to the API
$studentId = $_GET['student_id'] ?? 20;
$courseId = $_GET['course_id'] ?? 183; // Different course
$semesterId = $_GET['semester_id'] ?? 1;

try {
    // Create a fake request
    $request = \Illuminate\Http\Request::create(
        '/api/enrollments',
        'POST',
        [
            'student_id' => $studentId,
            'course_id' => $courseId,
            'semester_id' => $semesterId,
            'section' => 'A',
            'status' => 'ENROLLED',
        ]
    );

    // Get a user to authenticate (admin user)
    $user = \App\Models\User::where('role', 'admin')->first();
    if (!$user) {
        $user = \App\Models\User::first();
    }

    if ($user) {
        // Set the user as authenticated
        auth()->login($user);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });
    }

    // Call the controller directly
    $controller = new \App\Http\Controllers\Api\EnrollmentController();
    $response = $controller->store($request);

    echo json_encode([
        'success' => true,
        'api_response' => json_decode($response->getContent(), true),
        'status_code' => $response->getStatusCode(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (\Illuminate\Validation\ValidationException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Validation Error',
        'details' => $e->errors(),
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT);
}
