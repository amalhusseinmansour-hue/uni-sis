<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Department::with(['college']);

        if ($request->has('college_id')) {
            $query->where('college_id', $request->college_id);
        }

        $departments = $query->get();
        return response()->json($departments);
    }

    public function show(Department $department): JsonResponse
    {
        return response()->json($department->load(['college', 'programs', 'courses']));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'college_id' => 'required|exists:colleges,id',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:departments',
            'head' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $validated = $request->validate([
            'college_id' => 'sometimes|exists:colleges,id',
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:20|unique:departments,code,' . $department->id,
            'head' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $department->update($validated);
        return response()->json($department);
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();
        return response()->json(null, 204);
    }

    public function courses(Department $department): JsonResponse
    {
        return response()->json($department->courses);
    }
}
