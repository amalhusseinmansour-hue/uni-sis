<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicFormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_form_id',
        'section_id',
        'field_name',
        'field_key',
        'label_en',
        'label_ar',
        'placeholder_en',
        'placeholder_ar',
        'help_text_en',
        'help_text_ar',
        'field_type',
        'options',
        'options_source',
        'options_filter',
        'data_source',
        'default_value',
        'validation',
        'attributes',
        'conditions',
        'dependencies',
        'width',
        'is_required',
        'is_unique',
        'is_searchable',
        'is_filterable',
        'is_sortable',
        'is_readonly',
        'is_disabled',
        'is_visible',
        'show_in_list',
        'show_in_detail',
        'show_in_form',
        'is_hidden',
        'conditional_logic',
        'computed_formula',
        'grid_column',
        'section',
        'order',
        'sort_order',
        'permissions',
        'styling',
    ];

    protected $casts = [
        'options' => 'array',
        'options_filter' => 'array',
        'validation' => 'array',
        'conditional_logic' => 'array',
        'computed_formula' => 'array',
        'permissions' => 'array',
        'styling' => 'array',
        'is_required' => 'boolean',
        'is_unique' => 'boolean',
        'is_searchable' => 'boolean',
        'is_filterable' => 'boolean',
        'is_sortable' => 'boolean',
        'show_in_list' => 'boolean',
        'show_in_detail' => 'boolean',
        'show_in_form' => 'boolean',
        'is_readonly' => 'boolean',
        'is_hidden' => 'boolean',
    ];

    protected $appends = ['label', 'placeholder', 'help_text'];

    public function getLabelAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->label_ar : $this->label_en;
    }

    public function getPlaceholderAttribute(): ?string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->placeholder_ar : $this->placeholder_en;
    }

    public function getHelpTextAttribute(): ?string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->help_text_ar : $this->help_text_en;
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(DynamicForm::class, 'dynamic_form_id');
    }

    public function dynamicForm(): BelongsTo
    {
        return $this->belongsTo(DynamicForm::class, 'dynamic_form_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(DynamicFormSection::class, 'section_id');
    }

    public function getOptionsFromSource(): array
    {
        if (!$this->options_source) {
            return $this->options ?? [];
        }

        // Parse options source (e.g., "colleges:id,name" or "api:/api/colleges")
        if (str_starts_with($this->options_source, 'api:')) {
            // Handle API source
            $endpoint = substr($this->options_source, 4);
            // Call internal API or external endpoint
            return [];
        }

        // Handle table source (e.g., "colleges:id,name_en,name_ar")
        $parts = explode(':', $this->options_source);
        $table = $parts[0];
        $fields = isset($parts[1]) ? explode(',', $parts[1]) : ['id', 'name'];

        $query = \DB::table($table)->select($fields);

        if ($this->options_filter) {
            foreach ($this->options_filter as $field => $value) {
                $query->where($field, $value);
            }
        }

        return $query->get()->map(function ($item) use ($fields) {
            $locale = app()->getLocale();
            $nameField = $locale === 'ar' ? 'name_ar' : 'name_en';

            return [
                'value' => $item->{$fields[0]},
                'label' => $item->{$nameField} ?? $item->{$fields[1]} ?? $item->{$fields[0]},
            ];
        })->toArray();
    }

    public function evaluateConditionalLogic(array $formData): bool
    {
        if (!$this->conditional_logic) {
            return true;
        }

        $logic = $this->conditional_logic;
        $operator = $logic['operator'] ?? 'and';
        $conditions = $logic['conditions'] ?? [];

        $results = [];
        foreach ($conditions as $condition) {
            $field = $condition['field'];
            $op = $condition['operator'];
            $value = $condition['value'];
            $fieldValue = $formData[$field] ?? null;

            $result = match ($op) {
                'equals' => $fieldValue == $value,
                'not_equals' => $fieldValue != $value,
                'contains' => str_contains($fieldValue ?? '', $value),
                'is_empty' => empty($fieldValue),
                'is_not_empty' => !empty($fieldValue),
                'greater_than' => $fieldValue > $value,
                'less_than' => $fieldValue < $value,
                'in' => in_array($fieldValue, (array) $value),
                default => true,
            };

            $results[] = $result;
        }

        return $operator === 'and' ? !in_array(false, $results) : in_array(true, $results);
    }
}
