<?php

namespace App\Jobs;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use App\Services\MoodleIntegrationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BulkSyncToMoodle implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 3600; // 1 hour for bulk operations

    public function __construct(
        public string $type,
        public array $ids = [],
        public array $options = []
    ) {}

    public function handle(MoodleIntegrationService $moodleService): void
    {
        if (!$moodleService->isSyncEnabled()) {
            Log::info('Moodle sync disabled, skipping bulk sync', [
                'type' => $this->type,
            ]);
            return;
        }

        Log::info('Starting bulk Moodle sync', [
            'type' => $this->type,
            'count' => count($this->ids) ?: 'all',
        ]);

        $results = match ($this->type) {
            'students' => $this->syncStudents($moodleService),
            'lecturers' => $this->syncLecturers($moodleService),
            'courses' => $this->syncCourses($moodleService),
            'enrollments' => $this->syncEnrollments($moodleService),
            default => ['error' => 'Unknown sync type'],
        };

        Log::info('Bulk Moodle sync completed', [
            'type' => $this->type,
            'results' => $results,
        ]);
    }

    protected function syncStudents(MoodleIntegrationService $moodleService): array
    {
        $query = Student::where('status', 'ACTIVE');

        if (!empty($this->ids)) {
            $query->whereIn('id', $this->ids);
        }

        if ($this->options['only_pending'] ?? false) {
            $query->whereDoesntHave('moodleUser')
                ->orWhereHas('moodleUser', fn ($q) => $q->pending());
        }

        return $moodleService->syncStudents($query->get());
    }

    protected function syncLecturers(MoodleIntegrationService $moodleService): array
    {
        $query = User::where('role', 'LECTURER');

        if (!empty($this->ids)) {
            $query->whereIn('id', $this->ids);
        }

        return $moodleService->syncLecturers($query->get());
    }

    protected function syncCourses(MoodleIntegrationService $moodleService): array
    {
        $query = Course::where('is_active', true);

        if (!empty($this->ids)) {
            $query->whereIn('id', $this->ids);
        }

        if ($this->options['only_pending'] ?? false) {
            $query->whereDoesntHave('moodleCourse')
                ->orWhereHas('moodleCourse', fn ($q) => $q->pending());
        }

        return $moodleService->syncCourses($query->get());
    }

    protected function syncEnrollments(MoodleIntegrationService $moodleService): array
    {
        $query = Enrollment::where('status', 'ENROLLED');

        if (!empty($this->ids)) {
            $query->whereIn('id', $this->ids);
        }

        if (!empty($this->options['semester_id'])) {
            $query->where('semester_id', $this->options['semester_id']);
        }

        if ($this->options['only_pending'] ?? false) {
            $query->whereDoesntHave('moodleEnrollment')
                ->orWhereHas('moodleEnrollment', fn ($q) => $q->pending());
        }

        return $moodleService->syncEnrollments($query->get());
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('BulkSyncToMoodle job failed', [
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);
    }
}
