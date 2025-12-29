<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServiceRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ServiceRequest::with(['student']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $serviceRequests = $query->latest()->paginate($request->get('per_page', 15));
        return response()->json($serviceRequests);
    }

    public function show(ServiceRequest $serviceRequest): JsonResponse
    {
        return response()->json($serviceRequest->load('student'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'type' => 'required|in:TRANSCRIPT,ENROLLMENT_LETTER,GRADE_APPEAL,COURSE_WITHDRAWAL,LEAVE_OF_ABSENCE,ID_REPLACEMENT,OTHER',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:LOW,MEDIUM,HIGH,URGENT',
            'attachments' => 'nullable|array',
        ]);

        $validated['status'] = 'PENDING';
        $validated['request_date'] = now();

        $serviceRequest = ServiceRequest::create($validated);
        return response()->json($serviceRequest->load('student'), 201);
    }

    public function update(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'sometimes|in:TRANSCRIPT,ENROLLMENT_LETTER,GRADE_APPEAL,COURSE_WITHDRAWAL,LEAVE_OF_ABSENCE,ID_REPLACEMENT,OTHER',
            'subject' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'priority' => 'sometimes|in:LOW,MEDIUM,HIGH,URGENT',
            'status' => 'sometimes|in:PENDING,IN_PROGRESS,COMPLETED,REJECTED',
            'admin_notes' => 'nullable|string',
            'attachments' => 'nullable|array',
        ]);

        // Set completion date if status is COMPLETED or REJECTED
        if (isset($validated['status']) && in_array($validated['status'], ['COMPLETED', 'REJECTED'])) {
            $validated['completion_date'] = now();
        }

        $serviceRequest->update($validated);
        return response()->json($serviceRequest);
    }

    public function destroy(ServiceRequest $serviceRequest): JsonResponse
    {
        $serviceRequest->delete();
        return response()->json(null, 204);
    }

    public function process(ServiceRequest $serviceRequest): JsonResponse
    {
        $serviceRequest->update(['status' => 'IN_PROGRESS']);
        return response()->json($serviceRequest);
    }

    public function complete(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        $validated = $request->validate([
            'admin_notes' => 'nullable|string',
        ]);

        $serviceRequest->update([
            'status' => 'COMPLETED',
            'completion_date' => now(),
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        return response()->json($serviceRequest);
    }

    public function reject(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        $validated = $request->validate([
            'admin_notes' => 'required|string',
        ]);

        $serviceRequest->update([
            'status' => 'REJECTED',
            'completion_date' => now(),
            'admin_notes' => $validated['admin_notes'],
        ]);

        return response()->json($serviceRequest);
    }
}
