<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->unread_only, fn($q) => $q->whereNull('read_at'))
            ->paginate($request->per_page ?? 20);

        return response()->json($notifications);
    }

    public function unread(Request $request): JsonResponse
    {
        $notifications = $request->user()->unreadNotifications()
            ->limit($request->limit ?? 10)
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $request->user()->unread_notifications_count,
        ]);
    }

    public function show(Notification $notification): JsonResponse
    {
        // Ensure user owns this notification
        if ($notification->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($notification);
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        if ($notification->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification,
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read',
            'count' => $count,
        ]);
    }

    public function destroy(Notification $notification): JsonResponse
    {
        if ($notification->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->delete();

        return response()->json(null, 204);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $count = $request->user()->notifications()->delete();

        return response()->json([
            'message' => 'All notifications deleted',
            'count' => $count,
        ]);
    }

    public function count(Request $request): JsonResponse
    {
        return response()->json([
            'total' => $request->user()->notifications()->count(),
            'unread' => $request->user()->unread_notifications_count,
        ]);
    }

    /**
     * Create a custom notification (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'title_ar' => 'nullable|string|max:255',
            'message' => 'required|string',
            'message_ar' => 'nullable|string',
            'type' => 'nullable|string|in:INFO,SUCCESS,WARNING,ERROR,ACADEMIC,FINANCIAL,ANNOUNCEMENT',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
            'broadcast' => 'nullable|boolean',
        ]);

        $user = $request->user();

        // Check if admin
        if ($user->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $type = $request->type ?? 'INFO';
        $titleAr = $request->title_ar ?? $request->title;
        $messageAr = $request->message_ar ?? $request->message;

        if ($request->broadcast) {
            // Send to all users
            $count = NotificationService::broadcast(
                $request->title,
                $titleAr,
                $request->message,
                $messageAr,
                $type
            );
            return response()->json([
                'message' => "Notification broadcast to {$count} users",
                'count' => $count,
            ]);
        }

        if ($request->user_ids && count($request->user_ids) > 0) {
            // Send to specific users
            $count = NotificationService::sendToMany(
                $request->user_ids,
                $request->title,
                $titleAr,
                $request->message,
                $messageAr,
                $type
            );
            return response()->json([
                'message' => "Notification sent to {$count} users",
                'count' => $count,
            ]);
        }

        return response()->json(['message' => 'No recipients specified'], 400);
    }

    /**
     * Send test notifications to current user (for testing)
     */
    public function sendTestNotifications(Request $request): JsonResponse
    {
        $user = $request->user();

        // Create sample notifications
        $notifications = [
            [
                'title' => 'Grade Posted',
                'title_ar' => 'تم رصد الدرجة',
                'message' => 'Your grade for CS101 has been posted: A',
                'message_ar' => 'تم رصد درجتك في CS101: A',
                'type' => 'GRADE',
                'icon' => 'award',
                'link' => '/academic?tab=grades',
            ],
            [
                'title' => 'Payment Received',
                'title_ar' => 'تم استلام الدفعة',
                'message' => 'Your payment of 5,000 USD has been received',
                'message_ar' => 'تم استلام دفعتك بمبلغ 5,000 دولار',
                'type' => 'FINANCIAL',
                'icon' => 'check-circle',
                'link' => '/finance',
            ],
            [
                'title' => 'New Announcement',
                'title_ar' => 'إعلان جديد',
                'message' => 'Registration for Spring 2025 opens next week',
                'message_ar' => 'يبدأ التسجيل لفصل الربيع 2025 الأسبوع القادم',
                'type' => 'ANNOUNCEMENT',
                'icon' => 'megaphone',
                'link' => '/',
            ],
            [
                'title' => 'Attendance Warning',
                'title_ar' => 'تحذير الحضور',
                'message' => 'You have 3 absences in MATH201. Maximum allowed: 5',
                'message_ar' => 'لديك 3 غيابات في MATH201. الحد الأقصى: 5',
                'type' => 'WARNING',
                'icon' => 'alert-triangle',
                'link' => '/attendance',
            ],
            [
                'title' => 'Course Enrollment',
                'title_ar' => 'تسجيل المقرر',
                'message' => 'You have been enrolled in PHYS101',
                'message_ar' => 'تم تسجيلك في PHYS101',
                'type' => 'ENROLLMENT',
                'icon' => 'book-open',
                'link' => '/academic?tab=courses',
            ],
        ];

        foreach ($notifications as $notification) {
            Notification::create([
                'user_id' => $user->id,
                'title' => $notification['title'],
                'title_ar' => $notification['title_ar'],
                'message' => $notification['message'],
                'message_ar' => $notification['message_ar'],
                'type' => $notification['type'],
                'icon' => $notification['icon'],
                'link' => $notification['link'],
            ]);
        }

        return response()->json([
            'message' => 'Test notifications created',
            'count' => count($notifications),
        ]);
    }
}
