<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scholarship;
use App\Models\StudentScholarship;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ScholarshipController extends Controller
{
    /**
     * Get all scholarships
     */
    public function index(Request $request)
    {
        $query = Scholarship::withCount('studentScholarships');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->boolean('active_only')) {
            $query->active();
        }

        if ($request->boolean('accepting_applications')) {
            $query->acceptingApplications()->hasAvailableSlots();
        }

        $scholarships = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return response()->json($scholarships);
    }

    /**
     * Get available scholarships (Public/Students)
     */
    public function available()
    {
        $scholarships = Scholarship::active()
            ->acceptingApplications()
            ->hasAvailableSlots()
            ->get();

        return response()->json(['data' => $scholarships]);
    }

    /**
     * Create a new scholarship
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:scholarships,code',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'type' => 'required|in:MERIT,NEED_BASED,ATHLETIC,GOVERNMENT,CORPORATE,FULL,PARTIAL',
            'coverage_type' => 'required|in:PERCENTAGE,FIXED',
            'coverage_value' => 'required|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'min_gpa' => 'nullable|numeric|min:0|max:4',
            'max_recipients' => 'nullable|integer|min:1',
            'application_start' => 'nullable|date',
            'application_end' => 'nullable|date|after_or_equal:application_start',
            'is_renewable' => 'boolean',
            'max_semesters' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'eligibility_criteria' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
        ]);

        $scholarship = Scholarship::create($validated);

        return response()->json([
            'message' => 'Scholarship created successfully',
            'data' => $scholarship
        ], 201);
    }

    /**
     * Get a specific scholarship
     */
    public function show(Scholarship $scholarship)
    {
        $scholarship->loadCount('studentScholarships');
        $scholarship->load(['studentScholarships' => function ($q) {
            $q->with('student.user')->latest()->take(10);
        }]);

        return response()->json(['data' => $scholarship]);
    }

    /**
     * Update a scholarship
     */
    public function update(Request $request, Scholarship $scholarship)
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|unique:scholarships,code,' . $scholarship->id,
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:MERIT,NEED_BASED,ATHLETIC,GOVERNMENT,CORPORATE,FULL,PARTIAL',
            'coverage_type' => 'sometimes|in:PERCENTAGE,FIXED',
            'coverage_value' => 'sometimes|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'min_gpa' => 'nullable|numeric|min:0|max:4',
            'max_recipients' => 'nullable|integer|min:1',
            'application_start' => 'nullable|date',
            'application_end' => 'nullable|date|after_or_equal:application_start',
            'is_renewable' => 'boolean',
            'max_semesters' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'eligibility_criteria' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
        ]);

        $scholarship->update($validated);

        return response()->json([
            'message' => 'Scholarship updated successfully',
            'data' => $scholarship
        ]);
    }

    /**
     * Delete a scholarship
     */
    public function destroy(Scholarship $scholarship)
    {
        if ($scholarship->studentScholarships()->exists()) {
            return response()->json(['message' => 'Cannot delete scholarship with active recipients'], 422);
        }

        $scholarship->delete();

        return response()->json(['message' => 'Scholarship deleted successfully']);
    }

    /**
     * Get scholarship types
     */
    public function types()
    {
        return response()->json(['data' => Scholarship::getTypes()]);
    }

    /**
     * Get scholarship statistics
     */
    public function statistics()
    {
        $stats = [
            'total_scholarships' => Scholarship::count(),
            'active_scholarships' => Scholarship::active()->count(),
            'total_recipients' => StudentScholarship::where('status', 'ACTIVE')->count(),
            'total_awarded' => StudentScholarship::sum('awarded_amount'),
            'total_disbursed' => StudentScholarship::sum('disbursed_amount'),
            'by_type' => Scholarship::select('type')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
        ];

        return response()->json($stats);
    }

    // ========== Student Scholarships ==========

    /**
     * Get all student scholarships (Admin)
     */
    public function studentScholarships(Request $request)
    {
        $query = StudentScholarship::with(['student.user', 'scholarship', 'approvedBy']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('scholarship_id')) {
            $query->where('scholarship_id', $request->scholarship_id);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        $studentScholarships = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($studentScholarships);
    }

    /**
     * Get current student's scholarships
     */
    public function myScholarships()
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $scholarships = StudentScholarship::with('scholarship')
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalAwarded = $scholarships->where('status', 'ACTIVE')->sum('awarded_amount');
        $totalDisbursed = $scholarships->where('status', 'ACTIVE')->sum('disbursed_amount');

        return response()->json([
            'data' => $scholarships,
            'summary' => [
                'total_scholarships' => $scholarships->count(),
                'active_scholarships' => $scholarships->where('status', 'ACTIVE')->count(),
                'total_awarded' => $totalAwarded,
                'total_disbursed' => $totalDisbursed,
                'pending_disbursement' => $totalAwarded - $totalDisbursed,
            ]
        ]);
    }

    /**
     * Apply for a scholarship (Student)
     */
    public function apply(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $validated = $request->validate([
            'scholarship_id' => 'required|exists:scholarships,id',
            'application_reason' => 'required|string|max:2000',
            'documents' => 'nullable|array',
        ]);

        $scholarship = Scholarship::findOrFail($validated['scholarship_id']);

        // Check eligibility
        if (!$scholarship->isAcceptingApplications()) {
            return response()->json(['message' => 'This scholarship is not accepting applications'], 422);
        }

        if (!$scholarship->hasAvailableSlots()) {
            return response()->json(['message' => 'This scholarship has no available slots'], 422);
        }

        if (!$scholarship->isStudentEligible($student)) {
            return response()->json(['message' => 'You do not meet the eligibility criteria for this scholarship'], 422);
        }

        // Check if already applied
        $existingApplication = StudentScholarship::where('student_id', $student->id)
            ->where('scholarship_id', $scholarship->id)
            ->whereIn('status', ['PENDING', 'ACTIVE'])
            ->first();

        if ($existingApplication) {
            return response()->json(['message' => 'You have already applied for this scholarship'], 422);
        }

        $studentScholarship = StudentScholarship::create([
            'student_id' => $student->id,
            'scholarship_id' => $scholarship->id,
            'status' => 'PENDING',
            'application_date' => now(),
            'application_reason' => $validated['application_reason'],
            'documents' => $validated['documents'] ?? null,
        ]);

        return response()->json([
            'message' => 'Scholarship application submitted successfully',
            'data' => $studentScholarship->load('scholarship')
        ], 201);
    }

    /**
     * Award scholarship to student (Admin)
     */
    public function award(Request $request, StudentScholarship $studentScholarship)
    {
        $validated = $request->validate([
            'awarded_amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'notes' => 'nullable|string',
        ]);

        $studentScholarship->update([
            'status' => 'ACTIVE',
            'awarded_amount' => $validated['awarded_amount'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        // Increment scholarship recipients count
        $studentScholarship->scholarship->increment('current_recipients');

        return response()->json([
            'message' => 'Scholarship awarded successfully',
            'data' => $studentScholarship->fresh()
        ]);
    }

    /**
     * Reject scholarship application (Admin)
     */
    public function reject(Request $request, StudentScholarship $studentScholarship)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $studentScholarship->update([
            'status' => 'REJECTED',
            'notes' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'message' => 'Scholarship application rejected',
            'data' => $studentScholarship
        ]);
    }

    /**
     * Disburse scholarship funds (Admin)
     */
    public function disburse(Request $request, StudentScholarship $studentScholarship)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'reference' => 'nullable|string',
        ]);

        if ($studentScholarship->status !== 'ACTIVE') {
            return response()->json(['message' => 'Can only disburse to active scholarships'], 422);
        }

        $newDisbursed = $studentScholarship->disbursed_amount + $validated['amount'];
        if ($newDisbursed > $studentScholarship->awarded_amount) {
            return response()->json(['message' => 'Disbursement exceeds awarded amount'], 422);
        }

        $studentScholarship->update([
            'disbursed_amount' => $newDisbursed,
            'last_disbursement_date' => now(),
        ]);

        // Update student financial record
        $student = $studentScholarship->student;
        $student->increment('scholarships', $validated['amount']);
        $student->decrement('current_balance', $validated['amount']);

        return response()->json([
            'message' => 'Funds disbursed successfully',
            'data' => $studentScholarship->fresh()
        ]);
    }

    /**
     * Revoke scholarship (Admin)
     */
    public function revoke(Request $request, StudentScholarship $studentScholarship)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        if ($studentScholarship->status !== 'ACTIVE') {
            return response()->json(['message' => 'Can only revoke active scholarships'], 422);
        }

        $studentScholarship->update([
            'status' => 'REVOKED',
            'end_date' => now(),
            'notes' => $studentScholarship->notes . "\n\nRevoked: " . $validated['reason'],
        ]);

        // Decrement scholarship recipients count
        $studentScholarship->scholarship->decrement('current_recipients');

        return response()->json([
            'message' => 'Scholarship revoked',
            'data' => $studentScholarship
        ]);
    }
}
