<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grading_scales', function (Blueprint $table) {
            $table->id();
            $table->string('letter_grade', 5); // A+, A, A-, B+, etc.
            $table->decimal('min_score', 5, 2); // Minimum score for this grade
            $table->decimal('max_score', 5, 2); // Maximum score for this grade
            $table->decimal('grade_points', 3, 2); // GPA points (4.0, 3.7, etc.)
            $table->string('description_en')->nullable();
            $table->string('description_ar')->nullable();
            $table->boolean('is_passing')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->unique('letter_grade');
        });

        // Insert default grading scale
        DB::table('grading_scales')->insert([
            ['letter_grade' => 'A+', 'min_score' => 95, 'max_score' => 100, 'grade_points' => 4.00, 'description_en' => 'Exceptional', 'description_ar' => 'ممتاز مرتفع', 'is_passing' => true, 'is_active' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'A', 'min_score' => 90, 'max_score' => 94.99, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => true, 'is_active' => true, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'A-', 'min_score' => 85, 'max_score' => 89.99, 'grade_points' => 3.70, 'description_en' => 'Very Good+', 'description_ar' => 'جيد جداً مرتفع', 'is_passing' => true, 'is_active' => true, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'B+', 'min_score' => 80, 'max_score' => 84.99, 'grade_points' => 3.30, 'description_en' => 'Very Good', 'description_ar' => 'جيد جداً', 'is_passing' => true, 'is_active' => true, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'B', 'min_score' => 75, 'max_score' => 79.99, 'grade_points' => 3.00, 'description_en' => 'Good+', 'description_ar' => 'جيد مرتفع', 'is_passing' => true, 'is_active' => true, 'order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'B-', 'min_score' => 70, 'max_score' => 74.99, 'grade_points' => 2.70, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => true, 'is_active' => true, 'order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'C+', 'min_score' => 65, 'max_score' => 69.99, 'grade_points' => 2.30, 'description_en' => 'Satisfactory+', 'description_ar' => 'مقبول مرتفع', 'is_passing' => true, 'is_active' => true, 'order' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'C', 'min_score' => 60, 'max_score' => 64.99, 'grade_points' => 2.00, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => true, 'is_active' => true, 'order' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'C-', 'min_score' => 55, 'max_score' => 59.99, 'grade_points' => 1.70, 'description_en' => 'Pass+', 'description_ar' => 'ناجح مرتفع', 'is_passing' => true, 'is_active' => true, 'order' => 9, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'D+', 'min_score' => 53, 'max_score' => 54.99, 'grade_points' => 1.30, 'description_en' => 'Pass', 'description_ar' => 'ناجح', 'is_passing' => true, 'is_active' => true, 'order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'D', 'min_score' => 50, 'max_score' => 52.99, 'grade_points' => 1.00, 'description_en' => 'Minimum Pass', 'description_ar' => 'الحد الأدنى للنجاح', 'is_passing' => true, 'is_active' => true, 'order' => 11, 'created_at' => now(), 'updated_at' => now()],
            ['letter_grade' => 'F', 'min_score' => 0, 'max_score' => 49.99, 'grade_points' => 0.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => false, 'is_active' => true, 'order' => 12, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('grading_scales');
    }
};
