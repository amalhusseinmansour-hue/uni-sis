<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && ($this->user()->isAdmin() || $this->user()->isLecturer());
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'required|exists:semesters,id',
            'midterm' => 'nullable|numeric|min:0|max:100',
            'final_exam' => 'nullable|numeric|min:0|max:100',
            'assignments' => 'nullable|numeric|min:0|max:100',
            'attendance' => 'nullable|numeric|min:0|max:100',
            'coursework' => 'nullable|numeric|min:0|max:100',
            'grade' => 'nullable|in:A+,A,A-,B+,B,B-,C+,C,C-,D+,D,F,W,I,IP',
            'status' => 'sometimes|in:PENDING,APPROVED,FINAL',
            'remarks' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.exists' => 'Student not found',
            'course_id.exists' => 'Course not found',
            'semester_id.exists' => 'Semester not found',
            'midterm.max' => 'Midterm score cannot exceed 100',
            'final_exam.max' => 'Final exam score cannot exceed 100',
            'grade.in' => 'Invalid grade value',
        ];
    }
}
