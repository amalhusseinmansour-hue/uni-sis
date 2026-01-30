<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            // Add semester_id foreign key
            $table->foreignId('semester_id')->nullable()->after('enrollment_id')->constrained()->onDelete('cascade');

            // Add additional fields for API compatibility
            $table->string('status')->default('PENDING')->after('points'); // PENDING, SUBMITTED, APPROVED, CONTESTED
            $table->text('remarks')->nullable()->after('status');

            // Rename existing columns to match controller expectations (using aliases in model)
            // Keep the original columns but the model will map them
        });
    }

    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropForeign(['semester_id']);
            $table->dropColumn(['semester_id', 'status', 'remarks']);
        });
    }
};
