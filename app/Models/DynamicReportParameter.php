<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicReportParameter extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_report_id',
        'param_key',
        'param_type',
        'field_name',
        'label_en',
        'label_ar',
        'placeholder_en',
        'placeholder_ar',
        'input_type',
        'data_type',
        'operator',
        'options',
        'options_source',
        'data_source',
        'default_value',
        'is_required',
        'is_visible',
        'depends_on',
        'validation',
        'order',
        'sort_order',
    ];

    protected $casts = [
        'options' => 'array',
        'depends_on' => 'array',
        'validation' => 'array',
        'is_required' => 'boolean',
        'is_visible' => 'boolean',
    ];

    protected $appends = ['label'];

    public function getLabelAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->label_ar : $this->label_en;
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function dynamicReport(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function getOptionsFromSource(): array
    {
        if (!$this->options_source) {
            return $this->options ?? [];
        }

        // Handle special sources
        if ($this->options_source === 'academic_years') {
            return $this->getAcademicYears();
        }

        if ($this->options_source === 'semesters') {
            return $this->getSemesters();
        }

        // Handle table source
        $parts = explode(':', $this->options_source);
        $table = $parts[0];
        $fields = isset($parts[1]) ? explode(',', $parts[1]) : ['id', 'name'];

        return \DB::table($table)
            ->select($fields)
            ->orderBy($fields[1] ?? $fields[0])
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

    protected function getAcademicYears(): array
    {
        $currentYear = date('Y');
        $years = [];

        for ($i = -5; $i <= 2; $i++) {
            $year = $currentYear + $i;
            $years[] = [
                'value' => "{$year}-" . ($year + 1),
                'label' => "{$year}/" . ($year + 1),
            ];
        }

        return array_reverse($years);
    }

    protected function getSemesters(): array
    {
        $locale = app()->getLocale();

        return [
            ['value' => 'fall', 'label' => $locale === 'ar' ? 'الفصل الأول' : 'Fall Semester'],
            ['value' => 'spring', 'label' => $locale === 'ar' ? 'الفصل الثاني' : 'Spring Semester'],
            ['value' => 'summer', 'label' => $locale === 'ar' ? 'الفصل الصيفي' : 'Summer Semester'],
        ];
    }

    public function castValue($value)
    {
        if ($value === null) {
            return null;
        }

        return match ($this->data_type) {
            'integer' => (int) $value,
            'float', 'decimal' => (float) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'date' => date('Y-m-d', strtotime($value)),
            'datetime' => date('Y-m-d H:i:s', strtotime($value)),
            'array' => is_array($value) ? $value : explode(',', $value),
            default => (string) $value,
        };
    }

    public function validate($value): array
    {
        $errors = [];

        if ($this->is_required && ($value === null || $value === '')) {
            $errors[] = __('validation.required', ['attribute' => $this->label]);
        }

        if ($this->validation) {
            foreach ($this->validation as $rule => $ruleValue) {
                $error = $this->validateRule($value, $rule, $ruleValue);
                if ($error) {
                    $errors[] = $error;
                }
            }
        }

        return $errors;
    }

    protected function validateRule($value, $rule, $ruleValue): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return match ($rule) {
            'min' => $value < $ruleValue ? __('validation.min.numeric', ['attribute' => $this->label, 'min' => $ruleValue]) : null,
            'max' => $value > $ruleValue ? __('validation.max.numeric', ['attribute' => $this->label, 'max' => $ruleValue]) : null,
            'min_length' => strlen($value) < $ruleValue ? __('validation.min.string', ['attribute' => $this->label, 'min' => $ruleValue]) : null,
            'max_length' => strlen($value) > $ruleValue ? __('validation.max.string', ['attribute' => $this->label, 'max' => $ruleValue]) : null,
            'pattern' => !preg_match($ruleValue, $value) ? __('validation.regex', ['attribute' => $this->label]) : null,
            'in' => !in_array($value, (array) $ruleValue) ? __('validation.in', ['attribute' => $this->label]) : null,
            default => null,
        };
    }

    public function getParameterConfig(): array
    {
        return [
            'key' => $this->param_key,
            'field' => $this->field_name,
            'label' => $this->label,
            'type' => $this->input_type,
            'dataType' => $this->data_type,
            'options' => $this->getOptionsFromSource(),
            'default' => $this->default_value,
            'required' => $this->is_required,
            'visible' => $this->is_visible,
            'depends_on' => $this->depends_on,
            'validation' => $this->validation,
        ];
    }
}
