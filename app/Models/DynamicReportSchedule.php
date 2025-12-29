<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicReportSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_report_id',
        'name',
        'cron_expression',
        'timezone',
        'parameters',
        'export_format',
        'recipients',
        'cc_recipients',
        'email_subject',
        'email_body',
        'is_active',
        'last_run_at',
        'next_run_at',
        'last_status',
        'last_error',
        'run_count',
        'created_by',
    ];

    protected $casts = [
        'parameters' => 'array',
        'recipients' => 'array',
        'cc_recipients' => 'array',
        'is_active' => 'boolean',
        'last_run_at' => 'datetime',
        'next_run_at' => 'datetime',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function dynamicReport(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDue($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('next_run_at')
                  ->orWhere('next_run_at', '<=', now());
            });
    }

    public function calculateNextRun(): void
    {
        $cron = new \Cron\CronExpression($this->cron_expression);
        $this->next_run_at = $cron->getNextRunDate(now($this->timezone ?? 'UTC'));
        $this->save();
    }

    public function execute(): bool
    {
        try {
            // Generate the report
            $reportData = $this->report->generateReport($this->parameters ?? []);

            // Export to specified format
            $exportPath = $this->exportReport($reportData);

            // Send email with attachment
            $this->sendEmail($exportPath);

            // Update schedule status
            $this->last_run_at = now();
            $this->last_status = 'success';
            $this->last_error = null;
            $this->run_count = ($this->run_count ?? 0) + 1;
            $this->calculateNextRun();

            return true;
        } catch (\Exception $e) {
            $this->last_run_at = now();
            $this->last_status = 'failed';
            $this->last_error = $e->getMessage();
            $this->save();

            return false;
        }
    }

    protected function exportReport(array $reportData): string
    {
        $format = $this->export_format ?? 'pdf';
        $filename = $this->report->code . '_' . now()->format('Y-m-d_His') . '.' . $format;
        $path = storage_path('app/reports/' . $filename);

        // Ensure directory exists
        if (!file_exists(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }

        // Export based on format
        match ($format) {
            'pdf' => $this->exportToPdf($reportData, $path),
            'excel', 'xlsx' => $this->exportToExcel($reportData, $path),
            'csv' => $this->exportToCsv($reportData, $path),
            default => throw new \Exception("Unsupported export format: {$format}"),
        };

        return $path;
    }

    protected function exportToPdf(array $reportData, string $path): void
    {
        // Use Laravel DomPDF or similar
        // $pdf = \PDF::loadView('reports.template', ['data' => $reportData]);
        // $pdf->save($path);
    }

    protected function exportToExcel(array $reportData, string $path): void
    {
        // Use Laravel Excel
        // Excel::store(new ReportExport($reportData), $path);
    }

    protected function exportToCsv(array $reportData, string $path): void
    {
        $handle = fopen($path, 'w');

        // Write headers
        if (!empty($reportData['data'])) {
            fputcsv($handle, array_keys($reportData['data'][0]));

            // Write data rows
            foreach ($reportData['data'] as $row) {
                fputcsv($handle, $row);
            }
        }

        fclose($handle);
    }

    protected function sendEmail(string $attachmentPath): void
    {
        // \Mail::to($this->recipients)
        //     ->cc($this->cc_recipients ?? [])
        //     ->send(new ScheduledReportMail(
        //         $this->email_subject ?? 'Scheduled Report: ' . $this->report->name,
        //         $this->email_body ?? 'Please find the attached scheduled report.',
        //         $attachmentPath
        //     ));
    }

    public function getScheduleConfig(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'cron' => $this->cron_expression,
            'timezone' => $this->timezone,
            'parameters' => $this->parameters,
            'format' => $this->export_format,
            'recipients' => $this->recipients,
            'is_active' => $this->is_active,
            'last_run' => $this->last_run_at?->toIso8601String(),
            'next_run' => $this->next_run_at?->toIso8601String(),
            'last_status' => $this->last_status,
        ];
    }
}
