<?php

namespace App\Exports;

use App\Models\Grade;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GradesExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected ?Collection $grades;
    protected ?int $studentId;
    protected ?int $semesterId;

    public function __construct(?Collection $grades = null, ?int $studentId = null, ?int $semesterId = null)
    {
        $this->grades = $grades;
        $this->studentId = $studentId;
        $this->semesterId = $semesterId;
    }

    public function collection()
    {
        if ($this->grades) {
            return $this->grades;
        }

        $query = Grade::with(['student', 'course', 'semester']);

        if ($this->studentId) {
            $query->where('student_id', $this->studentId);
        }

        if ($this->semesterId) {
            $query->where('semester_id', $this->semesterId);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Student ID',
            'Student Name',
            'Course Code',
            'Course Name',
            'Semester',
            'Midterm Score',
            'Final Score',
            'Assignments Score',
            'Total Score',
            'Letter Grade',
            'Grade Points',
            'Credits',
            'Status',
            'Remarks',
        ];
    }

    public function map($grade): array
    {
        return [
            $grade->student?->student_id,
            $grade->student?->name_en,
            $grade->course?->code,
            $grade->course?->name_en,
            $grade->semester?->name,
            $grade->midterm_score,
            $grade->final_score,
            $grade->assignments_score,
            $grade->total_score,
            $grade->letter_grade,
            $grade->grade_points,
            $grade->course?->credits,
            $grade->status,
            $grade->remarks,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
