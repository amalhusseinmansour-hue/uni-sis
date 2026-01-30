<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicReportChart extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_report_id',
        'chart_key',
        'title_en',
        'title_ar',
        'subtitle_en',
        'subtitle_ar',
        'chart_type',
        'data_source',
        'data_field',
        'label_field',
        'group_field',
        'series_field',
        'aggregation',
        'colors',
        'options',
        'show_legend',
        'show_labels',
        'show_grid',
        'legend_position',
        'width',
        'height',
        'position',
        'is_visible',
        'order',
        'sort_order',
    ];

    protected $casts = [
        'colors' => 'array',
        'options' => 'array',
        'is_visible' => 'boolean',
    ];

    protected $appends = ['title'];

    public function getTitleAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $this->title_ar : $this->title_en;
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function dynamicReport(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function generateChartData(array $data): array
    {
        $collection = collect($data);

        $chartData = [
            'key' => $this->chart_key,
            'title' => $this->title,
            'type' => $this->chart_type,
            'options' => $this->getChartOptions(),
        ];

        if ($this->group_field) {
            $grouped = $collection->groupBy($this->group_field);
            $chartData['labels'] = $grouped->keys()->toArray();

            if ($this->series_field) {
                // Multi-series chart
                $chartData['datasets'] = $this->generateMultiSeriesData($collection);
            } else {
                // Single series with aggregation
                $chartData['data'] = $this->aggregateData($grouped);
            }
        } else {
            $chartData['labels'] = $collection->pluck($this->label_field)->toArray();
            $chartData['data'] = $collection->pluck($this->data_field)->toArray();
        }

        $chartData['colors'] = $this->colors ?? $this->getDefaultColors(count($chartData['labels'] ?? []));

        return $chartData;
    }

    protected function aggregateData($grouped): array
    {
        return $grouped->map(function ($items) {
            return match ($this->aggregation) {
                'sum' => $items->sum($this->data_field),
                'avg' => $items->avg($this->data_field),
                'count' => $items->count(),
                'min' => $items->min($this->data_field),
                'max' => $items->max($this->data_field),
                default => $items->sum($this->data_field),
            };
        })->values()->toArray();
    }

    protected function generateMultiSeriesData($collection): array
    {
        $seriesValues = $collection->pluck($this->series_field)->unique()->values();
        $groupValues = $collection->pluck($this->group_field)->unique()->values();

        $datasets = [];
        foreach ($seriesValues as $index => $series) {
            $seriesData = [];
            foreach ($groupValues as $group) {
                $filtered = $collection->where($this->series_field, $series)
                    ->where($this->group_field, $group);

                $seriesData[] = match ($this->aggregation) {
                    'sum' => $filtered->sum($this->data_field),
                    'avg' => $filtered->avg($this->data_field),
                    'count' => $filtered->count(),
                    default => $filtered->sum($this->data_field),
                };
            }

            $datasets[] = [
                'label' => $series,
                'data' => $seriesData,
                'backgroundColor' => $this->colors[$index] ?? $this->getDefaultColors(1)[0],
            ];
        }

        return $datasets;
    }

    protected function getChartOptions(): array
    {
        $baseOptions = [
            'responsive' => true,
            'maintainAspectRatio' => false,
        ];

        $typeOptions = match ($this->chart_type) {
            'pie', 'doughnut' => [
                'plugins' => [
                    'legend' => ['position' => 'right'],
                ],
            ],
            'bar', 'line' => [
                'scales' => [
                    'y' => ['beginAtZero' => true],
                ],
                'plugins' => [
                    'legend' => ['position' => 'top'],
                ],
            ],
            default => [],
        };

        return array_merge($baseOptions, $typeOptions, $this->options ?? []);
    }

    protected function getDefaultColors(int $count): array
    {
        $palette = [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Yellow
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#06B6D4', // Cyan
            '#F97316', // Orange
            '#6366F1', // Indigo
            '#84CC16', // Lime
        ];

        $colors = [];
        for ($i = 0; $i < $count; $i++) {
            $colors[] = $palette[$i % count($palette)];
        }

        return $colors;
    }

    public function getChartConfig(): array
    {
        return [
            'key' => $this->chart_key,
            'title' => $this->title,
            'type' => $this->chart_type,
            'dataField' => $this->data_field,
            'labelField' => $this->label_field,
            'groupField' => $this->group_field,
            'seriesField' => $this->series_field,
            'aggregation' => $this->aggregation,
            'colors' => $this->colors,
            'width' => $this->width,
            'height' => $this->height,
            'position' => $this->position,
        ];
    }
}
