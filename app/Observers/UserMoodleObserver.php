<?php

namespace App\Observers;

use App\Jobs\SyncLecturerToMoodle;
use App\Models\User;

class UserMoodleObserver
{
    protected function isSyncEnabled(): bool
    {
        return config('services.moodle.sync_enabled', false)
            && !empty(config('services.moodle.url'))
            && !empty(config('services.moodle.token'));
    }

    public function created(User $user): void
    {
        if ($this->isSyncEnabled() && $user->role === 'LECTURER') {
            SyncLecturerToMoodle::dispatch($user)->onQueue('moodle');
        }
    }

    public function updated(User $user): void
    {
        if (!$this->isSyncEnabled() || $user->role !== 'LECTURER') {
            return;
        }

        // Only sync if relevant fields changed
        $syncFields = ['name', 'email'];
        $changedFields = array_keys($user->getDirty());
        $relevantChanges = array_intersect($syncFields, $changedFields);

        // Also check if role changed to LECTURER
        if ($user->wasChanged('role') && $user->role === 'LECTURER') {
            SyncLecturerToMoodle::dispatch($user)->onQueue('moodle');
            return;
        }

        if (!empty($relevantChanges)) {
            SyncLecturerToMoodle::dispatch($user)->onQueue('moodle');
        }
    }
}
