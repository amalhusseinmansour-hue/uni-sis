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
        $query = Student::with(['user', 'program', 'advisor']);

        // Include archived students if requested
        if ($request->boolean('include_archived')) {
            $query->withTrashed();
        }

        // Only archived students
        if ($request->boolean('only_archived')) {
            $query->onlyTrashed();
        }

        $students = $query
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->admission_type, fn($q) => $q->where('admission_type', $request->admission_type))
            ->when($request->program_id, fn($q) => $q->where('program_id', $request->program_id))
            ->when($request->search, fn($q) => $q->where(function($query) use ($request) {
                $query->where('name_en', 'like', "%{$request->search}%")
                    ->orWhere('name_ar', 'like', "%{$request->search}%")
                    ->orWhere('student_id', 'like', "%{$request->search}%")
                    ->orWhere('national_id', 'like', "%{$request->search}%");
            }))
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
            'name_ar' => 'nullable',
            'name_en' => 'required',
            'national_id' => 'required|unique:students',
            'date_of_birth' => 'nullable|date',
            'gender' => 'required|in:MALE,FEMALE',
            'nationality' => 'nullable',
            'admission_type' => 'nullable|in:DIRECT,TRANSFER,POSTGRADUATE,SCHOLARSHIP,BRIDGE,READMISSION,VISITING',
            'admission_date' => 'nullable|date',
            'phone' => 'nullable',
            'personal_email' => 'required|email',
            'program_id' => 'nullable|exists:programs,id',
            'password' => 'required|min:6',
        ]);

        // Generate student ID if not provided
        if (empty($validated['student_id'])) {
            $year = date('Y');
            $lastStudent = Student::whereYear('created_at', $year)->orderBy('id', 'desc')->first();
            $sequence = $lastStudent ? ((int)substr($lastStudent->student_id, -4) + 1) : 1;
            $validated['student_id'] = $year . str_pad($sequence, 4, '0', STR_PAD_LEFT);
        }

        // Generate university email
        $emailBase = strtolower(str_replace(' ', '.', $validated['name_en']));
        $universityEmail = $emailBase . '@student.university.edu';
        $counter = 1;
        while (\App\Models\User::where('email', $universityEmail)->exists() || Student::where('university_email', $universityEmail)->exists()) {
            $universityEmail = $emailBase . $counter . '@student.university.edu';
            $counter++;
        }

        // Create user account for the student
        $user = \App\Models\User::create([
            'name' => $validated['name_en'],
            'email' => $universityEmail,
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => 'STUDENT',
        ]);

        // Create student record
        $student = Student::create([
            'user_id' => $user->id,
            'student_id' => $validated['student_id'],
            'name_en' => $validated['name_en'],
            'name_ar' => $validated['name_ar'] ?? $validated['name_en'],
            'national_id' => $validated['national_id'],
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'nationality' => $validated['nationality'] ?? 'Unknown',
            'admission_type' => $validated['admission_type'] ?? 'DIRECT',
            'admission_date' => $validated['admission_date'] ?? now(),
            'phone' => $validated['phone'],
            'personal_email' => $validated['personal_email'],
            'university_email' => $universityEmail,
            'program_id' => $validated['program_id'],
            'status' => 'ACTIVE',
        ]);

        return response()->json([
            'message' => 'تم إنشاء الطالب بنجاح',
            'student' => $student->load(['user', 'program']),
            'credentials' => [
                'email' => $universityEmail,
                'student_id' => $validated['student_id'],
            ]
        ], 201);
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'name_ar' => 'sometimes|required',
            'name_en' => 'sometimes|required',
            'status' => 'sometimes|in:ACTIVE,SUSPENDED,GRADUATED,WITHDRAWN',
            'admission_type' => 'sometimes|in:DIRECT,TRANSFER,POSTGRADUATE,SCHOLARSHIP,BRIDGE,READMISSION,VISITING',
            'phone' => 'sometimes|required',
            'nationality' => 'sometimes|string',
            'date_of_birth' => 'sometimes|date',
            'gender' => 'sometimes|in:MALE,FEMALE',
            'marital_status' => 'sometimes|in:SINGLE,MARRIED,DIVORCED,WIDOWED',
        ]);

        $student->update($validated);

        return response()->json($student);
    }

    public function destroy(Request $request, Student $student): JsonResponse
    {
        $reason = $request->input('archive_reason', 'Archived by administrator');

        // Use soft delete (archive) instead of hard delete
        $student->archive($reason, auth()->id());

        return response()->json([
            'message' => 'تم أرشفة الطالب بنجاح',
            'message_en' => 'Student archived successfully',
        ]);
    }

    public function restore(Request $request, $studentId): JsonResponse
    {
        $student = Student::withTrashed()->findOrFail($studentId);
        $student->unarchive();

        return response()->json([
            'message' => 'تم استعادة الطالب بنجاح',
            'message_en' => 'Student restored successfully',
            'student' => $student->fresh(['user', 'program']),
        ]);
    }

    public function forceDelete($studentId): JsonResponse
    {
        $student = Student::withTrashed()->findOrFail($studentId);

        // Also delete the user account
        if ($student->user) {
            $student->user->delete();
        }

        $student->forceDelete();

        return response()->json([
            'message' => 'تم حذف الطالب نهائياً',
            'message_en' => 'Student permanently deleted',
        ]);
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
