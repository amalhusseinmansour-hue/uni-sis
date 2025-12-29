<?php

namespace App\Jobs;

use App\Models\Course;
use App\Services\MoodleIntegrationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncCourseToMoodle implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Course $course
    ) {}

    public function handle(MoodleIntegrationService $moodleService): void
    {
        if (!$moodleService->isSyncEnabled()) {
            Log::info('Moodle sync disabled, skipping course sync', [
                'course_id' => $this->course->id,
            ]);
            return;
        }

        try {
            $moodleService->syncCourse($this->course);

            Log::info('Course synced to Moodle via job', [
                'course_id' => $this->course->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to sync course to Moodle', [
                'course_id' => $this->course->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncCourseToMoodle job failed permanently', [
            'course_id' => $this->course->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
