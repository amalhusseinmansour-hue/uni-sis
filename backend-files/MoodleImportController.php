<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MoodleImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MoodleImportController extends Controller
{
    public function __construct(
        protected MoodleImportService $importService
    ) {}

    /**
     * Test Moodle connection
     */
    public function testConnection(): JsonResponse
    {
        $result = $this->importService->testConnection();

        return response()->json([
            'success' => $result['success'],
            'data' => $result,
            'message' => $result['success']
                ? 'Successfully connected to Moodle'
                : 'Failed to connect to Moodle',
            'message_ar' => $result['success']
                ? 'تم الاتصال بـ Moodle بنجاح'
                : 'فشل الاتصال بـ Moodle',
        ], $result['success'] ? 200 : 503);
    }

    /**
     * Get students from Moodle (preview)
     */
    public function previewStudents(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 50);
            $students = $this->importService->fetchMoodleStudents($limit);

            $preview = $this->importService->previewImport($students);

            return response()->json([
                'success' => true,
                'data' => [
                    'students' => array_map(fn($s) => [
                        'moodle_id' => $s['id'],
                        'username' => $s['username'],
                        'email' => $s['email'] ?? null,
                        'name' => ($s['firstname'] ?? '') . ' ' . ($s['lastname'] ?? ''),
                        'department' => $s['department'] ?? null,
                        'suspended' => $s['suspended'] ?? false,
                    ], array_slice($students, 0, 100)),
                    'total_count' => count($students),
                    'preview' => $preview,
                ],
                'message' => 'Students fetched successfully',
                'message_ar' => 'تم جلب الطلاب بنجاح',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch students: ' . $e->getMessage(),
                'message_ar' => 'فشل جلب الطلاب: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Import students from Moodle
     */
    public function importStudents(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:1000',
            'moodle_ids' => 'nullable|array',
            'moodle_ids.*' => 'integer',
        ]);

        try {
            $limit = $request->get('limit', 0);
            $selectedIds = $request->get('moodle_ids', []);

            // Fetch students
            $students = $this->importService->fetchMoodleStudents($limit);

            // Filter by selected IDs if provided
            if (!empty($selectedIds)) {
                $students = array_filter($students, fn($s) => in_array($s['id'], $selectedIds));
                $students = array_values($students);
            }

            if (empty($students)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No students to import',
                    'message_ar' => 'لا يوجد طلاب للاستيراد',
                ], 400);
            }

            // Perform import
            $results = $this->importService->importStudents($students);

            return response()->json([
                'success' => true,
                'data' => [
                    'created' => $results['created'],
                    'updated' => $results['updated'],
                    'skipped' => $results['skipped'],
                    'failed' => $results['failed'],
                    'errors' => array_slice($results['errors'], 0, 20),
                ],
                'message' => "Import completed: {$results['created']} created, {$results['updated']} updated",
                'message_ar' => "تم الاستيراد: {$results['created']} جديد، {$results['updated']} تحديث",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'message_ar' => 'فشل الاستيراد: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Import a single student by Moodle ID
     */
    public function importSingleStudent(Request $request): JsonResponse
    {
        $request->validate([
            'moodle_id' => 'required|integer',
        ]);

        try {
            $moodleId = $request->get('moodle_id');

            // Fetch student from Moodle
            $students = $this->importService->fetchMoodleStudents(1000);
            $student = collect($students)->firstWhere('id', $moodleId);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found in Moodle',
                    'message_ar' => 'الطالب غير موجود في Moodle',
                ], 404);
            }

            $result = $this->importService->importSingleStudent($student);

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $result['status'],
                    'student_id' => $result['student']->id ?? null,
                    'student_number' => $result['student']->student_id ?? null,
                    'credentials' => $result['credentials'] ?? null,
                ],
                'message' => $result['status'] === 'created'
                    ? 'Student created successfully'
                    : 'Student updated successfully',
                'message_ar' => $result['status'] === 'created'
                    ? 'تم إنشاء الطالب بنجاح'
                    : 'تم تحديث الطالب بنجاح',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to import student: ' . $e->getMessage(),
                'message_ar' => 'فشل استيراد الطالب: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get import statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->importService->getImportStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Sync student data from Moodle (grades, courses)
     */
    public function syncStudentData(Request $request, int $studentId): JsonResponse
    {
        $student = \App\Models\Student::find($studentId);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
                'message_ar' => 'الطالب غير موجود',
            ], 404);
        }

        $result = $this->importService->syncStudentData($student);

        return response()->json([
            'success' => $result['success'],
            'data' => $result,
            'message' => $result['success']
                ? 'Student data synced successfully'
                : 'Failed to sync student data',
            'message_ar' => $result['success']
                ? 'تم مزامنة بيانات الطالب بنجاح'
                : 'فشل مزامنة بيانات الطالب',
        ], $result['success'] ? 200 : 500);
    }
}
