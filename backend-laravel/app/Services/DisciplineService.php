<?php

namespace App\Services;

use App\Models\DisciplineIncident;
use App\Models\DisciplineAction;
use App\Models\DisciplinePoints;
use App\Models\DisciplineAppeal;
use App\Models\Student;
use App\Models\Semester;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class DisciplineService
{
    /**
     * Report a new discipline incident
     */
    public function reportIncident(array $data): DisciplineIncident
    {
        return DB::transaction(function () use ($data) {
            // Create the incident
            $incident = DisciplineIncident::create([
                'student_id' => $data['student_id'],
                'reported_by' => auth()->id(),
                'semester_id' => $data['semester_id'] ?? Semester::getCurrentSemester()?->id,
                'type' => $data['type'],
                'type_other' => $data['type_other'] ?? null,
                'severity' => $data['severity'],
                'incident_date' => $data['incident_date'],
                'incident_time' => $data['incident_time'] ?? null,
                'location' => $data['location'] ?? null,
                'description' => $data['description'],
                'description_ar' => $data['description_ar'] ?? null,
                'witnesses' => $data['witnesses'] ?? null,
                'evidence' => $data['evidence'] ?? null,
                'status' => 'REPORTED',
            ]);

            // Update points
            $this->updateStudentPoints($incident->student_id, $incident->semester_id);

            // Send notification to student
            $this->notifyStudent($incident);

            return $incident->fresh(['student', 'reporter', 'semester']);
        });
    }

    /**
     * Update an incident
     */
    public function updateIncident(DisciplineIncident $incident, array $data): DisciplineIncident
    {
        $incident->update($data);

        if (isset($data['status']) && $data['status'] === 'CONFIRMED') {
            $this->updateStudentPoints($incident->student_id, $incident->semester_id);
        }

        return $incident->fresh(['student', 'reporter', 'semester', 'actions']);
    }

    /**
     * Start investigation on an incident
     */
    public function startInvestigation(DisciplineIncident $incident): DisciplineIncident
    {
        $incident->update([
            'status' => 'INVESTIGATING',
            'investigated_by' => auth()->id(),
        ]);

        return $incident->fresh();
    }

    /**
     * Complete investigation and confirm incident
     */
    public function confirmIncident(DisciplineIncident $incident, array $data): DisciplineIncident
    {
        return DB::transaction(function () use ($incident, $data) {
            $incident->update([
                'status' => 'CONFIRMED',
                'investigation_notes' => $data['investigation_notes'] ?? null,
                'investigation_completed_at' => now(),
            ]);

            // Update severity and points if changed
            if (isset($data['severity'])) {
                $incident->severity = $data['severity'];
                $incident->points = $incident->calculatePoints();
                $incident->save();
            }

            // Update points record
            $this->updateStudentPoints($incident->student_id, $incident->semester_id);

            return $incident->fresh();
        });
    }

    /**
     * Dismiss an incident
     */
    public function dismissIncident(DisciplineIncident $incident, string $reason): DisciplineIncident
    {
        $incident->update([
            'status' => 'DISMISSED',
            'resolution_notes' => $reason,
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
        ]);

        return $incident->fresh();
    }

    /**
     * Resolve an incident
     */
    public function resolveIncident(DisciplineIncident $incident, string $notes = null): DisciplineIncident
    {
        $incident->update([
            'status' => 'RESOLVED',
            'resolution_notes' => $notes,
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
        ]);

        return $incident->fresh();
    }

    /**
     * Assign disciplinary action
     */
    public function assignAction(DisciplineIncident $incident, array $data): DisciplineAction
    {
        return DB::transaction(function () use ($incident, $data) {
            $action = DisciplineAction::create([
                'incident_id' => $incident->id,
                'student_id' => $incident->student_id,
                'assigned_by' => auth()->id(),
                'action_type' => $data['action_type'],
                'action_type_other' => $data['action_type_other'] ?? null,
                'action_date' => $data['action_date'] ?? now()->toDateString(),
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'duration_days' => $data['duration_days'] ?? null,
                'description' => $data['description'],
                'description_ar' => $data['description_ar'] ?? null,
                'status' => $data['status'] ?? 'PENDING',
                'is_appealable' => $data['is_appealable'] ?? true,
            ]);

            // Notify student of action
            $this->notifyStudentOfAction($action);

            return $action->fresh(['incident', 'student', 'assignedBy']);
        });
    }

    /**
     * Complete an action
     */
    public function completeAction(DisciplineAction $action, string $notes = null): DisciplineAction
    {
        $action->markAsCompleted(auth()->id(), $notes);

        // Check if all actions for incident are completed
        $incident = $action->incident;
        if ($incident && !$incident->actions()->whereIn('status', ['PENDING', 'ACTIVE'])->exists()) {
            $this->resolveIncident($incident, 'All actions completed');
        }

        return $action->fresh();
    }

    /**
     * Cancel an action
     */
    public function cancelAction(DisciplineAction $action, string $reason = null): DisciplineAction
    {
        $action->update([
            'status' => 'CANCELLED',
            'completion_notes' => $reason,
        ]);

        return $action->fresh();
    }

    /**
     * Submit an appeal
     */
    public function submitAppeal(array $data): DisciplineAppeal
    {
        $appeal = DisciplineAppeal::create([
            'incident_id' => $data['incident_id'] ?? null,
            'action_id' => $data['action_id'] ?? null,
            'student_id' => $data['student_id'],
            'submitted_by' => auth()->id(),
            'appeal_type' => $data['appeal_type'],
            'reason' => $data['reason'],
            'reason_ar' => $data['reason_ar'] ?? null,
            'supporting_documents' => $data['supporting_documents'] ?? null,
            'submission_deadline' => $data['submission_deadline'] ?? now()->addDays(14),
            'status' => 'SUBMITTED',
        ]);

        // Update incident status if applicable
        if ($appeal->incident) {
            $appeal->incident->update(['status' => 'APPEALED']);
        }

        return $appeal->fresh(['incident', 'action', 'student']);
    }

    /**
     * Review and decide on appeal
     */
    public function reviewAppeal(DisciplineAppeal $appeal, array $data): DisciplineAppeal
    {
        $status = $data['status'];
        $reviewerId = auth()->id();

        switch ($status) {
            case 'APPROVED':
                $appeal->approve(
                    $reviewerId,
                    $data['decision'],
                    $data['points_reduced'] ?? 0,
                    $data['review_notes'] ?? null
                );
                break;

            case 'PARTIALLY_APPROVED':
                $appeal->partiallyApprove(
                    $reviewerId,
                    $data['decision'],
                    $data['points_reduced'] ?? 0,
                    $data['action_modified'] ?? false,
                    $data['modified_action_details'] ?? null,
                    $data['review_notes'] ?? null
                );
                break;

            case 'REJECTED':
                $appeal->reject(
                    $reviewerId,
                    $data['decision'],
                    $data['review_notes'] ?? null
                );
                break;
        }

        // Notify student of decision
        $this->notifyStudentOfAppealDecision($appeal);

        return $appeal->fresh(['incident', 'action', 'student', 'reviewer']);
    }

    /**
     * Get student discipline summary
     */
    public function getStudentSummary(Student $student, ?int $semesterId = null): array
    {
        $semesterId = $semesterId ?? Semester::getCurrentSemester()?->id;

        $points = DisciplinePoints::getOrCreateForStudent($student->id, $semesterId);

        $incidents = DisciplineIncident::byStudent($student->id)
            ->when($semesterId, fn($q) => $q->where('semester_id', $semesterId))
            ->with(['actions', 'appeals'])
            ->latest('incident_date')
            ->get();

        $activeActions = DisciplineAction::byStudent($student->id)
            ->currentlyInEffect()
            ->with('incident')
            ->get();

        $pendingAppeals = DisciplineAppeal::byStudent($student->id)
            ->pending()
            ->with(['incident', 'action'])
            ->get();

        return [
            'student' => $student->only(['id', 'student_id', 'name_en', 'name_ar']),
            'points' => [
                'total' => $points->total_points,
                'active' => $points->active_points,
                'status' => $points->status,
                'status_display' => $points->status_display,
                'status_display_ar' => $points->status_display_ar,
                'status_color' => $points->status_color,
                'points_to_next_threshold' => $points->points_to_next_threshold,
                'next_threshold_name' => $points->next_threshold_name,
            ],
            'incidents_count' => $incidents->count(),
            'incidents_by_status' => $incidents->groupBy('status')->map->count(),
            'incidents_by_severity' => $incidents->groupBy('severity')->map->count(),
            'active_actions_count' => $activeActions->count(),
            'pending_appeals_count' => $pendingAppeals->count(),
            'recent_incidents' => $incidents->take(5)->map(fn($i) => [
                'id' => $i->id,
                'incident_number' => $i->incident_number,
                'type' => $i->type,
                'type_display' => $i->type_display,
                'type_display_ar' => $i->type_display_ar,
                'severity' => $i->severity,
                'points' => $i->points,
                'incident_date' => $i->incident_date->format('Y-m-d'),
                'status' => $i->status,
            ]),
            'active_actions' => $activeActions->map(fn($a) => [
                'id' => $a->id,
                'action_type' => $a->action_type,
                'action_type_display' => $a->action_type_display,
                'action_type_display_ar' => $a->action_type_display_ar,
                'start_date' => $a->start_date?->format('Y-m-d'),
                'end_date' => $a->end_date?->format('Y-m-d'),
                'remaining_days' => $a->remaining_days,
            ]),
        ];
    }

    /**
     * Get discipline statistics
     */
    public function getStatistics(?int $semesterId = null): array
    {
        // Get current semester ID if not provided
        if ($semesterId === null) {
            $currentSemester = Semester::getCurrentSemester();
            $semesterId = $currentSemester?->id;
        }

        // Base query for incidents
        $baseQuery = DisciplineIncident::query();
        if ($semesterId) {
            $baseQuery->where('semester_id', $semesterId);
        }

        return [
            'total_incidents' => (clone $baseQuery)->count(),
            'by_status' => [
                'reported' => (clone $baseQuery)->where('status', 'REPORTED')->count(),
                'investigating' => (clone $baseQuery)->where('status', 'INVESTIGATING')->count(),
                'confirmed' => (clone $baseQuery)->where('status', 'CONFIRMED')->count(),
                'resolved' => (clone $baseQuery)->where('status', 'RESOLVED')->count(),
                'dismissed' => (clone $baseQuery)->where('status', 'DISMISSED')->count(),
                'appealed' => (clone $baseQuery)->where('status', 'APPEALED')->count(),
            ],
            'by_severity' => [
                'minor' => (clone $baseQuery)->where('severity', 'MINOR')->count(),
                'moderate' => (clone $baseQuery)->where('severity', 'MODERATE')->count(),
                'major' => (clone $baseQuery)->where('severity', 'MAJOR')->count(),
                'severe' => (clone $baseQuery)->where('severity', 'SEVERE')->count(),
            ],
            'by_type' => (clone $baseQuery)
                ->selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'students_on_warning' => DisciplinePoints::query()
                ->when($semesterId, fn($q) => $q->where('semester_id', $semesterId))
                ->whereIn('status', ['WARNING_1', 'WARNING_2'])
                ->count(),
            'students_on_probation' => DisciplinePoints::query()
                ->when($semesterId, fn($q) => $q->where('semester_id', $semesterId))
                ->where('status', 'PROBATION')
                ->count(),
            'students_critical' => DisciplinePoints::query()
                ->when($semesterId, fn($q) => $q->where('semester_id', $semesterId))
                ->where('status', 'CRITICAL')
                ->count(),
            'pending_appeals' => DisciplineAppeal::pending()->count(),
            'semester_id' => $semesterId,
        ];
    }

    /**
     * Update student discipline points
     */
    protected function updateStudentPoints(int $studentId, ?int $semesterId = null): void
    {
        $points = DisciplinePoints::getOrCreateForStudent($studentId, $semesterId);
        $points->recalculateFromIncidents();
    }

    /**
     * Notify student about incident
     */
    protected function notifyStudent(DisciplineIncident $incident): void
    {
        $student = $incident->student;
        if (!$student || !$student->user_id) {
            return;
        }

        Notification::create([
            'user_id' => $student->user_id,
            'type' => 'DISCIPLINE_INCIDENT',
            'title' => 'Discipline Incident Reported',
            'title_ar' => 'تم الإبلاغ عن مخالفة سلوكية',
            'message' => "A {$incident->severity_display} discipline incident has been reported against you.",
            'message_ar' => "تم الإبلاغ عن مخالفة سلوكية {$incident->severity_display_ar} ضدك.",
            'data' => [
                'incident_id' => $incident->id,
                'incident_number' => $incident->incident_number,
                'type' => $incident->type,
            ],
        ]);
    }

    /**
     * Notify student about action
     */
    protected function notifyStudentOfAction(DisciplineAction $action): void
    {
        $student = $action->student;
        if (!$student || !$student->user_id) {
            return;
        }

        Notification::create([
            'user_id' => $student->user_id,
            'type' => 'DISCIPLINE_ACTION',
            'title' => 'Disciplinary Action Assigned',
            'title_ar' => 'تم إصدار إجراء تأديبي',
            'message' => "A disciplinary action ({$action->action_type_display}) has been assigned to you.",
            'message_ar' => "تم إصدار إجراء تأديبي ({$action->action_type_display_ar}) ضدك.",
            'data' => [
                'action_id' => $action->id,
                'incident_id' => $action->incident_id,
                'action_type' => $action->action_type,
            ],
        ]);
    }

    /**
     * Notify student about appeal decision
     */
    protected function notifyStudentOfAppealDecision(DisciplineAppeal $appeal): void
    {
        $student = $appeal->student;
        if (!$student || !$student->user_id) {
            return;
        }

        Notification::create([
            'user_id' => $student->user_id,
            'type' => 'DISCIPLINE_APPEAL_DECISION',
            'title' => "Appeal {$appeal->status_display}",
            'title_ar' => "الاستئناف {$appeal->status_display_ar}",
            'message' => "Your appeal #{$appeal->appeal_number} has been {$appeal->status_display}.",
            'message_ar' => "تم {$appeal->status_display_ar} استئنافك رقم #{$appeal->appeal_number}.",
            'data' => [
                'appeal_id' => $appeal->id,
                'appeal_number' => $appeal->appeal_number,
                'status' => $appeal->status,
            ],
        ]);
    }
}
