<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class DashboardWidget extends Model
{
    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'type',
        'component',
        'data_source',
        'settings',
        'styles',
        'size',
        'roles',
        'is_active',
    ];

    protected $casts = [
        'data_source' => 'array',
        'settings' => 'array',
        'styles' => 'array',
        'roles' => 'array',
        'is_active' => 'boolean',
    ];

    // Get widget data
    public function getData(array $params = []): array
    {
        if (!$this->data_source) {
            return [];
        }

        $source = $this->data_source;

        if ($source['type'] === 'query') {
            return $this->executeQuery($source, $params);
        }

        if ($source['type'] === 'api') {
            return ['endpoint' => $source['endpoint'], 'params' => $params];
        }

        if ($source['type'] === 'static') {
            return $source['data'] ?? [];
        }

        return [];
    }

    protected function executeQuery(array $source, array $params): array
    {
        $model = $source['model'] ?? null;
        if (!$model || !class_exists($model)) {
            return [];
        }

        $query = $model::query();

        // Apply filters
        if (!empty($source['filters'])) {
            foreach ($source['filters'] as $filter) {
                $value = $params[$filter['param']] ?? $filter['default'] ?? null;
                if ($value !== null) {
                    $query->where($filter['field'], $filter['operator'] ?? '=', $value);
                }
            }
        }

        // Apply aggregation
        if (!empty($source['aggregation'])) {
            $agg = $source['aggregation'];
            return [
                'value' => $query->{$agg['function']}($agg['field'] ?? '*'),
            ];
        }

        // Apply grouping for charts
        if (!empty($source['group_by'])) {
            return $query->select($source['group_by'], DB::raw('count(*) as count'))
                ->groupBy($source['group_by'])
                ->get()
                ->toArray();
        }

        return $query->limit($source['limit'] ?? 10)->get()->toArray();
    }
}
