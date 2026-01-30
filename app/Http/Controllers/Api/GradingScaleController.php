<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GradingScale;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GradingScaleController extends Controller
{
    /**
     * Display a listing of grading scales.
     */
    public function index(Request $request)
    {
        $query = GradingScale::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $scales = $query->orderBy('min_score', 'desc')->get();

        return response()->json([
            'data' => $scales,
            'total' => $scales->count(),
        ]);
    }

    /**
     * Store a newly created grading scale.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'letter_grade' => 'required|string|max:5|unique:grading_scales,letter_grade',
            'min_score' => 'required|numeric|min:0|max:100',
            'max_score' => 'required|numeric|min:0|max:100|gte:min_score',
            'grade_points' => 'required|numeric|min:0|max:4',
            'description_en' => 'nullable|string|max:255',
            'description_ar' => 'nullable|string|max:255',
            'is_passing' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $scale = GradingScale::create($validated);

        return response()->json([
            'message' => 'Grading scale created successfully',
            'data' => $scale,
        ], 201);
    }

    /**
     * Display the specified grading scale.
     */
    public function show(GradingScale $gradingScale)
    {
        return response()->json([
            'data' => $gradingScale,
        ]);
    }

    /**
     * Update the specified grading scale.
     */
    public function update(Request $request, GradingScale $gradingScale)
    {
        $validated = $request->validate([
            'letter_grade' => [
                'sometimes',
                'required',
                'string',
                'max:5',
                Rule::unique('grading_scales', 'letter_grade')->ignore($gradingScale->id),
            ],
            'min_score' => 'sometimes|required|numeric|min:0|max:100',
            'max_score' => 'sometimes|required|numeric|min:0|max:100',
            'grade_points' => 'sometimes|required|numeric|min:0|max:4',
            'description_en' => 'nullable|string|max:255',
            'description_ar' => 'nullable|string|max:255',
            'is_passing' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Validate max_score >= min_score
        $minScore = $validated['min_score'] ?? $gradingScale->min_score;
        $maxScore = $validated['max_score'] ?? $gradingScale->max_score;

        if ($maxScore < $minScore) {
            return response()->json([
                'message' => 'Maximum score must be greater than or equal to minimum score',
                'errors' => ['max_score' => ['Maximum score must be greater than or equal to minimum score']],
            ], 422);
        }

        $gradingScale->update($validated);

        return response()->json([
            'message' => 'Grading scale updated successfully',
            'data' => $gradingScale->fresh(),
        ]);
    }

    /**
     * Remove the specified grading scale.
     */
    public function destroy(GradingScale $gradingScale)
    {
        $gradingScale->delete();

        return response()->json([
            'message' => 'Grading scale deleted successfully',
        ]);
    }

    /**
     * Get grade for a given score.
     */
    public function getForScore(Request $request)
    {
        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:100',
        ]);

        $scale = GradingScale::active()
            ->where('min_score', '<=', $validated['score'])
            ->where('max_score', '>=', $validated['score'])
            ->first();

        if (!$scale) {
            return response()->json([
                'message' => 'No grade found for this score',
            ], 404);
        }

        return response()->json([
            'data' => $scale,
        ]);
    }

    /**
     * Calculate grade for a given score.
     */
    public function calculateGrade(Request $request)
    {
        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:100',
        ]);

        $result = GradingScale::calculateGrade($validated['score']);

        return response()->json([
            'score' => $validated['score'],
            'letter_grade' => $result['grade'],
            'grade_points' => $result['points'],
            'is_passing' => $result['is_passing'],
            'description_en' => $result['description_en'],
            'description_ar' => $result['description_ar'],
        ]);
    }

    /**
     * Reset to default grading scale.
     */
    public function reset()
    {
        // Delete all existing scales
        GradingScale::truncate();

        // Insert default scales
        $defaults = [
            ['letter_grade' => 'A+', 'min_score' => 95, 'max_score' => 100, 'grade_points' => 4.00, 'description_en' => 'Exceptional', 'description_ar' => 'ممتاز مرتفع', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'A', 'min_score' => 90, 'max_score' => 94.99, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'A-', 'min_score' => 85, 'max_score' => 89.99, 'grade_points' => 3.70, 'description_en' => 'Very Good+', 'description_ar' => 'جيد جداً مرتفع', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'B+', 'min_score' => 80, 'max_score' => 84.99, 'grade_points' => 3.30, 'description_en' => 'Very Good', 'description_ar' => 'جيد جداً', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'B', 'min_score' => 75, 'max_score' => 79.99, 'grade_points' => 3.00, 'description_en' => 'Good+', 'description_ar' => 'جيد مرتفع', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'B-', 'min_score' => 70, 'max_score' => 74.99, 'grade_points' => 2.70, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'C+', 'min_score' => 65, 'max_score' => 69.99, 'grade_points' => 2.30, 'description_en' => 'Satisfactory+', 'description_ar' => 'مقبول مرتفع', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'C', 'min_score' => 60, 'max_score' => 64.99, 'grade_points' => 2.00, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'C-', 'min_score' => 55, 'max_score' => 59.99, 'grade_points' => 1.70, 'description_en' => 'Pass+', 'description_ar' => 'ناجح مرتفع', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'D+', 'min_score' => 53, 'max_score' => 54.99, 'grade_points' => 1.30, 'description_en' => 'Pass', 'description_ar' => 'ناجح', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'D', 'min_score' => 50, 'max_score' => 52.99, 'grade_points' => 1.00, 'description_en' => 'Minimum Pass', 'description_ar' => 'الحد الأدنى للنجاح', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'F', 'min_score' => 0, 'max_score' => 49.99, 'grade_points' => 0.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => false, 'is_active' => true],
        ];

        foreach ($defaults as $scale) {
            GradingScale::create($scale);
        }

        return response()->json([
            'message' => 'Grading scale reset to default successfully',
            'data' => GradingScale::orderBy('min_score', 'desc')->get(),
        ]);
    }
}
