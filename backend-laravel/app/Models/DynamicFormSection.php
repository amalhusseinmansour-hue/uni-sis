<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DynamicFormSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_form_id',
        'section_key',
        'title_en',
        'title_ar',
        'description_en',
        'description_ar',
        'icon',
        'layout',
        'columns',
        'is_collapsible',
        'is_collapsed',
        'is_collapsed_default',
        'conditions',
        'conditional_logic',
        'is_visible',
        'grid_columns',
        'order',
        'sort_order',
    ];

    protected $casts = [
        'conditional_logic' => 'array',
        'is_collapsible' => 'boolean',
        'is_collapsed_default' => 'boolean',
    ];

    protected $appends = ['title', 'description'];

    public function getTitleAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->title_ar : $this->title_en;
    }

    public function getDescriptionAttribute(): ?string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->description_ar : $this->description_en;
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(DynamicForm::class, 'dynamic_form_id');
    }

    public function dynamicForm(): BelongsTo
    {
        return $this->belongsTo(DynamicForm::class, 'dynamic_form_id');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(DynamicFormField::class, 'section_id')
            ->orderBy('order');
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
                default => true,
            };

            $results[] = $result;
        }

        return $operator === 'and' ? !in_array(false, $results) : in_array(true, $results);
    }
}
