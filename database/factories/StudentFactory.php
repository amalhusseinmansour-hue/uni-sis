<?php

namespace Database\Factories;

use App\Models\Advisor;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        $gender = fake()->randomElement(['MALE', 'FEMALE']);
        $firstName = $gender === 'MALE' ? fake()->firstNameMale() : fake()->firstNameFemale();
        $lastName = fake()->lastName();

        return [
            'user_id' => User::factory(),
            'program_id' => Program::inRandomOrder()->first()?->id ?? 1,
            'advisor_id' => null,
            'student_id' => fake()->unique()->numerify('STU#####'),
            'name_ar' => fake('ar_SA')->name($gender === 'MALE' ? 'male' : 'female'),
            'name_en' => "$firstName $lastName",
            'status' => fake()->randomElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'GRADUATED']),
            'program_type' => fake()->randomElement(['REGULAR', 'PART_TIME', 'ONLINE']),
            'national_id' => fake()->unique()->numerify('##########'),
            'passport_number' => fake()->optional(0.3)->bothify('??######'),
            'date_of_birth' => fake()->dateTimeBetween('-30 years', '-18 years'),
            'birth_city' => fake()->city(),
            'birth_country' => fake()->country(),
            'gender' => $gender,
            'nationality' => fake()->country(),
            'marital_status' => fake()->randomElement(['SINGLE', 'SINGLE', 'SINGLE', 'MARRIED']),
            'admission_date' => fake()->dateTimeBetween('-4 years', 'now'),
            'phone' => fake()->phoneNumber(),
            'alternative_phone' => fake()->optional(0.5)->phoneNumber(),
            'personal_email' => fake()->unique()->safeEmail(),
            'university_email' => fake()->unique()->userName() . '@university.edu',
            'address_country' => fake()->country(),
            'address_city' => fake()->city(),
            'address_street' => fake()->streetAddress(),
            'postal_code' => fake()->postcode(),
            'guardian_name' => fake()->name(),
            'guardian_relationship' => fake()->randomElement(['Father', 'Mother', 'Guardian', 'Spouse']),
            'guardian_phone' => fake()->phoneNumber(),
            'guardian_email' => fake()->optional(0.7)->safeEmail(),
            'emergency_name' => fake()->name(),
            'emergency_phone' => fake()->phoneNumber(),
            'emergency_relationship' => fake()->randomElement(['Parent', 'Sibling', 'Friend', 'Relative']),
            'college' => fake()->randomElement(['Engineering', 'Science', 'Business', 'Arts']),
            'department' => fake()->randomElement(['Computer Science', 'Mathematics', 'Physics', 'Management']),
            'major' => fake()->randomElement(['Software Engineering', 'Data Science', 'Cyber Security']),
            'degree' => fake()->randomElement(['Bachelor', 'Master', 'PhD']),
            'level' => fake()->numberBetween(1, 5),
            'current_semester' => fake()->numberBetween(1, 10),
            'academic_status' => fake()->randomElement(['REGULAR', 'PROBATION', 'DISMISSED']),
            'total_required_credits' => fake()->numberBetween(120, 150),
            'completed_credits' => fake()->numberBetween(0, 120),
            'registered_credits' => fake()->numberBetween(12, 21),
            'remaining_credits' => fake()->numberBetween(0, 150),
            'term_gpa' => fake()->randomFloat(2, 1.5, 4.0),
            'gpa' => fake()->randomFloat(2, 1.5, 4.0),
            'total_fees' => fake()->randomFloat(2, 10000, 50000),
            'paid_amount' => fake()->randomFloat(2, 5000, 40000),
            'current_balance' => fake()->randomFloat(2, 0, 10000),
            'previous_balance' => fake()->randomFloat(2, 0, 5000),
            'scholarships' => fake()->optional(0.3)->randomFloat(2, 1000, 20000),
            'financial_status' => fake()->randomElement(['CLEAR', 'PENDING', 'HOLD']),
            'sis_username' => fake()->userName(),
            'lms_username' => fake()->userName(),
            'account_status' => 'ACTIVE',
            'last_login' => fake()->optional(0.8)->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ACTIVE',
            'account_status' => 'ACTIVE',
        ]);
    }

    public function graduated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'GRADUATED',
            'completed_credits' => $attributes['total_required_credits'] ?? 130,
            'remaining_credits' => 0,
            'gpa' => fake()->randomFloat(2, 2.5, 4.0),
        ]);
    }

    public function onProbation(): static
    {
        return $this->state(fn (array $attributes) => [
            'academic_status' => 'PROBATION',
            'gpa' => fake()->randomFloat(2, 1.0, 1.99),
        ]);
    }
}
