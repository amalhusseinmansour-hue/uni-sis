<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add STUDENT_AFFAIRS role to the users table enum
     */
    public function up(): void
    {
        // For MySQL, we need to modify the enum column
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('STUDENT', 'LECTURER', 'ADMIN', 'FINANCE', 'STUDENT_AFFAIRS') DEFAULT 'STUDENT'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First update any STUDENT_AFFAIRS users to ADMIN
        DB::table('users')->where('role', 'STUDENT_AFFAIRS')->update(['role' => 'ADMIN']);

        // Then revert the enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('STUDENT', 'LECTURER', 'ADMIN', 'FINANCE') DEFAULT 'STUDENT'");
    }
};
