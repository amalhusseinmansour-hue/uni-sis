<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PaymentPlanController extends Controller
{
    /**
     * Get all payment plans (Admin/Finance)
     */
    public function index(Request $request)
    {
        $query = PaymentPlan::with(['student.user', 'semester', 'installments', 'approvedBy']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        $plans = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return response()->json($plans);
    }

    /**
     * Get current student's payment plans
     */
    public function myPaymentPlans(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $plans = PaymentPlan::with(['semester', 'installments'])
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $plans,
            'summary' => [
                'total_plans' => $plans->count(),
                'active_plans' => $plans->where('status', 'ACTIVE')->count(),
                'total_remaining' => $plans->where('status', 'ACTIVE')->sum('remaining_amount'),
            ]
        ]);
    }

    /**
     * Create a new payment plan
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'total_amount' => 'required|numeric|min:0',
            'number_of_installments' => 'required|integer|min:2|max:12',
            'frequency' => 'required|in:WEEKLY,BI_WEEKLY,MONTHLY,CUSTOM',
            'start_date' => 'required|date',
            'down_payment' => 'nullable|numeric|min:0',
            'late_fee_percentage' => 'nullable|numeric|min:0|max:100',
            'grace_period_days' => 'nullable|integer|min:0',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $plan = PaymentPlan::create([
                ...$validated,
                'status' => PaymentPlan::STATUS_DRAFT,
                'paid_amount' => $validated['down_payment'] ?? 0,
                'remaining_amount' => $validated['total_amount'] - ($validated['down_payment'] ?? 0),
            ]);

            // Generate installments
            $plan->generateInstallments();

            DB::commit();

            return response()->json([
                'message' => 'Payment plan created successfully',
                'data' => $plan->load('installments')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create payment plan', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get a specific payment plan
     */
    public function show(PaymentPlan $paymentPlan)
    {
        $paymentPlan->load(['student.user', 'semester', 'installments', 'approvedBy']);

        return response()->json([
            'data' => $paymentPlan,
            'progress' => $paymentPlan->progress_percentage,
            'next_installment' => $paymentPlan->next_installment,
        ]);
    }

    /**
     * Update a payment plan
     */
    public function update(Request $request, PaymentPlan $paymentPlan)
    {
        if ($paymentPlan->status !== PaymentPlan::STATUS_DRAFT) {
            return response()->json(['message' => 'Only draft plans can be updated'], 422);
        }

        $validated = $request->validate([
            'total_amount' => 'sometimes|numeric|min:0',
            'number_of_installments' => 'sometimes|integer|min:2|max:12',
            'frequency' => 'sometimes|in:WEEKLY,BI_WEEKLY,MONTHLY,CUSTOM',
            'start_date' => 'sometimes|date',
            'down_payment' => 'nullable|numeric|min:0',
            'late_fee_percentage' => 'nullable|numeric|min:0|max:100',
            'grace_period_days' => 'nullable|integer|min:0',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $paymentPlan->update($validated);

            // Regenerate installments if amount or number changed
            if (isset($validated['total_amount']) || isset($validated['number_of_installments'])) {
                $paymentPlan->installments()->delete();
                $paymentPlan->generateInstallments();
            }

            DB::commit();

            return response()->json([
                'message' => 'Payment plan updated successfully',
                'data' => $paymentPlan->fresh()->load('installments')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update payment plan', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a payment plan
     */
    public function destroy(PaymentPlan $paymentPlan)
    {
        if ($paymentPlan->status !== PaymentPlan::STATUS_DRAFT) {
            return response()->json(['message' => 'Only draft plans can be deleted'], 422);
        }

        $paymentPlan->installments()->delete();
        $paymentPlan->delete();

        return response()->json(['message' => 'Payment plan deleted successfully']);
    }

    /**
     * Approve a payment plan
     */
    public function approve(Request $request, PaymentPlan $paymentPlan)
    {
        if ($paymentPlan->status !== PaymentPlan::STATUS_DRAFT) {
            return response()->json(['message' => 'Only draft plans can be approved'], 422);
        }

        $paymentPlan->update([
            'status' => PaymentPlan::STATUS_ACTIVE,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Payment plan approved successfully',
            'data' => $paymentPlan
        ]);
    }

    /**
     * Cancel a payment plan
     */
    public function cancel(Request $request, PaymentPlan $paymentPlan)
    {
        if (!in_array($paymentPlan->status, [PaymentPlan::STATUS_DRAFT, PaymentPlan::STATUS_ACTIVE])) {
            return response()->json(['message' => 'This plan cannot be cancelled'], 422);
        }

        $paymentPlan->update([
            'status' => PaymentPlan::STATUS_CANCELLED,
            'notes' => $paymentPlan->notes . "\n\nCancelled by: " . Auth::user()->name . " at " . now(),
        ]);

        return response()->json([
            'message' => 'Payment plan cancelled successfully',
            'data' => $paymentPlan
        ]);
    }

    /**
     * Pay an installment
     */
    public function payInstallment(Request $request, PaymentPlanInstallment $installment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'reference' => 'nullable|string',
        ]);

        if ($installment->status === 'PAID') {
            return response()->json(['message' => 'This installment is already paid'], 422);
        }

        try {
            DB::beginTransaction();

            $installment->update([
                'paid_amount' => $installment->paid_amount + $validated['amount'],
                'paid_date' => now(),
                'status' => ($installment->paid_amount + $validated['amount'] >= $installment->amount) ? 'PAID' : 'PARTIAL',
                'payment_method' => $validated['payment_method'],
                'payment_reference' => $validated['reference'] ?? null,
            ]);

            // Update plan totals
            $installment->paymentPlan->recordPayment($validated['amount']);

            DB::commit();

            return response()->json([
                'message' => 'Payment recorded successfully',
                'data' => $installment->fresh(),
                'plan' => $installment->paymentPlan->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to record payment', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get payment plan statistics
     */
    public function statistics()
    {
        $stats = [
            'total_plans' => PaymentPlan::count(),
            'active_plans' => PaymentPlan::where('status', 'ACTIVE')->count(),
            'completed_plans' => PaymentPlan::where('status', 'COMPLETED')->count(),
            'defaulted_plans' => PaymentPlan::where('status', 'DEFAULTED')->count(),
            'total_amount' => PaymentPlan::sum('total_amount'),
            'total_paid' => PaymentPlan::sum('paid_amount'),
            'total_remaining' => PaymentPlan::where('status', 'ACTIVE')->sum('remaining_amount'),
            'overdue_installments' => PaymentPlanInstallment::where('status', 'OVERDUE')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get overdue installments
     */
    public function overdueInstallments()
    {
        $installments = PaymentPlanInstallment::with(['paymentPlan.student.user'])
            ->where('status', 'OVERDUE')
            ->orWhere(function ($q) {
                $q->where('status', 'PENDING')
                    ->where('due_date', '<', now());
            })
            ->orderBy('due_date')
            ->get();

        return response()->json(['data' => $installments]);
    }

    /**
     * Apply for a payment plan (Student)
     */
    public function apply(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $validated = $request->validate([
            'semester_id' => 'nullable|exists:semesters,id',
            'total_amount' => 'required|numeric|min:100',
            'number_of_installments' => 'required|integer|min:2|max:6',
            'frequency' => 'required|in:WEEKLY,BI_WEEKLY,MONTHLY',
            'reason' => 'required|string|max:1000',
        ]);

        // Check if student already has an active plan
        $activePlan = PaymentPlan::where('student_id', $student->id)
            ->where('status', 'ACTIVE')
            ->first();

        if ($activePlan) {
            return response()->json(['message' => 'You already have an active payment plan'], 422);
        }

        $plan = PaymentPlan::create([
            'student_id' => $student->id,
            'semester_id' => $validated['semester_id'],
            'total_amount' => $validated['total_amount'],
            'number_of_installments' => $validated['number_of_installments'],
            'frequency' => $validated['frequency'],
            'start_date' => now()->addDays(7),
            'status' => PaymentPlan::STATUS_DRAFT,
            'notes' => "Student Application Reason: " . $validated['reason'],
        ]);

        $plan->generateInstallments();

        return response()->json([
            'message' => 'Payment plan application submitted successfully. Pending approval.',
            'data' => $plan->load('installments')
        ], 201);
    }
}
