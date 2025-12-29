<?php

namespace App\Jobs;

use App\Models\Enrollment;
use App\Services\MoodleIntegrationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncEnrollmentToMoodle implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Enrollment $enrollment
    ) {}

    public function handle(MoodleIntegrationService $moodleService): void
    {
        if (!$moodleService->isSyncEnabled()) {
            Log::info('Moodle sync disabled, skipping enrollment sync', [
                'enrollment_id' => $this->enrollment->id,
            ]);
            return;
        }

        try {
            $moodleService->syncEnrollment($this->enrollment);

            Log::info('Enrollment synced to Moodle via job', [
                'enrollment_id' => $this->enrollment->id,
                'status' => $this->enrollment->status,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to sync enrollment to Moodle', [
                'enrollment_id' => $this->enrollment->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncEnrollmentToMoodle job failed permanently', [
            'enrollment_id' => $this->enrollment->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
