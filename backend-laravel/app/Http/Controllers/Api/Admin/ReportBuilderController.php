<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DynamicReport;
use App\Models\DynamicReportField;
use App\Models\DynamicReportParameter;
use App\Models\DynamicReportChart;
use App\Models\DynamicReportSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReportBuilderController extends Controller
{
    // Get all reports
    public function index(): JsonResponse
    {
        $reports = DynamicReport::withCount(['fields', 'charts', 'parameters'])
            ->orderBy('name_en')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }

    // Get single report with all relations
    public function show(string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)
            ->with([
                'fields' => fn($q) => $q->orderBy('order'),
                'parameters' => fn($q) => $q->orderBy('order'),
                'charts' => fn($q) => $q->orderBy('order'),
                'schedules',
            ])
            ->first();

        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    // Create or update report
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:100',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'report_type' => 'required|string',
            'data_source' => 'required|array',
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $report = DynamicReport::updateOrCreate(
            ['code' => $request->code],
            [
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'description_en' => $request->description_en,
                'description_ar' => $request->description_ar,
                'category' => $request->category,
                'report_type' => $request->report_type,
                'data_source' => $request->data_source,
                'settings' => $request->settings,
                'roles' => $request->roles,
                'is_active' => $request->is_active ?? true,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $report,
        ], $request->has('id') ? 200 : 201);
    }

    // Delete report
    public function destroy(string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)->first();

        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }

        $report->delete();

        return response()->json(['success' => true, 'message' => 'Report deleted']);
    }

    // Duplicate report
    public function duplicate(string $code): JsonResponse
    {
        $report = DynamicReport::where('code', $code)
            ->with(['fields', 'parameters', 'charts'])
            ->first();

        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }

        $newCode = $code . '_copy_' . Str::random(4);

        DB::beginTransaction();
        try {
            $newReport = $report->replicate();
            $newReport->code = $newCode;
            $newReport->name_en = $report->name_en . ' (Copy)';
            $newReport->name_ar = $report->name_ar . ' (نسخة)';
            $newReport->save();

            foreach ($report->fields as $field) {
                $newField = $field->replicate();
                $newField->dynamic_report_id = $newReport->id;
                $newField->save();
            }

            foreach ($report->parameters as $param) {
                $newParam = $param->replicate();
                $newParam->dynamic_report_id = $newReport->id;
                $newParam->save();
            }

            foreach ($report->charts as $chart) {
                $newChart = $chart->replicate();
                $newChart->dynamic_report_id = $newReport->id;
                $newChart->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $newReport->load(['fields', 'parameters', 'charts']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // FIELDS
    // =========================================================================

    public function saveFields(Request $request, string $reportCode): JsonResponse
    {
        $report = DynamicReport::where('code', $reportCode)->first();

        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }

        $fields = $request->input('fields', []);

        $existingIds = collect($fields)->pluck('id')->filter()->toArray();

        DynamicReportField::where('dynamic_report_id', $report->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        foreach ($fields as $index => $fieldData) {
            $fieldData['dynamic_report_id'] = $report->id;
            $fieldData['order'] = $index;

            if (!empty($fieldData['id'])) {
                DynamicReportField::where('id', $fieldData['id'])->update($fieldData);
            } else {
                unset($fieldData['id']);
                DynamicReportField::create($fieldData);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $report->fields()->orderBy('order')->get(),
        ]);
    }

    // =========================================================================
    // PARAMETERS
    // =========================================================================

    public function saveParameters(Request $request, string $reportCode): JsonResponse
    {
        $report = DynamicReport::where('code', $reportCode)->first();

        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }

        $parameters = $request->input('parameters', []);

        $existingIds = collect($parameters)->pluck('id')->filter()->toArray();

        DynamicReportParameter::where('dynamic_report_id', $report->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        foreach ($parameters as $index => $paramData) {
            $paramData['dynamic_report_id'] = $report->id;
            $paramData['order'] = $index;

            if (!empty($paramData['id'])) {
                DynamicReportParameter::where('id', $paramData['id'])->update($paramData);
            } else {
                unset($paramData['id']);
                DynamicReportParameter::create($paramData);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $report->parameters()->orderBy('order')->get(),
        ]);
    }

    // =========================================================================
    // CHARTS
    // =========================================================================

    public function saveCharts(Request $request, string $reportCode): JsonResponse
    {
        $report = DynamicReport::where('code', $reportCode)->first();

        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }

        $charts = $request->input('charts', []);

        $existingIds = collect($charts)->pluck('id')->filter()->toArray();

        DynamicReportChart::where('dynamic_report_id', $report->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        foreach ($charts as $index => $chartData) {
            $chartData['dynamic_report_id'] = $report->id;
            $chartData['order'] = $index;

            if (!empty($chartData['id'])) {
                DynamicReportChart::where('id', $chartData['id'])->update($chartData);
            } else {
                unset($chartData['id']);
                DynamicReportChart::create($chartData);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $report->charts()->orderBy('order')->get(),
        ]);
    }

    // =========================================================================
    // SCHEDULES
    // =========================================================================

    public function getSchedules(string $reportCode): JsonResponse
    {
        $report = DynamicReport::where('code', $reportCode)->first();

        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report->schedules,
        ]);
    }

    public function saveSchedule(Request $request, string $reportCode): JsonResponse
    {
        $report = DynamicReport::where('code', $reportCode)->first();

        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'cron_expression' => 'required|string',
            'recipients' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $schedule = DynamicReportSchedule::updateOrCreate(
            ['id' => $request->id],
            [
                'dynamic_report_id' => $report->id,
                'name' => $request->name,
                'cron_expression' => $request->cron_expression,
                'timezone' => $request->timezone ?? 'UTC',
                'parameters' => $request->parameters,
                'export_format' => $request->export_format ?? 'pdf',
                'recipients' => $request->recipients,
                'is_active' => $request->is_active ?? true,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $schedule,
        ]);
    }

    public function deleteSchedule(int $id): JsonResponse
    {
        $schedule = DynamicReportSchedule::find($id);

        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'Schedule not found'], 404);
        }

        $schedule->delete();

        return response()->json(['success' => true, 'message' => 'Schedule deleted']);
    }

    // =========================================================================
    // CHART TYPES
    // =========================================================================

    public function getChartTypes(): JsonResponse
    {
        $types = [
            ['type' => 'bar', 'label' => 'Bar Chart', 'icon' => 'bar-chart-2'],
            ['type' => 'line', 'label' => 'Line Chart', 'icon' => 'trending-up'],
            ['type' => 'area', 'label' => 'Area Chart', 'icon' => 'activity'],
            ['type' => 'pie', 'label' => 'Pie Chart', 'icon' => 'pie-chart'],
            ['type' => 'donut', 'label' => 'Donut Chart', 'icon' => 'circle'],
            ['type' => 'radar', 'label' => 'Radar Chart', 'icon' => 'hexagon'],
            ['type' => 'scatter', 'label' => 'Scatter Plot', 'icon' => 'crosshair'],
        ];

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    public function getReportCategories(): JsonResponse
    {
        $categories = DynamicReport::distinct('category')
            ->whereNotNull('category')
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
