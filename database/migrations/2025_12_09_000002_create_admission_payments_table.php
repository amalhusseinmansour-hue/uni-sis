<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admission_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_application_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id')->unique(); // رقم المعاملة
            $table->decimal('amount', 10, 2); // المبلغ
            $table->string('currency', 3)->default('USD'); // العملة
            $table->enum('payment_method', ['BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'ONLINE'])->default('ONLINE'); // طريقة الدفع
            $table->enum('status', ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])->default('PENDING'); // حالة الدفع
            $table->string('bank_name')->nullable(); // اسم البنك
            $table->string('receipt_number')->nullable(); // رقم الإيصال
            $table->string('receipt_path')->nullable(); // مسار صورة الإيصال
            $table->timestamp('paid_at')->nullable(); // تاريخ الدفع
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null'); // من قام بالتحقق
            $table->timestamp('verified_at')->nullable(); // تاريخ التحقق
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admission_payments');
    }
};
