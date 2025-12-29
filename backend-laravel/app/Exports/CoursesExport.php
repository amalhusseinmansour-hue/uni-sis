<?php

namespace App\Exports;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CoursesExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected ?Collection $courses;
    protected ?bool $isActive;

    public function __construct(?Collection $courses = null, ?bool $isActive = null)
    {
        $this->courses = $courses;
        $this->isActive = $isActive;
    }

    public function collection()
    {
        if ($this->courses) {
            return $this->courses;
        }

        $query = Course::with('department');

        if ($this->isActive !== null) {
            $query->where('is_active', $this->isActive);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Course Code',
            'Name (English)',
            'Name (Arabic)',
            'Department',
            'Credits',
            'Lecture Hours',
            'Lab Hours',
            'Level',
            'Semester',
            'Max Enrollment',
            'Type',
            'Is Active',
            'Prerequisites',
            'Description',
        ];
    }

    public function map($course): array
    {
        return [
            $course->code,
            $course->name_en,
            $course->name_ar,
            $course->department?->name_en,
            $course->credits,
            $course->lecture_hours,
            $course->lab_hours,
            $course->level,
            $course->semester,
            $course->max_enrollment,
            $course->type,
            $course->is_active ? 'Yes' : 'No',
            $course->prerequisites,
            $course->description,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
