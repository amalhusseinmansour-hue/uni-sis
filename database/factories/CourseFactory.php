<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        $prefixes = ['CS', 'IT', 'SE', 'IS', 'MATH', 'PHYS', 'CHEM', 'ENG', 'BUS', 'MGT'];
        $prefix = fake()->randomElement($prefixes);
        $number = fake()->numberBetween(100, 499);

        $courseNames = [
            'Introduction to Programming',
            'Data Structures',
            'Algorithms',
            'Database Systems',
            'Operating Systems',
            'Computer Networks',
            'Software Engineering',
            'Web Development',
            'Mobile App Development',
            'Machine Learning',
            'Artificial Intelligence',
            'Calculus',
            'Linear Algebra',
            'Statistics',
            'Discrete Mathematics',
            'Physics',
            'Chemistry',
            'Technical Writing',
            'Project Management',
            'Business Administration',
        ];

        $name = fake()->randomElement($courseNames);

        return [
            'department_id' => Department::inRandomOrder()->first()?->id ?? 1,
            'code' => $prefix . $number,
            'name_en' => $name,
            'name_ar' => 'مقرر ' . fake('ar_SA')->word(),
            'description_en' => fake()->paragraph(3),
            'description_ar' => fake('ar_SA')->paragraph(3),
            'credits' => fake()->randomElement([2, 3, 3, 3, 4]),
            'lecture_hours' => fake()->numberBetween(2, 4),
            'lab_hours' => fake()->randomElement([0, 0, 1, 2, 3]),
            'type' => fake()->randomElement(['REQUIRED', 'REQUIRED', 'ELECTIVE', 'GENERAL']),
            'level' => fake()->numberBetween(1, 5),
            'max_students' => fake()->randomElement([30, 40, 50, 60, 80, 100]),
            'is_active' => fake()->boolean(90),
        ];
    }

    public function required(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'REQUIRED',
        ]);
    }

    public function elective(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'ELECTIVE',
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }
}
