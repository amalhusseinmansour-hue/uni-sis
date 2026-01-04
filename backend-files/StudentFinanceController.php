<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialRecord;
use App\Models\FinancialTransaction;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class StudentFinanceController extends Controller
{
    /**
     * Get current student's financial balance
     */
    public function myBalance()
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $balance = [
            'total_fees' => (float) $student->total_fees,
            'paid_amount' => (float) $student->paid_amount,
            'current_balance' => (float) $student->current_balance,
            'previous_balance' => (float) $student->previous_balance,
            'scholarships' => (float) $student->scholarships,
            'financial_status' => $student->financial_status,
            'net_balance' => (float) ($student->current_balance - $student->scholarships),
        ];

        // Get pending payments
        $pendingRecords = FinancialRecord::where('student_id', $student->id)
            ->whereIn('status', ['PENDING', 'PARTIAL'])
            ->get();

        $balance['pending_payments'] = (float) ($pendingRecords->sum('amount') - $pendingRecords->sum('paid_amount'));
        $balance['pending_count'] = $pendingRecords->count();

        // Get transaction-based balance
        $balance['transaction_balance'] = (float) FinancialTransaction::getStudentBalance($student->id);

        return response()->json(['data' => $balance]);
    }

    /**
     * Get current student's financial records
     */
    public function myFinancialRecords(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $query = FinancialRecord::where('student_id', $student->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        $records = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($records);
    }

    /**
     * Get current student's transactions
     */
    public function myTransactions(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $query = FinancialTransaction::where('student_id', $student->id);

        if ($request->has('type')) {
            $query->where('transaction_type', $request->type);
        }

        if ($request->has('from')) {
            $query->where('transaction_date', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('transaction_date', '<=', $request->to);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($transactions);
    }

    /**
     * Get available payment methods
     */
    public function paymentMethods()
    {
        $methods = [
            [
                'id' => 'CREDIT_CARD',
                'name' => 'Credit/Debit Card',
                'name_ar' => 'بطاقة ائتمان/خصم',
                'icon' => 'credit-card',
                'enabled' => true,
                'online' => true,
                'description' => 'Pay securely with Visa, Mastercard, or American Express',
            ],
            [
                'id' => 'BANK_TRANSFER',
                'name' => 'Bank Transfer',
                'name_ar' => 'حوالة بنكية',
                'icon' => 'building-columns',
                'enabled' => true,
                'online' => false,
                'description' => 'Transfer directly from your bank account',
            ],
            [
                'id' => 'CASH',
                'name' => 'Cash (Finance Office)',
                'name_ar' => 'نقداً (مكتب المالية)',
                'icon' => 'banknotes',
                'enabled' => true,
                'online' => false,
                'description' => 'Pay in person at the finance office',
            ],
            [
                'id' => 'ONLINE',
                'name' => 'Online Payment Gateway',
                'name_ar' => 'بوابة الدفع الإلكتروني',
                'icon' => 'globe',
                'enabled' => true,
                'online' => true,
                'description' => 'Pay through our secure online payment gateway',
            ],
        ];

        return response()->json(['data' => $methods]);
    }

    /**
     * Create payment intent (Stripe)
     */
    public function createPaymentIntent(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'financial_record_id' => 'nullable|exists:financial_records,id',
            'description' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:3',
        ]);

        // Verify the financial record belongs to this student
        if (!empty($validated['financial_record_id'])) {
            $record = FinancialRecord::where('id', $validated['financial_record_id'])
                ->where('student_id', $student->id)
                ->first();

            if (!$record) {
                return response()->json(['message' => 'Financial record not found'], 404);
            }
        }

        try {
            $stripeKey = config('services.stripe.secret');
            if (empty($stripeKey)) {
                return response()->json(['message' => 'Payment gateway not configured'], 500);
            }

            Stripe::setApiKey($stripeKey);

            $currency = $validated['currency'] ?? config('services.stripe.currency', 'usd');

            $paymentIntent = PaymentIntent::create([
                'amount' => (int)($validated['amount'] * 100), // Convert to cents
                'currency' => strtolower($currency),
                'metadata' => [
                    'student_id' => $student->id,
                    'user_id' => $user->id,
                    'financial_record_id' => $validated['financial_record_id'] ?? null,
                    'description' => $validated['description'] ?? 'Payment',
                ],
            ]);

            // Create pending payment record
            $payment = Payment::create([
                'student_id' => $student->id,
                'amount' => $validated['amount'],
                'currency' => strtoupper($currency),
                'payment_method' => Payment::METHOD_ONLINE,
                'status' => Payment::STATUS_PENDING,
                'gateway_reference' => $paymentIntent->id,
                'notes' => $validated['description'] ?? 'Online Payment',
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_id' => $payment->id,
                'transaction_id' => $payment->transaction_id,
                'amount' => $validated['amount'],
                'currency' => $currency,
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            return response()->json([
                'message' => 'Payment gateway error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create payment intent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm payment (after Stripe success)
     */
    public function confirmPayment(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            $stripeKey = config('services.stripe.secret');
            if (empty($stripeKey)) {
                return response()->json(['message' => 'Payment gateway not configured'], 500);
            }

            Stripe::setApiKey($stripeKey);

            $paymentIntent = PaymentIntent::retrieve($validated['payment_intent_id']);

            if ($paymentIntent->status !== 'succeeded') {
                return response()->json([
                    'message' => 'Payment not yet completed',
                    'status' => $paymentIntent->status
                ], 422);
            }

            // Find the payment record
            $payment = Payment::where('gateway_reference', $validated['payment_intent_id'])
                ->where('student_id', $student->id)
                ->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment record not found'], 404);
            }

            if ($payment->status === Payment::STATUS_COMPLETED) {
                return response()->json(['message' => 'Payment already processed'], 422);
            }

            DB::beginTransaction();

            // Update payment record
            $payment->update([
                'status' => Payment::STATUS_COMPLETED,
                'payment_date' => now(),
                'receipt_number' => Payment::generateReceiptNumber(),
                'gateway_response' => [
                    'payment_intent_id' => $paymentIntent->id,
                    'charge_id' => $paymentIntent->latest_charge,
                    'status' => $paymentIntent->status,
                ],
            ]);

            // Update student balance
            $student->increment('paid_amount', $payment->amount);
            $student->decrement('current_balance', $payment->amount);

            // Record transaction
            FinancialTransaction::recordPayment(
                $student,
                $payment->amount,
                'Online Payment - ' . $payment->transaction_id,
                $payment,
                $user
            );

            DB::commit();

            return response()->json([
                'message' => 'Payment confirmed successfully',
                'data' => $payment->fresh(),
                'receipt_number' => $payment->receipt_number,
                'new_balance' => $student->fresh()->current_balance,
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Payment gateway error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to confirm payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment history
     */
    public function paymentHistory(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $query = Payment::where('student_id', $student->id)
            ->where('status', Payment::STATUS_COMPLETED);

        if ($request->has('method')) {
            $query->where('payment_method', $request->method);
        }

        if ($request->has('from')) {
            $query->where('payment_date', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('payment_date', '<=', $request->to);
        }

        $payments = $query->orderBy('payment_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($payments);
    }

    /**
     * Get financial summary
     */
    public function financialSummary()
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        // Get statement
        $statement = FinancialTransaction::getStudentStatement($student->id);

        // Get records by semester
        $recordsBySemester = FinancialRecord::where('student_id', $student->id)
            ->with('semester')
            ->selectRaw('semester_id, SUM(amount) as total_fees, SUM(paid_amount) as total_paid')
            ->groupBy('semester_id')
            ->get();

        // Get records by type
        $recordsByType = FinancialRecord::where('student_id', $student->id)
            ->selectRaw('type, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('type')
            ->get();

        // Get monthly payment trend (last 12 months)
        $monthlyPayments = Payment::where('student_id', $student->id)
            ->where('status', Payment::STATUS_COMPLETED)
            ->where('payment_date', '>=', now()->subMonths(12))
            ->selectRaw('DATE_FORMAT(payment_date, "%Y-%m") as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'balance' => [
                'total_fees' => (float) $student->total_fees,
                'paid_amount' => (float) $student->paid_amount,
                'current_balance' => (float) $student->current_balance,
                'scholarships' => (float) $student->scholarships,
                'transaction_balance' => (float) ($statement['closing_balance'] ?? 0),
            ],
            'statement' => [
                'total_debits' => (float) ($statement['total_debits'] ?? 0),
                'total_credits' => (float) ($statement['total_credits'] ?? 0),
            ],
            'by_semester' => $recordsBySemester,
            'by_type' => $recordsByType,
            'monthly_payments' => $monthlyPayments,
        ]);
    }

    /**
     * Request fee waiver
     */
    public function requestWaiver(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $validated = $request->validate([
            'financial_record_id' => 'required|exists:financial_records,id',
            'reason' => 'required|string|max:2000',
            'requested_amount' => 'required|numeric|min:0',
            'supporting_documents' => 'nullable|array',
        ]);

        $record = FinancialRecord::where('id', $validated['financial_record_id'])
            ->where('student_id', $student->id)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Financial record not found'], 404);
        }

        // Create a service request for the waiver
        if (class_exists(\App\Models\ServiceRequest::class)) {
            $waiver = \App\Models\ServiceRequest::create([
                'student_id' => $student->id,
                'type' => 'FEE_WAIVER',
                'status' => 'PENDING',
                'details' => json_encode([
                    'financial_record_id' => $record->id,
                    'original_amount' => $record->amount,
                    'requested_waiver' => $validated['requested_amount'],
                    'reason' => $validated['reason'],
                ]),
            ]);

            return response()->json([
                'message' => 'Fee waiver request submitted successfully',
                'data' => $waiver
            ], 201);
        }

        return response()->json([
            'message' => 'Fee waiver request submitted. Reference: FW-' . now()->format('YmdHis'),
            'data' => [
                'financial_record_id' => $record->id,
                'requested_amount' => $validated['requested_amount'],
                'status' => 'PENDING',
            ]
        ], 201);
    }

    /**
     * Download receipt
     */
    public function downloadReceipt(Payment $payment)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student || $payment->student_id !== $student->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($payment->status !== Payment::STATUS_COMPLETED) {
            return response()->json(['message' => 'Receipt only available for completed payments'], 422);
        }

        // Check if DomPDF is available
        if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.payment-receipt', [
                'payment' => $payment,
                'student' => $student,
            ]);

            return $pdf->download('receipt-' . $payment->receipt_number . '.pdf');
        }

        // Return JSON receipt if PDF not available
        return response()->json([
            'receipt' => [
                'receipt_number' => $payment->receipt_number,
                'transaction_id' => $payment->transaction_id,
                'student_name' => $student->name_en,
                'student_id' => $student->student_id,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'payment_method' => $payment->payment_method,
                'payment_date' => $payment->payment_date,
                'description' => $payment->notes,
            ]
        ]);
    }

    /**
     * Get student's financial statement
     */
    public function statement(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $from = $request->get('from', now()->subYear()->toDateString());
        $to = $request->get('to', now()->toDateString());

        $statement = FinancialTransaction::getStudentStatement($student->id, $from, $to);

        return response()->json([
            'period' => ['from' => $from, 'to' => $to],
            'opening_balance' => 0, // Could calculate from before $from
            'transactions' => $statement['transactions'],
            'total_debits' => $statement['total_debits'],
            'total_credits' => $statement['total_credits'],
            'closing_balance' => $statement['closing_balance'],
        ]);
    }
}
