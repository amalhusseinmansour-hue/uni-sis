<?php

namespace App\Services;

use App\Models\StudentRequestForm;
use App\Models\StudentRequestApproval;
use Illuminate\Support\Facades\DB;

class StudentRequestWorkflowService
{
    /**
     * تقديم الطلب وبدء تدفق الموافقات
     */
    public function submitRequest(StudentRequestForm $request): void
    {
        DB::transaction(function () use ($request) {
            // تحديث حالة الطلب
            $request->update([
                'status' => 'SUBMITTED',
                'submitted_at' => now(),
            ]);

            // إنشاء خطوات الموافقة
            $this->createApprovalSteps($request);

            // تحديث الحالة للخطوة الأولى
            $this->updateStatusForCurrentStep($request);
        });
    }

    /**
     * إنشاء خطوات الموافقة
     */
    protected function createApprovalSteps(StudentRequestForm $request): void
    {
        $workflow = $request->getWorkflow();

        foreach ($workflow as $index => $role) {
            $roleInfo = StudentRequestForm::APPROVAL_ROLES[$role] ?? [
                'name_ar' => $role,
                'name_en' => $role,
            ];

            StudentRequestApproval::create([
                'student_request_form_id' => $request->id,
                'step_number' => $index + 1,
                'approver_role' => $role,
                'approver_title_ar' => $roleInfo['name_ar'],
                'approver_title_en' => $roleInfo['name_en'],
                'status' => 'PENDING',
            ]);
        }

        $request->update([
            'current_approval_step' => 1,
        ]);
    }

    /**
     * تحديث حالة الطلب بناءً على الخطوة الحالية
     */
    protected function updateStatusForCurrentStep(StudentRequestForm $request): void
    {
        $currentApproval = $request->approvals()
            ->where('step_number', $request->current_approval_step)
            ->first();

        if (!$currentApproval) {
            return;
        }

        $statusMap = [
            'DEPT_HEAD' => 'PENDING_DEPT',
            'CURRENT_DEPT_HEAD' => 'PENDING_DEPT',
            'NEW_DEPT_HEAD' => 'PENDING_DEPT',
            'DEAN' => 'PENDING_DEAN',
            'ACADEMIC_AFFAIRS' => 'PENDING_ACADEMIC',
            'STUDENT_AFFAIRS' => 'PENDING_STUDENT_AFFAIRS',
            'FINANCE' => 'PENDING_FINANCE',
            'ADMISSIONS' => 'PENDING_ADMISSIONS',
            'COURSE_INSTRUCTOR' => 'UNDER_REVIEW',
        ];

        $status = $statusMap[$currentApproval->approver_role] ?? 'UNDER_REVIEW';
        $request->update(['status' => $status]);
    }

    /**
     * الموافقة على الخطوة الحالية
     */
    public function approveStep(StudentRequestForm $request, int $approverId, ?string $comments = null): bool
    {
        return DB::transaction(function () use ($request, $approverId, $comments) {
            $currentApproval = $request->approvals()
                ->where('step_number', $request->current_approval_step)
                ->first();

            if (!$currentApproval || $currentApproval->status !== 'PENDING') {
                return false;
            }

            // تحديث حالة الموافقة
            $currentApproval->approve($approverId, $comments);

            // التحقق مما إذا كانت هذه آخر خطوة
            $totalSteps = $request->approvals()->count();

            if ($request->current_approval_step >= $totalSteps) {
                // تمت جميع الموافقات
                $request->update([
                    'status' => 'APPROVED',
                    'approved_by' => $approverId,
                    'approved_at' => now(),
                ]);
            } else {
                // الانتقال للخطوة التالية
                $request->update([
                    'current_approval_step' => $request->current_approval_step + 1,
                ]);
                $this->updateStatusForCurrentStep($request);
            }

            return true;
        });
    }

    /**
     * رفض الطلب
     */
    public function rejectStep(StudentRequestForm $request, int $approverId, string $reason, ?string $comments = null): bool
    {
        return DB::transaction(function () use ($request, $approverId, $reason, $comments) {
            $currentApproval = $request->approvals()
                ->where('step_number', $request->current_approval_step)
                ->first();

            if (!$currentApproval || $currentApproval->status !== 'PENDING') {
                return false;
            }

            // تحديث حالة الموافقة
            $currentApproval->reject($approverId, $reason, $comments);

            // تحديث حالة الطلب
            $request->update([
                'status' => 'REJECTED',
                'rejection_reason' => $reason,
                'reviewed_by' => $approverId,
                'reviewed_at' => now(),
            ]);

            return true;
        });
    }

    /**
     * إرجاع الطلب للتعديل
     */
    public function returnForRevision(StudentRequestForm $request, int $approverId, string $comments): bool
    {
        return DB::transaction(function () use ($request, $approverId, $comments) {
            $currentApproval = $request->approvals()
                ->where('step_number', $request->current_approval_step)
                ->first();

            if (!$currentApproval || $currentApproval->status !== 'PENDING') {
                return false;
            }

            // تحديث حالة الموافقة
            $currentApproval->returnForRevision($approverId, $comments);

            // تحديث حالة الطلب
            $request->update([
                'status' => 'DRAFT',
                'admin_notes' => $comments,
            ]);

            return true;
        });
    }

    /**
     * إعادة تقديم الطلب بعد التعديل
     */
    public function resubmitRequest(StudentRequestForm $request): void
    {
        DB::transaction(function () use ($request) {
            // إعادة تعيين الموافقة المرجعة
            $currentApproval = $request->approvals()
                ->where('step_number', $request->current_approval_step)
                ->first();

            if ($currentApproval) {
                $currentApproval->update([
                    'status' => 'PENDING',
                    'comments' => null,
                    'action_at' => null,
                    'approver_id' => null,
                ]);
            }

            // تحديث حالة الطلب
            $this->updateStatusForCurrentStep($request);
        });
    }

    /**
     * إلغاء الطلب
     */
    public function cancelRequest(StudentRequestForm $request): void
    {
        $request->update([
            'status' => 'CANCELLED',
        ]);
    }

    /**
     * إتمام الطلب (بعد تنفيذ الإجراءات)
     */
    public function completeRequest(StudentRequestForm $request, int $completedBy): void
    {
        $request->update([
            'status' => 'COMPLETED',
            'completed_at' => now(),
        ]);
    }

    /**
     * الحصول على الطلبات المعلقة لدور معين
     */
    public function getPendingRequestsForRole(string $role, ?int $departmentId = null, ?int $collegeId = null)
    {
        $query = StudentRequestForm::query()
            ->whereHas('approvals', function ($q) use ($role) {
                $q->where('approver_role', $role)
                    ->where('status', 'PENDING');
            })
            ->whereColumn('current_approval_step', '=', DB::raw(
                '(SELECT step_number FROM student_request_approvals
                  WHERE student_request_approvals.student_request_form_id = student_request_forms.id
                  AND approver_role = "' . $role . '" LIMIT 1)'
            ));

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($collegeId) {
            $query->whereHas('department', function ($q) use ($collegeId) {
                $q->where('college_id', $collegeId);
            });
        }

        return $query->with(['student', 'department', 'program', 'attachments'])
            ->orderBy('submitted_at', 'asc')
            ->get();
    }

    /**
     * الحصول على إحصائيات الطلبات
     */
    public function getRequestStatistics(?int $departmentId = null, ?int $collegeId = null): array
    {
        $query = StudentRequestForm::query();

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($collegeId) {
            $query->whereHas('department', function ($q) use ($collegeId) {
                $q->where('college_id', $collegeId);
            });
        }

        return [
            'total' => $query->count(),
            'pending' => (clone $query)->pending()->count(),
            'approved' => (clone $query)->where('status', 'APPROVED')->count(),
            'rejected' => (clone $query)->where('status', 'REJECTED')->count(),
            'completed' => (clone $query)->where('status', 'COMPLETED')->count(),
            'by_type' => (clone $query)->selectRaw('request_type, count(*) as count')
                ->groupBy('request_type')
                ->pluck('count', 'request_type')
                ->toArray(),
        ];
    }
}
