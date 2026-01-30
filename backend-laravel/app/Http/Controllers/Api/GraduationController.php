<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GraduationApplication;
use App\Models\GraduationRequirement;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GraduationController extends Controller
{
    /**
     * Get all graduation applications with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = GraduationApplication::with(['student.program', 'semester', 'reviewer', 'approver']);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->has('program_id')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('program_id', $request->program_id);
            });
        }

        if ($request->has('academic_year')) {
            $query->whereHas('semester', function ($q) use ($request) {
                $q->where('academic_year', $request->academic_year);
            });
        }

        // Sort by newest first
        $query->orderBy('created_at', 'desc');

        $applications = $query->paginate($request->get('per_page', 15));
        return response()->json($applications);
    }

    /**
     * Get a specific graduation application
     */
    public function show(GraduationApplication $application): JsonResponse
    {
        $application->load(['student.program.department.college', 'semester', 'reviewer', 'approver']);

        // Get the student's graduation requirements
        $requirements = GraduationRequirement::where('student_id', $application->student_id)->first();

        return response()->json([
            'application' => $application,
            'requirements' => $requirements,
        ]);
    }

    /**
     * Create a new graduation application
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'graduation_term' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        // Check if student already has a pending application
        $existingApplication = GraduationApplication::where('student_id', $validated['student_id'])
            ->whereIn('status', ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'PENDING_FEES'])
            ->first();

        if ($existingApplication) {
            return response()->json([
                'message' => 'Student already has a pending graduation application',
                'message_ar' => 'الطالب لديه طلب تخرج قيد المراجعة',
                'existing_application' => $existingApplication,
            ], 422);
        }

        // Get current semester if not provided
        if (!isset($validated['semester_id'])) {
            $currentSemester = \App\Models\Semester::where('is_current', true)->first();
            $validated['semester_id'] = $currentSemester?->id;
        }

        $application = GraduationApplication::create([
            'student_id' => $validated['student_id'],
            'semester_id' => $validated['semester_id'],
            'graduation_term' => $validated['graduation_term'] ?? null,
            'application_date' => now(),
            'status' => 'SUBMITTED',
            'review_notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Graduation application submitted successfully',
            'message_ar' => 'تم تقديم طلب التخرج بنجاح',
            'application' => $application->load(['student', 'semester']),
        ], 201);
    }

    /**
     * Start review of a graduation application
     */
    public function startReview(GraduationApplication $application): JsonResponse
    {
        if ($application->status !== 'SUBMITTED') {
            return response()->json([
                'message' => 'Application is not in submitted status',
                'message_ar' => 'الطلب ليس في حالة مقدم',
            ], 422);
        }

        $application->update([
            'status' => 'UNDER_REVIEW',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Application is now under review',
            'message_ar' => 'الطلب الآن قيد المراجعة',
            'application' => $application->fresh(['student', 'semester', 'reviewer']),
        ]);
    }

    /**
     * Approve a graduation application
     */
    public function approve(Request $request, GraduationApplication $application): JsonResponse
    {
        if (!in_array($application->status, ['SUBMITTED', 'UNDER_REVIEW'])) {
            return response()->json([
                'message' => 'Application cannot be approved in current status',
                'message_ar' => 'لا يمكن الموافقة على الطلب في حالته الحالية',
            ], 422);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'graduation_date' => 'nullable|date',
            'honors' => 'nullable|string|in:EXCELLENT_HONORS,EXCELLENT,VERY_GOOD,GOOD,PASS',
        ]);

        // Calculate final GPA
        $student = $application->student;
        $gpa = $this->calculateStudentGPA($student->id);

        $application->update([
            'status' => 'APPROVED',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'approval_notes' => $validated['notes'] ?? null,
            'graduation_date' => $validated['graduation_date'] ?? null,
            'final_gpa' => $gpa,
            'honors' => $validated['honors'] ?? $this->determineHonors($gpa),
        ]);

        return response()->json([
            'message' => 'Graduation application approved',
            'message_ar' => 'تمت الموافقة على طلب التخرج',
            'application' => $application->fresh(['student', 'semester', 'approver']),
        ]);
    }

    /**
     * Reject a graduation application
     */
    public function reject(Request $request, GraduationApplication $application): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string',
            'missing_requirements' => 'nullable|array',
        ]);

        $application->update([
            'status' => 'REJECTED',
            'rejection_reason' => $validated['reason'],
            'missing_requirements' => $validated['missing_requirements'] ?? null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Graduation application rejected',
            'message_ar' => 'تم رفض طلب التخرج',
            'application' => $application->fresh(['student', 'semester']),
        ]);
    }

    /**
     * Mark student as graduated
     */
    public function markGraduated(Request $request, GraduationApplication $application): JsonResponse
    {
        if ($application->status !== 'APPROVED') {
            return response()->json([
                'message' => 'Application must be approved first',
                'message_ar' => 'يجب الموافقة على الطلب أولاً',
            ], 422);
        }

        $validated = $request->validate([
            'graduation_date' => 'nullable|date',
            'graduation_ceremony' => 'nullable|string',
            'diploma_number' => 'nullable|string',
            'class_rank' => 'nullable|integer',
            'total_graduates' => 'nullable|integer',
        ]);

        $application->update([
            'status' => 'GRADUATED',
            'graduation_date' => $validated['graduation_date'] ?? now(),
            'graduation_ceremony' => $validated['graduation_ceremony'] ?? null,
            'diploma_number' => $validated['diploma_number'] ?? $this->generateDiplomaNumber($application),
            'class_rank' => $validated['class_rank'] ?? null,
            'total_graduates' => $validated['total_graduates'] ?? null,
        ]);

        // Update student status
        $application->student->update([
            'status' => 'GRADUATED',
            'graduation_date' => $application->graduation_date,
        ]);

        return response()->json([
            'message' => 'Student marked as graduated',
            'message_ar' => 'تم تخريج الطالب بنجاح',
            'application' => $application->fresh(['student', 'semester']),
        ]);
    }

    /**
     * Check student eligibility for graduation
     */
    public function checkEligibility(Student $student): JsonResponse
    {
        // Get or create graduation requirements record
        $requirements = GraduationRequirement::firstOrCreate(
            ['student_id' => $student->id],
            $this->calculateRequirements($student)
        );

        // Recalculate and update
        $calculatedRequirements = $this->calculateRequirements($student);
        $requirements->update($calculatedRequirements);

        // Check eligibility
        $isEligible = $requirements->checkEligibility();

        // Get missing courses
        $missingCourses = $this->getMissingCourses($student);

        return response()->json([
            'is_eligible' => $isEligible,
            'student' => $student->load('program'),
            'gpa' => $this->calculateStudentGPA($student->id),
            'total_credits' => $requirements->total_credits_required,
            'completed_credits' => $requirements->total_credits_completed,
            'remaining_credits' => $requirements->total_credits_remaining,
            'requirements' => $requirements,
            'deficiencies' => $requirements->deficiency_list,
            'missing_courses' => $missingCourses,
        ]);
    }

    /**
     * Get graduation statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_applications' => GraduationApplication::count(),
            'by_status' => [
                'SUBMITTED' => GraduationApplication::submitted()->count(),
                'UNDER_REVIEW' => GraduationApplication::underReview()->count(),
                'APPROVED' => GraduationApplication::approved()->count(),
                'REJECTED' => GraduationApplication::rejected()->count(),
                'GRADUATED' => GraduationApplication::graduated()->count(),
            ],
            'this_semester' => GraduationApplication::whereHas('semester', function ($q) {
                $q->where('is_current', true);
            })->count(),
            'pending' => GraduationApplication::pending()->count(),
            'graduated_this_year' => GraduationApplication::graduated()
                ->whereYear('graduation_date', date('Y'))
                ->count(),
            'avg_gpa' => GraduationApplication::graduated()
                ->whereNotNull('final_gpa')
                ->avg('final_gpa'),
            'with_honors' => GraduationApplication::graduated()
                ->whereIn('honors', ['EXCELLENT', 'EXCELLENT_HONORS'])
                ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Issue a document for graduated student
     */
    public function issueDocument(Request $request, GraduationApplication $application): JsonResponse
    {
        $validated = $request->validate([
            'document_type' => 'required|in:transcript,diploma,certificate,letter',
        ]);

        $documentType = $validated['document_type'];

        // Update the appropriate flag
        $updateField = match ($documentType) {
            'transcript' => 'transcript_issued',
            'diploma' => 'diploma_issued',
            'certificate' => 'certificate_issued',
            default => null,
        };

        if ($updateField) {
            $application->update([$updateField => true]);
        }

        // Track all issued documents
        $issuedDocuments = $application->documents_issued ?? [];
        $issuedDocuments[] = [
            'type' => $documentType,
            'issued_at' => now()->toISOString(),
            'issued_by' => auth()->user()->name,
        ];
        $application->update(['documents_issued' => $issuedDocuments]);

        return response()->json([
            'message' => "Document ({$documentType}) marked as issued",
            'message_ar' => 'تم إصدار الوثيقة بنجاح',
            'application' => $application->fresh(),
        ]);
    }

    /**
     * Get graduation requirements for a program
     */
    public function getProgramRequirements($programId): JsonResponse
    {
        $program = \App\Models\Program::with(['courses', 'department.college'])->findOrFail($programId);

        // Calculate program requirements
        $requirements = [
            'program' => $program,
            'total_credits' => $program->total_credits ?? 132,
            'university_credits' => $program->courses()->wherePivot('type', 'UNIVERSITY')->sum('credits'),
            'college_credits' => $program->courses()->wherePivot('type', 'COLLEGE')->sum('credits'),
            'major_credits' => $program->courses()->wherePivot('type', 'MAJOR')->sum('credits'),
            'elective_credits' => $program->courses()->wherePivot('type', 'ELECTIVE')->sum('credits'),
            'required_courses' => $program->courses()->wherePivot('is_common', false)->get(),
        ];

        return response()->json($requirements);
    }

    // ==================== Helper Methods ====================

    /**
     * Calculate student GPA
     */
    private function calculateStudentGPA($studentId): float
    {
        $grades = Grade::where('student_id', $studentId)
            ->where('status', 'APPROVED')
            ->with('course')
            ->get();

        if ($grades->isEmpty()) {
            return 0;
        }

        $totalPoints = 0;
        $totalCredits = 0;

        foreach ($grades as $grade) {
            $credits = $grade->course->credits ?? 3;
            $totalPoints += ($grade->grade_points ?? 0) * $credits;
            $totalCredits += $credits;
        }

        return $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;
    }

    /**
     * Determine honors based on GPA
     */
    private function determineHonors(float $gpa): ?string
    {
        if ($gpa >= 3.7) return 'EXCELLENT_HONORS';
        if ($gpa >= 3.5) return 'EXCELLENT';
        if ($gpa >= 3.0) return 'VERY_GOOD';
        if ($gpa >= 2.5) return 'GOOD';
        if ($gpa >= 2.0) return 'PASS';
        return null;
    }

    /**
     * Generate diploma number
     */
    private function generateDiplomaNumber(GraduationApplication $application): string
    {
        $year = date('Y');
        $sequence = GraduationApplication::graduated()
            ->whereYear('graduation_date', $year)
            ->count() + 1;

        return sprintf('VU-%s-%04d', $year, $sequence);
    }

    /**
     * Calculate graduation requirements for a student
     */
    private function calculateRequirements(Student $student): array
    {
        $program = $student->program;
        $gpa = $this->calculateStudentGPA($student->id);

        // Get completed courses
        $completedEnrollments = Enrollment::where('student_id', $student->id)
            ->where('status', 'COMPLETED')
            ->with('course')
            ->get();

        $completedCredits = $completedEnrollments->sum(fn($e) => $e->course->credits ?? 0);
        $totalRequired = $program->total_credits ?? 132;

        return [
            'student_id' => $student->id,
            'total_credits_required' => $totalRequired,
            'total_credits_completed' => $completedCredits,
            'total_credits_in_progress' => Enrollment::where('student_id', $student->id)
                ->where('status', 'ENROLLED')
                ->with('course')
                ->get()
                ->sum(fn($e) => $e->course->credits ?? 0),
            'total_credits_remaining' => max(0, $totalRequired - $completedCredits),
            'completion_percentage' => $totalRequired > 0 ? round(($completedCredits / $totalRequired) * 100, 2) : 0,
            'minimum_gpa_required' => 2.0,
            'gpa_requirement_met' => $gpa >= 2.0,
            'is_eligible_to_graduate' => $completedCredits >= $totalRequired && $gpa >= 2.0,
            'eligibility_checked_at' => now(),
            'eligibility_checked_by' => auth()->id(),
        ];
    }

    /**
     * Get missing required courses for a student
     */
    private function getMissingCourses(Student $student): array
    {
        $program = $student->program;
        if (!$program) {
            return [];
        }

        // Get all required courses for the program
        $requiredCourseIds = $program->courses()
            ->wherePivot('type', '!=', 'ELECTIVE')
            ->pluck('courses.id')
            ->toArray();

        // Get completed course IDs
        $completedCourseIds = Enrollment::where('student_id', $student->id)
            ->where('status', 'COMPLETED')
            ->pluck('course_id')
            ->toArray();

        // Find missing courses
        $missingCourseIds = array_diff($requiredCourseIds, $completedCourseIds);

        return \App\Models\Course::whereIn('id', $missingCourseIds)
            ->select('id', 'code', 'name_en', 'name_ar', 'credits')
            ->get()
            ->toArray();
    }
}
