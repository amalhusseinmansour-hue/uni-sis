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
            $table->string('letter_grade', 5);
            $table->decimal('min_score', 5, 2);
            $table->decimal('max_score', 5, 2);
            $table->decimal('grade_points', 3, 2);
            $table->string('description_en')->nullable();
            $table->string('description_ar')->nullable();
            $table->boolean('is_passing')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default grading scales
        $scales = [
            ['letter_grade' => 'A+', 'min_score' => 95, 'max_score' => 100, 'grade_points' => 4.0, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'A', 'min_score' => 90, 'max_score' => 94.99, 'grade_points' => 4.0, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'A-', 'min_score' => 85, 'max_score' => 89.99, 'grade_points' => 3.7, 'description_en' => 'Very Good', 'description_ar' => 'جيد جداً', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'B+', 'min_score' => 80, 'max_score' => 84.99, 'grade_points' => 3.3, 'description_en' => 'Very Good', 'description_ar' => 'جيد جداً', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'B', 'min_score' => 75, 'max_score' => 79.99, 'grade_points' => 3.0, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'B-', 'min_score' => 70, 'max_score' => 74.99, 'grade_points' => 2.7, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'C+', 'min_score' => 65, 'max_score' => 69.99, 'grade_points' => 2.3, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'C', 'min_score' => 60, 'max_score' => 64.99, 'grade_points' => 2.0, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'C-', 'min_score' => 55, 'max_score' => 59.99, 'grade_points' => 1.7, 'description_en' => 'Pass', 'description_ar' => 'مقبول', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'D+', 'min_score' => 50, 'max_score' => 54.99, 'grade_points' => 1.3, 'description_en' => 'Pass', 'description_ar' => 'مقبول', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'D', 'min_score' => 45, 'max_score' => 49.99, 'grade_points' => 1.0, 'description_en' => 'Poor', 'description_ar' => 'ضعيف', 'is_passing' => true, 'is_active' => true],
            ['letter_grade' => 'F', 'min_score' => 0, 'max_score' => 44.99, 'grade_points' => 0.0, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => false, 'is_active' => true],
        ];

        foreach ($scales as $scale) {
            $scale['created_at'] = now();
            $scale['updated_at'] = now();
            DB::table('grading_scales')->insert($scale);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('grading_scales');
    }
};
