<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\MoodleIntegrationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncLecturerToMoodle implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public User $lecturer
    ) {}

    public function handle(MoodleIntegrationService $moodleService): void
    {
        if (!$moodleService->isSyncEnabled()) {
            Log::info('Moodle sync disabled, skipping lecturer sync', [
                'user_id' => $this->lecturer->id,
            ]);
            return;
        }

        if ($this->lecturer->role !== 'LECTURER') {
            Log::warning('User is not a lecturer, skipping sync', [
                'user_id' => $this->lecturer->id,
                'role' => $this->lecturer->role,
            ]);
            return;
        }

        try {
            $moodleService->syncLecturer($this->lecturer);

            Log::info('Lecturer synced to Moodle via job', [
                'user_id' => $this->lecturer->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to sync lecturer to Moodle', [
                'user_id' => $this->lecturer->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncLecturerToMoodle job failed permanently', [
            'user_id' => $this->lecturer->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
