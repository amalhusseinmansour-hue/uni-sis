<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DynamicTable;
use App\Models\DynamicTableColumn;
use App\Models\DynamicTableFilter;
use App\Models\DynamicTableView;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DynamicTableController extends Controller
{
    /**
     * Get all tables accessible by the user
     */
    public function index(Request $request): JsonResponse
    {
        $tables = DynamicTable::active()
            ->accessibleBy($request->user())
            ->orderBy('sort_order')
            ->get(['id', 'code', 'name_en', 'name_ar', 'description_en', 'description_ar']);

        return response()->json([
            'success' => true,
            'data' => $tables,
        ]);
    }

    /**
     * Get table configuration by code
     */
    public function show(string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)
            ->with(['columns', 'filters'])
            ->firstOrFail();

        // Get filter options for each filter
        $filtersWithOptions = $table->filters->map(function ($filter) {
            $filterData = $filter->toArray();
            if ($filter->options_source) {
                $filterData['options'] = $filter->getOptionsFromSource();
            }
            return $filterData;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $table->id,
                'code' => $table->code,
                'name' => $table->name,
                'name_en' => $table->name_en,
                'name_ar' => $table->name_ar,
                'description' => $table->description,
                'columns' => $table->columns,
                'filters' => $filtersWithOptions,
                'settings' => [
                    'is_paginated' => $table->is_paginated,
                    'is_searchable' => $table->is_searchable,
                    'is_filterable' => $table->is_filterable,
                    'is_sortable' => $table->is_sortable,
                    'is_exportable' => $table->is_exportable,
                    'export_formats' => $table->export_formats,
                    'show_row_numbers' => $table->show_row_numbers,
                    'show_selection' => $table->show_selection,
                    'default_page_size' => $table->default_page_size,
                    'page_size_options' => $table->page_size_options ?? [10, 25, 50, 100],
                    'bulk_actions' => $table->bulk_actions,
                    'row_actions' => $table->row_actions,
                ],
            ],
        ]);
    }

    /**
     * Fetch table data
     */
    public function data(Request $request, string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)
            ->with('columns')
            ->firstOrFail();

        $params = [
            'search' => $request->search,
            'filters' => $request->filters ?? [],
            'sort' => $request->sort ? [
                'field' => $request->sort,
                'direction' => $request->direction ?? 'asc',
            ] : null,
            'page' => $request->page ?? 1,
            'per_page' => $request->per_page ?? $table->default_page_size ?? 10,
        ];

        $data = $table->fetchData($params);

        // Format data according to column settings
        if ($table->is_paginated) {
            $formattedItems = collect($data->items())->map(function ($row) use ($table) {
                return $this->formatRow($row, $table->columns);
            });

            return response()->json([
                'success' => true,
                'data' => $formattedItems,
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'last_page' => $data->lastPage(),
                    'per_page' => $data->perPage(),
                    'total' => $data->total(),
                ],
            ]);
        }

        $formattedData = collect($data)->map(function ($row) use ($table) {
            return $this->formatRow($row, $table->columns);
        });

        return response()->json([
            'success' => true,
            'data' => $formattedData,
            'meta' => [
                'total' => count($formattedData),
            ],
        ]);
    }

    /**
     * Format row data according to column settings
     */
    protected function formatRow($row, $columns): array
    {
        $formatted = [];
        $rowArray = is_object($row) ? (array) $row : $row;

        foreach ($columns as $column) {
            $value = $rowArray[$column->field_name] ?? null;
            $formatted[$column->column_key] = [
                'raw' => $value,
                'formatted' => $column->formatValue($value),
            ];
        }

        // Include ID for row actions
        if (isset($rowArray['id'])) {
            $formatted['id'] = $rowArray['id'];
        }

        return $formatted;
    }

    /**
     * Store a new table configuration
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:dynamic_tables,code',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'data_source' => 'required|string',
            'columns' => 'required|array|min:1',
            'columns.*.column_key' => 'required|string',
            'columns.*.field_name' => 'required|string',
            'columns.*.header_en' => 'required|string',
            'columns.*.header_ar' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $table = DynamicTable::create([
                'code' => $request->code,
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'description_en' => $request->description_en,
                'description_ar' => $request->description_ar,
                'data_source' => $request->data_source,
                'data_model' => $request->data_model,
                'base_query' => $request->base_query,
                'default_filters' => $request->default_filters,
                'default_sort' => $request->default_sort,
                'default_page_size' => $request->default_page_size ?? 10,
                'page_size_options' => $request->page_size_options ?? [10, 25, 50, 100],
                'is_paginated' => $request->is_paginated ?? true,
                'is_searchable' => $request->is_searchable ?? true,
                'is_filterable' => $request->is_filterable ?? true,
                'is_sortable' => $request->is_sortable ?? true,
                'is_exportable' => $request->is_exportable ?? true,
                'export_formats' => $request->export_formats ?? ['excel', 'csv', 'pdf'],
                'show_row_numbers' => $request->show_row_numbers ?? false,
                'show_selection' => $request->show_selection ?? false,
                'bulk_actions' => $request->bulk_actions,
                'row_actions' => $request->row_actions,
                'settings' => $request->settings,
                'allowed_roles' => $request->allowed_roles,
                'is_active' => $request->is_active ?? true,
                'created_by' => auth()->id(),
            ]);

            // Create columns
            foreach ($request->columns as $index => $column) {
                DynamicTableColumn::create([
                    'table_id' => $table->id,
                    'column_key' => $column['column_key'],
                    'field_name' => $column['field_name'],
                    'header_en' => $column['header_en'],
                    'header_ar' => $column['header_ar'],
                    'data_type' => $column['data_type'] ?? 'string',
                    'format_options' => $column['format_options'] ?? null,
                    'status_colors' => $column['status_colors'] ?? null,
                    'width' => $column['width'] ?? null,
                    'min_width' => $column['min_width'] ?? null,
                    'align' => $column['align'] ?? 'left',
                    'is_visible' => $column['is_visible'] ?? true,
                    'is_sortable' => $column['is_sortable'] ?? true,
                    'is_searchable' => $column['is_searchable'] ?? false,
                    'is_filterable' => $column['is_filterable'] ?? false,
                    'filter_type' => $column['filter_type'] ?? null,
                    'filter_options' => $column['filter_options'] ?? null,
                    'filter_source' => $column['filter_source'] ?? null,
                    'is_exportable' => $column['is_exportable'] ?? true,
                    'is_frozen' => $column['is_frozen'] ?? false,
                    'conditional_styling' => $column['conditional_styling'] ?? null,
                    'sort_order' => $index,
                ]);
            }

            // Create filters if provided
            if ($request->filters) {
                foreach ($request->filters as $index => $filter) {
                    DynamicTableFilter::create([
                        'table_id' => $table->id,
                        'filter_key' => $filter['filter_key'],
                        'field_name' => $filter['field_name'],
                        'label_en' => $filter['label_en'],
                        'label_ar' => $filter['label_ar'],
                        'filter_type' => $filter['filter_type'],
                        'operator' => $filter['operator'] ?? 'equals',
                        'options' => $filter['options'] ?? null,
                        'options_source' => $filter['options_source'] ?? null,
                        'default_value' => $filter['default_value'] ?? null,
                        'is_required' => $filter['is_required'] ?? false,
                        'is_visible' => $filter['is_visible'] ?? true,
                        'depends_on' => $filter['depends_on'] ?? null,
                        'sort_order' => $index,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Table created successfully',
                'data' => $table->load(['columns', 'filters']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create table',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update table configuration
     */
    public function update(Request $request, string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)->firstOrFail();

        try {
            DB::beginTransaction();

            $table->update([
                'name_en' => $request->name_en ?? $table->name_en,
                'name_ar' => $request->name_ar ?? $table->name_ar,
                'description_en' => $request->description_en ?? $table->description_en,
                'description_ar' => $request->description_ar ?? $table->description_ar,
                'data_source' => $request->data_source ?? $table->data_source,
                'data_model' => $request->data_model ?? $table->data_model,
                'base_query' => $request->base_query ?? $table->base_query,
                'default_sort' => $request->default_sort ?? $table->default_sort,
                'is_paginated' => $request->is_paginated ?? $table->is_paginated,
                'is_searchable' => $request->is_searchable ?? $table->is_searchable,
                'is_filterable' => $request->is_filterable ?? $table->is_filterable,
                'is_sortable' => $request->is_sortable ?? $table->is_sortable,
                'is_exportable' => $request->is_exportable ?? $table->is_exportable,
                'bulk_actions' => $request->bulk_actions ?? $table->bulk_actions,
                'row_actions' => $request->row_actions ?? $table->row_actions,
                'is_active' => $request->is_active ?? $table->is_active,
                'updated_by' => auth()->id(),
            ]);

            // Update columns if provided
            if ($request->has('columns')) {
                $table->columns()->delete();
                foreach ($request->columns as $index => $column) {
                    DynamicTableColumn::create([
                        'table_id' => $table->id,
                        'column_key' => $column['column_key'],
                        'field_name' => $column['field_name'],
                        'header_en' => $column['header_en'],
                        'header_ar' => $column['header_ar'],
                        'data_type' => $column['data_type'] ?? 'string',
                        'is_visible' => $column['is_visible'] ?? true,
                        'is_sortable' => $column['is_sortable'] ?? true,
                        'sort_order' => $index,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Table updated successfully',
                'data' => $table->fresh(['columns', 'filters']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update table',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete table
     */
    public function destroy(string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)->firstOrFail();
        $table->delete();

        return response()->json([
            'success' => true,
            'message' => 'Table deleted successfully',
        ]);
    }

    /**
     * Export table data
     */
    public function export(Request $request, string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)
            ->with('columns')
            ->firstOrFail();

        if (!$table->is_exportable) {
            return response()->json([
                'success' => false,
                'message' => 'Export is not enabled for this table',
            ], 403);
        }

        $format = $request->format ?? 'excel';
        $allowedFormats = $table->export_formats ?? ['excel', 'csv', 'pdf'];

        if (!in_array($format, $allowedFormats)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid export format',
            ], 400);
        }

        // Fetch all data without pagination
        $params = [
            'search' => $request->search,
            'filters' => $request->filters ?? [],
            'sort' => $request->sort ? [
                'field' => $request->sort,
                'direction' => $request->direction ?? 'asc',
            ] : null,
        ];

        // Temporarily disable pagination
        $table->is_paginated = false;
        $data = $table->fetchData($params);

        // Export based on format
        $filename = $table->code . '_' . now()->format('Y-m-d_His');

        // Return export URL or file
        return response()->json([
            'success' => true,
            'message' => 'Export generated successfully',
            'data' => [
                'download_url' => "/api/dynamic-tables/{$code}/download/{$filename}.{$format}",
                'row_count' => count($data),
            ],
        ]);
    }

    /**
     * Get user's saved views
     */
    public function views(Request $request, string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)->firstOrFail();

        $views = DynamicTableView::where('table_id', $table->id)
            ->forUser(auth()->id())
            ->get();

        return response()->json([
            'success' => true,
            'data' => $views->map->getViewConfig(),
        ]);
    }

    /**
     * Save a view
     */
    public function saveView(Request $request, string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)->firstOrFail();

        $view = DynamicTableView::updateOrCreate(
            [
                'table_id' => $table->id,
                'user_id' => auth()->id(),
                'name' => $request->name,
            ],
            [
                'visible_columns' => $request->visible_columns,
                'column_order' => $request->column_order,
                'column_widths' => $request->column_widths,
                'filters' => $request->filters,
                'sort' => $request->sort,
                'page_size' => $request->page_size,
                'is_default' => $request->is_default ?? false,
                'is_shared' => $request->is_shared ?? false,
            ]
        );

        if ($request->is_default) {
            $view->setAsDefault();
        }

        return response()->json([
            'success' => true,
            'message' => 'View saved successfully',
            'data' => $view->getViewConfig(),
        ]);
    }

    /**
     * Delete a view
     */
    public function deleteView(string $code, int $viewId): JsonResponse
    {
        $table = DynamicTable::where('code', $code)->firstOrFail();

        DynamicTableView::where('table_id', $table->id)
            ->where('id', $viewId)
            ->where('user_id', auth()->id())
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'View deleted successfully',
        ]);
    }
}
