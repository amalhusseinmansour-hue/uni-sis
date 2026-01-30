<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicTableAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_table_id',
        'action_key',
        'label_en',
        'label_ar',
        'icon',
        'color',
        'action_type',
        'action_target',
        'confirm_message_en',
        'confirm_message_ar',
        'conditions',
        'permissions',
        'is_bulk',
        'is_visible',
        'order',
    ];

    protected $casts = [
        'conditions' => 'array',
        'permissions' => 'array',
        'is_bulk' => 'boolean',
        'is_visible' => 'boolean',
    ];

    protected $appends = ['label', 'confirm_message'];

    public function getLabelAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->label_ar : $this->label_en;
    }

    public function getConfirmMessageAttribute(): ?string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->confirm_message_ar : $this->confirm_message_en;
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(DynamicTable::class, 'dynamic_table_id');
    }

    public function dynamicTable(): BelongsTo
    {
        return $this->belongsTo(DynamicTable::class, 'dynamic_table_id');
    }

    public function evaluateConditions(array $rowData): bool
    {
        if (!$this->conditions) {
            return true;
        }

        foreach ($this->conditions as $condition) {
            $field = $condition['field'];
            $operator = $condition['operator'];
            $value = $condition['value'];
            $rowValue = $rowData[$field] ?? null;

            $result = match ($operator) {
                'equals' => $rowValue == $value,
                'not_equals' => $rowValue != $value,
                'in' => in_array($rowValue, (array) $value),
                'not_in' => !in_array($rowValue, (array) $value),
                'is_null' => $rowValue === null,
                'is_not_null' => $rowValue !== null,
                default => true,
            };

            if (!$result) {
                return false;
            }
        }

        return true;
    }
}
