<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\College;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CollegeController extends Controller
{
    public function index(): JsonResponse
    {
        $colleges = College::with(['departments', 'programs'])->get();
        return response()->json($colleges);
    }

    public function show(College $college): JsonResponse
    {
        return response()->json($college->load(['departments', 'programs']));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:colleges',
            'dean' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $college = College::create($validated);
        return response()->json($college, 201);
    }

    public function update(Request $request, College $college): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:20|unique:colleges,code,' . $college->id,
            'dean' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $college->update($validated);
        return response()->json($college);
    }

    public function destroy(College $college): JsonResponse
    {
        $college->delete();
        return response()->json(null, 204);
    }

    public function departments(College $college): JsonResponse
    {
        return response()->json($college->departments);
    }

    public function programs(College $college): JsonResponse
    {
        return response()->json($college->programs);
    }
}
