<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $students = Student::with(['user', 'program', 'advisor'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('name_en', 'like', "%{$request->search}%")
                ->orWhere('student_id', 'like', "%{$request->search}%"))
            ->paginate($request->per_page ?? 15);

        return response()->json($students);
    }

    public function show(Student $student): JsonResponse
    {
        $student->load(['user', 'program', 'advisor', 'enrollments.course', 'grades.course', 'financialRecords', 'documents']);

        return response()->json($student);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|unique:students',
            'name_ar' => 'required',
            'name_en' => 'required',
            'national_id' => 'required|unique:students',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:MALE,FEMALE',
            'nationality' => 'required',
            'admission_date' => 'required|date',
            'phone' => 'required',
            'personal_email' => 'required|email',
            'university_email' => 'required|email|unique:students',
        ]);

        $student = Student::create($validated);

        return response()->json($student, 201);
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'name_ar' => 'sometimes|required',
            'name_en' => 'sometimes|required',
            'status' => 'sometimes|in:ACTIVE,SUSPENDED,GRADUATED,WITHDRAWN',
            'phone' => 'sometimes|required',
        ]);

        $student->update($validated);

        return response()->json($student);
    }

    public function destroy(Student $student): JsonResponse
    {
        $student->delete();

        return response()->json(null, 204);
    }

    public function grades(Student $student): JsonResponse
    {
        $grades = $student->grades()->with('course')->get();

        return response()->json($grades);
    }

    public function financialRecords(Student $student): JsonResponse
    {
        $records = $student->financialRecords()->orderBy('date', 'desc')->get();

        return response()->json($records);
    }

    public function enrollments(Student $student): JsonResponse
    {
        $enrollments = $student->enrollments()->with('course')->get();

        return response()->json($enrollments);
    }
}
