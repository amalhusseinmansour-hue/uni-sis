<?php

namespace App\Observers;

use App\Jobs\SyncCourseToMoodle;
use App\Models\Course;

class CourseMoodleObserver
{
    protected function isSyncEnabled(): bool
    {
        return config('services.moodle.sync_enabled', false)
            && !empty(config('services.moodle.url'))
            && !empty(config('services.moodle.token'));
    }

    public function created(Course $course): void
    {
        if ($this->isSyncEnabled() && ($course->is_active ?? true)) {
            SyncCourseToMoodle::dispatch($course)->onQueue('moodle');
        }
    }

    public function updated(Course $course): void
    {
        if (!$this->isSyncEnabled()) {
            return;
        }

        // Only sync if relevant fields changed
        $syncFields = [
            'code',
            'name_en',
            'name_ar',
            'description',
            'is_active',
            'department_id',
        ];

        $changedFields = array_keys($course->getDirty());
        $relevantChanges = array_intersect($syncFields, $changedFields);

        if (!empty($relevantChanges)) {
            SyncCourseToMoodle::dispatch($course)->onQueue('moodle');
        }
    }
}
