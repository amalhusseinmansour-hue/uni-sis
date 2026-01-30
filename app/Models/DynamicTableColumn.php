<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicTableColumn extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_table_id',
        'column_key',
        'field_name',
        'header_en',
        'header_ar',
        'data_type',
        'format',
        'format_options',
        'cell_template',
        'cell_style',
        'conditional_styles',
        'status_colors',
        'width',
        'min_width',
        'max_width',
        'align',
        'is_visible',
        'is_sortable',
        'is_searchable',
        'is_filterable',
        'filter_type',
        'filter_options',
        'filter_source',
        'is_exportable',
        'is_frozen',
        'is_resizable',
        'conditional_styling',
        'tooltip',
        'permissions',
        'order',
        'sort_order',
    ];

    protected $casts = [
        'format_options' => 'array',
        'status_colors' => 'array',
        'filter_options' => 'array',
        'conditional_styling' => 'array',
        'tooltip' => 'array',
        'permissions' => 'array',
        'is_visible' => 'boolean',
        'is_sortable' => 'boolean',
        'is_searchable' => 'boolean',
        'is_filterable' => 'boolean',
        'is_exportable' => 'boolean',
        'is_frozen' => 'boolean',
        'is_resizable' => 'boolean',
    ];

    protected $appends = ['header'];

    public function getHeaderAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->header_ar : $this->header_en;
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(DynamicTable::class, 'dynamic_table_id');
    }

    public function dynamicTable(): BelongsTo
    {
        return $this->belongsTo(DynamicTable::class, 'dynamic_table_id');
    }

    public function formatValue($value)
    {
        if ($value === null) {
            return '-';
        }

        return match ($this->data_type) {
            'date' => $this->formatDate($value),
            'datetime' => $this->formatDateTime($value),
            'time' => $this->formatTime($value),
            'number' => $this->formatNumber($value),
            'decimal' => $this->formatDecimal($value),
            'currency' => $this->formatCurrency($value),
            'percentage' => $this->formatPercentage($value),
            'boolean' => $this->formatBoolean($value),
            'status' => $this->formatStatus($value),
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

    protected function formatTime($value): string
    {
        $format = $this->format_options['format'] ?? 'H:i';
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
        $currency = $this->format_options['currency'] ?? 'USD';
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

    protected function formatStatus($value): array
    {
        $colors = $this->status_colors ?? [];
        $color = $colors[strtolower($value)] ?? 'gray';

        return [
            'value' => $value,
            'color' => $color,
        ];
    }

    public function getFilterOptionsFromSource(): array
    {
        if (!$this->filter_source) {
            return $this->filter_options ?? [];
        }

        // Parse filter source similar to form options
        $parts = explode(':', $this->filter_source);
        $table = $parts[0];
        $fields = isset($parts[1]) ? explode(',', $parts[1]) : ['id', 'name'];

        return \DB::table($table)
            ->select($fields)
            ->distinct()
            ->get()
            ->map(function ($item) use ($fields) {
                $locale = app()->getLocale();
                $nameField = $locale === 'ar' ? 'name_ar' : 'name_en';

                return [
                    'value' => $item->{$fields[0]},
                    'label' => $item->{$nameField} ?? $item->{$fields[1]} ?? $item->{$fields[0]},
                ];
            })->toArray();
    }
}
