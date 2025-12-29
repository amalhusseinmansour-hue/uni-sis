<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class DynamicReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'description_en',
        'description_ar',
        'category',
        'report_type',
        'data_source',
        'data_source_type',
        'query',
        'model_class',
        'model_relations',
        'parameters',
        'default_values',
        'grouping',
        'aggregations',
        'sorting',
        'layout',
        'template',
        'header',
        'footer',
        'show_logo',
        'show_date',
        'show_page_numbers',
        'page_orientation',
        'page_size',
        'margins',
        'export_formats',
        'is_scheduled',
        'schedule_cron',
        'schedule_recipients',
        'allowed_roles',
        'permissions',
        'is_active',
        'is_public',
        'cache_duration',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'model_relations' => 'array',
        'parameters' => 'array',
        'default_values' => 'array',
        'grouping' => 'array',
        'aggregations' => 'array',
        'sorting' => 'array',
        'layout' => 'array',
        'header' => 'array',
        'footer' => 'array',
        'margins' => 'array',
        'export_formats' => 'array',
        'schedule_recipients' => 'array',
        'allowed_roles' => 'array',
        'permissions' => 'array',
        'show_logo' => 'boolean',
        'show_date' => 'boolean',
        'show_page_numbers' => 'boolean',
        'is_scheduled' => 'boolean',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
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
        return $this->hasMany(DynamicReportField::class, 'dynamic_report_id')->orderBy('order');
    }

    public function reportParameters(): HasMany
    {
        return $this->hasMany(DynamicReportParameter::class, 'dynamic_report_id')->orderBy('order');
    }

    public function charts(): HasMany
    {
        return $this->hasMany(DynamicReportChart::class, 'dynamic_report_id')->orderBy('order');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(DynamicReportSchedule::class, 'dynamic_report_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(DynamicReportLog::class, 'dynamic_report_id');
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

    public function generateReport(array $params = []): array
    {
        $startTime = microtime(true);

        // Merge default values with provided parameters
        $params = array_merge($this->default_values ?? [], $params);

        // Get data based on source type
        $data = match ($this->data_source_type) {
            'query' => $this->executeRawQuery($params),
            'model' => $this->executeModelQuery($params),
            'procedure' => $this->executeProcedure($params),
            'api' => $this->fetchFromApi($params),
            default => [],
        };

        // Apply grouping if configured
        if ($this->grouping) {
            $data = $this->applyGrouping($data);
        }

        // Calculate aggregations
        $aggregations = [];
        if ($this->aggregations) {
            $aggregations = $this->calculateAggregations($data);
        }

        // Format fields
        $formattedData = $this->formatData($data);

        // Prepare charts data if needed
        $chartsData = [];
        if ($this->charts->count() > 0) {
            $chartsData = $this->prepareChartsData($data);
        }

        $executionTime = round((microtime(true) - $startTime) * 1000);

        // Log report generation
        $this->logs()->create([
            'user_id' => auth()->id(),
            'parameters' => $params,
            'row_count' => count($data),
            'execution_time' => $executionTime,
            'status' => 'completed',
        ]);

        return [
            'data' => $formattedData,
            'aggregations' => $aggregations,
            'charts' => $chartsData,
            'meta' => [
                'total_rows' => count($data),
                'execution_time' => $executionTime,
                'generated_at' => now()->toIso8601String(),
                'parameters' => $params,
            ],
        ];
    }

    protected function executeRawQuery(array $params): array
    {
        $query = $this->query;

        // Replace parameters in query
        foreach ($params as $key => $value) {
            $query = str_replace(":{$key}", DB::getPdo()->quote($value), $query);
        }

        return DB::select($query);
    }

    protected function executeModelQuery(array $params): array
    {
        if (!$this->model_class || !class_exists($this->model_class)) {
            return [];
        }

        $modelClass = $this->model_class;
        $query = $modelClass::query();

        // Eager load relations
        if ($this->model_relations) {
            $query->with($this->model_relations);
        }

        // Apply parameter filters
        foreach ($this->reportParameters as $param) {
            $value = $params[$param->param_key] ?? null;
            if ($value !== null && $param->field_name) {
                $query->where($param->field_name, $value);
            }
        }

        // Apply sorting
        if ($this->sorting) {
            foreach ($this->sorting as $sort) {
                $query->orderBy($sort['field'], $sort['direction'] ?? 'asc');
            }
        }

        return $query->get()->toArray();
    }

    protected function executeProcedure(array $params): array
    {
        $procedure = $this->data_source;
        $paramsList = array_values($params);
        $placeholders = implode(',', array_fill(0, count($paramsList), '?'));

        return DB::select("CALL {$procedure}({$placeholders})", $paramsList);
    }

    protected function fetchFromApi(array $params): array
    {
        // Implement API fetching logic
        return [];
    }

    protected function applyGrouping(array $data): array
    {
        $groupField = $this->grouping['field'] ?? null;
        if (!$groupField) {
            return $data;
        }

        $grouped = collect($data)->groupBy($groupField);

        return $grouped->map(function ($items, $key) {
            return [
                'group' => $key,
                'items' => $items->toArray(),
                'count' => $items->count(),
            ];
        })->values()->toArray();
    }

    protected function calculateAggregations(array $data): array
    {
        $collection = collect($data);
        $results = [];

        foreach ($this->aggregations as $agg) {
            $field = $agg['field'];
            $function = $agg['function'];
            $label = $agg['label'] ?? "{$function}_{$field}";

            $results[$label] = match ($function) {
                'sum' => $collection->sum($field),
                'avg' => $collection->avg($field),
                'count' => $collection->count(),
                'min' => $collection->min($field),
                'max' => $collection->max($field),
                default => null,
            };
        }

        return $results;
    }

    protected function formatData(array $data): array
    {
        return collect($data)->map(function ($row) {
            $formatted = [];
            foreach ($this->fields as $field) {
                $value = data_get($row, $field->field_name);
                $formatted[$field->field_key] = $field->formatValue($value);
            }
            return $formatted;
        })->toArray();
    }

    protected function prepareChartsData(array $data): array
    {
        $collection = collect($data);
        $chartsData = [];

        foreach ($this->charts as $chart) {
            $chartData = [
                'key' => $chart->chart_key,
                'title' => $chart->title,
                'type' => $chart->chart_type,
                'options' => $chart->options,
            ];

            if ($chart->group_field) {
                $grouped = $collection->groupBy($chart->group_field);
                $chartData['labels'] = $grouped->keys()->toArray();
                $chartData['data'] = $grouped->map(fn($items) => $items->sum($chart->data_field))->values()->toArray();
            } else {
                $chartData['labels'] = $collection->pluck($chart->label_field)->toArray();
                $chartData['data'] = $collection->pluck($chart->data_field)->toArray();
            }

            $chartData['colors'] = $chart->colors;
            $chartsData[] = $chartData;
        }

        return $chartsData;
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
            'category' => $this->category,
            'report_type' => $this->report_type,
            'fields' => $this->fields->map(fn($f) => $f->toArray()),
            'parameters' => $this->reportParameters->map(fn($p) => $p->toArray()),
            'charts' => $this->charts->map(fn($c) => $c->toArray()),
            'layout' => $this->layout,
            'export_formats' => $this->export_formats ?? ['pdf', 'excel'],
            'settings' => [
                'show_logo' => $this->show_logo,
                'show_date' => $this->show_date,
                'show_page_numbers' => $this->show_page_numbers,
                'page_orientation' => $this->page_orientation,
                'page_size' => $this->page_size,
            ],
        ];
    }
}
