<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'description_en',
        'description_ar',
        'category',
        'target_table',
        'target_model',
        'settings',
        'validation_rules',
        'workflow',
        'is_active',
        'requires_auth',
        'allowed_roles',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'settings' => 'array',
        'validation_rules' => 'array',
        'workflow' => 'array',
        'allowed_roles' => 'array',
        'is_active' => 'boolean',
        'requires_auth' => 'boolean',
    ];

    protected $appends = ['name', 'description'];

    public function getNameAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->name_ar : $this->name_en;
    }

    public function getDescriptionAttribute(): ?string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->description_ar : $this->description_en;
    }

    public function fields(): HasMany
    {
        return $this->hasMany(DynamicFormField::class, 'dynamic_form_id')->orderBy('order');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(DynamicFormSection::class, 'dynamic_form_id')->orderBy('order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(DynamicFormSubmission::class, 'dynamic_form_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeAccessibleBy($query, $user)
    {
        if ($user->hasRole('super_admin')) {
            return $query;
        }

        return $query->where(function ($q) use ($user) {
            $q->whereNull('allowed_roles')
              ->orWhereJsonContains('allowed_roles', $user->roles->pluck('name')->toArray());
        });
    }

    public function getFieldsGroupedBySections(): array
    {
        $sections = $this->sections->keyBy('section_key')->toArray();
        $fields = $this->fields->groupBy('section');

        $grouped = [];
        foreach ($sections as $key => $section) {
            $section['fields'] = $fields[$key] ?? [];
            $grouped[$key] = $section;
        }

        // Fields without section
        if (isset($fields[''])) {
            $grouped['_default'] = [
                'section_key' => '_default',
                'title_en' => 'General',
                'title_ar' => 'عام',
                'fields' => $fields['']->toArray(),
            ];
        }

        return $grouped;
    }

    public function generateValidationRules(): array
    {
        $rules = [];
        foreach ($this->fields as $field) {
            $fieldRules = [];

            if ($field->is_required) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            if ($field->validation) {
                $fieldRules = array_merge($fieldRules, $field->validation);
            }

            if ($field->is_unique) {
                $fieldRules[] = "unique:{$this->target_table},{$field->field_name}";
            }

            $rules[$field->field_key] = $fieldRules;
        }

        return $rules;
    }
}
