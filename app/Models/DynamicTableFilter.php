<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicTableFilter extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_table_id',
        'filter_key',
        'field_name',
        'label_en',
        'label_ar',
        'placeholder_en',
        'placeholder_ar',
        'filter_type',
        'operator',
        'options',
        'options_source',
        'data_source',
        'default_value',
        'is_required',
        'is_visible',
        'depends_on',
        'order',
        'sort_order',
    ];

    protected $casts = [
        'options' => 'array',
        'depends_on' => 'array',
        'is_required' => 'boolean',
        'is_visible' => 'boolean',
    ];

    protected $appends = ['label'];

    public function getLabelAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->label_ar : $this->label_en;
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(DynamicTable::class, 'dynamic_table_id');
    }

    public function dynamicTable(): BelongsTo
    {
        return $this->belongsTo(DynamicTable::class, 'dynamic_table_id');
    }

    public function getOptionsFromSource(): array
    {
        if (!$this->options_source) {
            return $this->options ?? [];
        }

        $parts = explode(':', $this->options_source);
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

    public function getFilterConfig(): array
    {
        return [
            'key' => $this->filter_key,
            'field' => $this->field_name,
            'label' => $this->label,
            'type' => $this->filter_type,
            'operator' => $this->operator,
            'options' => $this->getOptionsFromSource(),
            'default' => $this->default_value,
            'required' => $this->is_required,
            'depends_on' => $this->depends_on,
        ];
    }
}
