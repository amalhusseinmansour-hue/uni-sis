<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Fix enrollment table constraints for data integrity
     */
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            // Make semester_id not nullable if it exists
            if (Schema::hasColumn('enrollments', 'semester_id')) {
                // First, update any null semester_id values to the current semester
                $currentSemester = DB::table('semesters')->where('is_current', true)->first();
                if ($currentSemester) {
                    DB::table('enrollments')
                        ->whereNull('semester_id')
                        ->update(['semester_id' => $currentSemester->id]);
                }
            }
        });

        // Add unique constraint if not exists
        try {
            Schema::table('enrollments', function (Blueprint $table) {
                // Drop old unique constraint if exists
                try {
                    $table->dropUnique('unique_enrollment');
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }

                // Add new unique constraint with semester_id
                $table->unique(['student_id', 'course_id', 'semester_id'], 'unique_enrollment_semester');
            });
        } catch (\Exception $e) {
            // Constraint might already exist or there are duplicates
            \Log::warning('Could not add unique constraint: ' . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            try {
                $table->dropUnique('unique_enrollment_semester');
            } catch (\Exception $e) {
                // Constraint doesn't exist
            }
        });
    }
};
