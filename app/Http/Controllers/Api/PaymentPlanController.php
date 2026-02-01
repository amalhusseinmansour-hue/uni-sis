<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentPlanController extends Controller
{
    /**
     * Get all payment plans (admin)
     */
    public function index(Request $request): JsonResponse
    {
        $plans = PaymentPlan::with(['student', 'installments', 'semester'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($plan) => $this->formatPlan($plan));

        return response()->json($plans);
    }

    /**
     * Format payment plan for API response
     */
    private function formatPlan(PaymentPlan $plan): array
    {
        return [
            'id' => $plan->plan_number,
            'student_id' => $plan->student_id,
            'student_name' => $plan->student?->full_name_en ?? $plan->student?->name_en ?? $plan->student?->name_ar ?? $plan->student?->name ?? 'N/A',
            'student_number' => $plan->student?->student_id ?? $plan->student?->student_number ?? 'N/A',
            'name' => 'Semester Payment Plan',
            'name_ar' => 'خطة دفع الفصل الدراسي',
            'total_amount' => (float) $plan->total_amount,
            'down_payment' => (float) $plan->down_payment,
            'paid_amount' => (float) $plan->paid_amount,
            'remaining_amount' => (float) $plan->remaining_amount,
            'installments_count' => $plan->number_of_installments,
            'installments' => $plan->installments->map(fn($i) => [
                'id' => 'INS-' . str_pad($i->id, 3, '0', STR_PAD_LEFT),
                'installment_id' => $i->id,
                'plan_id' => $plan->plan_number,
                'number' => $i->installment_number,
                'amount' => (float) $i->amount,
                'due_date' => $i->due_date->format('Y-m-d'),
                'status' => $i->status,
                'paid_amount' => (float) $i->paid_amount,
                'paid_date' => $i->paid_date?->format('Y-m-d'),
            ]),
            'status' => $plan->status,
            'created_at' => $plan->created_at->format('Y-m-d'),
            'start_date' => $plan->start_date->format('Y-m-d'),
            'end_date' => $plan->end_date?->format('Y-m-d'),
            'notes' => $plan->notes,
            'progress_percentage' => $plan->progress_percentage,
        ];
    }

    /**
     * Get current student's payment plans
     */
    public function myPaymentPlans(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([]);
        }

        $plans = PaymentPlan::with(['student', 'installments', 'semester'])
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($plan) => $this->formatPlan($plan));

        return response()->json($plans);
    }

    /**
     * Get a specific payment plan
     */
    public function show(PaymentPlan $paymentPlan): JsonResponse
    {
        $paymentPlan->load(['student', 'installments', 'semester']);

        return response()->json($this->formatPlan($paymentPlan));
    }

    /**
     * Create a new payment plan
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'total_amount' => 'required|numeric|min:0',
            'down_payment' => 'nullable|numeric|min:0',
            'number_of_installments' => 'required|integer|min:1|max:12',
            'frequency' => 'nullable|in:WEEKLY,BI_WEEKLY,MONTHLY,CUSTOM',
            'start_date' => 'required|date',
            'late_fee_percentage' => 'nullable|numeric|min:0|max:100',
            'grace_period_days' => 'nullable|integer|min:0',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['frequency'] = $validated['frequency'] ?? 'MONTHLY';
        $validated['status'] = PaymentPlan::STATUS_DRAFT;

        $plan = PaymentPlan::create($validated);
        $plan->generateInstallments();
        $plan->activate();

        $plan->load(['student', 'installments', 'semester']);
        return response()->json($this->formatPlan($plan), 201);
    }

    /**
     * Update a payment plan
     */
    public function update(Request $request, PaymentPlan $paymentPlan): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:DRAFT,ACTIVE,COMPLETED,DEFAULTED,CANCELLED',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
        ]);

        $paymentPlan->update($validated);

        return response()->json($paymentPlan->load('installments'));
    }

    /**
     * Pay an installment
     */
    public function payInstallment(Request $request, PaymentPlanInstallment $installment): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
        ]);

        // Record payment (simplified - in real scenario, would create Payment record)
        $installment->increment('paid_amount', $validated['amount']);

        if ($installment->paid_amount >= $installment->amount) {
            $installment->update([
                'status' => 'PAID',
                'paid_date' => now(),
            ]);
        } else {
            $installment->update(['status' => 'PARTIALLY_PAID']);
        }

        // Update plan
        $installment->paymentPlan->recordPayment($validated['amount']);

        return response()->json($installment);
    }

    /**
     * Get payment plan statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_plans' => PaymentPlan::count(),
            'active_plans' => PaymentPlan::active()->count(),
            'total_amount' => (float) PaymentPlan::sum('total_amount'),
            'collected_amount' => (float) PaymentPlan::sum('paid_amount'),
            'pending_amount' => (float) PaymentPlan::sum('remaining_amount'),
            'overdue_count' => PaymentPlanInstallment::overdue()->count(),
            'overdue_amount' => (float) PaymentPlanInstallment::overdue()->sum('amount'),
        ];

        return response()->json($stats);
    }
}
