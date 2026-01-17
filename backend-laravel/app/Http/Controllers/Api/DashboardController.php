<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\FinancialRecord;
use App\Models\AdmissionApplication;
use App\Models\ServiceRequest;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        // Return different stats based on user role
        switch ($user->role) {
            case 'ADMIN':
                return $this->adminStats();
            case 'LECTURER':
                return $this->lecturerStats($user);
            case 'FINANCE':
                return $this->financeStats();
            case 'STUDENT':
                return $this->studentStats($user);
            case 'STUDENT_AFFAIRS':
                return $this->studentAffairsStats();
            default:
                return response()->json(['message' => 'Unknown role'], 403);
        }
    }

    private function adminStats(): JsonResponse
    {
        return response()->json([
            'students' => [
                'total' => Student::count(),
                'active' => Student::where('status', 'ACTIVE')->count(),
                'graduated' => Student::where('status', 'GRADUATED')->count(),
                'suspended' => Student::where('status', 'SUSPENDED')->count(),
            ],
            'courses' => [
                'total' => Course::count(),
                'active' => Course::where('is_active', true)->count(),
            ],
            'enrollments' => [
                'total' => Enrollment::count(),
                'enrolled' => Enrollment::where('status', 'ENROLLED')->count(),
                'completed' => Enrollment::where('status', 'COMPLETED')->count(),
                'dropped' => Enrollment::where('status', 'DROPPED')->count(),
            ],
            'admissions' => [
                'total' => AdmissionApplication::count(),
                'pending' => AdmissionApplication::where('status', 'PENDING')->count(),
                'approved' => AdmissionApplication::where('status', 'APPROVED')->count(),
                'rejected' => AdmissionApplication::where('status', 'REJECTED')->count(),
            ],
            'service_requests' => [
                'total' => ServiceRequest::count(),
                'pending' => ServiceRequest::where('status', 'PENDING')->count(),
                'in_progress' => ServiceRequest::where('status', 'IN_PROGRESS')->count(),
                'completed' => ServiceRequest::where('status', 'COMPLETED')->count(),
            ],
            'financial' => [
                'total_receivable' => FinancialRecord::where('type', 'DEBIT')->sum('amount'),
                'total_received' => FinancialRecord::where('type', 'CREDIT')->sum('amount'),
                'pending' => FinancialRecord::where('status', 'PENDING')->sum('amount'),
                'overdue' => FinancialRecord::where('status', 'OVERDUE')->sum('amount'),
            ],
            'announcements' => [
                'total' => Announcement::count(),
                'published' => Announcement::where('is_published', true)->count(),
            ],
        ]);
    }

    private function lecturerStats($user): JsonResponse
    {
        // Get courses assigned to lecturer (assuming lecturer has courses relation)
        // For now, return general teaching stats
        return response()->json([
            'courses' => [
                'total' => Course::where('is_active', true)->count(),
            ],
            'grades' => [
                'pending' => Grade::where('status', 'PENDING')->count(),
                'submitted' => Grade::where('status', 'SUBMITTED')->count(),
                'approved' => Grade::where('status', 'APPROVED')->count(),
            ],
            'enrollments' => [
                'active' => Enrollment::where('status', 'ENROLLED')->count(),
            ],
        ]);
    }

    private function financeStats(): JsonResponse
    {
        return response()->json([
            'financial' => [
                'total_debit' => FinancialRecord::where('type', 'DEBIT')->sum('amount'),
                'total_credit' => FinancialRecord::where('type', 'CREDIT')->sum('amount'),
                'pending_count' => FinancialRecord::where('status', 'PENDING')->count(),
                'pending_amount' => FinancialRecord::where('status', 'PENDING')->sum('amount'),
                'overdue_count' => FinancialRecord::where('status', 'OVERDUE')->count(),
                'overdue_amount' => FinancialRecord::where('status', 'OVERDUE')->sum('amount'),
                'paid_count' => FinancialRecord::where('status', 'PAID')->count(),
                'paid_amount' => FinancialRecord::where('status', 'PAID')->sum('amount'),
            ],
            'students_with_balance' => Student::whereHas('financialRecords', function ($q) {
                $q->whereIn('status', ['PENDING', 'OVERDUE']);
            })->count(),
        ]);
    }

    private function studentAffairsStats(): JsonResponse
    {
        return response()->json([
            'students' => [
                'total' => Student::count(),
                'active' => Student::where('status', 'ACTIVE')->count(),
                'suspended' => Student::where('status', 'SUSPENDED')->count(),
                'graduated' => Student::where('status', 'GRADUATED')->count(),
                'withdrawn' => Student::where('status', 'WITHDRAWN')->count(),
            ],
            'admissions' => [
                'total' => AdmissionApplication::count(),
                'pending' => AdmissionApplication::where('status', 'PENDING')->count(),
                'under_review' => AdmissionApplication::where('status', 'UNDER_REVIEW')->count(),
                'approved' => AdmissionApplication::where('status', 'APPROVED')->count(),
                'rejected' => AdmissionApplication::where('status', 'REJECTED')->count(),
                'today' => AdmissionApplication::whereDate('created_at', today())->count(),
                'this_week' => AdmissionApplication::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            ],
            'enrollments' => [
                'total' => Enrollment::count(),
                'enrolled' => Enrollment::where('status', 'ENROLLED')->count(),
                'completed' => Enrollment::where('status', 'COMPLETED')->count(),
                'dropped' => Enrollment::where('status', 'DROPPED')->count(),
                'withdrawn' => Enrollment::where('status', 'WITHDRAWN')->count(),
            ],
            'service_requests' => [
                'total' => ServiceRequest::count(),
                'pending' => ServiceRequest::where('status', 'PENDING')->count(),
                'in_progress' => ServiceRequest::where('status', 'IN_PROGRESS')->count(),
                'completed' => ServiceRequest::where('status', 'COMPLETED')->count(),
            ],
            'recent_applications' => AdmissionApplication::with('program')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(['id', 'full_name', 'email', 'status', 'created_at', 'program_id']),
        ]);
    }

    private function studentStats($user): JsonResponse
    {
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found'
            ], 404);
        }

        $enrollments = $student->enrollments;
        $grades = $student->grades()->where('status', 'APPROVED')->get();
        $financialRecords = $student->financialRecords;

        // Calculate GPA
        $totalPoints = 0;
        $totalCredits = 0;
        foreach ($grades as $grade) {
            $credits = $grade->course->credits ?? 3;
            $totalPoints += ($grade->points ?? 0) * $credits;
            $totalCredits += $credits;
        }
        $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;

        // Financial balance
        $totalDebit = $financialRecords->where('type', 'DEBIT')->sum('amount');
        $totalCredit = $financialRecords->where('type', 'CREDIT')->sum('amount');
        $balance = $totalCredit - $totalDebit;

        return response()->json([
            'student_id' => $student->student_id,
            'name' => $student->full_name_en,
            'program' => $student->program->name_en ?? null,
            'academic' => [
                'gpa' => $gpa,
                'total_credits' => $totalCredits,
                'courses_completed' => $grades->count(),
                'current_enrollments' => $enrollments->where('status', 'ENROLLED')->count(),
            ],
            'financial' => [
                'balance' => $balance,
                'pending_payments' => $financialRecords->where('status', 'PENDING')->sum('amount'),
                'overdue_payments' => $financialRecords->where('status', 'OVERDUE')->sum('amount'),
            ],
            'service_requests' => [
                'pending' => $student->serviceRequests()->where('status', 'PENDING')->count(),
                'total' => $student->serviceRequests()->count(),
            ],
        ]);
    }
}
