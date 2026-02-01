<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialRecord;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\Semester;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FinancialRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $records = FinancialRecord::with('student')
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->when($request->from_date, fn($q) => $q->whereDate('date', '>=', $request->from_date))
            ->when($request->to_date, fn($q) => $q->whereDate('date', '<=', $request->to_date))
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($records);
    }

    public function show(FinancialRecord $financialRecord): JsonResponse
    {
        $financialRecord->load('student');

        return response()->json($financialRecord);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'description' => 'required|string',
            'description_ar' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|in:DEBIT,CREDIT',
            'status' => 'required|in:PAID,PENDING,OVERDUE',
            'reference_number' => 'nullable|string|max:100',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Generate unique reference number if not provided
        if (empty($validated['reference_number'])) {
            $validated['reference_number'] = 'FIN-' . date('Ymd') . '-' . strtoupper(Str::random(8));
        }

        $record = FinancialRecord::create($validated);

        return response()->json($record->load('student'), 201);
    }

    public function update(Request $request, FinancialRecord $financialRecord): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'sometimes|date',
            'description' => 'sometimes|string',
            'description_ar' => 'nullable|string',
            'amount' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|in:DEBIT,CREDIT',
            'status' => 'sometimes|in:PAID,PENDING,OVERDUE',
            'reference_number' => 'nullable|string|max:100',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $financialRecord->update($validated);

        return response()->json($financialRecord->load('student'));
    }

    public function destroy(FinancialRecord $financialRecord): JsonResponse
    {
        // Prevent deletion of paid records
        if ($financialRecord->status === 'PAID') {
            return response()->json([
                'message' => 'Cannot delete a paid financial record'
            ], 422);
        }

        $financialRecord->delete();

        return response()->json(null, 204);
    }

    public function markPaid(Request $request, FinancialRecord $financialRecord): JsonResponse
    {
        $validated = $request->validate([
            'payment_date' => 'nullable|date',
            'payment_method' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $financialRecord->update([
            'status' => 'PAID',
            'notes' => $validated['notes'] ?? $financialRecord->notes,
        ]);

        return response()->json($financialRecord);
    }

    public function markOverdue(FinancialRecord $financialRecord): JsonResponse
    {
        if ($financialRecord->status === 'PAID') {
            return response()->json([
                'message' => 'Cannot mark a paid record as overdue'
            ], 422);
        }

        $financialRecord->update(['status' => 'OVERDUE']);

        return response()->json($financialRecord);
    }

    public function studentBalance(Student $student): JsonResponse
    {
        $records = $student->financialRecords;

        $totalDebit = $records->where('type', 'DEBIT')->sum('amount');
        $totalCredit = $records->where('type', 'CREDIT')->sum('amount');
        $balance = $totalCredit - $totalDebit;

        $pending = $records->where('status', 'PENDING')->sum('amount');
        $overdue = $records->where('status', 'OVERDUE')->sum('amount');

        return response()->json([
            'student_id' => $student->id,
            'student_name' => $student->full_name_en,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'balance' => $balance,
            'pending_amount' => $pending,
            'overdue_amount' => $overdue,
            'has_outstanding_balance' => $balance < 0,
        ]);
    }

    public function statistics(): JsonResponse
    {
        $stats = [
            'total_records' => FinancialRecord::count(),
            'total_debit' => FinancialRecord::where('type', 'DEBIT')->sum('amount'),
            'total_credit' => FinancialRecord::where('type', 'CREDIT')->sum('amount'),
            'pending_count' => FinancialRecord::where('status', 'PENDING')->count(),
            'pending_amount' => FinancialRecord::where('status', 'PENDING')->sum('amount'),
            'overdue_count' => FinancialRecord::where('status', 'OVERDUE')->count(),
            'overdue_amount' => FinancialRecord::where('status', 'OVERDUE')->sum('amount'),
            'paid_count' => FinancialRecord::where('status', 'PAID')->count(),
            'paid_amount' => FinancialRecord::where('status', 'PAID')->sum('amount'),
        ];

        return response()->json($stats);
    }

    /**
     * Get current student's financial records
     */
    public function myFinancialRecords(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $records = FinancialRecord::where('student_id', $student->id)
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('date', 'desc')
            ->get();

        // Calculate totals
        $totalDebit = $records->where('type', 'DEBIT')->sum('amount');
        $totalCredit = $records->where('type', 'CREDIT')->sum('amount');
        $balance = $totalCredit - $totalDebit;

        return response()->json([
            'records' => $records,
            'balance' => $balance,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
        ]);
    }

    /**
     * Get current student's balance
     */
    public function myBalance(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $records = FinancialRecord::where('student_id', $student->id)->get();

        $totalDebit = $records->where('type', 'DEBIT')->sum('amount');
        $totalCredit = $records->where('type', 'CREDIT')->sum('amount');
        $balance = $totalCredit - $totalDebit;

        $pending = $records->where('status', 'PENDING')->sum('amount');
        $overdue = $records->where('status', 'OVERDUE')->sum('amount');
        $paid = $records->where('status', 'PAID')->sum('amount');

        // Get current semester fees
        $currentSemester = Semester::where('is_current', true)->first();
        $currentSemesterFees = 0;

        if ($currentSemester) {
            $currentSemesterFees = $records
                ->filter(fn($r) => $r->date >= $currentSemester->start_date && $r->date <= $currentSemester->end_date)
                ->where('type', 'DEBIT')
                ->sum('amount');
        }

        return response()->json([
            'student_id' => $student->id,
            'student_name' => $student->full_name_en ?? $student->name,
            'total_debit' => (float) $totalDebit,
            'total_credit' => (float) $totalCredit,
            'balance' => (float) $balance,
            'pending_amount' => (float) $pending,
            'overdue_amount' => (float) $overdue,
            'paid_amount' => (float) $paid,
            'current_semester_fees' => (float) $currentSemesterFees,
            'has_outstanding_balance' => $balance < 0,
        ]);
    }

    /**
     * Get fee structure (for student to view)
     */
    public function getFeeStructure(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        $query = FeeStructure::active()->effective();

        if ($student && $student->program_id) {
            $query->forProgram($student->program_id);
        }

        $fees = $query->orderBy('fee_type')->get()->map(fn($fee) => [
            'id' => $fee->id,
            'type' => $fee->fee_type,
            'name' => $fee->name_en,
            'name_ar' => $fee->name_ar,
            'amount' => (float) $fee->amount,
            'currency' => $fee->currency ?? 'USD',
            'is_mandatory' => $fee->is_mandatory,
            'is_recurring' => $fee->is_recurring,
            'description' => $fee->description,
        ]);

        // Calculate totals
        $mandatoryTotal = $fees->where('is_mandatory', true)->sum('amount');
        $optionalTotal = $fees->where('is_mandatory', false)->sum('amount');

        return response()->json([
            'fees' => $fees,
            'mandatory_total' => $mandatoryTotal,
            'optional_total' => $optionalTotal,
            'total' => $mandatoryTotal + $optionalTotal,
        ]);
    }

    /**
     * Get all fee structures (admin)
     */
    public function allFeeStructures(Request $request): JsonResponse
    {
        $fees = FeeStructure::with(['program', 'semester'])
            ->when($request->program_id, fn($q) => $q->where('program_id', $request->program_id))
            ->when($request->fee_type, fn($q) => $q->where('fee_type', $request->fee_type))
            ->when($request->has('active'), fn($q) => $q->where('is_active', $request->boolean('active')))
            ->orderBy('fee_type')
            ->orderBy('name_en')
            ->paginate($request->per_page ?? 50);

        return response()->json($fees);
    }

    /**
     * Create fee structure (admin)
     */
    public function createFeeStructure(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'fee_type' => 'required|string|max:50',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'is_mandatory' => 'boolean',
            'is_recurring' => 'boolean',
            'applies_to' => 'nullable|in:ALL,NEW_STUDENTS,CONTINUING,SPECIFIC_LEVELS',
            'applicable_levels' => 'nullable|array',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $fee = FeeStructure::create($validated);

        return response()->json($fee->load(['program', 'semester']), 201);
    }

    /**
     * Update fee structure (admin)
     */
    public function updateFeeStructure(Request $request, FeeStructure $feeStructure): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'fee_type' => 'sometimes|string|max:50',
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'is_mandatory' => 'boolean',
            'is_recurring' => 'boolean',
            'applies_to' => 'nullable|in:ALL,NEW_STUDENTS,CONTINUING,SPECIFIC_LEVELS',
            'applicable_levels' => 'nullable|array',
            'effective_from' => 'sometimes|date',
            'effective_to' => 'nullable|date',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $feeStructure->update($validated);

        return response()->json($feeStructure->load(['program', 'semester']));
    }

    /**
     * Delete fee structure (admin)
     */
    public function deleteFeeStructure(FeeStructure $feeStructure): JsonResponse
    {
        $feeStructure->delete();

        return response()->json(null, 204);
    }

    /**
     * Get fee types
     */
    public function getFeeTypes(): JsonResponse
    {
        return response()->json(FeeStructure::getFeeTypes());
    }
}
