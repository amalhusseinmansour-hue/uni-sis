<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Grade;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class GradeFactory extends Factory
{
    protected $model = Grade::class;

    public function definition(): array
    {
        $midterm = fake()->randomFloat(1, 40, 100);
        $final = fake()->randomFloat(1, 40, 100);
        $assignments = fake()->randomFloat(1, 50, 100);
        $attendance = fake()->randomFloat(1, 60, 100);

        $total = ($midterm * 0.25) + ($final * 0.40) + ($assignments * 0.25) + ($attendance * 0.10);
        $grade = $this->calculateGrade($total);

        return [
            'student_id' => Student::inRandomOrder()->first()?->id ?? Student::factory(),
            'course_id' => Course::inRandomOrder()->first()?->id ?? Course::factory(),
            'semester_id' => Semester::inRandomOrder()->first()?->id ?? 1,
            'midterm' => $midterm,
            'final_exam' => $final,
            'assignments' => $assignments,
            'coursework' => fake()->randomFloat(1, 50, 100),
            'attendance' => $attendance,
            'grade' => $grade,
            'status' => fake()->randomElement(['PENDING', 'APPROVED', 'FINAL']),
            'remarks' => fake()->optional(0.2)->sentence(),
        ];
    }

    private function calculateGrade(float $total): string
    {
        return match (true) {
            $total >= 95 => 'A+',
            $total >= 90 => 'A',
            $total >= 85 => 'A-',
            $total >= 80 => 'B+',
            $total >= 75 => 'B',
            $total >= 70 => 'B-',
            $total >= 65 => 'C+',
            $total >= 60 => 'C',
            $total >= 55 => 'C-',
            $total >= 50 => 'D+',
            $total >= 45 => 'D',
            default => 'F',
        };
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'APPROVED',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'PENDING',
        ]);
    }

    public function passing(): static
    {
        return $this->state(function (array $attributes) {
            $midterm = fake()->randomFloat(1, 60, 100);
            $final = fake()->randomFloat(1, 60, 100);
            $total = ($midterm + $final) / 2;

            return [
                'midterm' => $midterm,
                'final_exam' => $final,
                'grade' => $this->calculateGrade($total),
            ];
        });
    }
}
