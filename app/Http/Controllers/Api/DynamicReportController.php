<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DynamicReport;
use App\Models\DynamicReportField;
use App\Models\DynamicReportParameter;
use App\Models\DynamicReportChart;
use App\Models\DynamicReportSchedule;
use App\Models\DynamicReportLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DynamicReportController extends Controller
{
    /**
     * Get all reports accessible by the user
     */
    public function index(Request $request): JsonResponse
    {
        $reports = DynamicReport::active()
            ->accessibleBy($request->user())
            ->when($request->category, fn($q, $cat) => $q->byCategory($cat))
            ->orderBy('sort_order')
            ->get(['id', 'code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'category', 'report_type']);

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }

    /**
     * Get report categories
     */
    public function categories(): JsonResponse
    {
        $categories = DynamicReport::active()
            ->select('category')
            ->distinct()
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Get report configuration by code
     */
    public function show(string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)
            ->with(['fields', 'reportParameters', 'charts'])
            ->firstOrFail();

        // Get parameter options
        $parametersWithOptions = $report->reportParameters->map(function ($param) {
            $paramData = $param->toArray();
            if ($param->options_source) {
                $paramData['options'] = $param->getOptionsFromSource();
            }
            return $paramData;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $report->id,
                'code' => $report->code,
                'name' => $report->name,
                'name_en' => $report->name_en,
                'name_ar' => $report->name_ar,
                'description' => $report->description,
                'category' => $report->category,
                'report_type' => $report->report_type,
                'fields' => $report->fields,
                'parameters' => $parametersWithOptions,
                'charts' => $report->charts->map->getChartConfig(),
                'layout' => $report->layout,
                'export_formats' => $report->export_formats ?? ['pdf', 'excel'],
                'settings' => [
                    'show_logo' => $report->show_logo,
                    'show_date' => $report->show_date,
                    'show_page_numbers' => $report->show_page_numbers,
                    'page_orientation' => $report->page_orientation,
                    'page_size' => $report->page_size,
                ],
            ],
        ]);
    }

    /**
     * Generate report
     */
    public function generate(Request $request, string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)
            ->with(['fields', 'reportParameters', 'charts'])
            ->firstOrFail();

        // Validate parameters
        $errors = [];
        foreach ($report->reportParameters as $param) {
            $value = $request->get($param->param_key);
            $paramErrors = $param->validate($value);
            if (!empty($paramErrors)) {
                $errors[$param->param_key] = $paramErrors;
            }
        }

        if (!empty($errors)) {
            return response()->json([
                'success' => false,
                'errors' => $errors,
            ], 422);
        }

        // Cast parameter values
        $params = [];
        foreach ($report->reportParameters as $param) {
            $value = $request->get($param->param_key);
            $params[$param->param_key] = $param->castValue($value);
        }

        try {
            $result = $report->generateReport($params);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            // Log failed generation
            DynamicReportLog::logGeneration(
                $report->id,
                auth()->id(),
                $params,
                0,
                0,
                'failed',
                $e->getMessage()
            );

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export report to file
     */
    public function export(Request $request, string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)
            ->with(['fields', 'reportParameters', 'charts'])
            ->firstOrFail();

        $format = $request->format ?? 'pdf';
        $allowedFormats = $report->export_formats ?? ['pdf', 'excel'];

        if (!in_array($format, $allowedFormats)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid export format',
            ], 400);
        }

        // Get parameters
        $params = [];
        foreach ($report->reportParameters as $param) {
            $value = $request->get($param->param_key);
            $params[$param->param_key] = $param->castValue($value);
        }

        try {
            $startTime = microtime(true);
            $result = $report->generateReport($params);
            $executionTime = round((microtime(true) - $startTime) * 1000);

            // Generate export file
            $filename = $report->code . '_' . now()->format('Y-m-d_His') . '.' . $format;
            $path = $this->exportToFormat($result, $report, $format, $filename);
            $fileSize = file_exists($path) ? filesize($path) : 0;

            // Log export
            DynamicReportLog::logGeneration(
                $report->id,
                auth()->id(),
                $params,
                $result['meta']['total_rows'],
                $executionTime,
                'completed',
                null,
                $format,
                $path,
                $fileSize
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'download_url' => "/api/dynamic-reports/{$code}/download/{$filename}",
                    'filename' => $filename,
                    'file_size' => $fileSize,
                    'row_count' => $result['meta']['total_rows'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export report to specified format
     */
    protected function exportToFormat(array $data, DynamicReport $report, string $format, string $filename): string
    {
        $path = storage_path('app/reports/' . $filename);

        // Ensure directory exists
        if (!file_exists(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }

        match ($format) {
            'pdf' => $this->exportToPdf($data, $report, $path),
            'excel', 'xlsx' => $this->exportToExcel($data, $report, $path),
            'csv' => $this->exportToCsv($data, $report, $path),
            default => throw new \Exception("Unsupported format: {$format}"),
        };

        return $path;
    }

    protected function exportToPdf(array $data, DynamicReport $report, string $path): void
    {
        // Implementation would use Laravel DomPDF or similar
    }

    protected function exportToExcel(array $data, DynamicReport $report, string $path): void
    {
        // Implementation would use Laravel Excel
    }

    protected function exportToCsv(array $data, DynamicReport $report, string $path): void
    {
        $handle = fopen($path, 'w');

        // Write headers
        if (!empty($data['data'])) {
            $headers = array_keys($data['data'][0]);
            fputcsv($handle, $headers);

            // Write data rows
            foreach ($data['data'] as $row) {
                fputcsv($handle, $row);
            }
        }

        fclose($handle);
    }

    /**
     * Store a new report configuration
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:dynamic_reports,code',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'report_type' => 'required|string|in:tabular,chart,document,transcript,invoice',
            'data_source_type' => 'required|string|in:query,model,procedure,api',
            'fields' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $report = DynamicReport::create([
                'code' => $request->code,
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'description_en' => $request->description_en,
                'description_ar' => $request->description_ar,
                'category' => $request->category,
                'report_type' => $request->report_type,
                'data_source' => $request->data_source,
                'data_source_type' => $request->data_source_type,
                'query' => $request->query_string,
                'model_class' => $request->model_class,
                'model_relations' => $request->model_relations,
                'parameters' => $request->parameters,
                'default_values' => $request->default_values,
                'grouping' => $request->grouping,
                'aggregations' => $request->aggregations,
                'sorting' => $request->sorting,
                'layout' => $request->layout,
                'template' => $request->template,
                'header' => $request->header,
                'footer' => $request->footer,
                'show_logo' => $request->show_logo ?? true,
                'show_date' => $request->show_date ?? true,
                'show_page_numbers' => $request->show_page_numbers ?? true,
                'page_orientation' => $request->page_orientation ?? 'portrait',
                'page_size' => $request->page_size ?? 'A4',
                'margins' => $request->margins,
                'export_formats' => $request->export_formats ?? ['pdf', 'excel'],
                'allowed_roles' => $request->allowed_roles,
                'is_active' => $request->is_active ?? true,
                'created_by' => auth()->id(),
            ]);

            // Create fields
            foreach ($request->fields as $index => $field) {
                DynamicReportField::create([
                    'report_id' => $report->id,
                    'field_key' => $field['field_key'],
                    'field_name' => $field['field_name'],
                    'header_en' => $field['header_en'],
                    'header_ar' => $field['header_ar'],
                    'data_type' => $field['data_type'] ?? 'string',
                    'format_options' => $field['format_options'] ?? null,
                    'width' => $field['width'] ?? null,
                    'align' => $field['align'] ?? 'left',
                    'is_visible' => $field['is_visible'] ?? true,
                    'is_summary' => $field['is_summary'] ?? false,
                    'summary_function' => $field['summary_function'] ?? null,
                    'conditional_styling' => $field['conditional_styling'] ?? null,
                    'sort_order' => $index,
                ]);
            }

            // Create parameters
            if ($request->report_parameters) {
                foreach ($request->report_parameters as $index => $param) {
                    DynamicReportParameter::create([
                        'report_id' => $report->id,
                        'param_key' => $param['param_key'],
                        'field_name' => $param['field_name'] ?? null,
                        'label_en' => $param['label_en'],
                        'label_ar' => $param['label_ar'],
                        'input_type' => $param['input_type'],
                        'data_type' => $param['data_type'] ?? 'string',
                        'options' => $param['options'] ?? null,
                        'options_source' => $param['options_source'] ?? null,
                        'default_value' => $param['default_value'] ?? null,
                        'is_required' => $param['is_required'] ?? false,
                        'is_visible' => $param['is_visible'] ?? true,
                        'depends_on' => $param['depends_on'] ?? null,
                        'validation' => $param['validation'] ?? null,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Create charts
            if ($request->charts) {
                foreach ($request->charts as $index => $chart) {
                    DynamicReportChart::create([
                        'report_id' => $report->id,
                        'chart_key' => $chart['chart_key'],
                        'title_en' => $chart['title_en'],
                        'title_ar' => $chart['title_ar'],
                        'chart_type' => $chart['chart_type'],
                        'data_field' => $chart['data_field'],
                        'label_field' => $chart['label_field'] ?? null,
                        'group_field' => $chart['group_field'] ?? null,
                        'series_field' => $chart['series_field'] ?? null,
                        'aggregation' => $chart['aggregation'] ?? 'sum',
                        'colors' => $chart['colors'] ?? null,
                        'options' => $chart['options'] ?? null,
                        'width' => $chart['width'] ?? '100%',
                        'height' => $chart['height'] ?? '300px',
                        'position' => $chart['position'] ?? 'after_table',
                        'is_visible' => $chart['is_visible'] ?? true,
                        'sort_order' => $index,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Report created successfully',
                'data' => $report->load(['fields', 'reportParameters', 'charts']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update report configuration
     */
    public function update(Request $request, string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)->firstOrFail();

        try {
            DB::beginTransaction();

            $report->update([
                'name_en' => $request->name_en ?? $report->name_en,
                'name_ar' => $request->name_ar ?? $report->name_ar,
                'description_en' => $request->description_en ?? $report->description_en,
                'description_ar' => $request->description_ar ?? $report->description_ar,
                'category' => $request->category ?? $report->category,
                'query' => $request->query_string ?? $report->query,
                'model_class' => $request->model_class ?? $report->model_class,
                'model_relations' => $request->model_relations ?? $report->model_relations,
                'grouping' => $request->grouping ?? $report->grouping,
                'aggregations' => $request->aggregations ?? $report->aggregations,
                'layout' => $request->layout ?? $report->layout,
                'is_active' => $request->is_active ?? $report->is_active,
                'updated_by' => auth()->id(),
            ]);

            // Update fields if provided
            if ($request->has('fields')) {
                $report->fields()->delete();
                foreach ($request->fields as $index => $field) {
                    DynamicReportField::create([
                        'report_id' => $report->id,
                        'field_key' => $field['field_key'],
                        'field_name' => $field['field_name'],
                        'header_en' => $field['header_en'],
                        'header_ar' => $field['header_ar'],
                        'data_type' => $field['data_type'] ?? 'string',
                        'is_visible' => $field['is_visible'] ?? true,
                        'sort_order' => $index,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Report updated successfully',
                'data' => $report->fresh(['fields', 'reportParameters', 'charts']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete report
     */
    public function destroy(string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)->firstOrFail();
        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully',
        ]);
    }

    /**
     * Get report generation logs
     */
    public function logs(Request $request, string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)->firstOrFail();

        $logs = DynamicReportLog::where('report_id', $report->id)
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Get report statistics
     */
    public function stats(string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)->firstOrFail();

        $stats = DynamicReportLog::getReportStats($report->id, 30);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get report schedules
     */
    public function schedules(string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)->firstOrFail();

        $schedules = DynamicReportSchedule::where('report_id', $report->id)
            ->with('createdBy:id,name')
            ->get()
            ->map->getScheduleConfig();

        return response()->json([
            'success' => true,
            'data' => $schedules,
        ]);
    }

    /**
     * Create or update schedule
     */
    public function saveSchedule(Request $request, string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'cron_expression' => 'required|string',
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'email',
            'export_format' => 'required|string|in:pdf,excel,csv',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $schedule = DynamicReportSchedule::updateOrCreate(
            [
                'report_id' => $report->id,
                'id' => $request->schedule_id,
            ],
            [
                'name' => $request->name,
                'cron_expression' => $request->cron_expression,
                'timezone' => $request->timezone ?? 'UTC',
                'parameters' => $request->parameters ?? [],
                'export_format' => $request->export_format,
                'recipients' => $request->recipients,
                'cc_recipients' => $request->cc_recipients ?? [],
                'email_subject' => $request->email_subject,
                'email_body' => $request->email_body,
                'is_active' => $request->is_active ?? true,
                'created_by' => auth()->id(),
            ]
        );

        $schedule->calculateNextRun();

        return response()->json([
            'success' => true,
            'message' => 'Schedule saved successfully',
            'data' => $schedule->getScheduleConfig(),
        ]);
    }

    /**
     * Delete schedule
     */
    public function deleteSchedule(string $code, int $scheduleId): JsonResponse
    {
        $report = DynamicReport::where('code', $code)->firstOrFail();

        DynamicReportSchedule::where('report_id', $report->id)
            ->where('id', $scheduleId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Schedule deleted successfully',
        ]);
    }

    /**
     * Toggle schedule status
     */
    public function toggleSchedule(string $code, int $scheduleId): JsonResponse
    {
        $report = DynamicReport::where('code', $code)->firstOrFail();

        $schedule = DynamicReportSchedule::where('report_id', $report->id)
            ->where('id', $scheduleId)
            ->firstOrFail();

        $schedule->is_active = !$schedule->is_active;
        $schedule->save();

        if ($schedule->is_active) {
            $schedule->calculateNextRun();
        }

        return response()->json([
            'success' => true,
            'message' => $schedule->is_active ? 'Schedule activated' : 'Schedule deactivated',
            'data' => $schedule->getScheduleConfig(),
        ]);
    }
}
