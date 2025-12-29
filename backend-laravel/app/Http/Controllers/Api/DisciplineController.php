<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DisciplineIncident;
use App\Models\DisciplineAction;
use App\Models\DisciplineAppeal;
use App\Models\DisciplinePoints;
use App\Models\Student;
use App\Services\DisciplineService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class DisciplineController extends Controller
{
    public function __construct(
        protected DisciplineService $disciplineService
    ) {}

    // ==========================================
    // INCIDENTS
    // ==========================================

    /**
     * List all incidents
     */
    public function indexIncidents(Request $request): JsonResponse
    {
        $query = DisciplineIncident::with(['student', 'reporter', 'semester', 'actions'])
            ->when($request->student_id, fn($q, $v) => $q->where('student_id', $v))
            ->when($request->semester_id, fn($q, $v) => $q->where('semester_id', $v))
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->severity, fn($q, $v) => $q->where('severity', $v))
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->when($request->date_from, fn($q, $v) => $q->where('incident_date', '>=', $v))
            ->when($request->date_to, fn($q, $v) => $q->where('incident_date', '<=', $v))
            ->latest('incident_date');

        $perPage = $request->per_page ?? 15;

        return response()->json($query->paginate($perPage));
    }

    /**
     * Get single incident
     */
    public function showIncident(DisciplineIncident $incident): JsonResponse
    {
        return response()->json(
            $incident->load(['student', 'reporter', 'semester', 'investigator', 'resolver', 'actions.assignedBy', 'appeals'])
        );
    }

    /**
     * Report new incident
     */
    public function storeIncident(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'type' => ['required', Rule::in([
                'TARDINESS', 'ABSENCE', 'ACADEMIC_DISHONESTY', 'MISCONDUCT',
                'DRESS_CODE', 'PROPERTY_DAMAGE', 'BULLYING', 'SUBSTANCE_ABUSE',
                'VIOLENCE', 'HARASSMENT', 'THEFT', 'OTHER'
            ])],
            'type_other' => 'nullable|string|max:255',
            'severity' => ['required', Rule::in(['MINOR', 'MODERATE', 'MAJOR', 'SEVERE'])],
            'incident_date' => 'required|date',
            'incident_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
            'description' => 'required|string',
            'description_ar' => 'nullable|string',
            'witnesses' => 'nullable|array',
            'evidence' => 'nullable|array',
        ]);

        $incident = $this->disciplineService->reportIncident($validated);

        return response()->json([
            'message' => 'Incident reported successfully',
            'message_ar' => 'تم الإبلاغ عن المخالفة بنجاح',
            'incident' => $incident,
        ], 201);
    }

    /**
     * Update incident
     */
    public function updateIncident(Request $request, DisciplineIncident $incident): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['nullable', Rule::in([
                'TARDINESS', 'ABSENCE', 'ACADEMIC_DISHONESTY', 'MISCONDUCT',
                'DRESS_CODE', 'PROPERTY_DAMAGE', 'BULLYING', 'SUBSTANCE_ABUSE',
                'VIOLENCE', 'HARASSMENT', 'THEFT', 'OTHER'
            ])],
            'type_other' => 'nullable|string|max:255',
            'severity' => ['nullable', Rule::in(['MINOR', 'MODERATE', 'MAJOR', 'SEVERE'])],
            'incident_date' => 'nullable|date',
            'incident_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'witnesses' => 'nullable|array',
            'evidence' => 'nullable|array',
        ]);

        $incident = $this->disciplineService->updateIncident($incident, $validated);

        return response()->json([
            'message' => 'Incident updated successfully',
            'message_ar' => 'تم تحديث المخالفة بنجاح',
            'incident' => $incident,
        ]);
    }

    /**
     * Start investigation
     */
    public function startInvestigation(DisciplineIncident $incident): JsonResponse
    {
        if ($incident->status !== 'REPORTED') {
            return response()->json([
                'message' => 'Only reported incidents can be investigated',
                'message_ar' => 'يمكن التحقيق فقط في المخالفات المبلغ عنها',
            ], 422);
        }

        $incident = $this->disciplineService->startInvestigation($incident);

        return response()->json([
            'message' => 'Investigation started',
            'message_ar' => 'بدأ التحقيق',
            'incident' => $incident,
        ]);
    }

    /**
     * Confirm incident after investigation
     */
    public function confirmIncident(Request $request, DisciplineIncident $incident): JsonResponse
    {
        $validated = $request->validate([
            'severity' => ['nullable', Rule::in(['MINOR', 'MODERATE', 'MAJOR', 'SEVERE'])],
            'investigation_notes' => 'nullable|string',
        ]);

        $incident = $this->disciplineService->confirmIncident($incident, $validated);

        return response()->json([
            'message' => 'Incident confirmed',
            'message_ar' => 'تم تأكيد المخالفة',
            'incident' => $incident,
        ]);
    }

    /**
     * Dismiss incident
     */
    public function dismissIncident(Request $request, DisciplineIncident $incident): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $incident = $this->disciplineService->dismissIncident($incident, $validated['reason']);

        return response()->json([
            'message' => 'Incident dismissed',
            'message_ar' => 'تم رفض المخالفة',
            'incident' => $incident,
        ]);
    }

    /**
     * Resolve incident
     */
    public function resolveIncident(Request $request, DisciplineIncident $incident): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $incident = $this->disciplineService->resolveIncident($incident, $validated['notes'] ?? null);

        return response()->json([
            'message' => 'Incident resolved',
            'message_ar' => 'تم حل المخالفة',
            'incident' => $incident,
        ]);
    }

    /**
     * Delete incident
     */
    public function destroyIncident(DisciplineIncident $incident): JsonResponse
    {
        $incident->delete();

        return response()->json([
            'message' => 'Incident deleted',
            'message_ar' => 'تم حذف المخالفة',
        ]);
    }

    // ==========================================
    // ACTIONS
    // ==========================================

    /**
     * List all actions
     */
    public function indexActions(Request $request): JsonResponse
    {
        $query = DisciplineAction::with(['student', 'incident', 'assignedBy'])
            ->when($request->student_id, fn($q, $v) => $q->where('student_id', $v))
            ->when($request->incident_id, fn($q, $v) => $q->where('incident_id', $v))
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->action_type, fn($q, $v) => $q->where('action_type', $v))
            ->when($request->active_only, fn($q) => $q->currentlyInEffect())
            ->latest('action_date');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    /**
     * Get single action
     */
    public function showAction(DisciplineAction $action): JsonResponse
    {
        return response()->json(
            $action->load(['student', 'incident.reporter', 'assignedBy', 'completedBy', 'appeals'])
        );
    }

    /**
     * Assign action to incident
     */
    public function storeAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'incident_id' => 'required|exists:discipline_incidents,id',
            'action_type' => ['required', Rule::in([
                'VERBAL_WARNING', 'WRITTEN_WARNING', 'PARENT_CONFERENCE', 'DETENTION',
                'COMMUNITY_SERVICE', 'SUSPENSION', 'PROBATION', 'RESTRICTION',
                'COUNSELING', 'EXPULSION', 'OTHER'
            ])],
            'action_type_other' => 'nullable|string|max:255',
            'action_date' => 'nullable|date',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'duration_days' => 'nullable|integer|min:1',
            'description' => 'required|string',
            'description_ar' => 'nullable|string',
            'status' => ['nullable', Rule::in(['PENDING', 'ACTIVE'])],
            'is_appealable' => 'nullable|boolean',
        ]);

        $incident = DisciplineIncident::findOrFail($validated['incident_id']);
        $action = $this->disciplineService->assignAction($incident, $validated);

        return response()->json([
            'message' => 'Action assigned successfully',
            'message_ar' => 'تم إصدار الإجراء بنجاح',
            'action' => $action,
        ], 201);
    }

    /**
     * Update action
     */
    public function updateAction(Request $request, DisciplineAction $action): JsonResponse
    {
        $validated = $request->validate([
            'action_type' => ['nullable', Rule::in([
                'VERBAL_WARNING', 'WRITTEN_WARNING', 'PARENT_CONFERENCE', 'DETENTION',
                'COMMUNITY_SERVICE', 'SUSPENSION', 'PROBATION', 'RESTRICTION',
                'COUNSELING', 'EXPULSION', 'OTHER'
            ])],
            'action_type_other' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'duration_days' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
        ]);

        $action->update($validated);

        return response()->json([
            'message' => 'Action updated successfully',
            'message_ar' => 'تم تحديث الإجراء بنجاح',
            'action' => $action->fresh(['student', 'incident', 'assignedBy']),
        ]);
    }

    /**
     * Activate action
     */
    public function activateAction(DisciplineAction $action): JsonResponse
    {
        $action->activate();

        return response()->json([
            'message' => 'Action activated',
            'message_ar' => 'تم تفعيل الإجراء',
            'action' => $action->fresh(),
        ]);
    }

    /**
     * Complete action
     */
    public function completeAction(Request $request, DisciplineAction $action): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $action = $this->disciplineService->completeAction($action, $validated['notes'] ?? null);

        return response()->json([
            'message' => 'Action completed',
            'message_ar' => 'تم إكمال الإجراء',
            'action' => $action,
        ]);
    }

    /**
     * Cancel action
     */
    public function cancelAction(Request $request, DisciplineAction $action): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $action = $this->disciplineService->cancelAction($action, $validated['reason'] ?? null);

        return response()->json([
            'message' => 'Action cancelled',
            'message_ar' => 'تم إلغاء الإجراء',
            'action' => $action,
        ]);
    }

    // ==========================================
    // APPEALS
    // ==========================================

    /**
     * List all appeals
     */
    public function indexAppeals(Request $request): JsonResponse
    {
        $query = DisciplineAppeal::with(['student', 'incident', 'action', 'submitter', 'reviewer'])
            ->when($request->student_id, fn($q, $v) => $q->where('student_id', $v))
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->pending_only, fn($q) => $q->pending())
            ->latest();

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    /**
     * Get single appeal
     */
    public function showAppeal(DisciplineAppeal $appeal): JsonResponse
    {
        return response()->json(
            $appeal->load(['student', 'incident.reporter', 'action.assignedBy', 'submitter', 'reviewer'])
        );
    }

    /**
     * Submit appeal
     */
    public function storeAppeal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'incident_id' => 'nullable|exists:discipline_incidents,id',
            'action_id' => 'nullable|exists:discipline_actions,id',
            'student_id' => 'required|exists:students,id',
            'appeal_type' => ['required', Rule::in([
                'INCIDENT_DISPUTE', 'ACTION_REDUCTION', 'POINTS_REDUCTION', 'FULL_DISMISSAL'
            ])],
            'reason' => 'required|string',
            'reason_ar' => 'nullable|string',
            'supporting_documents' => 'nullable|array',
        ]);

        // Verify student can submit appeal
        if ($validated['action_id']) {
            $action = DisciplineAction::findOrFail($validated['action_id']);
            if (!$action->canBeAppealed()) {
                return response()->json([
                    'message' => 'This action cannot be appealed',
                    'message_ar' => 'لا يمكن استئناف هذا الإجراء',
                ], 422);
            }
        }

        $appeal = $this->disciplineService->submitAppeal($validated);

        return response()->json([
            'message' => 'Appeal submitted successfully',
            'message_ar' => 'تم تقديم الاستئناف بنجاح',
            'appeal' => $appeal,
        ], 201);
    }

    /**
     * Review appeal
     */
    public function reviewAppeal(Request $request, DisciplineAppeal $appeal): JsonResponse
    {
        if (!$appeal->isPending()) {
            return response()->json([
                'message' => 'Appeal already processed',
                'message_ar' => 'تم معالجة الاستئناف مسبقاً',
            ], 422);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED'])],
            'decision' => 'required|string',
            'decision_ar' => 'nullable|string',
            'review_notes' => 'nullable|string',
            'points_reduced' => 'nullable|integer|min:0',
            'action_modified' => 'nullable|boolean',
            'modified_action_details' => 'nullable|string',
        ]);

        $appeal = $this->disciplineService->reviewAppeal($appeal, $validated);

        return response()->json([
            'message' => 'Appeal reviewed successfully',
            'message_ar' => 'تم مراجعة الاستئناف بنجاح',
            'appeal' => $appeal,
        ]);
    }

    /**
     * Withdraw appeal (by student)
     */
    public function withdrawAppeal(DisciplineAppeal $appeal): JsonResponse
    {
        if (!$appeal->isPending()) {
            return response()->json([
                'message' => 'Appeal cannot be withdrawn',
                'message_ar' => 'لا يمكن سحب الاستئناف',
            ], 422);
        }

        $appeal->withdraw();

        return response()->json([
            'message' => 'Appeal withdrawn',
            'message_ar' => 'تم سحب الاستئناف',
            'appeal' => $appeal->fresh(),
        ]);
    }

    // ==========================================
    // POINTS
    // ==========================================

    /**
     * Get student points summary
     */
    public function getStudentPoints(Student $student, Request $request): JsonResponse
    {
        $semesterId = $request->semester_id;
        $points = DisciplinePoints::getOrCreateForStudent($student->id, $semesterId);

        return response()->json($points);
    }

    /**
     * Get points history for student
     */
    public function getStudentPointsHistory(Student $student): JsonResponse
    {
        $pointsHistory = DisciplinePoints::byStudent($student->id)
            ->with('semester')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pointsHistory);
    }

    // ==========================================
    // STUDENT VIEWS
    // ==========================================

    /**
     * Get my discipline record (for student)
     */
    public function myRecord(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found',
                'message_ar' => 'لم يتم العثور على الملف الشخصي للطالب',
            ], 404);
        }

        return response()->json(
            $this->disciplineService->getStudentSummary($student)
        );
    }

    /**
     * Get my incidents (for student)
     */
    public function myIncidents(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found',
            ], 404);
        }

        $incidents = DisciplineIncident::byStudent($student->id)
            ->with(['actions', 'appeals'])
            ->latest('incident_date')
            ->paginate($request->per_page ?? 15);

        return response()->json($incidents);
    }

    /**
     * Get my actions (for student)
     */
    public function myActions(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found',
            ], 404);
        }

        $actions = DisciplineAction::byStudent($student->id)
            ->with(['incident'])
            ->latest('action_date')
            ->paginate($request->per_page ?? 15);

        return response()->json($actions);
    }

    /**
     * Get my appeals (for student)
     */
    public function myAppeals(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found',
            ], 404);
        }

        $appeals = DisciplineAppeal::byStudent($student->id)
            ->with(['incident', 'action', 'reviewer'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($appeals);
    }

    // ==========================================
    // STATISTICS
    // ==========================================

    /**
     * Get discipline statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        return response()->json(
            $this->disciplineService->getStatistics($request->semester_id)
        );
    }

    /**
     * Get student summary
     */
    public function studentSummary(Student $student, Request $request): JsonResponse
    {
        return response()->json(
            $this->disciplineService->getStudentSummary($student, $request->semester_id)
        );
    }
}
