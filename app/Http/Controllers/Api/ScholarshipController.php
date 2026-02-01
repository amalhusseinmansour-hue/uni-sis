<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scholarship;
use App\Models\StudentScholarship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScholarshipController extends Controller
{
    /**
     * Get all scholarships (admin)
     */
    public function index(Request $request): JsonResponse
    {
        $scholarships = Scholarship::query()
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->has('active'), fn($q) => $q->where('is_active', $request->boolean('active')))
            ->orderBy('name_en')
            ->get()
            ->map(fn($s) => $this->formatScholarship($s));

        return response()->json($scholarships);
    }

    /**
     * Get available scholarships for students
     */
    public function available(): JsonResponse
    {
        $scholarships = Scholarship::active()
            ->acceptingApplications()
            ->hasAvailableSlots()
            ->get()
            ->map(fn($s) => $this->formatScholarship($s));

        return response()->json($scholarships);
    }

    /**
     * Get a specific scholarship
     */
    public function show(Scholarship $scholarship): JsonResponse
    {
        return response()->json($this->formatScholarship($scholarship));
    }

    /**
     * Create a new scholarship
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:scholarships,code|max:50',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'type' => 'required|in:MERIT,NEED_BASED,ATHLETIC,GOVERNMENT,CORPORATE,FULL,PARTIAL',
            'coverage_type' => 'required|in:PERCENTAGE,FIXED',
            'coverage_value' => 'required|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'min_gpa' => 'nullable|numeric|min:0|max:4',
            'max_recipients' => 'nullable|integer|min:1',
            'max_semesters' => 'nullable|integer|min:1',
            'is_renewable' => 'boolean',
            'is_active' => 'boolean',
            'application_start' => 'nullable|date',
            'application_end' => 'nullable|date|after:application_start',
            'eligibility_criteria' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
        ]);

        $scholarship = Scholarship::create($validated);

        return response()->json($this->formatScholarship($scholarship), 201);
    }

    /**
     * Update a scholarship
     */
    public function update(Request $request, Scholarship $scholarship): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'type' => 'sometimes|in:MERIT,NEED_BASED,ATHLETIC,GOVERNMENT,CORPORATE,FULL,PARTIAL',
            'coverage_type' => 'sometimes|in:PERCENTAGE,FIXED',
            'coverage_value' => 'sometimes|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'min_gpa' => 'nullable|numeric|min:0|max:4',
            'max_recipients' => 'nullable|integer|min:1',
            'max_semesters' => 'nullable|integer|min:1',
            'is_renewable' => 'boolean',
            'is_active' => 'boolean',
            'application_start' => 'nullable|date',
            'application_end' => 'nullable|date',
            'eligibility_criteria' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
        ]);

        $scholarship->update($validated);

        return response()->json($this->formatScholarship($scholarship));
    }

    /**
     * Delete a scholarship
     */
    public function destroy(Scholarship $scholarship): JsonResponse
    {
        // Check if scholarship has active recipients
        if ($scholarship->studentScholarships()->active()->exists()) {
            return response()->json([
                'message' => 'Cannot delete scholarship with active recipients'
            ], 422);
        }

        $scholarship->delete();

        return response()->json(null, 204);
    }

    /**
     * Get student's scholarships
     */
    public function myScholarships(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([]);
        }

        $scholarships = StudentScholarship::with('scholarship')
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($ss) => $this->formatStudentScholarship($ss));

        return response()->json($scholarships);
    }

    /**
     * Apply for a scholarship
     */
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scholarship_id' => 'required|exists:scholarships,id',
            'reason' => 'nullable|string|max:1000',
        ]);

        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $scholarship = Scholarship::findOrFail($validated['scholarship_id']);

        // Check if already applied
        $existingApplication = StudentScholarship::where('student_id', $student->id)
            ->where('scholarship_id', $scholarship->id)
            ->whereIn('status', ['PENDING', 'APPROVED', 'ACTIVE'])
            ->first();

        if ($existingApplication) {
            return response()->json([
                'message' => 'You have already applied for this scholarship'
            ], 422);
        }

        // Check eligibility
        if (!$scholarship->isAcceptingApplications()) {
            return response()->json([
                'message' => 'This scholarship is not accepting applications'
            ], 422);
        }

        if (!$scholarship->hasAvailableSlots()) {
            return response()->json([
                'message' => 'This scholarship has no available slots'
            ], 422);
        }

        if (!$scholarship->isStudentEligible($student)) {
            return response()->json([
                'message' => 'You do not meet the eligibility requirements'
            ], 422);
        }

        $studentScholarship = StudentScholarship::create([
            'student_id' => $student->id,
            'scholarship_id' => $scholarship->id,
            'status' => StudentScholarship::STATUS_PENDING,
            'application_notes' => $validated['reason'] ?? null,
        ]);

        return response()->json($this->formatStudentScholarship($studentScholarship), 201);
    }

    /**
     * Get all student scholarships (admin)
     */
    public function allStudentScholarships(Request $request): JsonResponse
    {
        $scholarships = StudentScholarship::with(['student', 'scholarship'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->scholarship_id, fn($q) => $q->where('scholarship_id', $request->scholarship_id))
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        $scholarships->getCollection()->transform(fn($ss) => $this->formatStudentScholarship($ss));

        return response()->json($scholarships);
    }

    /**
     * Update student scholarship status
     */
    public function updateStatus(Request $request, StudentScholarship $studentScholarship): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:PENDING,APPROVED,REJECTED,ACTIVE,SUSPENDED,COMPLETED,CANCELLED',
            'notes' => 'nullable|string',
            'awarded_amount' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();

        if ($validated['status'] === 'APPROVED') {
            $studentScholarship->approve($user, $validated['notes'] ?? null);
            if (isset($validated['awarded_amount'])) {
                $studentScholarship->update(['awarded_amount' => $validated['awarded_amount']]);
            }
        } elseif ($validated['status'] === 'ACTIVE') {
            $studentScholarship->activate();
        } elseif ($validated['status'] === 'SUSPENDED') {
            $studentScholarship->suspend($validated['notes'] ?? null);
        } elseif ($validated['status'] === 'COMPLETED') {
            $studentScholarship->complete();
        } else {
            $studentScholarship->update([
                'status' => $validated['status'],
                'approval_notes' => $validated['notes'] ?? $studentScholarship->approval_notes,
            ]);
        }

        return response()->json($this->formatStudentScholarship($studentScholarship->fresh()));
    }

    /**
     * Get scholarship statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_scholarships' => Scholarship::count(),
            'active_recipients' => StudentScholarship::active()->count(),
            'total_awarded' => (float) StudentScholarship::sum('awarded_amount'),
            'total_disbursed' => (float) StudentScholarship::sum('disbursed_amount'),
            'pending_applications' => StudentScholarship::pending()->count(),
            'by_type' => Scholarship::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->get()
                ->map(fn($s) => [
                    'type' => $s->type,
                    'count' => $s->count,
                    'amount' => (float) StudentScholarship::whereHas('scholarship', fn($q) => $q->where('type', $s->type))
                        ->sum('awarded_amount'),
                ]),
        ];

        return response()->json($stats);
    }

    /**
     * Format scholarship for API response
     */
    private function formatScholarship(Scholarship $scholarship): array
    {
        return [
            'id' => $scholarship->code,
            'code' => $scholarship->code,
            'name' => $scholarship->name_en,
            'name_ar' => $scholarship->name_ar ?? $scholarship->name_en,
            'description' => $scholarship->eligibility_criteria,
            'description_ar' => $scholarship->eligibility_criteria,
            'type' => $scholarship->type,
            'coverage_percentage' => $scholarship->coverage_type === 'PERCENTAGE' ? (float) $scholarship->coverage_value : null,
            'coverage_amount' => $scholarship->coverage_type === 'FIXED' ? (float) $scholarship->coverage_value : null,
            'max_semesters' => $scholarship->max_semesters,
            'requirements' => $scholarship->terms_conditions,
            'requirements_ar' => $scholarship->terms_conditions,
            'is_active' => $scholarship->is_active,
            'application_deadline' => $scholarship->application_end?->format('Y-m-d'),
            'academic_year' => now()->format('Y') . '-' . (now()->format('Y') + 1),
            'min_gpa' => (float) $scholarship->min_gpa,
            'max_recipients' => $scholarship->max_recipients,
            'current_recipients' => $scholarship->current_recipients,
            'is_renewable' => $scholarship->is_renewable,
        ];
    }

    /**
     * Format student scholarship for API response
     */
    private function formatStudentScholarship(StudentScholarship $ss): array
    {
        return [
            'id' => 'SS-' . str_pad($ss->id, 3, '0', STR_PAD_LEFT),
            'student_id' => $ss->student_id,
            'scholarship_id' => $ss->scholarship?->code,
            'scholarship' => $ss->scholarship ? $this->formatScholarship($ss->scholarship) : null,
            'status' => $ss->status,
            'applied_date' => $ss->created_at->format('Y-m-d'),
            'approved_date' => $ss->approved_at?->format('Y-m-d'),
            'start_semester' => $ss->start_date?->format('Y-m-d'),
            'end_semester' => $ss->end_date?->format('Y-m-d'),
            'total_awarded' => (float) $ss->awarded_amount,
            'total_disbursed' => (float) $ss->disbursed_amount,
            'gpa_requirement' => $ss->scholarship?->min_gpa,
            'notes' => $ss->application_notes,
        ];
    }
}
