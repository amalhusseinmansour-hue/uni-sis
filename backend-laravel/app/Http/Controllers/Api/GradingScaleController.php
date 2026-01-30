<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GradingScale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

class GradingScaleController extends Controller
{
    /**
     * Ensure the grading_scales table exists
     */
    private function ensureTableExists(): void
    {
        try {
            if (!Schema::hasTable('grading_scales')) {
                DB::statement("
                    CREATE TABLE IF NOT EXISTS grading_scales (
                        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                        letter_grade VARCHAR(5) NOT NULL,
                        min_score DECIMAL(5,2) NOT NULL,
                        max_score DECIMAL(5,2) NOT NULL,
                        grade_points DECIMAL(3,2) NOT NULL,
                        description_en VARCHAR(255) NULL,
                        description_ar VARCHAR(255) NULL,
                        is_passing TINYINT(1) DEFAULT 1,
                        is_active TINYINT(1) DEFAULT 1,
                        program_type ENUM('BACHELOR', 'GRADUATE') DEFAULT 'BACHELOR',
                        created_at TIMESTAMP NULL,
                        updated_at TIMESTAMP NULL,
                        INDEX idx_program_active (program_type, is_active),
                        INDEX idx_scores (min_score, max_score)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ");
            }
        } catch (\Exception $e) {
            // Table might already exist, ignore
        }
    }

    /**
     * Get all grading scales
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $this->ensureTableExists();

            $programType = $request->input('program_type');
            $query = GradingScale::query();

            // Filter by program type
            if ($programType) {
                $query->where('program_type', $programType);
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $scales = $query->orderBy('min_score', 'desc')->get();

            // If no scales exist for this program type, create default ones
            if ($scales->isEmpty()) {
                $this->seedDefaultScales();
                $query = GradingScale::query();
                if ($programType) {
                    $query->where('program_type', $programType);
                }
                $scales = $query->orderBy('min_score', 'desc')->get();
            }

            return response()->json([
                'success' => true,
                'data' => $scales,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Seed default scales directly using DB
     */
    private function seedDefaultScales(): void
    {
        $now = now();
        $data = [
            ['letter_grade' => 'A+', 'min_score' => 96, 'max_score' => 100, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A', 'min_score' => 90, 'max_score' => 95.99, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A-', 'min_score' => 85, 'max_score' => 89.99, 'grade_points' => 3.70, 'description_en' => 'Very Good', 'description_ar' => 'جيد جدا', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B+', 'min_score' => 80, 'max_score' => 84.99, 'grade_points' => 3.30, 'description_en' => 'Very Good', 'description_ar' => 'جيد جدا', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B', 'min_score' => 75, 'max_score' => 79.99, 'grade_points' => 3.00, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B-', 'min_score' => 70, 'max_score' => 74.99, 'grade_points' => 2.70, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C+', 'min_score' => 65, 'max_score' => 69.99, 'grade_points' => 2.30, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C', 'min_score' => 60, 'max_score' => 64.99, 'grade_points' => 2.00, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C-', 'min_score' => 55, 'max_score' => 59.99, 'grade_points' => 1.70, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'D+', 'min_score' => 50, 'max_score' => 54.99, 'grade_points' => 1.30, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'D', 'min_score' => 45, 'max_score' => 49.99, 'grade_points' => 1.00, 'description_en' => 'Poor', 'description_ar' => 'ضعيف', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'F', 'min_score' => 0, 'max_score' => 44.99, 'grade_points' => 0.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A+', 'min_score' => 96, 'max_score' => 100, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A', 'min_score' => 90, 'max_score' => 95.99, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A-', 'min_score' => 85, 'max_score' => 89.99, 'grade_points' => 3.70, 'description_en' => 'Very Good', 'description_ar' => 'جيد جدا', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B+', 'min_score' => 80, 'max_score' => 84.99, 'grade_points' => 3.30, 'description_en' => 'Very Good', 'description_ar' => 'جيد جدا', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B', 'min_score' => 75, 'max_score' => 79.99, 'grade_points' => 3.00, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B-', 'min_score' => 70, 'max_score' => 74.99, 'grade_points' => 2.70, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C+', 'min_score' => 65, 'max_score' => 69.99, 'grade_points' => 2.30, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C', 'min_score' => 60, 'max_score' => 64.99, 'grade_points' => 2.00, 'description_en' => 'Pass', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C-', 'min_score' => 55, 'max_score' => 59.99, 'grade_points' => 1.70, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'D+', 'min_score' => 50, 'max_score' => 54.99, 'grade_points' => 1.30, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'D', 'min_score' => 45, 'max_score' => 49.99, 'grade_points' => 1.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'F', 'min_score' => 0, 'max_score' => 44.99, 'grade_points' => 0.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('grading_scales')->insert($data);
    }

    /**
     * Get a single grading scale
     */
    public function show(GradingScale $gradingScale): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $gradingScale,
        ]);
    }

    /**
     * Create a new grading scale
     */
    public function store(Request $request): JsonResponse
    {
        $this->ensureTableExists();

        $validated = $request->validate([
            'letter_grade' => 'required|string|max:5',
            'min_score' => 'required|numeric|min:0|max:100',
            'max_score' => 'required|numeric|min:0|max:100|gte:min_score',
            'grade_points' => 'required|numeric|min:0|max:4',
            'description_en' => 'nullable|string|max:255',
            'description_ar' => 'nullable|string|max:255',
            'is_passing' => 'boolean',
            'is_active' => 'boolean',
            'program_type' => 'required|in:BACHELOR,GRADUATE',
        ]);

        $scale = GradingScale::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Grading scale created successfully',
            'data' => $scale,
        ], 201);
    }

    /**
     * Update a grading scale
     */
    public function update(Request $request, GradingScale $gradingScale): JsonResponse
    {
        $validated = $request->validate([
            'letter_grade' => 'sometimes|string|max:5',
            'min_score' => 'sometimes|numeric|min:0|max:100',
            'max_score' => 'sometimes|numeric|min:0|max:100',
            'grade_points' => 'sometimes|numeric|min:0|max:4',
            'description_en' => 'nullable|string|max:255',
            'description_ar' => 'nullable|string|max:255',
            'is_passing' => 'boolean',
            'is_active' => 'boolean',
            'program_type' => 'sometimes|in:BACHELOR,GRADUATE',
        ]);

        $gradingScale->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Grading scale updated successfully',
            'data' => $gradingScale,
        ]);
    }

    /**
     * Delete a grading scale
     */
    public function destroy(GradingScale $gradingScale): JsonResponse
    {
        $gradingScale->delete();

        return response()->json([
            'success' => true,
            'message' => 'Grading scale deleted successfully',
        ]);
    }

    /**
     * Get grading scale for a specific score
     */
    public function getForScore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'program_type' => 'nullable|in:BACHELOR,GRADUATE',
        ]);

        $programType = $validated['program_type'] ?? 'BACHELOR';
        $scale = GradingScale::getForScore($validated['score'], $programType);

        if (!$scale) {
            return response()->json([
                'success' => false,
                'message' => 'No grading scale found for this score',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $scale,
        ]);
    }

    /**
     * Reset grading scales to default values
     */
    public function reset(Request $request): JsonResponse
    {
        $this->ensureTableExists();

        $programType = $request->input('program_type');

        if ($programType) {
            // Reset only specific program type
            GradingScale::where('program_type', $programType)->delete();
            $this->createDefaultScales($programType);
        } else {
            // Reset all
            GradingScale::truncate();
            $this->createDefaultScales();
        }

        $scales = GradingScale::orderBy('program_type')->orderBy('min_score', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Grading scales reset to default',
            'data' => $scales,
        ]);
    }

    /**
     * Create default grading scales
     */
    private function createDefaultScales(?string $programType = null): void
    {
        $types = $programType ? [$programType] : ['BACHELOR', 'GRADUATE'];

        foreach ($types as $type) {
            $defaults = GradingScale::getDefaultScales($type);
            foreach ($defaults as $scale) {
                GradingScale::create(array_merge($scale, [
                    'program_type' => $type,
                    'is_active' => true,
                ]));
            }
        }
    }
}
