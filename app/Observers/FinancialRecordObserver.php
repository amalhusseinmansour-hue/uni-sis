<?php

namespace App\Observers;

use App\Models\FinancialRecord;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class FinancialRecordObserver
{
    /**
     * Handle the FinancialRecord "created" event.
     */
    public function created(FinancialRecord $record): void
    {
        $this->notifyNewInvoice($record);
    }

    /**
     * Handle the FinancialRecord "updated" event.
     */
    public function updated(FinancialRecord $record): void
    {
        // Check if status changed to paid
        if ($record->isDirty('status')) {
            $newStatus = strtoupper($record->status);

            if ($newStatus === 'PAID') {
                $this->notifyPaymentReceived($record);
            } elseif ($newStatus === 'OVERDUE') {
                $this->notifyOverduePayment($record);
            }
        }
    }

    /**
     * Notify about new invoice
     */
    private function notifyNewInvoice(FinancialRecord $record): void
    {
        try {
            $student = $record->student;
            if (!$student || !$student->user) return;

            // Only notify for invoice/fee type records
            $type = strtoupper($record->type ?? '');
            if (!in_array($type, ['TUITION', 'FEE', 'INVOICE', 'REGISTRATION'])) {
                return;
            }

            $dueDate = $record->due_date
                ? $record->due_date->format('Y-m-d')
                : 'Not specified';

            NotificationService::notifyNewInvoice(
                $student->user,
                $record->amount ?? 0,
                $dueDate
            );
        } catch (\Exception $e) {
            Log::error('Failed to send invoice notification: ' . $e->getMessage());
        }
    }

    /**
     * Notify about payment received
     */
    private function notifyPaymentReceived(FinancialRecord $record): void
    {
        try {
            $student = $record->student;
            if (!$student || !$student->user) return;

            NotificationService::notifyPaymentReceived(
                $student->user,
                $record->amount ?? 0,
                $record->reference_number ?? $record->id
            );
        } catch (\Exception $e) {
            Log::error('Failed to send payment notification: ' . $e->getMessage());
        }
    }

    /**
     * Notify about overdue payment
     */
    private function notifyOverduePayment(FinancialRecord $record): void
    {
        try {
            $student = $record->student;
            if (!$student || !$student->user) return;

            $daysPastDue = 0;
            if ($record->due_date) {
                $daysPastDue = now()->diffInDays($record->due_date);
            }

            NotificationService::notifyOverduePayment(
                $student->user,
                $record->amount ?? 0,
                $daysPastDue
            );
        } catch (\Exception $e) {
            Log::error('Failed to send overdue notification: ' . $e->getMessage());
        }
    }
}
