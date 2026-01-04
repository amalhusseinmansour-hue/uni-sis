<?php

// ============================================
// NEW ROUTES TO ADD TO routes/api.php
// ============================================

use App\Http\Controllers\Api\PaymentPlanController;
use App\Http\Controllers\Api\ScholarshipController;
use App\Http\Controllers\Api\StudentFinanceController;

// Add these routes inside the auth:sanctum middleware group

// ============================================
// PAYMENT PLANS ROUTES
// ============================================

// Student Routes (self-service)
Route::middleware('role:STUDENT')->group(function () {
    Route::get('/my-payment-plans', [PaymentPlanController::class, 'myPaymentPlans']);
    Route::post('/payment-plans/apply', [PaymentPlanController::class, 'apply']);
});

// Finance/Admin Routes
Route::middleware('role:FINANCE,ADMIN')->group(function () {
    Route::apiResource('payment-plans', PaymentPlanController::class);
    Route::post('/payment-plans/{paymentPlan}/approve', [PaymentPlanController::class, 'approve']);
    Route::post('/payment-plans/{paymentPlan}/cancel', [PaymentPlanController::class, 'cancel']);
    Route::get('/payment-plans-statistics', [PaymentPlanController::class, 'statistics']);
    Route::get('/payment-plans-overdue', [PaymentPlanController::class, 'overdueInstallments']);
});

// Installment payment (Finance/Admin/Student who owns the plan)
Route::post('/installments/{installment}/pay', [PaymentPlanController::class, 'payInstallment'])
    ->middleware('role:FINANCE,ADMIN,STUDENT');

// ============================================
// SCHOLARSHIPS ROUTES
// ============================================

// Public/Student Routes
Route::get('/scholarships/available', [ScholarshipController::class, 'available']);
Route::get('/scholarships/types', [ScholarshipController::class, 'types']);

// Student Routes
Route::middleware('role:STUDENT')->group(function () {
    Route::get('/my-scholarships', [ScholarshipController::class, 'myScholarships']);
    Route::post('/scholarships/apply', [ScholarshipController::class, 'apply']);
});

// Finance/Admin Routes
Route::middleware('role:FINANCE,ADMIN')->group(function () {
    Route::apiResource('scholarships', ScholarshipController::class);
    Route::get('/scholarships-statistics', [ScholarshipController::class, 'statistics']);
    Route::get('/student-scholarships', [ScholarshipController::class, 'studentScholarships']);
    Route::post('/student-scholarships/{studentScholarship}/award', [ScholarshipController::class, 'award']);
    Route::post('/student-scholarships/{studentScholarship}/reject', [ScholarshipController::class, 'reject']);
    Route::post('/student-scholarships/{studentScholarship}/disburse', [ScholarshipController::class, 'disburse']);
    Route::post('/student-scholarships/{studentScholarship}/revoke', [ScholarshipController::class, 'revoke']);
});

// ============================================
// STUDENT FINANCIAL SELF-SERVICE ROUTES
// ============================================

Route::middleware('role:STUDENT')->group(function () {
    // Balance & Records
    Route::get('/my-balance', [StudentFinanceController::class, 'myBalance']);
    Route::get('/my-financial-records', [StudentFinanceController::class, 'myFinancialRecords']);
    Route::get('/my-transactions', [StudentFinanceController::class, 'myTransactions']);
    Route::get('/my-financial-summary', [StudentFinanceController::class, 'financialSummary']);

    // Payments
    Route::get('/payment-methods', [StudentFinanceController::class, 'paymentMethods']);
    Route::post('/payments/create-intent', [StudentFinanceController::class, 'createPaymentIntent']);
    Route::post('/payments/confirm', [StudentFinanceController::class, 'confirmPayment']);
    Route::get('/my-payment-history', [StudentFinanceController::class, 'paymentHistory']);

    // Receipts
    Route::get('/payments/{payment}/receipt', [StudentFinanceController::class, 'downloadReceipt']);

    // Fee Waiver
    Route::post('/request-fee-waiver', [StudentFinanceController::class, 'requestWaiver']);
});
