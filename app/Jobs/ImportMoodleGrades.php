<?php

namespace App\Jobs;

use App\Models\MoodleCourse;
use App\Services\MoodleIntegrationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ImportMoodleGrades implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public ?int $moodleCourseId = null,
        public bool $allCourses = false
    ) {}

    public function handle(MoodleIntegrationService $moodleService): void
    {
        if (!$moodleService->isSyncEnabled()) {
            Log::info('Moodle sync disabled, skipping grade import');
            return;
        }

        if ($this->allCourses) {
            $this->importAllCourseGrades($moodleService);
        } elseif ($this->moodleCourseId) {
            $this->importSingleCourseGrades($moodleService);
        } else {
            Log::warning('ImportMoodleGrades: No course specified');
        }
    }

    protected function importSingleCourseGrades(MoodleIntegrationService $moodleService): void
    {
        try {
            $results = $moodleService->importGradesFromMoodle($this->moodleCourseId);

            Log::info('Grades imported from Moodle', [
                'moodle_course_id' => $this->moodleCourseId,
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to import grades from Moodle', [
                'moodle_course_id' => $this->moodleCourseId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    protected function importAllCourseGrades(MoodleIntegrationService $moodleService): void
    {
        $moodleCourses = MoodleCourse::synced()
            ->whereNotNull('moodle_course_id')
            ->get();

        $totalResults = ['success' => 0, 'failed' => 0];

        foreach ($moodleCourses as $moodleCourse) {
            try {
                $results = $moodleService->importGradesFromMoodle($moodleCourse->moodle_course_id);
                $totalResults['success'] += $results['success'];
                $totalResults['failed'] += $results['failed'];
            } catch (\Exception $e) {
                Log::error('Failed to import grades for course', [
                    'moodle_course_id' => $moodleCourse->moodle_course_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('All course grades imported from Moodle', [
            'courses_processed' => $moodleCourses->count(),
            'results' => $totalResults,
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ImportMoodleGrades job failed', [
            'moodle_course_id' => $this->moodleCourseId,
            'all_courses' => $this->allCourses,
            'error' => $exception->getMessage(),
        ]);
    }
}
