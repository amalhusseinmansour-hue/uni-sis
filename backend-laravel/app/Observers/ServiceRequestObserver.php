<?php

namespace App\Observers;

use App\Models\ServiceRequest;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class ServiceRequestObserver
{
    /**
     * Handle the ServiceRequest "created" event.
     */
    public function created(ServiceRequest $request): void
    {
        $this->notifyStudent($request, 'SUBMITTED');

        // Also notify admins about new request
        $this->notifyAdmins($request);
    }

    /**
     * Handle the ServiceRequest "updated" event.
     */
    public function updated(ServiceRequest $request): void
    {
        if ($request->isDirty('status')) {
            $status = strtoupper($request->status);
            $this->notifyStudent($request, $status);
        }
    }

    /**
     * Notify student about request status
     */
    private function notifyStudent(ServiceRequest $request, string $status): void
    {
        try {
            $student = $request->student;
            if (!$student || !$student->user) return;

            $requestType = $request->type ?? $request->request_type ?? 'Service Request';

            NotificationService::notifyServiceRequestStatus(
                $student->user,
                $requestType,
                $status
            );
        } catch (\Exception $e) {
            Log::error('Failed to send service request notification: ' . $e->getMessage());
        }
    }

    /**
     * Notify admins about new request
     */
    private function notifyAdmins(ServiceRequest $request): void
    {
        try {
            $student = $request->student;
            $studentName = $student ? ($student->user->name ?? 'Unknown') : 'Unknown';
            $requestType = $request->type ?? $request->request_type ?? 'Service Request';

            NotificationService::sendToRole(
                'ADMIN',
                'New Service Request',
                'طلب خدمة جديد',
                "New {$requestType} request from {$studentName}",
                "طلب {$requestType} جديد من {$studentName}",
                'SERVICE_REQUEST',
                'file-text',
                '/admin/service-requests'
            );
        } catch (\Exception $e) {
            Log::error('Failed to notify admins about service request: ' . $e->getMessage());
        }
    }
}
