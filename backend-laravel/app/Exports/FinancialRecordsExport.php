<?php

namespace App\Exports;

use App\Models\FinancialRecord;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class FinancialRecordsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected ?Collection $records;
    protected ?int $studentId;
    protected ?string $status;

    public function __construct(?Collection $records = null, ?int $studentId = null, ?string $status = null)
    {
        $this->records = $records;
        $this->studentId = $studentId;
        $this->status = $status;
    }

    public function collection()
    {
        if ($this->records) {
            return $this->records;
        }

        $query = FinancialRecord::with(['student', 'semester']);

        if ($this->studentId) {
            $query->where('student_id', $this->studentId);
        }

        if ($this->status) {
            $query->where('status', $this->status);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Record ID',
            'Student ID',
            'Student Name',
            'Semester',
            'Type',
            'Description',
            'Amount',
            'Due Date',
            'Payment Date',
            'Status',
            'Payment Method',
            'Reference Number',
            'Notes',
        ];
    }

    public function map($record): array
    {
        return [
            $record->id,
            $record->student?->student_id,
            $record->student?->name_en,
            $record->semester?->name,
            $record->type,
            $record->description,
            number_format($record->amount, 2),
            $record->due_date?->format('Y-m-d'),
            $record->payment_date?->format('Y-m-d'),
            $record->status,
            $record->payment_method,
            $record->reference_number,
            $record->notes,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
