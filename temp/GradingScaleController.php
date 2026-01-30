<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GradingScale;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GradingScaleController extends Controller
{
    public function index(): JsonResponse
    {
        $scales = GradingScale::orderBy('min_score', 'desc')->get();
        return response()->json(['data' => $scales]);
    }

    public function show(GradingScale $gradingScale): JsonResponse
    {
        return response()->json($gradingScale);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'letter_grade' => 'required|string|max:5',
            'min_score' => 'required|numeric|min:0|max:100',
            'max_score' => 'required|numeric|min:0|max:100',
            'grade_points' => 'required|numeric|min:0|max:4',
            'description_en' => 'nullable|string|max:255',
            'description_ar' => 'nullable|string|max:255',
            'is_passing' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $validated['is_passing'] = $validated['is_passing'] ?? true;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $scale = GradingScale::create($validated);
        return response()->json($scale, 201);
    }

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
        ]);

        $gradingScale->update($validated);
        return response()->json($gradingScale);
    }

    public function destroy(GradingScale $gradingScale): JsonResponse
    {
        $gradingScale->delete();
        return response()->json(null, 204);
    }

    public function reset(): JsonResponse
    {
        // Delete all existing scales
        GradingScale::truncate();

        // Insert default scales
        foreach (GradingScale::getDefaultScales() as $scale) {
            $scale['is_active'] = true;
            GradingScale::create($scale);
        }

        return response()->json(['message' => 'Grading scales reset to default']);
    }

    public function getForScore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:100',
        ]);

        $scale = GradingScale::getGradeForScore($validated['score']);

        if (!$scale) {
            return response()->json(['message' => 'No grade found for this score'], 404);
        }

        return response()->json($scale);
    }
}
