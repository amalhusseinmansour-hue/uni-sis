<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && ($this->user()->isAdmin() || $this->user()->isStudent());
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'required|exists:semesters,id',
            'section' => 'nullable|string|max:10',
            'status' => 'sometimes|in:ENROLLED,DROPPED,WITHDRAWN,COMPLETED',
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required' => 'Student is required',
            'student_id.exists' => 'Student not found',
            'course_id.required' => 'Course is required',
            'course_id.exists' => 'Course not found',
            'semester_id.required' => 'Semester is required',
            'semester_id.exists' => 'Semester not found',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Check for duplicate enrollment
            $exists = \App\Models\Enrollment::where('student_id', $this->student_id)
                ->where('course_id', $this->course_id)
                ->where('semester_id', $this->semester_id)
                ->exists();

            if ($exists) {
                $validator->errors()->add('course_id', 'Student is already enrolled in this course for this semester');
            }
        });
    }
}
