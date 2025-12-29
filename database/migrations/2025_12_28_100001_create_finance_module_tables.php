<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fee Structures - Define fees per program/semester
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->nullable()->constrained()->onDelete('set null');
            $table->string('fee_type'); // TUITION, REGISTRATION, LAB, LIBRARY, SPORTS, INSURANCE, etc.
            $table->string('name_en');
            $table->string('name_ar');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->boolean('is_mandatory')->default(true);
            $table->boolean('is_recurring')->default(true); // Per semester or one-time
            $table->enum('applies_to', ['ALL', 'NEW_STUDENTS', 'CONTINUING', 'SPECIFIC_LEVELS'])->default('ALL');
            $table->json('applicable_levels')->nullable(); // [1, 2, 3, 4] for specific levels
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['program_id', 'semester_id', 'is_active']);
            $table->index('fee_type');
        });

        // Scholarships - Track scholarship types and allocations
        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->enum('type', ['MERIT', 'NEED_BASED', 'ATHLETIC', 'GOVERNMENT', 'CORPORATE', 'FULL', 'PARTIAL']);
            $table->enum('coverage_type', ['PERCENTAGE', 'FIXED_AMOUNT']);
            $table->decimal('coverage_value', 12, 2); // Percentage (0-100) or fixed amount
            $table->decimal('max_amount', 12, 2)->nullable(); // Max amount if percentage
            $table->string('currency', 3)->default('USD');
            $table->decimal('min_gpa', 3, 2)->nullable();
            $table->integer('max_recipients')->nullable();
            $table->integer('current_recipients')->default(0);
            $table->date('application_start')->nullable();
            $table->date('application_end')->nullable();
            $table->boolean('is_renewable')->default(true);
            $table->integer('max_semesters')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('eligibility_criteria')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->timestamps();
        });

        // Student Scholarships - Link students to scholarships
        Schema::create('student_scholarships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('scholarship_id')->constrained()->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'CANCELLED'])->default('PENDING');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('awarded_amount', 12, 2)->nullable();
            $table->decimal('disbursed_amount', 12, 2)->default(0);
            $table->integer('semesters_used')->default(0);
            $table->text('application_notes')->nullable();
            $table->text('approval_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'scholarship_id']);
            $table->index(['status', 'start_date']);
        });

        // Invoices - Student billing
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->nullable()->constrained()->onDelete('set null');
            $table->string('invoice_number')->unique();
            $table->enum('status', ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED'])->default('DRAFT');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('scholarship_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('balance_due', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->date('issue_date');
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('pdf_path')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'semester_id']);
            $table->index(['status', 'due_date']);
            $table->index('invoice_number');
        });

        // Invoice Items - Line items on invoices
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_structure_id')->nullable()->constrained()->onDelete('set null');
            $table->string('description');
            $table->string('fee_type')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->timestamps();
        });

        // Payments - Track all payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->string('transaction_id')->unique();
            $table->string('reference_number')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('payment_method', ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE', 'ONLINE', 'MOBILE_PAYMENT', 'SCHOLARSHIP', 'SPONSOR']);
            $table->enum('status', ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'])->default('PENDING');
            $table->string('bank_name')->nullable();
            $table->string('cheque_number')->nullable();
            $table->date('cheque_date')->nullable();
            $table->string('card_last_four')->nullable();
            $table->string('gateway_reference')->nullable();
            $table->json('gateway_response')->nullable();
            $table->string('receipt_number')->nullable();
            $table->string('receipt_path')->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index(['payment_date', 'status']);
            $table->index('transaction_id');
        });

        // Payment Plans - Installment plans
        Schema::create('payment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('semester_id')->nullable()->constrained()->onDelete('set null');
            $table->string('plan_number')->unique();
            $table->decimal('total_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('remaining_amount', 12, 2);
            $table->integer('number_of_installments');
            $table->enum('frequency', ['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'CUSTOM'])->default('MONTHLY');
            $table->enum('status', ['DRAFT', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED'])->default('DRAFT');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('down_payment', 12, 2)->default(0);
            $table->decimal('late_fee_percentage', 5, 2)->default(0);
            $table->integer('grace_period_days')->default(0);
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('terms')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
        });

        // Payment Plan Installments
        Schema::create('payment_plan_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_plan_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('installment_number');
            $table->decimal('amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('late_fee', 12, 2)->default(0);
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->enum('status', ['PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'WAIVED'])->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['payment_plan_id', 'status']);
            $table->index('due_date');
        });

        // Refunds
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->string('refund_number')->unique();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('reason', ['WITHDRAWAL', 'COURSE_DROP', 'OVERPAYMENT', 'SCHOLARSHIP_ADJUSTMENT', 'ERROR_CORRECTION', 'OTHER']);
            $table->text('reason_details')->nullable();
            $table->enum('method', ['ORIGINAL_METHOD', 'BANK_TRANSFER', 'CHEQUE', 'CASH', 'CREDIT_TO_ACCOUNT']);
            $table->enum('status', ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED'])->default('PENDING');
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('cheque_number')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->text('approval_notes')->nullable();
            $table->text('processing_notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
        });

        // Fines and Penalties
        Schema::create('fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->string('fine_type'); // LATE_PAYMENT, LIBRARY, DAMAGE, DISCIPLINARY, etc.
            $table->string('description');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['PENDING', 'PAID', 'WAIVED', 'APPEALED'])->default('PENDING');
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->date('paid_date')->nullable();
            $table->foreignId('issued_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('waived_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('waived_at')->nullable();
            $table->text('waiver_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index('fine_type');
        });

        // Sponsor/Third-party Payers
        Schema::create('sponsors', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->enum('type', ['GOVERNMENT', 'CORPORATE', 'EMBASSY', 'FAMILY', 'NGO', 'OTHER']);
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('tax_id')->nullable();
            $table->decimal('credit_limit', 12, 2)->nullable();
            $table->decimal('current_balance', 12, 2)->default(0);
            $table->enum('payment_terms', ['IMMEDIATE', 'NET_15', 'NET_30', 'NET_60', 'NET_90'])->default('NET_30');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Student Sponsors - Link students to sponsors
        Schema::create('student_sponsors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('sponsor_id')->constrained()->onDelete('cascade');
            $table->enum('coverage_type', ['FULL', 'PARTIAL', 'SPECIFIC_FEES']);
            $table->decimal('coverage_percentage', 5, 2)->nullable();
            $table->decimal('max_amount', 12, 2)->nullable();
            $table->json('covered_fees')->nullable(); // ['TUITION', 'REGISTRATION']
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['ACTIVE', 'SUSPENDED', 'ENDED'])->default('ACTIVE');
            $table->string('sponsor_student_id')->nullable(); // Sponsor's reference for the student
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'sponsor_id', 'status']);
        });

        // Financial Transactions Log (Audit)
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->enum('transaction_type', ['CHARGE', 'PAYMENT', 'REFUND', 'ADJUSTMENT', 'SCHOLARSHIP', 'FINE', 'WAIVER', 'TRANSFER']);
            $table->string('reference_type')->nullable(); // Invoice, Payment, Refund, etc.
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->decimal('debit', 12, 2)->default(0);
            $table->decimal('credit', 12, 2)->default(0);
            $table->decimal('balance_after', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('description');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('transaction_date');
            $table->timestamps();

            $table->index(['student_id', 'transaction_date']);
            $table->index(['reference_type', 'reference_id']);
        });

        // Update financial_records table with new fields
        Schema::table('financial_records', function (Blueprint $table) {
            $table->foreignId('semester_id')->nullable()->after('student_id')->constrained()->onDelete('set null');
            $table->foreignId('invoice_id')->nullable()->after('semester_id')->constrained()->onDelete('set null');
            $table->string('fee_category')->nullable()->after('description');
            $table->date('due_date')->nullable()->after('date');
            $table->date('payment_date')->nullable()->after('due_date');
            $table->enum('payment_method', ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE', 'ONLINE', 'MOBILE_PAYMENT'])->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove added columns from financial_records
        Schema::table('financial_records', function (Blueprint $table) {
            $table->dropForeign(['semester_id']);
            $table->dropForeign(['invoice_id']);
            $table->dropColumn(['semester_id', 'invoice_id', 'fee_category', 'due_date', 'payment_date', 'payment_method']);
        });

        Schema::dropIfExists('financial_transactions');
        Schema::dropIfExists('student_sponsors');
        Schema::dropIfExists('sponsors');
        Schema::dropIfExists('fines');
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payment_plan_installments');
        Schema::dropIfExists('payment_plans');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('student_scholarships');
        Schema::dropIfExists('scholarships');
        Schema::dropIfExists('fee_structures');
    }
};
