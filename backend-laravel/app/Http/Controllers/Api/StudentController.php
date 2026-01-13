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
            'student_id' => 'nullable|unique:students',
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
            'program_id' => 'nullable|exists:programs,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Student ID will be auto-generated in the model's boot method if not provided
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

    /**
     * Get student's study plan and progress
     */
    public function studyPlan(Student $student): JsonResponse
    {
        $student->load(['program.courses', 'enrollments.course', 'grades']);

        $completedCredits = $student->grades()
            ->where('grade', '>=', 60)
            ->with('course')
            ->get()
            ->sum(fn($g) => $g->course->credits ?? 3);

        $totalCredits = $student->program->total_credits ?? 132;
        $progressPercentage = $totalCredits > 0 ? round(($completedCredits / $totalCredits) * 100, 2) : 0;

        return response()->json([
            'student' => $student,
            'program' => $student->program,
            'completed_credits' => $completedCredits,
            'total_credits' => $totalCredits,
            'progress_percentage' => $progressPercentage,
            'remaining_credits' => $totalCredits - $completedCredits,
        ]);
    }

    /**
     * Assign or update student's study plan
     */
    public function assignStudyPlan(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'notes' => 'nullable|string',
        ]);

        $oldProgramId = $student->program_id;
        $student->update(['program_id' => $validated['program_id']]);

        return response()->json([
            'message' => 'تم ربط الخطة الدراسية بنجاح',
            'student' => $student->fresh(['program']),
            'old_program_id' => $oldProgramId,
            'new_program_id' => $validated['program_id'],
        ]);
    }

    /**
     * Transfer student to a different major/program
     */
    public function transferMajor(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'new_program_id' => 'required|exists:programs,id',
            'reason' => 'nullable|string',
            'effective_date' => 'nullable|date',
        ]);

        $oldProgram = $student->program;
        $student->update([
            'program_id' => $validated['new_program_id'],
        ]);

        return response()->json([
            'message' => 'تم تحويل التخصص بنجاح',
            'student' => $student->fresh(['program']),
            'old_program' => $oldProgram,
            'new_program' => $student->program,
            'transfer_date' => $validated['effective_date'] ?? now()->toDateString(),
        ]);
    }

    /**
     * Open registration for a specific student
     */
    public function openRegistration(Request $request, Student $student): JsonResponse
    {
        $student->update(['registration_hold' => false]);

        return response()->json([
            'message' => 'تم فتح التسجيل للطالب',
            'student' => $student,
        ]);
    }

    /**
     * Close registration for a specific student
     */
    public function closeRegistration(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $student->update([
            'registration_hold' => true,
            'registration_hold_reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'تم إغلاق التسجيل للطالب',
            'student' => $student,
        ]);
    }
}
