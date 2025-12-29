<?php

namespace Database\Factories;

use App\Models\Semester;
use Illuminate\Database\Eloquent\Factories\Factory;

class SemesterFactory extends Factory
{
    protected $model = Semester::class;

    public function definition(): array
    {
        $year = fake()->numberBetween(2020, 2025);
        $term = fake()->randomElement(['FALL', 'SPRING', 'SUMMER']);

        $termNames = [
            'FALL' => ['First Semester', 'الفصل الأول'],
            'SPRING' => ['Second Semester', 'الفصل الثاني'],
            'SUMMER' => ['Summer Semester', 'الفصل الصيفي'],
        ];

        $startDates = [
            'FALL' => "$year-09-01",
            'SPRING' => "$year-01-15",
            'SUMMER' => "$year-06-01",
        ];

        $endDates = [
            'FALL' => "$year-12-20",
            'SPRING' => "$year-05-15",
            'SUMMER' => "$year-07-31",
        ];

        return [
            'name_en' => "{$termNames[$term][0]} {$year}",
            'name_ar' => "{$termNames[$term][1]} {$year}",
            'year' => $year,
            'term' => $term,
            'start_date' => $startDates[$term],
            'end_date' => $endDates[$term],
            'registration_start' => fake()->dateTimeBetween("-2 months", "-1 month")->format('Y-m-d'),
            'registration_end' => fake()->dateTimeBetween("-1 month", "-1 week")->format('Y-m-d'),
            'is_current' => false,
            'is_active' => true,
        ];
    }

    public function current(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_current' => true,
            'is_active' => true,
        ]);
    }

    public function fall(int $year = null): static
    {
        $year = $year ?? now()->year;
        return $this->state(fn (array $attributes) => [
            'name_en' => "Fall Semester $year",
            'name_ar' => "الفصل الأول $year",
            'year' => $year,
            'term' => 'FALL',
            'start_date' => "$year-09-01",
            'end_date' => "$year-12-20",
        ]);
    }

    public function spring(int $year = null): static
    {
        $year = $year ?? now()->year;
        return $this->state(fn (array $attributes) => [
            'name_en' => "Spring Semester $year",
            'name_ar' => "الفصل الثاني $year",
            'year' => $year,
            'term' => 'SPRING',
            'start_date' => "$year-01-15",
            'end_date' => "$year-05-15",
        ]);
    }
}
