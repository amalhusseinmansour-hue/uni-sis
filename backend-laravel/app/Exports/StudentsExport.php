<?php

namespace App\Exports;

use App\Models\Student;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected ?Collection $students;
    protected ?array $filters;

    public function __construct(?Collection $students = null, ?array $filters = null)
    {
        $this->students = $students;
        $this->filters = $filters;
    }

    public function collection()
    {
        if ($this->students) {
            return $this->students;
        }

        $query = Student::query();

        if ($this->filters) {
            if (isset($this->filters['status'])) {
                $query->where('status', $this->filters['status']);
            }
            if (isset($this->filters['program_type'])) {
                $query->where('program_type', $this->filters['program_type']);
            }
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Student ID',
            'Name (English)',
            'Name (Arabic)',
            'Status',
            'Program Type',
            'College',
            'Department',
            'Major',
            'Level',
            'GPA',
            'Academic Status',
            'Financial Status',
            'Phone',
            'University Email',
            'Personal Email',
            'National ID',
            'Gender',
            'Nationality',
            'Date of Birth',
            'Admission Date',
            'Completed Credits',
            'Remaining Credits',
        ];
    }

    public function map($student): array
    {
        return [
            $student->student_id,
            $student->name_en,
            $student->name_ar,
            $student->status,
            $student->program_type,
            $student->college,
            $student->department,
            $student->major,
            $student->level,
            $student->gpa,
            $student->academic_status,
            $student->financial_status,
            $student->phone,
            $student->university_email,
            $student->personal_email,
            $student->national_id,
            $student->gender,
            $student->nationality,
            $student->date_of_birth?->format('Y-m-d'),
            $student->admission_date?->format('Y-m-d'),
            $student->completed_credits,
            $student->remaining_credits,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
