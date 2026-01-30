<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        $studentId = $this->route('student')->id ?? $this->route('student');

        return [
            'program_id' => 'sometimes|exists:programs,id',
            'advisor_id' => 'nullable|exists:advisors,id',
            'student_id' => ['sometimes', 'string', Rule::unique('students')->ignore($studentId)],
            'name_ar' => 'sometimes|string|max:255',
            'name_en' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:ACTIVE,SUSPENDED,GRADUATED,WITHDRAWN',
            'program_type' => 'nullable|string|max:50',
            'national_id' => ['nullable', 'string', 'max:50', Rule::unique('students')->ignore($studentId)],
            'passport_number' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date|before:today',
            'birth_city' => 'nullable|string|max:100',
            'birth_country' => 'nullable|string|max:100',
            'gender' => 'sometimes|in:MALE,FEMALE',
            'nationality' => 'nullable|string|max:100',
            'marital_status' => 'nullable|in:SINGLE,MARRIED,DIVORCED,WIDOWED',
            'admission_date' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'alternative_phone' => 'nullable|string|max:20',
            'personal_email' => 'nullable|email|max:255',
            'university_email' => ['nullable', 'email', 'max:255', Rule::unique('students')->ignore($studentId)],
            'address_country' => 'nullable|string|max:100',
            'address_city' => 'nullable|string|max:100',
            'address_street' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_relationship' => 'nullable|string|max:50',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_email' => 'nullable|email|max:255',
            'emergency_name' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'emergency_relationship' => 'nullable|string|max:50',
            'college' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'degree' => 'nullable|string|max:100',
            'level' => 'nullable|integer|min:1|max:10',
            'current_semester' => 'nullable|integer|min:1',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'completed_credits' => 'nullable|integer|min:0',
            'registered_credits' => 'nullable|integer|min:0',
        ];
    }
}
