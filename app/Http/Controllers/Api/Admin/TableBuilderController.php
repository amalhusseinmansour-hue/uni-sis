<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DynamicTable;
use App\Models\DynamicTableColumn;
use App\Models\DynamicTableFilter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TableBuilderController extends Controller
{
    // Get all tables
    public function index(): JsonResponse
    {
        $tables = DynamicTable::withCount(['columns', 'filters'])
            ->orderBy('name_en')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tables,
        ]);
    }

    // Get single table with all relations
    public function show(string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)
            ->with([
                'columns' => fn($q) => $q->orderBy('order'),
                'filters' => fn($q) => $q->orderBy('order'),
            ])
            ->first();

        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $table,
        ]);
    }

    // Create or update table
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:100',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'model_class' => 'nullable|string',
            'api_endpoint' => 'nullable|string',
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $table = DynamicTable::updateOrCreate(
            ['code' => $request->code],
            [
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'description_en' => $request->description_en,
                'description_ar' => $request->description_ar,
                'model_class' => $request->model_class,
                'api_endpoint' => $request->api_endpoint,
                'settings' => $request->settings,
                'roles' => $request->roles,
                'is_active' => $request->is_active ?? true,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $table,
        ], $request->has('id') ? 200 : 201);
    }

    // Delete table
    public function destroy(string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)->first();

        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        $table->delete();

        return response()->json(['success' => true, 'message' => 'Table deleted']);
    }

    // Duplicate table
    public function duplicate(string $code): JsonResponse
    {
        $table = DynamicTable::where('code', $code)
            ->with(['columns', 'filters'])
            ->first();

        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        $newCode = $code . '_copy_' . Str::random(4);

        DB::beginTransaction();
        try {
            $newTable = $table->replicate();
            $newTable->code = $newCode;
            $newTable->name_en = $table->name_en . ' (Copy)';
            $newTable->name_ar = $table->name_ar . ' (نسخة)';
            $newTable->save();

            foreach ($table->columns as $column) {
                $newColumn = $column->replicate();
                $newColumn->dynamic_table_id = $newTable->id;
                $newColumn->save();
            }

            foreach ($table->filters as $filter) {
                $newFilter = $filter->replicate();
                $newFilter->dynamic_table_id = $newTable->id;
                $newFilter->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $newTable->load(['columns', 'filters']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // COLUMNS
    // =========================================================================

    public function getColumns(string $tableCode): JsonResponse
    {
        $table = DynamicTable::where('code', $tableCode)->first();

        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        $columns = $table->columns()->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data' => $columns,
        ]);
    }

    public function saveColumns(Request $request, string $tableCode): JsonResponse
    {
        $table = DynamicTable::where('code', $tableCode)->first();

        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        $columns = $request->input('columns', []);

        // Get existing column IDs
        $existingIds = collect($columns)->pluck('id')->filter()->toArray();

        // Delete removed columns
        DynamicTableColumn::where('dynamic_table_id', $table->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        // Update or create columns
        foreach ($columns as $index => $columnData) {
            $columnData['dynamic_table_id'] = $table->id;
            $columnData['order'] = $index;

            if (!empty($columnData['id'])) {
                DynamicTableColumn::where('id', $columnData['id'])->update($columnData);
            } else {
                unset($columnData['id']);
                DynamicTableColumn::create($columnData);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $table->columns()->orderBy('order')->get(),
        ]);
    }

    public function deleteColumn(int $id): JsonResponse
    {
        $column = DynamicTableColumn::find($id);

        if (!$column) {
            return response()->json(['success' => false, 'message' => 'Column not found'], 404);
        }

        $column->delete();

        return response()->json(['success' => true, 'message' => 'Column deleted']);
    }

    // =========================================================================
    // FILTERS
    // =========================================================================

    public function getFilters(string $tableCode): JsonResponse
    {
        $table = DynamicTable::where('code', $tableCode)->first();

        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        $filters = $table->filters()->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data' => $filters,
        ]);
    }

    public function saveFilters(Request $request, string $tableCode): JsonResponse
    {
        $table = DynamicTable::where('code', $tableCode)->first();

        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        $filters = $request->input('filters', []);

        // Get existing filter IDs
        $existingIds = collect($filters)->pluck('id')->filter()->toArray();

        // Delete removed filters
        DynamicTableFilter::where('dynamic_table_id', $table->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        // Update or create filters
        foreach ($filters as $index => $filterData) {
            $filterData['dynamic_table_id'] = $table->id;
            $filterData['order'] = $index;

            if (!empty($filterData['id'])) {
                DynamicTableFilter::where('id', $filterData['id'])->update($filterData);
            } else {
                unset($filterData['id']);
                DynamicTableFilter::create($filterData);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $table->filters()->orderBy('order')->get(),
        ]);
    }

    public function deleteFilter(int $id): JsonResponse
    {
        $filter = DynamicTableFilter::find($id);

        if (!$filter) {
            return response()->json(['success' => false, 'message' => 'Filter not found'], 404);
        }

        $filter->delete();

        return response()->json(['success' => true, 'message' => 'Filter deleted']);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    // Get available models
    public function getAvailableModels(): JsonResponse
    {
        $models = [
            ['class' => 'App\\Models\\Student', 'name' => 'Student'],
            ['class' => 'App\\Models\\User', 'name' => 'User'],
            ['class' => 'App\\Models\\Course', 'name' => 'Course'],
            ['class' => 'App\\Models\\Program', 'name' => 'Program'],
            ['class' => 'App\\Models\\Department', 'name' => 'Department'],
            ['class' => 'App\\Models\\College', 'name' => 'College'],
            ['class' => 'App\\Models\\Enrollment', 'name' => 'Enrollment'],
            ['class' => 'App\\Models\\Grade', 'name' => 'Grade'],
            ['class' => 'App\\Models\\AdmissionApplication', 'name' => 'Admission Application'],
            ['class' => 'App\\Models\\FinancialRecord', 'name' => 'Financial Record'],
            ['class' => 'App\\Models\\ServiceRequest', 'name' => 'Service Request'],
            ['class' => 'App\\Models\\Announcement', 'name' => 'Announcement'],
        ];

        return response()->json([
            'success' => true,
            'data' => $models,
        ]);
    }

    // Get model fields
    public function getModelFields(Request $request): JsonResponse
    {
        $modelClass = $request->query('model');

        if (!$modelClass || !class_exists($modelClass)) {
            return response()->json(['success' => false, 'message' => 'Invalid model'], 400);
        }

        try {
            $model = new $modelClass;
            $table = $model->getTable();

            $columns = DB::select("SHOW COLUMNS FROM {$table}");

            $fields = collect($columns)->map(function ($column) {
                return [
                    'field' => $column->Field,
                    'type' => $this->mapMySQLType($column->Type),
                    'nullable' => $column->Null === 'YES',
                    'key' => $column->Key,
                    'default' => $column->Default,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $fields,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    protected function mapMySQLType(string $type): string
    {
        if (str_contains($type, 'int')) return 'number';
        if (str_contains($type, 'decimal') || str_contains($type, 'float') || str_contains($type, 'double')) return 'decimal';
        if (str_contains($type, 'date') && !str_contains($type, 'datetime')) return 'date';
        if (str_contains($type, 'datetime') || str_contains($type, 'timestamp')) return 'datetime';
        if (str_contains($type, 'time')) return 'time';
        if (str_contains($type, 'tinyint(1)') || str_contains($type, 'boolean')) return 'boolean';
        if (str_contains($type, 'text') || str_contains($type, 'json')) return 'text';
        if (str_contains($type, 'enum')) return 'enum';

        return 'string';
    }
}
