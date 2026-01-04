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
        // Add missing fields to student_scholarships table
        Schema::table('student_scholarships', function (Blueprint $table) {
            if (!Schema::hasColumn('student_scholarships', 'application_date')) {
                $table->date('application_date')->nullable()->after('scholarship_id');
            }
            if (!Schema::hasColumn('student_scholarships', 'application_reason')) {
                $table->text('application_reason')->nullable()->after('application_date');
            }
            if (!Schema::hasColumn('student_scholarships', 'documents')) {
                $table->json('documents')->nullable()->after('application_reason');
            }
            if (!Schema::hasColumn('student_scholarships', 'notes')) {
                $table->text('notes')->nullable()->after('approval_notes');
            }
            if (!Schema::hasColumn('student_scholarships', 'last_disbursement_date')) {
                $table->date('last_disbursement_date')->nullable()->after('disbursed_amount');
            }
        });

        // Add missing fields to payment_plan_installments table
        Schema::table('payment_plan_installments', function (Blueprint $table) {
            if (!Schema::hasColumn('payment_plan_installments', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('paid_date');
            }
            if (!Schema::hasColumn('payment_plan_installments', 'payment_reference')) {
                $table->string('payment_reference')->nullable()->after('payment_method');
            }
        });

        // Create payments table if not exists
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained()->cascadeOnDelete();
                $table->foreignId('financial_record_id')->nullable()->constrained()->nullOnDelete();
                $table->decimal('amount', 10, 2);
                $table->string('payment_method')->default('CARD');
                $table->string('status')->default('PENDING'); // PENDING, COMPLETED, FAILED, REFUNDED
                $table->string('stripe_payment_intent_id')->nullable();
                $table->string('stripe_charge_id')->nullable();
                $table->string('description')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();

                $table->index('student_id');
                $table->index('status');
                $table->index('stripe_payment_intent_id');
            });
        }

        // Create financial_transactions table if not exists
        if (!Schema::hasTable('financial_transactions')) {
            Schema::create('financial_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained()->cascadeOnDelete();
                $table->string('type'); // PAYMENT, CHARGE, REFUND, ADJUSTMENT, SCHOLARSHIP
                $table->decimal('amount', 10, 2);
                $table->string('description')->nullable();
                $table->string('reference')->nullable();
                $table->decimal('balance_after', 10, 2)->nullable();
                $table->timestamps();

                $table->index('student_id');
                $table->index('type');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_scholarships', function (Blueprint $table) {
            $table->dropColumn(['application_date', 'application_reason', 'documents', 'notes', 'last_disbursement_date']);
        });

        Schema::table('payment_plan_installments', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_reference']);
        });

        Schema::dropIfExists('payments');
        Schema::dropIfExists('financial_transactions');
    }
};
