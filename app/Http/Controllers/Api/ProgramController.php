<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Program::with(['college', 'department']);

        if ($request->has('college_id')) {
            $query->where('college_id', $request->college_id);
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $programs = $query->get();
        return response()->json($programs);
    }

    public function show(Program $program): JsonResponse
    {
        return response()->json($program->load(['college', 'department', 'students']));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'college_id' => 'required|exists:colleges,id',
            'department_id' => 'nullable|exists:departments,id',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:programs',
            'type' => 'required|in:BACHELOR,MASTER,PHD,DIPLOMA',
            'duration_years' => 'required|integer|min:1|max:10',
            'total_credits' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $program = Program::create($validated);
        return response()->json($program, 201);
    }

    public function update(Request $request, Program $program): JsonResponse
    {
        $validated = $request->validate([
            'college_id' => 'sometimes|exists:colleges,id',
            'department_id' => 'nullable|exists:departments,id',
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:20|unique:programs,code,' . $program->id,
            'type' => 'sometimes|in:BACHELOR,MASTER,PHD,DIPLOMA',
            'duration_years' => 'sometimes|integer|min:1|max:10',
            'total_credits' => 'sometimes|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $program->update($validated);
        return response()->json($program);
    }

    public function destroy(Program $program): JsonResponse
    {
        $program->delete();
        return response()->json(null, 204);
    }

    public function students(Program $program): JsonResponse
    {
        return response()->json($program->students);
    }

    /**
     * Get courses for a program
     */
    public function courses(Program $program): JsonResponse
    {
        $courses = $program->courses()
            ->select('courses.*')
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'code' => $course->code,
                    'name_en' => $course->name_en,
                    'name_ar' => $course->name_ar,
                    'credits' => $course->credits,
                    'type' => $course->pivot->type ?? 'MAJOR',
                    'semester' => $course->pivot->semester ?? 1,
                    'is_common' => $course->pivot->is_common ?? false,
                    'order' => $course->pivot->order ?? 0,
                ];
            });

        return response()->json(['courses' => $courses]);
    }
}
