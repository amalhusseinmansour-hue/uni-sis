<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicReportField extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_report_id',
        'field_key',
        'label_en',
        'label_ar',
        'field_name',
        'header_en',
        'header_ar',
        'field_type',
        'data_field',
        'aggregation',
        'filter',
        'format',
        'data_type',
        'format_options',
        'styles',
        'width',
        'align',
        'is_visible',
        'is_summary',
        'summary_function',
        'conditional_styling',
        'order',
        'sort_order',
    ];

    protected $casts = [
        'format_options' => 'array',
        'conditional_styling' => 'array',
        'is_visible' => 'boolean',
        'is_summary' => 'boolean',
    ];

    protected $appends = ['header'];

    public function getHeaderAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->header_ar : $this->header_en;
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function dynamicReport(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function formatValue($value)
    {
        if ($value === null) {
            return '-';
        }

        return match ($this->data_type) {
            'date' => $this->formatDate($value),
            'datetime' => $this->formatDateTime($value),
            'number' => $this->formatNumber($value),
            'decimal' => $this->formatDecimal($value),
            'currency' => $this->formatCurrency($value),
            'percentage' => $this->formatPercentage($value),
            'boolean' => $this->formatBoolean($value),
            'grade' => $this->formatGrade($value),
            default => $value,
        };
    }

    protected function formatDate($value): string
    {
        $format = $this->format_options['format'] ?? 'Y-m-d';
        return date($format, strtotime($value));
    }

    protected function formatDateTime($value): string
    {
        $format = $this->format_options['format'] ?? 'Y-m-d H:i';
        return date($format, strtotime($value));
    }

    protected function formatNumber($value): string
    {
        $decimals = $this->format_options['decimals'] ?? 0;
        $thousandsSep = $this->format_options['thousands_sep'] ?? ',';
        $decPoint = $this->format_options['dec_point'] ?? '.';
        return number_format($value, $decimals, $decPoint, $thousandsSep);
    }

    protected function formatDecimal($value): string
    {
        $decimals = $this->format_options['decimals'] ?? 2;
        return number_format($value, $decimals);
    }

    protected function formatCurrency($value): string
    {
        $symbol = $this->format_options['symbol'] ?? '$';
        $decimals = $this->format_options['decimals'] ?? 2;
        return $symbol . number_format($value, $decimals);
    }

    protected function formatPercentage($value): string
    {
        $decimals = $this->format_options['decimals'] ?? 1;
        return number_format($value, $decimals) . '%';
    }

    protected function formatBoolean($value): string
    {
        $locale = app()->getLocale();
        if ($locale === 'ar') {
            return $value ? 'نعم' : 'لا';
        }
        return $value ? 'Yes' : 'No';
    }

    protected function formatGrade($value): array
    {
        $gradeColors = $this->format_options['grade_colors'] ?? [
            'A+' => 'green', 'A' => 'green', 'A-' => 'green',
            'B+' => 'blue', 'B' => 'blue', 'B-' => 'blue',
            'C+' => 'yellow', 'C' => 'yellow', 'C-' => 'yellow',
            'D+' => 'orange', 'D' => 'orange',
            'F' => 'red',
        ];

        return [
            'value' => $value,
            'color' => $gradeColors[$value] ?? 'gray',
        ];
    }

    public function calculateSummary(array $data)
    {
        if (!$this->is_summary || !$this->summary_function) {
            return null;
        }

        $values = collect($data)->pluck($this->field_name)->filter()->values();

        return match ($this->summary_function) {
            'sum' => $values->sum(),
            'avg' => $values->avg(),
            'count' => $values->count(),
            'min' => $values->min(),
            'max' => $values->max(),
            default => null,
        };
    }

    public function getConditionalStyle($value): ?array
    {
        if (!$this->conditional_styling) {
            return null;
        }

        foreach ($this->conditional_styling as $rule) {
            $condition = $rule['condition'];
            $style = $rule['style'];

            $matches = match ($condition['operator']) {
                'equals' => $value == $condition['value'],
                'not_equals' => $value != $condition['value'],
                'greater_than' => $value > $condition['value'],
                'less_than' => $value < $condition['value'],
                'between' => $value >= $condition['min'] && $value <= $condition['max'],
                'in' => in_array($value, (array) $condition['value']),
                default => false,
            };

            if ($matches) {
                return $style;
            }
        }

        return null;
    }
}
