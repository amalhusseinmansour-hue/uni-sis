<?php

namespace App\Observers;

use App\Jobs\SyncEnrollmentToMoodle;
use App\Models\Enrollment;

class EnrollmentMoodleObserver
{
    protected function isSyncEnabled(): bool
    {
        return config('services.moodle.sync_enabled', false)
            && !empty(config('services.moodle.url'))
            && !empty(config('services.moodle.token'));
    }

    public function created(Enrollment $enrollment): void
    {
        if ($this->isSyncEnabled() && $enrollment->status === 'ENROLLED') {
            SyncEnrollmentToMoodle::dispatch($enrollment)->onQueue('moodle');
        }
    }

    public function updated(Enrollment $enrollment): void
    {
        if (!$this->isSyncEnabled()) {
            return;
        }

        // Always sync if status changed (for enroll/unenroll)
        if ($enrollment->wasChanged('status')) {
            SyncEnrollmentToMoodle::dispatch($enrollment)->onQueue('moodle');
        }
    }
}
