<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialRecord;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        // Generate reference number if not provided
        if (empty($validated['reference_number'])) {
            $validated['reference_number'] = 'FIN-' . date('Ymd') . '-' . rand(1000, 9999);
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
}
