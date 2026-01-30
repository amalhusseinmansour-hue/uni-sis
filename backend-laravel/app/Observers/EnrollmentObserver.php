<?php

namespace App\Observers;

use App\Models\Enrollment;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class EnrollmentObserver
{
    /**
     * Handle the Enrollment "created" event.
     */
    public function created(Enrollment $enrollment): void
    {
        $this->notifyStudent($enrollment, 'ENROLLED');
    }

    /**
     * Handle the Enrollment "updated" event.
     */
    public function updated(Enrollment $enrollment): void
    {
        // Check if status changed
        if ($enrollment->isDirty('status')) {
            $status = strtoupper($enrollment->status);
            $this->notifyStudent($enrollment, $status);
        }
    }

    /**
     * Notify student about enrollment status
     */
    private function notifyStudent(Enrollment $enrollment, string $status): void
    {
        try {
            $student = $enrollment->student;
            if (!$student || !$student->user) return;

            $course = $enrollment->course;
            $courseName = $course ? ($course->name ?? $course->code) : 'Unknown Course';

            NotificationService::notifyEnrollmentStatus(
                $student->user,
                $courseName,
                $status
            );
        } catch (\Exception $e) {
            Log::error('Failed to send enrollment notification: ' . $e->getMessage());
        }
    }
}
