<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'date',
        'description',
        'amount',
        'type',
        'status',
        'reference_number',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function isDebit(): bool
    {
        return $this->type === 'DEBIT';
    }

    public function isCredit(): bool
    {
        return $this->type === 'CREDIT';
    }

    public function isPaid(): bool
    {
        return $this->status === 'PAID';
    }

    public function isPending(): bool
    {
        return $this->status === 'PENDING';
    }

    public function isOverdue(): bool
    {
        return $this->status === 'OVERDUE';
    }
}
