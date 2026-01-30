<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::inRandomOrder()->first()?->id ?? Student::factory(),
            'course_id' => Course::inRandomOrder()->first()?->id ?? Course::factory(),
            'semester_id' => Semester::inRandomOrder()->first()?->id ?? 1,
            'section' => fake()->randomElement(['A', 'B', 'C', 'D', null]),
            'status' => fake()->randomElement(['ENROLLED', 'ENROLLED', 'ENROLLED', 'COMPLETED', 'DROPPED']),
            'enrolled_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'attendance_count' => fake()->numberBetween(0, 30),
            'total_classes' => fake()->numberBetween(25, 40),
        ];
    }

    public function enrolled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ENROLLED',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'COMPLETED',
        ]);
    }

    public function dropped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'DROPPED',
        ]);
    }
}
