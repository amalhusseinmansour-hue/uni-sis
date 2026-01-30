<?php

namespace App\Observers;

use App\Jobs\SyncStudentToMoodle;
use App\Models\Student;

class StudentMoodleObserver
{
    protected function isSyncEnabled(): bool
    {
        return config('services.moodle.sync_enabled', false)
            && !empty(config('services.moodle.url'))
            && !empty(config('services.moodle.token'));
    }

    public function created(Student $student): void
    {
        if ($this->isSyncEnabled() && $student->status === 'ACTIVE') {
            SyncStudentToMoodle::dispatch($student)->onQueue('moodle');
        }
    }

    public function updated(Student $student): void
    {
        if (!$this->isSyncEnabled()) {
            return;
        }

        // Only sync if relevant fields changed
        $syncFields = [
            'name_en',
            'name_ar',
            'first_name_en',
            'last_name_en',
            'university_email',
            'personal_email',
            'status',
            'program_id',
        ];

        $changedFields = array_keys($student->getDirty());
        $relevantChanges = array_intersect($syncFields, $changedFields);

        if (!empty($relevantChanges)) {
            SyncStudentToMoodle::dispatch($student)->onQueue('moodle');
        }
    }
}
