<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|string|max:20|unique:courses,code',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'credits' => 'required|integer|min:0|max:12',
            'lecture_hours' => 'nullable|integer|min:0|max:10',
            'lab_hours' => 'nullable|integer|min:0|max:10',
            'type' => 'required|in:REQUIRED,ELECTIVE,GENERAL',
            'level' => 'nullable|integer|min:1|max:10',
            'max_students' => 'nullable|integer|min:1|max:500',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'Course code already exists',
            'department_id.exists' => 'Department not found',
            'credits.required' => 'Credit hours are required',
        ];
    }
}
