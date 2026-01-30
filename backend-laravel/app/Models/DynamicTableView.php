<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicTableView extends Model
{
    use HasFactory;

    protected $fillable = [
        'table_id',
        'user_id',
        'name',
        'is_default',
        'is_shared',
        'visible_columns',
        'column_order',
        'column_widths',
        'filters',
        'sort',
        'page_size',
    ];

    protected $casts = [
        'visible_columns' => 'array',
        'column_order' => 'array',
        'column_widths' => 'array',
        'filters' => 'array',
        'sort' => 'array',
        'is_default' => 'boolean',
        'is_shared' => 'boolean',
    ];

    public function table(): BelongsTo
    {
        return $this->belongsTo(DynamicTable::class, 'table_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhere('is_shared', true);
        });
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function setAsDefault(): void
    {
        // Remove default from other views for this user/table
        self::where('table_id', $this->table_id)
            ->where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_default' => false]);

        $this->is_default = true;
        $this->save();
    }

    public function applyToQuery($query): void
    {
        // Apply saved filters
        if ($this->filters) {
            foreach ($this->filters as $field => $value) {
                if ($value !== null && $value !== '') {
                    $query->where($field, $value);
                }
            }
        }

        // Apply saved sort - SECURITY: Validate sort parameters
        if ($this->sort) {
            $sortDir = strtolower($this->sort['direction'] ?? 'asc');
            if (!in_array($sortDir, ['asc', 'desc'])) {
                $sortDir = 'asc';
            }
            // SECURITY: Sanitize field name
            $field = preg_replace('/[^a-zA-Z0-9_.]/', '', $this->sort['field']);
            if (!empty($field)) {
                $query->orderBy($field, $sortDir);
            }
        }
    }

    public function getViewConfig(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_default' => $this->is_default,
            'is_shared' => $this->is_shared,
            'visible_columns' => $this->visible_columns,
            'column_order' => $this->column_order,
            'column_widths' => $this->column_widths,
            'filters' => $this->filters,
            'sort' => $this->sort,
            'page_size' => $this->page_size,
        ];
    }
}
