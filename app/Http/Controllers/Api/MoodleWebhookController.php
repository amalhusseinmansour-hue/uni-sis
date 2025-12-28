<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MoodleIntegrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MoodleWebhookController extends Controller
{
    public function __construct(
        protected MoodleIntegrationService $moodleService
    ) {}

    /**
     * Receive grade updates from Moodle
     * POST /api/webhook/moodle/grades
     */
    public function receiveGrades(Request $request): JsonResponse
    {
        // Validate webhook secret
        if (!$this->validateWebhookSecret($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'user_id' => 'required|integer',
            'course_id' => 'required|integer',
            'grade' => 'nullable|numeric',
            'grade_max' => 'nullable|numeric',
            'status' => 'nullable|string|in:completed,in_progress,failed,complete,fail',
            'completed_at' => 'nullable|date',
            'grade_items' => 'nullable|array',
        ]);

        try {
            $moodleGrade = $this->moodleService->processGradeWebhook($validated);

            Log::info('Moodle grade received', [
                'user_id' => $validated['user_id'],
                'course_id' => $validated['course_id'],
                'grade' => $validated['grade'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Grade received successfully',
                'data' => [
                    'id' => $moodleGrade->id,
                    'enrollment_id' => $moodleGrade->enrollment_id,
                    'completion_status' => $moodleGrade->completion_status,
                    'synced_to_sis' => $moodleGrade->synced_to_sis,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Moodle grade webhook failed', [
                'data' => $validated,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Receive bulk grade updates from Moodle
     * POST /api/webhook/moodle/grades/bulk
     */
    public function receiveBulkGrades(Request $request): JsonResponse
    {
        if (!$this->validateWebhookSecret($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'grades' => 'required|array',
            'grades.*.user_id' => 'required|integer',
            'grades.*.course_id' => 'required|integer',
            'grades.*.grade' => 'nullable|numeric',
            'grades.*.grade_max' => 'nullable|numeric',
            'grades.*.status' => 'nullable|string',
            'grades.*.completed_at' => 'nullable|date',
        ]);

        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        foreach ($validated['grades'] as $gradeData) {
            try {
                $this->moodleService->processGradeWebhook($gradeData);
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'user_id' => $gradeData['user_id'],
                    'course_id' => $gradeData['course_id'],
                    'error' => $e->getMessage(),
                ];
            }
        }

        Log::info('Moodle bulk grades received', $results);

        return response()->json([
            'success' => true,
            'message' => 'Bulk grades processed',
            'data' => $results,
        ]);
    }

    /**
     * Receive course completion notifications
     * POST /api/webhook/moodle/completion
     */
    public function receiveCompletion(Request $request): JsonResponse
    {
        if (!$this->validateWebhookSecret($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'user_id' => 'required|integer',
            'course_id' => 'required|integer',
            'status' => 'required|string|in:completed,failed',
            'completed_at' => 'nullable|date',
        ]);

        try {
            // Process as grade webhook with completion status
            $moodleGrade = $this->moodleService->processGradeWebhook([
                'user_id' => $validated['user_id'],
                'course_id' => $validated['course_id'],
                'status' => $validated['status'],
                'completed_at' => $validated['completed_at'] ?? now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Completion status received',
                'data' => [
                    'enrollment_id' => $moodleGrade->enrollment_id,
                    'completion_status' => $moodleGrade->completion_status,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Moodle completion webhook failed', [
                'data' => $validated,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Validate webhook secret from request
     */
    protected function validateWebhookSecret(Request $request): bool
    {
        $secret = config('services.moodle.webhook_secret');

        if (empty($secret)) {
            // If no secret configured, allow all requests (development mode)
            return true;
        }

        $providedSecret = $request->header('X-Moodle-Secret')
            ?? $request->header('Authorization')
            ?? $request->input('secret');

        return $providedSecret === $secret;
    }
}
