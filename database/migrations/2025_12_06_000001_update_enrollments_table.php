<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            // Add semester_id foreign key
            $table->foreignId('semester_id')->nullable()->after('course_id')->constrained()->onDelete('cascade');

            // Add section field
            $table->string('section', 10)->nullable()->after('semester_id');

            // Update status enum to include WITHDRAWN
            // Note: SQLite doesn't support modifying columns, so we keep the original status
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['semester_id']);
            $table->dropColumn(['semester_id', 'section']);
        });
    }
};
