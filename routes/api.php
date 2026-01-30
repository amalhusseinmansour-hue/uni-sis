<?php

use App\Http\Controllers\Api\AdmissionApplicationController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollegeController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\FinancialRecordController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentDocumentController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\AcademicCalendarController;
use App\Http\Controllers\Api\PrerequisiteController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\LecturerController;
use App\Http\Controllers\Api\BulkOperationController;
use App\Http\Controllers\Api\ProgramReportController;
use App\Http\Controllers\Api\CourseReportController;
use App\Http\Controllers\Api\InstructorReportController;
use App\Http\Controllers\Api\StudentRequestController;
use App\Http\Controllers\Api\DisciplineController;
use App\Http\Controllers\Api\StudentIdCardController;
use App\Http\Controllers\Api\ReportCardController;
use App\Http\Controllers\Api\DynamicFormController;
use App\Http\Controllers\Api\DynamicTableController;
use App\Http\Controllers\Api\DynamicReportController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\MoodleWebhookController;
use App\Http\Controllers\Api\MoodleSyncController;
use App\Http\Controllers\Api\GradingScaleController;
use App\Http\Controllers\Api\LectureController;
use App\Http\Controllers\Api\LectureAttendanceController;
use App\Http\Controllers\Api\LectureMaterialController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// REMOVED: Setup test users endpoint - Security risk in production
// Use php artisan db:seed or create-admin.php instead

// Public announcements
Route::get('/announcements/published', [AnnouncementController::class, 'published']);

// Current semester (public)
Route::get('/semesters/current', [SemesterController::class, 'current']);

// Academic Calendar (public)
Route::get('/academic-calendar/upcoming', [AcademicCalendarController::class, 'upcoming']);
Route::get('/academic-calendar/month', [AcademicCalendarController::class, 'currentMonth']);
Route::get('/academic-calendar/holidays', [AcademicCalendarController::class, 'holidays']);

// Admission application (public - for applicants) - Rate limited to prevent abuse
Route::post('/admission/apply', [AdmissionApplicationController::class, 'store'])
    ->middleware('throttle:10,1'); // Max 10 requests per minute per IP

// Student ID Card Verification (public endpoint)
Route::get('/verify/student/{encryptedData}', [StudentIdCardController::class, 'verifyFromUrl']);
Route::post('/verify/student', [StudentIdCardController::class, 'verify']);

// ==========================================
// WEBHOOK ENDPOINTS (for WordPress integration)
// Rate limited to prevent abuse
// ==========================================
Route::prefix('webhook')->middleware('throttle:60,1')->group(function () {
    // استقبال طلبات القبول من WordPress
    Route::post('/admission', [WebhookController::class, 'admissionApplication']);

    // الحصول على قائمة البرامج المتاحة
    Route::get('/programs', [WebhookController::class, 'getPrograms']);

    // التحقق من حالة طلب القبول
    Route::get('/admission/status/{reference}', [WebhookController::class, 'checkStatus']);

    // ==========================================
    // MOODLE WEBHOOK ENDPOINTS
    // Note: These endpoints validate API key in controller
    // ==========================================
    // استقبال العلامات من Moodle
    Route::post('/moodle/grades', [MoodleWebhookController::class, 'receiveGrades']);
    Route::post('/moodle/grades/bulk', [MoodleWebhookController::class, 'receiveBulkGrades']);
    Route::post('/moodle/completion', [MoodleWebhookController::class, 'receiveCompletion']);
});

// Protected routes (authenticated users)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // ==========================================
    // NOTIFICATIONS (All authenticated users)
    // ==========================================
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread', [NotificationController::class, 'unread']);
        Route::get('/count', [NotificationController::class, 'count']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/delete-all', [NotificationController::class, 'destroyAll']);
        Route::post('/send', [NotificationController::class, 'store']); // Admin: send notification
        Route::post('/test', [NotificationController::class, 'sendTestNotifications']); // Send test notifications
        Route::get('/{notification}', [NotificationController::class, 'show']);
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
    });

    // ==========================================
    // STUDENT ROUTES (Student can access their own data)
    // ==========================================
    Route::middleware('student.access')->group(function () {
        Route::get('/students/{student}/grades', [StudentController::class, 'grades']);
        Route::get('/students/{student}/financial-records', [StudentController::class, 'financialRecords']);
        Route::get('/students/{student}/enrollments', [StudentController::class, 'enrollments']);
        Route::get('/students/{student}/documents', [StudentDocumentController::class, 'studentDocuments']);
        Route::get('/students/{student}/balance', [FinancialRecordController::class, 'studentBalance']);
    });

    // ==========================================
    // GENERAL READ ACCESS (All authenticated users)
    // ==========================================
    // Courses - Read access for all
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::get('/courses/{course}/statistics', [CourseController::class, 'statistics']);

    // Course Prerequisites - Read access for all
    Route::get('/courses/{course}/prerequisites', [PrerequisiteController::class, 'index']);
    Route::get('/courses/{course}/required-for', [PrerequisiteController::class, 'coursesRequiringThis']);
    Route::post('/courses/{course}/check-eligibility', [PrerequisiteController::class, 'checkEligibility']);

    // Schedules - Read access for all
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::get('/schedules/{schedule}', [ScheduleController::class, 'show']);
    Route::get('/schedules/weekly', [ScheduleController::class, 'weeklyView']);
    Route::get('/courses/{course}/schedule', [ScheduleController::class, 'courseSchedule']);

    // Academic Calendar - Read access for all (some endpoints are public)
    Route::get('/academic-calendar', [AcademicCalendarController::class, 'index']);
    Route::get('/academic-calendar/{academicEvent}', [AcademicCalendarController::class, 'show']);
    Route::get('/academic-calendar/semester/{semester}', [AcademicCalendarController::class, 'semesterCalendar']);
    Route::get('/academic-calendar/exams', [AcademicCalendarController::class, 'exams']);
    Route::get('/academic-calendar/deadlines', [AcademicCalendarController::class, 'deadlines']);

    // Colleges - Read access for all
    Route::get('/colleges', [CollegeController::class, 'index']);
    Route::get('/colleges/{college}', [CollegeController::class, 'show']);
    Route::get('/colleges/{college}/departments', [CollegeController::class, 'departments']);
    Route::get('/colleges/{college}/programs', [CollegeController::class, 'programs']);

    // Departments - Read access for all
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/{department}', [DepartmentController::class, 'show']);
    Route::get('/departments/{department}/courses', [DepartmentController::class, 'courses']);

    // Programs - Read access for all
    Route::get('/programs', [ProgramController::class, 'index']);
    Route::get('/programs/{program}', [ProgramController::class, 'show']);
    Route::get('/programs/{program}/courses', [ProgramController::class, 'courses']);

    // Semesters - Read access for all
    Route::get('/semesters', [SemesterController::class, 'index']);
    Route::get('/semesters/{semester}', [SemesterController::class, 'show']);

    // Announcements - Read access for all
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show']);

    // ==========================================
    // STUDENT ONLY ROUTES
    // ==========================================
    Route::middleware('role:STUDENT')->group(function () {
        // Course Registration - Student Self-Service
        Route::get('/my-enrollments', [EnrollmentController::class, 'myEnrollments']);
        Route::post('/my-enrollments', [EnrollmentController::class, 'enroll']);
        Route::delete('/my-enrollments/{enrollmentId}', [EnrollmentController::class, 'dropMyEnrollment']);
        Route::get('/available-sections', [EnrollmentController::class, 'availableSections']);

        // Students can create service requests
        Route::post('/service-requests', [ServiceRequestController::class, 'store']);
        Route::get('/service-requests', [ServiceRequestController::class, 'index']);
        Route::get('/service-requests/{serviceRequest}', [ServiceRequestController::class, 'show']);

        // Students can upload their own documents
        Route::post('/student-documents', [StudentDocumentController::class, 'store']);

        // Student timetable
        Route::get('/my-timetable', [ScheduleController::class, 'studentTimetable']);

        // Student reports (own reports)
        Route::get('/my-transcript', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }
            return app(ReportController::class)->transcript($student);
        });
        Route::get('/my-grades', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }
            return app(ReportController::class)->gradeReport($student, $request);
        });
        Route::get('/my-academic-summary', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }
            return app(ReportController::class)->academicSummary($student);
        });

        // Student ID Card
        Route::get('/my-id-card', [StudentIdCardController::class, 'myIdCard']);
        Route::get('/my-id-card/download', [StudentIdCardController::class, 'downloadMyIdCard']);

        // Student Report Cards
        Route::get('/my-report-cards', [ReportCardController::class, 'myReportCards']);
        Route::get('/my-report-cards/{semester}', [ReportCardController::class, 'myReportCard']);
        Route::get('/my-report-cards/{semester}/download', [ReportCardController::class, 'downloadMyReportCard']);

        // Student Discipline (view own record)
        Route::get('/my-discipline', [DisciplineController::class, 'myRecord']);
        Route::get('/my-discipline/incidents', [DisciplineController::class, 'myIncidents']);
        Route::get('/my-discipline/actions', [DisciplineController::class, 'myActions']);
        Route::get('/my-discipline/appeals', [DisciplineController::class, 'myAppeals']);
        Route::post('/my-discipline/appeals', [DisciplineController::class, 'storeAppeal']);
        Route::post('/my-discipline/appeals/{appeal}/withdraw', [DisciplineController::class, 'withdrawAppeal']);
    });

    // ==========================================
    // LECTURER ROUTES (Lecturers can manage grades and attendance)
    // ==========================================
    Route::middleware('role:LECTURER,ADMIN')->group(function () {
        // Lecturer dashboard and schedule
        Route::get('/lecturer/dashboard', [LecturerController::class, 'dashboard']);
        Route::get('/lecturer/my-courses', [LecturerController::class, 'myCourses']);
        Route::get('/lecturer/my-schedule', [LecturerController::class, 'mySchedule']);

        // Course management for lecturers
        Route::get('/lecturer/courses/{course}/students', [LecturerController::class, 'courseStudents']);
        Route::get('/lecturer/courses/{course}/statistics', [LecturerController::class, 'courseStatistics']);
        Route::post('/lecturer/courses/{course}/grades', [LecturerController::class, 'submitGrades']);
        Route::put('/lecturer/courses/{course}/students/{student}/grade', [LecturerController::class, 'updateStudentGrade']);
        Route::post('/lecturer/courses/{course}/attendance', [LecturerController::class, 'markAttendance']);

        // Grades management
        Route::apiResource('grades', GradeController::class);
        Route::post('/grades/{grade}/approve', [GradeController::class, 'approve']);
        Route::post('/grades/calculate-gpa', [GradeController::class, 'calculateGPA']);

        // Grading Scales - Read access for lecturers and admins
        Route::get('/grading-scales', [GradingScaleController::class, 'index']);
        Route::get('/grading-scales/{gradingScale}', [GradingScaleController::class, 'show']);
        Route::post('/grading-scales/calculate', [GradingScaleController::class, 'calculateGrade']);

        // Attendance management
        Route::get('/enrollments/{enrollment}/attendance', [AttendanceController::class, 'show']);
        Route::post('/enrollments/{enrollment}/attendance', [AttendanceController::class, 'update']);
        Route::get('/courses/{course}/attendance', [AttendanceController::class, 'courseAttendance']);
        Route::post('/courses/{course}/attendance/bulk', [AttendanceController::class, 'bulkUpdate']);

        // Course enrollments view
        Route::get('/courses/{course}/enrollments', [CourseController::class, 'enrollments']);
    });

    // ==========================================
    // FINANCE ROUTES (Finance can manage financial records)
    // ==========================================
    Route::middleware('role:FINANCE,ADMIN')->group(function () {
        Route::apiResource('financial-records', FinancialRecordController::class);
        Route::post('/financial-records/{financialRecord}/mark-paid', [FinancialRecordController::class, 'markPaid']);
        Route::post('/financial-records/{financialRecord}/mark-overdue', [FinancialRecordController::class, 'markOverdue']);
        Route::get('/financial-records-statistics', [FinancialRecordController::class, 'statistics']);

        // الخطوة 5: تسجيل دفع رسوم التسجيل (القسم المالي)
        Route::post('/admission-applications/{admissionApplication}/record-payment', [AdmissionApplicationController::class, 'recordPayment']);
        // عرض طلبات القبول في انتظار الدفع
        Route::get('/admission-applications-pending-payment', function () {
            return \App\Models\AdmissionApplication::pendingPayment()
                ->with(['program'])
                ->latest()
                ->paginate(15);
        });
    });

    // ==========================================
    // ADMIN ROUTES (Full access to all resources)
    // ==========================================
    Route::middleware('role:ADMIN')->group(function () {
        // Get all lecturers (for dropdowns)
        Route::get('/lecturers', function () {
            return \App\Models\User::whereIn('role', ['LECTURER', 'ADMIN'])
                ->select('id', 'name', 'email', 'role')
                ->orderBy('name')
                ->get();
        });

        // Students management
        Route::apiResource('students', StudentController::class);

        // Grading Scales management (Admin only)
        Route::post('/grading-scales', [GradingScaleController::class, 'store']);
        Route::put('/grading-scales/{gradingScale}', [GradingScaleController::class, 'update']);
        Route::delete('/grading-scales/{gradingScale}', [GradingScaleController::class, 'destroy']);
        Route::post('/grading-scales/reorder', [GradingScaleController::class, 'reorder']);
        Route::post('/grading-scales/reset', [GradingScaleController::class, 'resetToDefault']);

        // Courses management
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
        Route::post('/courses/{course}/activate', [CourseController::class, 'activate']);
        Route::post('/courses/{course}/deactivate', [CourseController::class, 'deactivate']);
        Route::post('/courses/{course}/assign-programs', [CourseController::class, 'assignPrograms']);
        Route::delete('/courses/{course}/programs/{programId}', [CourseController::class, 'removeFromProgram']);

        // Announcements management
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);
        Route::post('/announcements/{announcement}/publish', [AnnouncementController::class, 'publish']);
        Route::post('/announcements/{announcement}/unpublish', [AnnouncementController::class, 'unpublish']);

        // Colleges management
        Route::post('/colleges', [CollegeController::class, 'store']);
        Route::put('/colleges/{college}', [CollegeController::class, 'update']);
        Route::delete('/colleges/{college}', [CollegeController::class, 'destroy']);

        // Departments management
        Route::post('/departments', [DepartmentController::class, 'store']);
        Route::put('/departments/{department}', [DepartmentController::class, 'update']);
        Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);

        // Programs management
        Route::post('/programs', [ProgramController::class, 'store']);
        Route::put('/programs/{program}', [ProgramController::class, 'update']);
        Route::delete('/programs/{program}', [ProgramController::class, 'destroy']);
        Route::get('/programs/{program}/students', [ProgramController::class, 'students']);

        // Enrollments management
        Route::apiResource('enrollments', EnrollmentController::class);
        Route::post('/enrollments/{enrollment}/drop', [EnrollmentController::class, 'drop']);
        Route::post('/enrollments/{enrollment}/withdraw', [EnrollmentController::class, 'withdraw']);

        // Semesters management
        Route::post('/semesters', [SemesterController::class, 'store']);
        Route::put('/semesters/{semester}', [SemesterController::class, 'update']);
        Route::delete('/semesters/{semester}', [SemesterController::class, 'destroy']);
        Route::post('/semesters/{semester}/set-current', [SemesterController::class, 'setCurrent']);

        // Service Requests management
        Route::put('/service-requests/{serviceRequest}', [ServiceRequestController::class, 'update']);
        Route::delete('/service-requests/{serviceRequest}', [ServiceRequestController::class, 'destroy']);
        Route::post('/service-requests/{serviceRequest}/process', [ServiceRequestController::class, 'process']);
        Route::post('/service-requests/{serviceRequest}/complete', [ServiceRequestController::class, 'complete']);
        Route::post('/service-requests/{serviceRequest}/reject', [ServiceRequestController::class, 'reject']);

        // Admission Applications management with Workflow
        Route::apiResource('admission-applications', AdmissionApplicationController::class);

        // Workflow Routes - قسم القبول والتسجيل
        // الخطوة 2: بدء المراجعة
        Route::post('/admission-applications/{admissionApplication}/start-review', [AdmissionApplicationController::class, 'startReview']);
        // الخطوة 3: التحقق من المستندات
        Route::post('/admission-applications/{admissionApplication}/verify-documents', [AdmissionApplicationController::class, 'verifyDocuments']);
        // الخطوة 4: طلب دفع الرسوم (إحالة للمالي)
        Route::post('/admission-applications/{admissionApplication}/request-payment', [AdmissionApplicationController::class, 'requestPayment']);
        // الخطوة 6: الموافقة النهائية (إنشاء الرقم الجامعي + خطاب القبول + بطاقة الجامعة)
        Route::post('/admission-applications/{admissionApplication}/approve', [AdmissionApplicationController::class, 'approve']);
        Route::post('/admission-applications/{admissionApplication}/reject', [AdmissionApplicationController::class, 'reject']);
        Route::post('/admission-applications/{admissionApplication}/waitlist', [AdmissionApplicationController::class, 'waitlist']);
        // سجل workflow
        Route::get('/admission-applications/{admissionApplication}/workflow-logs', [AdmissionApplicationController::class, 'workflowLogs']);
        Route::get('/admission-applications-statistics', [AdmissionApplicationController::class, 'statistics']);

        // Student Documents management
        Route::get('/student-documents', [StudentDocumentController::class, 'index']);
        Route::get('/student-documents/{studentDocument}', [StudentDocumentController::class, 'show']);
        Route::put('/student-documents/{studentDocument}', [StudentDocumentController::class, 'update']);
        Route::delete('/student-documents/{studentDocument}', [StudentDocumentController::class, 'destroy']);
        Route::post('/student-documents/{studentDocument}/verify', [StudentDocumentController::class, 'verify']);
        Route::post('/student-documents/{studentDocument}/reject', [StudentDocumentController::class, 'reject']);

        // Schedules management
        Route::post('/schedules', [ScheduleController::class, 'store']);
        Route::put('/schedules/{schedule}', [ScheduleController::class, 'update']);
        Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy']);

        // Academic Calendar management
        Route::post('/academic-calendar', [AcademicCalendarController::class, 'store']);
        Route::put('/academic-calendar/{academicEvent}', [AcademicCalendarController::class, 'update']);
        Route::delete('/academic-calendar/{academicEvent}', [AcademicCalendarController::class, 'destroy']);

        // Course Prerequisites management
        Route::post('/courses/{course}/prerequisites', [PrerequisiteController::class, 'store']);
        Route::put('/courses/{course}/prerequisites/{prerequisiteId}', [PrerequisiteController::class, 'update']);
        Route::delete('/courses/{course}/prerequisites/{prerequisiteId}', [PrerequisiteController::class, 'destroy']);

        // Reports (Admin can access any student's reports)
        Route::prefix('reports')->group(function () {
            Route::get('/students/{student}/transcript', [ReportController::class, 'transcript']);
            Route::get('/students/{student}/transcript/pdf', [ReportController::class, 'transcriptPdf']);
            Route::get('/students/{student}/grades', [ReportController::class, 'gradeReport']);
            Route::get('/students/{student}/enrollments', [ReportController::class, 'enrollmentReport']);
            Route::get('/students/{student}/financial', [ReportController::class, 'financialReport']);
            Route::get('/students/{student}/attendance', [ReportController::class, 'attendanceReport']);
            Route::get('/students/{student}/academic-summary', [ReportController::class, 'academicSummary']);
        });

        // Bulk Operations (Admin only)
        Route::prefix('bulk')->group(function () {
            Route::post('/enroll', [BulkOperationController::class, 'bulkEnroll']);
            Route::post('/drop', [BulkOperationController::class, 'bulkDrop']);
            Route::post('/grades', [BulkOperationController::class, 'bulkGradeUpdate']);
            Route::post('/grades/approve', [BulkOperationController::class, 'bulkApproveGrades']);
            Route::post('/notify', [BulkOperationController::class, 'bulkNotify']);
            Route::post('/students/status', [BulkOperationController::class, 'bulkStudentStatus']);
            Route::post('/students/import', [BulkOperationController::class, 'importStudents']);
        });

        // Document download
        Route::get('/student-documents/{studentDocument}/download', [StudentDocumentController::class, 'download']);

        // ==========================================
        // PROGRAM LEVEL REPORTS - تقارير على مستوى التخصص/البرنامج
        // ==========================================
        Route::prefix('reports')->group(function () {
            // Program Reports
            Route::get('/program/{programId}/students', [ProgramReportController::class, 'studentsByProgram']);
            Route::get('/program/{programId}/levels', [ProgramReportController::class, 'studentsByLevel']);
            Route::get('/program/{programId}/study-plans', [ProgramReportController::class, 'studentsByStudyPlan']);
            Route::get('/program/{programId}/gpa-distribution', [ProgramReportController::class, 'gpaDistribution']);
            Route::get('/program/{programId}/summary', [ProgramReportController::class, 'programSummary']);

            // Department Reports
            Route::get('/department/{departmentId}/students', [ProgramReportController::class, 'studentsByDepartment']);
            Route::get('/department/{departmentId}/summary', [ProgramReportController::class, 'departmentSummary']);

            // College Reports
            Route::get('/college/{collegeId}/students', [ProgramReportController::class, 'studentsByCollege']);
            Route::get('/college/{collegeId}/summary', [ProgramReportController::class, 'collegeSummary']);

            // Course Reports - تقارير المواد
            Route::get('/courses/offered', [CourseReportController::class, 'coursesOffered']);
            Route::get('/courses/by-type', [CourseReportController::class, 'coursesByType']);
            Route::get('/courses/high-enrollment', [CourseReportController::class, 'highEnrollmentCourses']);
            Route::get('/courses/needs-sections', [CourseReportController::class, 'coursesNeedingSections']);
            Route::get('/courses/high-failure', [CourseReportController::class, 'highFailureCourses']);

            // Instructor Reports - تقارير المدرسين
            Route::get('/instructor/course/{courseId}/attendance', [InstructorReportController::class, 'courseAttendance']);
            Route::get('/instructor/course/{courseId}/grades', [InstructorReportController::class, 'courseGrades']);
            Route::get('/instructor/course/{courseId}/grade-submission', [InstructorReportController::class, 'gradeSubmission']);
            Route::get('/instructor/course/{courseId}/comparison', [InstructorReportController::class, 'semesterComparison']);
            Route::get('/instructor/course/{courseId}/complaints', [InstructorReportController::class, 'courseComplaints']);
            Route::get('/instructor/{instructorId}/courses', [InstructorReportController::class, 'instructorCourses']);
        });

        // ==========================================
        // DISCIPLINE MANAGEMENT (Admin)
        // ==========================================
        Route::prefix('discipline')->group(function () {
            // Incidents
            Route::get('/incidents', [DisciplineController::class, 'indexIncidents']);
            Route::post('/incidents', [DisciplineController::class, 'storeIncident']);
            Route::get('/incidents/{incident}', [DisciplineController::class, 'showIncident']);
            Route::put('/incidents/{incident}', [DisciplineController::class, 'updateIncident']);
            Route::delete('/incidents/{incident}', [DisciplineController::class, 'destroyIncident']);
            Route::post('/incidents/{incident}/investigate', [DisciplineController::class, 'startInvestigation']);
            Route::post('/incidents/{incident}/confirm', [DisciplineController::class, 'confirmIncident']);
            Route::post('/incidents/{incident}/dismiss', [DisciplineController::class, 'dismissIncident']);
            Route::post('/incidents/{incident}/resolve', [DisciplineController::class, 'resolveIncident']);

            // Actions
            Route::get('/actions', [DisciplineController::class, 'indexActions']);
            Route::post('/actions', [DisciplineController::class, 'storeAction']);
            Route::get('/actions/{action}', [DisciplineController::class, 'showAction']);
            Route::put('/actions/{action}', [DisciplineController::class, 'updateAction']);
            Route::post('/actions/{action}/activate', [DisciplineController::class, 'activateAction']);
            Route::post('/actions/{action}/complete', [DisciplineController::class, 'completeAction']);
            Route::post('/actions/{action}/cancel', [DisciplineController::class, 'cancelAction']);

            // Appeals
            Route::get('/appeals', [DisciplineController::class, 'indexAppeals']);
            Route::get('/appeals/{appeal}', [DisciplineController::class, 'showAppeal']);
            Route::post('/appeals/{appeal}/review', [DisciplineController::class, 'reviewAppeal']);

            // Points
            Route::get('/students/{student}/points', [DisciplineController::class, 'getStudentPoints']);
            Route::get('/students/{student}/points/history', [DisciplineController::class, 'getStudentPointsHistory']);
            Route::get('/students/{student}/summary', [DisciplineController::class, 'studentSummary']);

            // Statistics
            Route::get('/statistics', [DisciplineController::class, 'statistics']);
        });

        // ==========================================
        // ID CARDS MANAGEMENT (Admin)
        // ==========================================
        Route::prefix('id-cards')->group(function () {
            Route::get('/students/{student}', [StudentIdCardController::class, 'show']);
            Route::post('/students/{student}/generate', [StudentIdCardController::class, 'generatePdf']);
            Route::get('/students/{student}/download', [StudentIdCardController::class, 'downloadPdf']);
            Route::post('/students/{student}/photo', [StudentIdCardController::class, 'uploadPhoto']);
            Route::post('/bulk-generate', [StudentIdCardController::class, 'bulkGenerate']);
            Route::post('/bulk-download', [StudentIdCardController::class, 'downloadBulkPdf']);
        });

        // ==========================================
        // REPORT CARDS MANAGEMENT (Admin)
        // ==========================================
        Route::prefix('report-cards')->group(function () {
            Route::get('/students/{student}', [ReportCardController::class, 'studentReportCards']);
            Route::get('/students/{student}/semesters/{semester}', [ReportCardController::class, 'show']);
            Route::post('/students/{student}/semesters/{semester}/generate', [ReportCardController::class, 'generatePdf']);
            Route::get('/students/{student}/semesters/{semester}/download', [ReportCardController::class, 'downloadPdf']);
            Route::post('/bulk-generate', [ReportCardController::class, 'bulkGenerate']);
            Route::post('/bulk-download', [ReportCardController::class, 'downloadBulkPdf']);
        });
    });

    // ==========================================
    // STUDENT REQUESTS - طلبات الطلاب (New System)
    // ==========================================

    // Get request types (available for all authenticated users)
    Route::get('/student-requests/types', [StudentRequestController::class, 'getRequestTypes']);

    // Student can create and view their own requests
    Route::middleware('role:STUDENT')->group(function () {
        Route::get('/student-requests', [StudentRequestController::class, 'index']);
        Route::get('/student-requests/{id}', [StudentRequestController::class, 'show']);
        Route::post('/student-requests', [StudentRequestController::class, 'store']);
        Route::put('/student-requests/{id}', [StudentRequestController::class, 'update']);
        Route::post('/student-requests/{id}/cancel', [StudentRequestController::class, 'cancel']);
        Route::post('/student-requests/{id}/comments', [StudentRequestController::class, 'addComment']);
    });

    // Staff can review and process requests
    Route::middleware('role:LECTURER,ADMIN')->group(function () {
        Route::get('/admin/student-requests', [StudentRequestController::class, 'index']);
        Route::get('/admin/student-requests/statistics', [StudentRequestController::class, 'statistics']);
        Route::get('/admin/student-requests/{id}', [StudentRequestController::class, 'show']);
        Route::post('/admin/student-requests/{id}/review', [StudentRequestController::class, 'review']);
        Route::post('/admin/student-requests/{id}/execute', [StudentRequestController::class, 'execute']);
        Route::post('/admin/student-requests/{id}/comments', [StudentRequestController::class, 'addComment']);
    });
});

// ==========================================
// STUDENT REQUEST FORMS - نماذج طلبات الطلاب المتقدمة
// (Added outside the main auth middleware for flexibility)
// ==========================================

Route::middleware('auth:sanctum')->group(function () {
    // أنواع الطلبات المتاحة (للجميع)
    Route::prefix('request-forms')->group(function () {
        Route::get('/types', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'getRequestTypes']);
        Route::get('/schema/{requestType}', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'getFormSchema']);
    });

    // طلبات الطالب الخاصة به
    Route::middleware('role:STUDENT')->prefix('request-forms')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'show']);
        Route::post('/', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'store']);
        Route::put('/{id}', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'update']);
        Route::post('/{id}/submit', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'submit']);
        Route::post('/{id}/attachments', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'uploadAttachment']);
        Route::delete('/{id}/attachments/{attachmentId}', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'deleteAttachment']);
        Route::post('/{id}/cancel', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'cancel']);
    });

    // إدارة الطلبات (للموظفين والإداريين)
    Route::middleware('role:LECTURER,ADMIN')->prefix('admin/request-forms')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'index']);
        Route::get('/pending', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'pendingForRole']);
        Route::get('/statistics', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'statistics']);
        Route::get('/{id}', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'show']);
        Route::post('/{id}/approve', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'approve']);
        Route::post('/{id}/reject', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'reject']);
        Route::post('/{id}/return', [\App\Http\Controllers\Api\StudentRequestFormController::class, 'returnForRevision']);
    });

    // ==========================================
    // DYNAMIC FORMS, TABLES, AND REPORTS
    // ==========================================

    // Dynamic Forms - Read (accessible by all authenticated users)
    Route::prefix('dynamic-forms')->group(function () {
        Route::get('/', [DynamicFormController::class, 'index']);
        Route::get('/{code}', [DynamicFormController::class, 'show']);
        Route::post('/{code}/submit', [DynamicFormController::class, 'submit']);
    });

    // Dynamic Tables - Read (accessible by all authenticated users)
    Route::prefix('dynamic-tables')->group(function () {
        Route::get('/', [DynamicTableController::class, 'index']);
        Route::get('/{code}', [DynamicTableController::class, 'show']);
        Route::get('/{code}/data', [DynamicTableController::class, 'data']);
        Route::get('/{code}/export', [DynamicTableController::class, 'export']);
        Route::get('/{code}/views', [DynamicTableController::class, 'views']);
        Route::post('/{code}/views', [DynamicTableController::class, 'saveView']);
        Route::delete('/{code}/views/{viewId}', [DynamicTableController::class, 'deleteView']);
    });

    // Dynamic Reports - Read (accessible by all authenticated users)
    Route::prefix('dynamic-reports')->group(function () {
        Route::get('/', [DynamicReportController::class, 'index']);
        Route::get('/categories', [DynamicReportController::class, 'categories']);
        Route::get('/{code}', [DynamicReportController::class, 'show']);
        Route::post('/{code}/generate', [DynamicReportController::class, 'generate']);
        Route::post('/{code}/export', [DynamicReportController::class, 'export']);
    });

    // Dynamic Forms, Tables, Reports - Admin Management
    Route::middleware('role:ADMIN')->group(function () {
        // Forms Management
        Route::prefix('dynamic-forms')->group(function () {
            Route::post('/', [DynamicFormController::class, 'store']);
            Route::put('/{code}', [DynamicFormController::class, 'update']);
            Route::delete('/{code}', [DynamicFormController::class, 'destroy']);
            Route::get('/{code}/submissions', [DynamicFormController::class, 'submissions']);
            Route::get('/{code}/submissions/{submissionId}', [DynamicFormController::class, 'getSubmission']);
            Route::post('/{code}/submissions/{submissionId}/approve', [DynamicFormController::class, 'approveSubmission']);
            Route::post('/{code}/submissions/{submissionId}/reject', [DynamicFormController::class, 'rejectSubmission']);
        });

        // Tables Management
        Route::prefix('dynamic-tables')->group(function () {
            Route::post('/', [DynamicTableController::class, 'store']);
            Route::put('/{code}', [DynamicTableController::class, 'update']);
            Route::delete('/{code}', [DynamicTableController::class, 'destroy']);
        });

        // Reports Management
        Route::prefix('dynamic-reports')->group(function () {
            Route::post('/', [DynamicReportController::class, 'store']);
            Route::put('/{code}', [DynamicReportController::class, 'update']);
            Route::delete('/{code}', [DynamicReportController::class, 'destroy']);
            Route::get('/{code}/logs', [DynamicReportController::class, 'logs']);
            Route::get('/{code}/stats', [DynamicReportController::class, 'stats']);
            Route::get('/{code}/schedules', [DynamicReportController::class, 'schedules']);
            Route::post('/{code}/schedules', [DynamicReportController::class, 'saveSchedule']);
            Route::delete('/{code}/schedules/{scheduleId}', [DynamicReportController::class, 'deleteSchedule']);
            Route::post('/{code}/schedules/{scheduleId}/toggle', [DynamicReportController::class, 'toggleSchedule']);
        });

        // ==========================================
        // ADMIN CONFIGURATION PANEL
        // ==========================================

        Route::prefix('admin/config')->group(function () {
            $systemController = \App\Http\Controllers\Api\Admin\SystemConfigController::class;
            $tableController = \App\Http\Controllers\Api\Admin\TableBuilderController::class;
            $formController = \App\Http\Controllers\Api\Admin\FormBuilderController::class;
            $reportController = \App\Http\Controllers\Api\Admin\ReportBuilderController::class;

            // System Settings
            Route::get('/settings', [$systemController, 'getSettings']);
            Route::post('/settings', [$systemController, 'updateSettings']);
            Route::post('/settings/create', [$systemController, 'createSetting']);
            Route::delete('/settings/{key}', [$systemController, 'deleteSetting']);

            // UI Themes
            Route::get('/themes', [$systemController, 'getThemes']);
            Route::post('/themes', [$systemController, 'saveTheme']);
            Route::delete('/themes/{code}', [$systemController, 'deleteTheme']);

            // Menus
            Route::get('/menus', [$systemController, 'getMenus']);
            Route::get('/menus/{code}', [$systemController, 'getMenu']);
            Route::post('/menus', [$systemController, 'saveMenu']);
            Route::post('/menus/{code}/items', [$systemController, 'saveMenuItems']);
            Route::delete('/menus/{code}', [$systemController, 'deleteMenu']);

            // Dashboard Widgets
            Route::get('/widgets', [$systemController, 'getWidgets']);
            Route::post('/widgets', [$systemController, 'saveWidget']);
            Route::delete('/widgets/{code}', [$systemController, 'deleteWidget']);

            // Dashboard Layouts
            Route::get('/dashboard-layouts', [$systemController, 'getDashboardLayouts']);
            Route::post('/dashboard-layouts', [$systemController, 'saveDashboardLayout']);
            Route::delete('/dashboard-layouts/{code}', [$systemController, 'deleteDashboardLayout']);

            // Page Configurations
            Route::get('/pages', [$systemController, 'getPageConfigs']);
            Route::get('/pages/{key}', [$systemController, 'getPageConfig']);
            Route::post('/pages', [$systemController, 'savePageConfig']);
            Route::delete('/pages/{key}', [$systemController, 'deletePageConfig']);

            // Table Builder
            Route::prefix('tables')->group(function () use ($tableController) {
                Route::get('/', [$tableController, 'index']);
                Route::get('/models', [$tableController, 'getAvailableModels']);
                Route::get('/model-fields', [$tableController, 'getModelFields']);
                Route::get('/{code}', [$tableController, 'show']);
                Route::post('/', [$tableController, 'store']);
                Route::delete('/{code}', [$tableController, 'destroy']);
                Route::post('/{code}/duplicate', [$tableController, 'duplicate']);
                Route::get('/{code}/columns', [$tableController, 'getColumns']);
                Route::post('/{code}/columns', [$tableController, 'saveColumns']);
                Route::delete('/columns/{id}', [$tableController, 'deleteColumn']);
                Route::get('/{code}/filters', [$tableController, 'getFilters']);
                Route::post('/{code}/filters', [$tableController, 'saveFilters']);
                Route::delete('/filters/{id}', [$tableController, 'deleteFilter']);
            });

            // Form Builder
            Route::prefix('forms')->group(function () use ($formController) {
                Route::get('/', [$formController, 'index']);
                Route::get('/field-types', [$formController, 'getFieldTypes']);
                Route::get('/{code}', [$formController, 'show']);
                Route::post('/', [$formController, 'store']);
                Route::delete('/{code}', [$formController, 'destroy']);
                Route::post('/{code}/duplicate', [$formController, 'duplicate']);
                Route::get('/{code}/sections', [$formController, 'getSections']);
                Route::post('/{code}/sections', [$formController, 'saveSections']);
                Route::get('/{code}/fields', [$formController, 'getFields']);
                Route::post('/{code}/fields', [$formController, 'saveFields']);
                Route::delete('/fields/{id}', [$formController, 'deleteField']);
            });

            // Report Builder
            Route::prefix('reports')->group(function () use ($reportController) {
                Route::get('/', [$reportController, 'index']);
                Route::get('/categories', [$reportController, 'getReportCategories']);
                Route::get('/chart-types', [$reportController, 'getChartTypes']);
                Route::get('/{code}', [$reportController, 'show']);
                Route::post('/', [$reportController, 'store']);
                Route::delete('/{code}', [$reportController, 'destroy']);
                Route::post('/{code}/duplicate', [$reportController, 'duplicate']);
                Route::post('/{code}/fields', [$reportController, 'saveFields']);
                Route::post('/{code}/parameters', [$reportController, 'saveParameters']);
                Route::post('/{code}/charts', [$reportController, 'saveCharts']);
                Route::get('/{code}/schedules', [$reportController, 'getSchedules']);
                Route::post('/{code}/schedules', [$reportController, 'saveSchedule']);
                Route::delete('/schedules/{id}', [$reportController, 'deleteSchedule']);
            });
        });
    });
});

// ==========================================
// LECTURES MODULE - موديول المحاضرات
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    // Public lecture endpoints (for all authenticated users)
    Route::get('/lectures', [LectureController::class, 'index']);
    Route::get('/lectures/today', [LectureController::class, 'today']);
    Route::get('/lectures/this-week', [LectureController::class, 'thisWeek']);
    Route::get('/lectures/upcoming', [LectureController::class, 'upcoming']);
    Route::get('/lectures/{lecture}', [LectureController::class, 'show']);
    Route::get('/courses/{course}/lectures', [LectureController::class, 'courseLectures']);

    // Student-only lecture routes
    Route::middleware('role:STUDENT')->group(function () {
        // Student attendance (check-in/out)
        Route::post('/lectures/{lecture}/check-in', [LectureAttendanceController::class, 'checkInByQR']);
        Route::post('/lectures/{lecture}/check-out', [LectureAttendanceController::class, 'checkOut']);
        Route::get('/my-attendance', [LectureAttendanceController::class, 'myAttendance']);

        // Student lecture materials (view only visible ones)
        Route::get('/lectures/{lecture}/materials', [LectureMaterialController::class, 'index']);
        Route::get('/lectures/{lecture}/materials/{material}', [LectureMaterialController::class, 'show']);
        Route::get('/lectures/{lecture}/materials/{material}/download', [LectureMaterialController::class, 'download']);
    });

    // Lecturer routes
    Route::middleware('role:LECTURER,ADMIN')->group(function () {
        // Lecturer schedule
        Route::get('/lecturer/lectures', [LectureController::class, 'lecturerSchedule']);

        // Lecture management
        Route::post('/lectures', [LectureController::class, 'store']);
        Route::put('/lectures/{lecture}', [LectureController::class, 'update']);
        Route::post('/lectures/{lecture}/start', [LectureController::class, 'start']);
        Route::post('/lectures/{lecture}/complete', [LectureController::class, 'complete']);
        Route::post('/lectures/{lecture}/cancel', [LectureController::class, 'cancel']);
        Route::post('/lectures/{lecture}/postpone', [LectureController::class, 'postpone']);
        Route::post('/lectures/{lecture}/duplicate', [LectureController::class, 'duplicate']);

        // Lecture materials management
        Route::post('/lectures/{lecture}/materials', [LectureMaterialController::class, 'store']);
        Route::put('/lectures/{lecture}/materials/{material}', [LectureMaterialController::class, 'update']);
        Route::delete('/lectures/{lecture}/materials/{material}', [LectureMaterialController::class, 'destroy']);
        Route::post('/lectures/{lecture}/materials/reorder', [LectureMaterialController::class, 'reorder']);
        Route::post('/lectures/{lecture}/materials/copy-from', [LectureMaterialController::class, 'copyFrom']);

        // Attendance management
        Route::get('/lectures/{lecture}/attendance', [LectureAttendanceController::class, 'index']);
        Route::post('/lectures/{lecture}/attendance/initialize', [LectureAttendanceController::class, 'initialize']);
        Route::post('/lectures/{lecture}/attendance/record', [LectureAttendanceController::class, 'recordSingle']);
        Route::post('/lectures/{lecture}/attendance/bulk', [LectureAttendanceController::class, 'recordBulk']);
        Route::post('/lectures/{lecture}/attendance/{student}/excuse', [LectureAttendanceController::class, 'markExcused']);

        // Student attendance report
        Route::get('/students/{student}/lecture-attendance', [LectureAttendanceController::class, 'studentAttendance']);
    });

    // Admin-only routes
    Route::middleware('role:ADMIN')->group(function () {
        // Full lecture management
        Route::delete('/lectures/{lecture}', [LectureController::class, 'destroy']);
        Route::post('/lectures/recurring', [LectureController::class, 'createRecurring']);

        // Statistics
        Route::get('/lectures-statistics', [LectureController::class, 'statistics']);

        // Course attendance report
        Route::get('/course-attendance-report', [LectureAttendanceController::class, 'courseAttendanceReport']);
    });
});

// ==========================================
// MOODLE LMS INTEGRATION (Admin)
// ==========================================
Route::middleware(['auth:sanctum'])->prefix('moodle')->group(function () {
    // حالة الاتصال والإحصائيات
    Route::get('/status', [MoodleSyncController::class, 'getStatus']);
    Route::get('/sync/status', [MoodleSyncController::class, 'getSyncStatus']);
    Route::post('/test-connection', [MoodleSyncController::class, 'testConnection']);

    // مزامنة البيانات إلى Moodle (Admin only)
    Route::middleware('role:ADMIN')->group(function () {
        // جلب المستخدمين من LMS
        Route::get('/users', [MoodleSyncController::class, 'getLmsUsers']);
        Route::get('/lecturers', [MoodleSyncController::class, 'getLmsLecturers']);

        // استيراد المحاضرين من LMS إلى SIS
        Route::post('/import/lecturers', [MoodleSyncController::class, 'importLecturers']);

        Route::post('/sync/students', [MoodleSyncController::class, 'syncStudents']);
        Route::post('/sync/lecturers', [MoodleSyncController::class, 'syncLecturers']);
        Route::post('/sync/courses', [MoodleSyncController::class, 'syncCourses']);
        Route::post('/sync/enrollments', [MoodleSyncController::class, 'syncEnrollments']);

        // استيراد العلامات من Moodle
        Route::post('/import/grades', [MoodleSyncController::class, 'importGrades']);
        Route::post('/sync/grades-to-sis', [MoodleSyncController::class, 'syncGradesToSis']);

        // إعادة محاولة المزامنات الفاشلة
        Route::post('/retry-failed', [MoodleSyncController::class, 'retryFailed']);

        // سجل المزامنة
        Route::get('/logs', [MoodleSyncController::class, 'getLogs']);
    });
});

// ==========================================
// PUBLIC CONFIGURATION (Frontend)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/config/public', [\App\Http\Controllers\Api\Admin\SystemConfigController::class, 'getPublicConfig']);
    Route::get('/config/dashboard', [\App\Http\Controllers\Api\Admin\SystemConfigController::class, 'getDashboard']);

    // Frontend specific config endpoints
    Route::get('/config/menus/{role}', [\App\Http\Controllers\Api\Admin\SystemConfigController::class, 'getMenuByRole']);
    Route::get('/config/dashboard/{role}', [\App\Http\Controllers\Api\Admin\SystemConfigController::class, 'getDashboardByRole']);
    Route::get('/config/theme', [\App\Http\Controllers\Api\Admin\SystemConfigController::class, 'getCurrentTheme']);
    Route::get('/config/widgets', [\App\Http\Controllers\Api\Admin\SystemConfigController::class, 'getActiveWidgets']);
    Route::get('/config/page/{key}', [\App\Http\Controllers\Api\Admin\SystemConfigController::class, 'getPageConfig']);
});
