<?php

namespace App\Observers;

use App\Models\Announcement;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class AnnouncementObserver
{
    /**
     * Handle the Announcement "created" event.
     */
    public function created(Announcement $announcement): void
    {
        // Only notify if announcement is published
        if ($announcement->is_published || $announcement->status === 'published') {
            $this->broadcastAnnouncement($announcement);
        }
    }

    /**
     * Handle the Announcement "updated" event.
     */
    public function updated(Announcement $announcement): void
    {
        // Check if just published
        if ($announcement->isDirty('is_published') && $announcement->is_published) {
            $this->broadcastAnnouncement($announcement);
        }

        if ($announcement->isDirty('status') && $announcement->status === 'published') {
            $this->broadcastAnnouncement($announcement);
        }
    }

    /**
     * Broadcast announcement to relevant users
     */
    private function broadcastAnnouncement(Announcement $announcement): void
    {
        try {
            $title = $announcement->title ?? $announcement->title_en ?? 'Announcement';
            $titleAr = $announcement->title_ar ?? $announcement->title ?? 'إعلان';

            // Determine target audience
            $targetRoles = $announcement->target_roles ?? $announcement->roles ?? null;

            if ($targetRoles && is_array($targetRoles) && count($targetRoles) > 0) {
                // Send to specific roles
                foreach ($targetRoles as $role) {
                    $userIds = User::where('role', $role)->pluck('id')->toArray();
                    foreach ($userIds as $userId) {
                        $user = User::find($userId);
                        if ($user) {
                            NotificationService::notifyAnnouncement($user, $title, $titleAr);
                        }
                    }
                }
            } else {
                // Broadcast to all
                $users = User::all();
                foreach ($users as $user) {
                    NotificationService::notifyAnnouncement($user, $title, $titleAr);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to broadcast announcement notification: ' . $e->getMessage());
        }
    }
}
