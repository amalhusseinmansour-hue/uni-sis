<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Notification;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BulkOperationController extends Controller
{
    public function bulkEnroll(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'enrollments' => 'required|array|min:1',
            'enrollments.*.student_id' => 'required|exists:students,id',
            'enrollments.*.course_id' => 'required|exists:courses,id',
            'enrollments.*.section' => 'nullable|string|max:10',
        ]);

        $results = [
            'success' => [],
            'failed' => [],
        ];

        DB::beginTransaction();
        try {
            foreach ($validated['enrollments'] as $enrollment) {
                // Check if already enrolled
                $exists = Enrollment::where('student_id', $enrollment['student_id'])
                    ->where('course_id', $enrollment['course_id'])
                    ->where('semester_id', $validated['semester_id'])
                    ->exists();

                if ($exists) {
                    $results['failed'][] = [
                        'student_id' => $enrollment['student_id'],
                        'course_id' => $enrollment['course_id'],
                        'reason' => 'Already enrolled',
                    ];
                    continue;
                }

                // Check prerequisites
                $student = Student::find($enrollment['student_id']);
                $course = Course::find($enrollment['course_id']);
                $eligibility = $course->canStudentEnroll($student);

                if (!$eligibility['can_enroll']) {
                    $results['failed'][] = [
                        'student_id' => $enrollment['student_id'],
                        'course_id' => $enrollment['course_id'],
                        'reason' => implode(', ', $eligibility['reasons']),
                    ];
                    continue;
                }

                $newEnrollment = Enrollment::create([
                    'student_id' => $enrollment['student_id'],
                    'course_id' => $enrollment['course_id'],
                    'semester_id' => $validated['semester_id'],
                    'section' => $enrollment['section'] ?? null,
                    'status' => 'ENROLLED',
                    'enrolled_at' => now(),
                ]);

                $results['success'][] = [
                    'enrollment_id' => $newEnrollment->id,
                    'student_id' => $enrollment['student_id'],
                    'course_id' => $enrollment['course_id'],
                ];
            }

            DB::commit();

            return response()->json([
                'message' => 'Bulk enrollment completed',
                'total_processed' => count($validated['enrollments']),
                'successful' => count($results['success']),
                'failed' => count($results['failed']),
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Bulk enrollment failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function bulkDrop(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enrollment_ids' => 'required|array|min:1',
            'enrollment_ids.*' => 'exists:enrollments,id',
            'reason' => 'nullable|string|max:255',
        ]);

        $updated = Enrollment::whereIn('id', $validated['enrollment_ids'])
            ->where('status', 'ENROLLED')
            ->update([
                'status' => 'DROPPED',
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'Bulk drop completed',
            'dropped_count' => $updated,
        ]);
    }

    public function bulkGradeUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'course_id' => 'required|exists:courses,id',
            'grades' => 'required|array|min:1',
            'grades.*.student_id' => 'required|exists:students,id',
            'grades.*.midterm' => 'nullable|numeric|min:0|max:100',
            'grades.*.final_exam' => 'nullable|numeric|min:0|max:100',
            'grades.*.assignments' => 'nullable|numeric|min:0|max:100',
            'grades.*.grade' => 'nullable|in:A+,A,A-,B+,B,B-,C+,C,C-,D+,D,F',
        ]);

        $results = [];

        DB::beginTransaction();
        try {
            foreach ($validated['grades'] as $gradeData) {
                $grade = Grade::updateOrCreate(
                    [
                        'student_id' => $gradeData['student_id'],
                        'course_id' => $validated['course_id'],
                        'semester_id' => $validated['semester_id'],
                    ],
                    [
                        'midterm' => $gradeData['midterm'] ?? null,
                        'final_exam' => $gradeData['final_exam'] ?? null,
                        'assignments' => $gradeData['assignments'] ?? null,
                        'grade' => $gradeData['grade'] ?? null,
                        'status' => 'PENDING',
                    ]
                );

                $results[] = [
                    'student_id' => $gradeData['student_id'],
                    'grade_id' => $grade->id,
                ];
            }

            DB::commit();

            return response()->json([
                'message' => 'Bulk grade update completed',
                'updated_count' => count($results),
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Bulk grade update failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function bulkApproveGrades(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'grade_ids' => 'required|array|min:1',
            'grade_ids.*' => 'exists:grades,id',
        ]);

        $updated = Grade::whereIn('id', $validated['grade_ids'])
            ->where('status', 'PENDING')
            ->update([
                'status' => 'APPROVED',
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'Grades approved successfully',
            'approved_count' => $updated,
        ]);
    }

    public function bulkNotify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'sometimes|in:INFO,WARNING,SUCCESS,ERROR,ANNOUNCEMENT',
            'data' => 'nullable|array',
        ]);

        $notifications = [];

        foreach ($validated['user_ids'] as $userId) {
            $notifications[] = [
                'user_id' => $userId,
                'title' => $validated['title'],
                'message' => $validated['message'],
                'type' => $validated['type'] ?? 'INFO',
                'data' => json_encode($validated['data'] ?? []),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Notification::insert($notifications);

        return response()->json([
            'message' => 'Notifications sent successfully',
            'sent_count' => count($notifications),
        ]);
    }

    public function bulkStudentStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
            'status' => 'required|in:ACTIVE,INACTIVE,SUSPENDED,GRADUATED',
        ]);

        $updated = Student::whereIn('id', $validated['student_ids'])
            ->update([
                'status' => $validated['status'],
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'Student status updated',
            'updated_count' => $updated,
        ]);
    }

    public function importStudents(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'students' => 'required|array|min:1|max:500',
            'students.*.student_id' => 'required|string|unique:students,student_id',
            'students.*.name_en' => 'required|string|max:255',
            'students.*.name_ar' => 'required|string|max:255',
            'students.*.program_id' => 'required|exists:programs,id',
            'students.*.gender' => 'required|in:MALE,FEMALE',
            'students.*.email' => 'nullable|email',
            'students.*.phone' => 'nullable|string',
            'students.*.national_id' => 'nullable|string',
        ]);

        $results = [
            'created' => [],
            'failed' => [],
        ];

        DB::beginTransaction();
        try {
            foreach ($validated['students'] as $studentData) {
                try {
                    $student = Student::create([
                        'student_id' => $studentData['student_id'],
                        'name_en' => $studentData['name_en'],
                        'name_ar' => $studentData['name_ar'],
                        'program_id' => $studentData['program_id'],
                        'gender' => $studentData['gender'],
                        'personal_email' => $studentData['email'] ?? null,
                        'phone' => $studentData['phone'] ?? null,
                        'national_id' => $studentData['national_id'] ?? null,
                        'status' => 'ACTIVE',
                        'admission_date' => now(),
                    ]);

                    $results['created'][] = [
                        'id' => $student->id,
                        'student_id' => $student->student_id,
                    ];
                } catch (\Exception $e) {
                    $results['failed'][] = [
                        'student_id' => $studentData['student_id'],
                        'error' => $e->getMessage(),
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Import completed',
                'total' => count($validated['students']),
                'created' => count($results['created']),
                'failed' => count($results['failed']),
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Import failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
