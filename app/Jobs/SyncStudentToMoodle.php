<?php

namespace App\Jobs;

use App\Models\Student;
use App\Services\MoodleIntegrationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncStudentToMoodle implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Student $student
    ) {}

    public function handle(MoodleIntegrationService $moodleService): void
    {
        if (!$moodleService->isSyncEnabled()) {
            Log::info('Moodle sync disabled, skipping student sync', [
                'student_id' => $this->student->id,
            ]);
            return;
        }

        try {
            $moodleService->syncStudent($this->student);

            Log::info('Student synced to Moodle via job', [
                'student_id' => $this->student->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to sync student to Moodle', [
                'student_id' => $this->student->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncStudentToMoodle job failed permanently', [
            'student_id' => $this->student->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
