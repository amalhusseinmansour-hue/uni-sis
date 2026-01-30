<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentRequestLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_request_id',
        'user_id',
        'action',
        'from_status',
        'to_status',
        'notes',
        'changes',
    ];

    protected function casts(): array
    {
        return [
            'changes' => 'array',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(StudentRequest::class, 'student_request_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getActionLabelAttribute(): string
    {
        return match ($this->action) {
            'CREATED' => 'Request Created / تم إنشاء الطلب',
            'SUBMITTED' => 'Request Submitted / تم تقديم الطلب',
            'ADVISOR_REVIEW' => 'Advisor Reviewed / مراجعة المرشد',
            'DEPARTMENT_REVIEW' => 'Department Reviewed / مراجعة القسم',
            'DEAN_REVIEW' => 'Dean Reviewed / مراجعة العمادة',
            'APPROVED' => 'Approved / تمت الموافقة',
            'REJECTED' => 'Rejected / تم الرفض',
            'CANCELLED' => 'Cancelled / تم الإلغاء',
            'DOCUMENTS_REQUESTED' => 'Documents Requested / طلب مستندات',
            'DOCUMENTS_UPLOADED' => 'Documents Uploaded / تم رفع المستندات',
            'PAYMENT_REQUESTED' => 'Payment Requested / طلب الدفع',
            'PAYMENT_RECEIVED' => 'Payment Received / تم الدفع',
            'EXECUTED' => 'Executed / تم التنفيذ',
            'COMPLETED' => 'Completed / مكتمل',
            'COMMENT_ADDED' => 'Comment Added / تمت إضافة تعليق',
            'STATUS_CHANGED' => 'Status Changed / تغيير الحالة',
            default => $this->action,
        };
    }
}
