<?php

namespace App\Services;

use App\Models\FeeStructure;
use App\Models\Fine;
use App\Models\FinancialTransaction;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\PaymentPlan;
use App\Models\Refund;
use App\Models\Scholarship;
use App\Models\Semester;
use App\Models\Student;
use App\Models\StudentScholarship;
use App\Models\StudentSponsor;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FinanceService
{
    /**
     * Generate invoice for a student for a specific semester
     */
    public function generateInvoice(Student $student, Semester $semester, ?User $createdBy = null): Invoice
    {
        return DB::transaction(function () use ($student, $semester, $createdBy) {
            // Check if invoice already exists
            $existingInvoice = Invoice::where('student_id', $student->id)
                ->where('semester_id', $semester->id)
                ->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_REFUNDED])
                ->first();

            if ($existingInvoice) {
                return $existingInvoice;
            }

            // Create invoice
            $invoice = Invoice::create([
                'student_id' => $student->id,
                'semester_id' => $semester->id,
                'status' => Invoice::STATUS_DRAFT,
                'issue_date' => now(),
                'due_date' => now()->addDays(30),
                'currency' => 'USD',
                'created_by' => $createdBy?->id,
            ]);

            // Get applicable fees
            $fees = $this->getApplicableFees($student, $semester);

            foreach ($fees as $fee) {
                $invoice->items()->create([
                    'fee_structure_id' => $fee->id,
                    'description' => $fee->name_en,
                    'fee_type' => $fee->fee_type,
                    'quantity' => 1,
                    'unit_price' => $fee->amount,
                    'discount' => 0,
                    'total' => $fee->amount,
                ]);
            }

            // Apply scholarships
            $scholarshipAmount = $this->calculateScholarshipDiscount($student, $invoice->subtotal);
            $invoice->scholarship_amount = $scholarshipAmount;

            // Apply sponsor coverage
            $sponsorDiscount = $this->calculateSponsorCoverage($student, $invoice->subtotal - $scholarshipAmount);
            $invoice->discount_amount = $sponsorDiscount;

            // Recalculate totals
            $invoice->calculateTotals();

            // Record financial transaction
            FinancialTransaction::recordCharge(
                $student,
                $invoice->total_amount,
                "Invoice #{$invoice->invoice_number} for {$semester->name}",
                $invoice,
                $createdBy
            );

            return $invoice;
        });
    }

    /**
     * Get applicable fees for a student in a semester
     */
    public function getApplicableFees(Student $student, Semester $semester): Collection
    {
        return FeeStructure::active()
            ->effective()
            ->forProgram($student->program_id)
            ->where(function ($query) use ($semester) {
                $query->where('semester_id', $semester->id)
                    ->orWhereNull('semester_id');
            })
            ->get()
            ->filter(fn($fee) => $fee->appliesToStudent($student));
    }

    /**
     * Calculate scholarship discount for a student
     */
    public function calculateScholarshipDiscount(Student $student, float $totalFees): float
    {
        $activeScholarships = StudentScholarship::where('student_id', $student->id)
            ->where('status', StudentScholarship::STATUS_ACTIVE)
            ->with('scholarship')
            ->get();

        $totalDiscount = 0;

        foreach ($activeScholarships as $studentScholarship) {
            $scholarship = $studentScholarship->scholarship;
            $discount = $scholarship->calculateAmount($totalFees - $totalDiscount);
            $totalDiscount += $discount;
        }

        return min($totalDiscount, $totalFees);
    }

    /**
     * Calculate sponsor coverage for a student
     */
    public function calculateSponsorCoverage(Student $student, float $remainingAmount): float
    {
        $activeSponsors = StudentSponsor::where('student_id', $student->id)
            ->where('status', StudentSponsor::STATUS_ACTIVE)
            ->get();

        $totalCoverage = 0;

        foreach ($activeSponsors as $studentSponsor) {
            $coverage = $studentSponsor->calculateCoverage($remainingAmount - $totalCoverage);
            $totalCoverage += $coverage;
        }

        return min($totalCoverage, $remainingAmount);
    }

    /**
     * Record a payment
     */
    public function recordPayment(array $data, ?User $receivedBy = null): Payment
    {
        return DB::transaction(function () use ($data, $receivedBy) {
            $payment = Payment::create([
                'student_id' => $data['student_id'],
                'invoice_id' => $data['invoice_id'] ?? null,
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'USD',
                'payment_method' => $data['payment_method'],
                'status' => Payment::STATUS_PENDING,
                'bank_name' => $data['bank_name'] ?? null,
                'cheque_number' => $data['cheque_number'] ?? null,
                'cheque_date' => $data['cheque_date'] ?? null,
                'reference_number' => $data['reference_number'] ?? null,
                'notes' => $data['notes'] ?? null,
                'received_by' => $receivedBy?->id,
            ]);

            return $payment;
        });
    }

    /**
     * Complete a payment and update balances
     */
    public function completePayment(Payment $payment, ?User $verifier = null): Payment
    {
        return DB::transaction(function () use ($payment, $verifier) {
            $payment->markAsCompleted($verifier);

            // Record transaction
            FinancialTransaction::recordPayment(
                $payment->student,
                $payment->amount,
                "Payment {$payment->transaction_id} via {$payment->payment_method}",
                $payment,
                $verifier
            );

            return $payment->fresh();
        });
    }

    /**
     * Create a payment plan for a student
     */
    public function createPaymentPlan(array $data, ?User $approver = null): PaymentPlan
    {
        return DB::transaction(function () use ($data, $approver) {
            $plan = PaymentPlan::create([
                'student_id' => $data['student_id'],
                'invoice_id' => $data['invoice_id'] ?? null,
                'semester_id' => $data['semester_id'] ?? null,
                'total_amount' => $data['total_amount'],
                'number_of_installments' => $data['number_of_installments'],
                'frequency' => $data['frequency'] ?? 'MONTHLY',
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'down_payment' => $data['down_payment'] ?? 0,
                'late_fee_percentage' => $data['late_fee_percentage'] ?? 0,
                'grace_period_days' => $data['grace_period_days'] ?? 0,
                'terms' => $data['terms'] ?? null,
                'notes' => $data['notes'] ?? null,
                'approved_by' => $approver?->id,
                'approved_at' => $approver ? now() : null,
                'status' => $approver ? PaymentPlan::STATUS_ACTIVE : PaymentPlan::STATUS_DRAFT,
            ]);

            // Generate installments
            $plan->generateInstallments();

            return $plan;
        });
    }

    /**
     * Process refund request
     */
    public function requestRefund(array $data, ?User $requestedBy = null): Refund
    {
        return Refund::create([
            'student_id' => $data['student_id'],
            'payment_id' => $data['payment_id'] ?? null,
            'invoice_id' => $data['invoice_id'] ?? null,
            'amount' => $data['amount'],
            'currency' => $data['currency'] ?? 'USD',
            'reason' => $data['reason'],
            'reason_details' => $data['reason_details'] ?? null,
            'method' => $data['method'] ?? Refund::METHOD_ORIGINAL,
            'status' => Refund::STATUS_PENDING,
            'requested_by' => $requestedBy?->id,
            'requested_at' => now(),
        ]);
    }

    /**
     * Complete a refund
     */
    public function completeRefund(Refund $refund, User $processor): Refund
    {
        return DB::transaction(function () use ($refund, $processor) {
            $refund->complete($processor);

            // Record transaction
            FinancialTransaction::recordRefund(
                $refund->student,
                $refund->amount,
                "Refund {$refund->refund_number}: {$refund->reason}",
                $refund,
                $processor
            );

            return $refund->fresh();
        });
    }

    /**
     * Issue a fine to a student
     */
    public function issueFine(array $data, User $issuedBy): Fine
    {
        return DB::transaction(function () use ($data, $issuedBy) {
            $fine = Fine::create([
                'student_id' => $data['student_id'],
                'fine_type' => $data['fine_type'],
                'description' => $data['description'],
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'USD',
                'status' => Fine::STATUS_PENDING,
                'issue_date' => now(),
                'due_date' => $data['due_date'] ?? now()->addDays(14),
                'issued_by' => $issuedBy->id,
                'notes' => $data['notes'] ?? null,
            ]);

            // Record transaction
            $student = Student::find($data['student_id']);
            FinancialTransaction::recordFine(
                $student,
                $fine->amount,
                "Fine: {$fine->description}",
                $fine,
                $issuedBy
            );

            return $fine;
        });
    }

    /**
     * Waive a fine
     */
    public function waiveFine(Fine $fine, User $waivedBy, string $reason): Fine
    {
        return DB::transaction(function () use ($fine, $waivedBy, $reason) {
            $fine->waive($waivedBy, $reason);

            // Record waiver transaction
            FinancialTransaction::recordWaiver(
                $fine->student,
                $fine->amount,
                "Fine waiver: {$reason}",
                $fine,
                $waivedBy
            );

            return $fine->fresh();
        });
    }

    /**
     * Award scholarship to a student
     */
    public function awardScholarship(Student $student, Scholarship $scholarship, array $data, ?User $approver = null): StudentScholarship
    {
        return DB::transaction(function () use ($student, $scholarship, $data, $approver) {
            $awardedAmount = $data['awarded_amount'] ?? $scholarship->calculateAmount($student->total_fees ?? 0);

            $studentScholarship = StudentScholarship::create([
                'student_id' => $student->id,
                'scholarship_id' => $scholarship->id,
                'status' => $approver ? StudentScholarship::STATUS_APPROVED : StudentScholarship::STATUS_PENDING,
                'start_date' => $data['start_date'] ?? now(),
                'end_date' => $data['end_date'] ?? null,
                'awarded_amount' => $awardedAmount,
                'application_notes' => $data['application_notes'] ?? null,
                'approved_by' => $approver?->id,
                'approved_at' => $approver ? now() : null,
                'approval_notes' => $data['approval_notes'] ?? null,
            ]);

            if ($approver) {
                $scholarship->increment('current_recipients');
            }

            return $studentScholarship;
        });
    }

    /**
     * Get student account summary
     */
    public function getStudentAccountSummary(Student $student): array
    {
        $invoices = Invoice::forStudent($student->id)->get();
        $payments = Payment::forStudent($student->id)->completed()->get();
        $refunds = Refund::where('student_id', $student->id)->completed()->get();
        $fines = Fine::where('student_id', $student->id)->pending()->get();
        $activeScholarships = StudentScholarship::where('student_id', $student->id)->active()->with('scholarship')->get();

        return [
            'student_id' => $student->id,
            'student_name' => $student->name_en,
            'total_charges' => $invoices->sum('total_amount'),
            'total_paid' => $payments->sum('amount'),
            'total_refunded' => $refunds->sum('amount'),
            'outstanding_balance' => FinancialTransaction::getStudentBalance($student->id),
            'pending_fines' => $fines->sum('amount'),
            'active_scholarships' => $activeScholarships->map(fn($ss) => [
                'name' => $ss->scholarship->name_en,
                'awarded_amount' => $ss->awarded_amount,
                'disbursed_amount' => $ss->disbursed_amount,
                'remaining' => $ss->remaining_amount,
            ]),
            'unpaid_invoices' => $invoices->where('balance_due', '>', 0)->count(),
            'financial_status' => $student->financial_status,
        ];
    }

    /**
     * Get finance statistics
     */
    public function getStatistics(?string $fromDate = null, ?string $toDate = null): array
    {
        $fromDate = $fromDate ?? now()->startOfMonth();
        $toDate = $toDate ?? now();

        return [
            'invoices' => [
                'total' => Invoice::count(),
                'draft' => Invoice::draft()->count(),
                'issued' => Invoice::issued()->count(),
                'paid' => Invoice::paid()->count(),
                'overdue' => Invoice::overdue()->count(),
                'total_amount' => Invoice::sum('total_amount'),
                'collected' => Invoice::sum('paid_amount'),
                'outstanding' => Invoice::unpaid()->sum('balance_due'),
            ],
            'payments' => [
                'total' => Payment::count(),
                'completed' => Payment::completed()->count(),
                'pending' => Payment::pending()->count(),
                'total_amount' => Payment::completed()->sum('amount'),
                'period_amount' => Payment::completed()
                    ->whereBetween('payment_date', [$fromDate, $toDate])
                    ->sum('amount'),
            ],
            'refunds' => [
                'total' => Refund::count(),
                'pending' => Refund::pending()->count(),
                'completed' => Refund::completed()->count(),
                'total_amount' => Refund::completed()->sum('amount'),
            ],
            'scholarships' => [
                'total_awarded' => StudentScholarship::active()->sum('awarded_amount'),
                'total_disbursed' => StudentScholarship::active()->sum('disbursed_amount'),
                'active_recipients' => StudentScholarship::active()->count(),
            ],
            'fines' => [
                'pending' => Fine::pending()->sum('amount'),
                'collected' => Fine::paid()->sum('amount'),
            ],
            'payment_plans' => [
                'active' => PaymentPlan::active()->count(),
                'total_amount' => PaymentPlan::active()->sum('total_amount'),
                'collected' => PaymentPlan::active()->sum('paid_amount'),
            ],
        ];
    }

    /**
     * Check and mark overdue invoices
     */
    public function processOverdueInvoices(): int
    {
        $count = 0;

        Invoice::whereIn('status', [Invoice::STATUS_ISSUED, Invoice::STATUS_PARTIALLY_PAID])
            ->where('due_date', '<', now())
            ->each(function ($invoice) use (&$count) {
                $invoice->markAsOverdue();
                $count++;
            });

        return $count;
    }

    /**
     * Check and mark overdue installments
     */
    public function processOverdueInstallments(): int
    {
        $count = 0;

        PaymentPlan::active()->each(function ($plan) use (&$count) {
            $plan->installments()
                ->where('status', 'PENDING')
                ->where('due_date', '<', now())
                ->each(function ($installment) use (&$count) {
                    $installment->checkOverdue();
                    $count++;
                });

            $plan->checkForDefault();
        });

        return $count;
    }

    /**
     * Generate bulk invoices for all active students
     */
    public function generateBulkInvoices(Semester $semester, ?User $createdBy = null): array
    {
        $results = ['success' => 0, 'skipped' => 0, 'errors' => []];

        Student::where('status', 'ACTIVE')
            ->chunk(100, function ($students) use ($semester, $createdBy, &$results) {
                foreach ($students as $student) {
                    try {
                        $existingInvoice = Invoice::where('student_id', $student->id)
                            ->where('semester_id', $semester->id)
                            ->whereNotIn('status', [Invoice::STATUS_CANCELLED])
                            ->exists();

                        if ($existingInvoice) {
                            $results['skipped']++;
                            continue;
                        }

                        $this->generateInvoice($student, $semester, $createdBy);
                        $results['success']++;
                    } catch (\Exception $e) {
                        $results['errors'][] = [
                            'student_id' => $student->id,
                            'error' => $e->getMessage(),
                        ];
                        Log::error("Failed to generate invoice for student {$student->id}: " . $e->getMessage());
                    }
                }
            });

        return $results;
    }
}
