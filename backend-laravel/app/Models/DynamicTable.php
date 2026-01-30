<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicTable extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'description_en',
        'description_ar',
        'data_source',
        'data_model',
        'base_query',
        'default_filters',
        'default_sort',
        'default_page_size',
        'page_size_options',
        'is_paginated',
        'is_searchable',
        'is_filterable',
        'is_sortable',
        'is_exportable',
        'export_formats',
        'show_row_numbers',
        'show_selection',
        'bulk_actions',
        'row_actions',
        'settings',
        'allowed_roles',
        'is_active',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'base_query' => 'array',
        'default_filters' => 'array',
        'default_sort' => 'array',
        'page_size_options' => 'array',
        'export_formats' => 'array',
        'bulk_actions' => 'array',
        'row_actions' => 'array',
        'settings' => 'array',
        'allowed_roles' => 'array',
        'is_paginated' => 'boolean',
        'is_searchable' => 'boolean',
        'is_filterable' => 'boolean',
        'is_sortable' => 'boolean',
        'is_exportable' => 'boolean',
        'show_row_numbers' => 'boolean',
        'show_selection' => 'boolean',
        'is_active' => 'boolean',
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

    public function columns(): HasMany
    {
        return $this->hasMany(DynamicTableColumn::class, 'dynamic_table_id')->orderBy('order');
    }

    public function filters(): HasMany
    {
        return $this->hasMany(DynamicTableFilter::class, 'dynamic_table_id')->orderBy('order');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(DynamicTableAction::class, 'dynamic_table_id')->orderBy('order');
    }

    public function views(): HasMany
    {
        return $this->hasMany(DynamicTableView::class, 'dynamic_table_id');
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

    public function getDataQuery()
    {
        if ($this->data_model) {
            $modelClass = $this->data_model;
            if (class_exists($modelClass)) {
                return $modelClass::query();
            }
        }

        return \DB::table($this->data_source);
    }

    public function fetchData(array $params = [])
    {
        $query = $this->getDataQuery();

        // Apply base query conditions
        if ($this->base_query) {
            foreach ($this->base_query as $condition) {
                $query->where($condition['field'], $condition['operator'] ?? '=', $condition['value']);
            }
        }

        // Apply search
        if (!empty($params['search']) && $this->is_searchable) {
            $searchTerm = $params['search'];
            $searchableColumns = $this->columns()->where('is_searchable', true)->pluck('field_name')->toArray();

            $query->where(function ($q) use ($searchTerm, $searchableColumns) {
                foreach ($searchableColumns as $column) {
                    $q->orWhere($column, 'like', "%{$searchTerm}%");
                }
            });
        }

        // Apply filters
        if (!empty($params['filters']) && $this->is_filterable) {
            foreach ($params['filters'] as $field => $value) {
                if ($value !== null && $value !== '') {
                    $filter = $this->filters()->where('filter_key', $field)->first();
                    if ($filter) {
                        $this->applyFilter($query, $filter, $value);
                    }
                }
            }
        }

        // Apply sorting - SECURITY: Validate sort fields to prevent SQL injection
        if (!empty($params['sort']) && $this->is_sortable) {
            $sortField = $params['sort']['field'];
            $sortDir = strtolower($params['sort']['direction'] ?? 'asc');

            // SECURITY: Validate sort direction
            if (!in_array($sortDir, ['asc', 'desc'])) {
                $sortDir = 'asc';
            }

            // SECURITY: Validate sort field against allowed columns
            $allowedColumns = $this->columns ? array_column($this->columns, 'field') : [];
            if (!empty($allowedColumns) && in_array($sortField, $allowedColumns)) {
                $query->orderBy($sortField, $sortDir);
            }
        } elseif ($this->default_sort) {
            foreach ($this->default_sort as $sort) {
                $sortDir = strtolower($sort['direction'] ?? 'asc');
                if (!in_array($sortDir, ['asc', 'desc'])) {
                    $sortDir = 'asc';
                }
                $query->orderBy($sort['field'], $sortDir);
            }
        }

        // Pagination
        if ($this->is_paginated) {
            $perPage = $params['per_page'] ?? $this->default_page_size;
            $page = $params['page'] ?? 1;
            return $query->paginate($perPage, ['*'], 'page', $page);
        }

        return $query->get();
    }

    protected function applyFilter($query, $filter, $value)
    {
        $field = $filter->field_name;
        $operator = $filter->operator;

        match ($operator) {
            'equals' => $query->where($field, $value),
            'not_equals' => $query->where($field, '!=', $value),
            'contains' => $query->where($field, 'like', "%{$value}%"),
            'starts_with' => $query->where($field, 'like', "{$value}%"),
            'ends_with' => $query->where($field, 'like', "%{$value}"),
            'greater_than' => $query->where($field, '>', $value),
            'less_than' => $query->where($field, '<', $value),
            'between' => $query->whereBetween($field, $value),
            'in' => $query->whereIn($field, (array) $value),
            'not_in' => $query->whereNotIn($field, (array) $value),
            'is_null' => $query->whereNull($field),
            'is_not_null' => $query->whereNotNull($field),
            'date_equals' => $query->whereDate($field, $value),
            'date_before' => $query->whereDate($field, '<', $value),
            'date_after' => $query->whereDate($field, '>', $value),
            'date_between' => $query->whereBetween($field, $value),
            default => $query->where($field, $value),
        };
    }

    public function getFullConfiguration(): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'name_en' => $this->name_en,
            'name_ar' => $this->name_ar,
            'description' => $this->description,
            'columns' => $this->columns->map(fn($col) => $col->toArray()),
            'filters' => $this->filters->map(fn($f) => $f->toArray()),
            'settings' => [
                'is_paginated' => $this->is_paginated,
                'is_searchable' => $this->is_searchable,
                'is_filterable' => $this->is_filterable,
                'is_sortable' => $this->is_sortable,
                'is_exportable' => $this->is_exportable,
                'export_formats' => $this->export_formats,
                'show_row_numbers' => $this->show_row_numbers,
                'show_selection' => $this->show_selection,
                'default_page_size' => $this->default_page_size,
                'page_size_options' => $this->page_size_options ?? [10, 25, 50, 100],
                'bulk_actions' => $this->bulk_actions,
                'row_actions' => $this->row_actions,
            ],
        ];
    }
}
