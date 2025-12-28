<?php

namespace App\Observers;

use App\Models\Grade;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class GradeObserver
{
    /**
     * Handle the Grade "created" event.
     */
    public function created(Grade $grade): void
    {
        $this->notifyStudent($grade, 'created');
    }

    /**
     * Handle the Grade "updated" event.
     */
    public function updated(Grade $grade): void
    {
        // Only notify if the grade value changed
        if ($grade->isDirty(['grade', 'letter_grade', 'points'])) {
            $this->notifyStudent($grade, 'updated');
        }
    }

    /**
     * Notify student about grade
     */
    private function notifyStudent(Grade $grade, string $action): void
    {
        try {
            $enrollment = $grade->enrollment;
            if (!$enrollment) return;

            $student = $enrollment->student;
            if (!$student || !$student->user) return;

            $course = $enrollment->course;
            $courseName = $course ? $course->name : 'Unknown Course';
            $gradeValue = $grade->letter_grade ?? $grade->grade ?? 'N/A';

            NotificationService::notifyNewGrade(
                $student->user,
                $courseName,
                $gradeValue
            );
        } catch (\Exception $e) {
            Log::error('Failed to send grade notification: ' . $e->getMessage());
        }
    }
}
