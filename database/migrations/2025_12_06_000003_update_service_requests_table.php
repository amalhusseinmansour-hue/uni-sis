<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            // Add additional fields for API compatibility
            $table->string('subject')->nullable()->after('request_type');
            $table->text('description')->nullable()->after('subject');
            $table->string('priority')->default('MEDIUM')->after('description'); // LOW, MEDIUM, HIGH, URGENT
            $table->json('attachments')->nullable()->after('priority');
            $table->date('request_date')->nullable()->after('date');
            $table->date('completion_date')->nullable()->after('request_date');
        });

        // Rename request_type to type for API compatibility
        // We'll handle this in the model with accessors
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn(['subject', 'description', 'priority', 'attachments', 'request_date', 'completion_date']);
        });
    }
};
