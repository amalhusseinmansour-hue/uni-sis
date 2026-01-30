<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentRequestForm;
use App\Models\StudentRequestAttachment;
use App\Models\StudentRequestCourse;
use App\Models\StudentRequestEquivalency;
use App\Services\StudentRequestWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StudentRequestFormController extends Controller
{
    protected StudentRequestWorkflowService $workflowService;

    public function __construct(StudentRequestWorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    /**
     * الحصول على قائمة أنواع الطلبات المتاحة
     */
    public function getRequestTypes(): JsonResponse
    {
        $types = collect(StudentRequestForm::REQUEST_TYPES)->map(function ($type, $key) {
            return [
                'code' => $key,
                'name_ar' => $type['name_ar'],
                'name_en' => $type['name_en'],
                'workflow' => collect($type['workflow'])->map(function ($role) {
                    return [
                        'role' => $role,
                        'name_ar' => StudentRequestForm::APPROVAL_ROLES[$role]['name_ar'] ?? $role,
                        'name_en' => StudentRequestForm::APPROVAL_ROLES[$role]['name_en'] ?? $role,
                    ];
                }),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    /**
     * الحصول على نموذج طلب محدد (الحقول المطلوبة)
     */
    public function getFormSchema(string $requestType): JsonResponse
    {
        $schemas = $this->getFormSchemas();

        if (!isset($schemas[$requestType])) {
            return response()->json([
                'success' => false,
                'message' => 'نوع الطلب غير موجود',
            ], 404);
        }

        $typeInfo = StudentRequestForm::REQUEST_TYPES[$requestType] ?? null;

        return response()->json([
            'success' => true,
            'data' => [
                'request_type' => $requestType,
                'name_ar' => $typeInfo['name_ar'] ?? $requestType,
                'name_en' => $typeInfo['name_en'] ?? $requestType,
                'fields' => $schemas[$requestType]['fields'],
                'required_attachments' => $schemas[$requestType]['required_attachments'] ?? [],
                'optional_attachments' => $schemas[$requestType]['optional_attachments'] ?? [],
                'workflow' => $typeInfo['workflow'] ?? [],
            ],
        ]);
    }

    /**
     * تعريف حقول كل نوع من الطلبات
     */
    protected function getFormSchemas(): array
    {
        return [
            // طلب تسجيل استثنائي / متأخر
            'EXCEPTIONAL_REGISTRATION' => [
                'fields' => [
                    ['name' => 'program_id', 'type' => 'select', 'required' => true, 'label_ar' => 'البرنامج', 'label_en' => 'Program'],
                    ['name' => 'department_id', 'type' => 'select', 'required' => true, 'label_ar' => 'التخصص', 'label_en' => 'Major'],
                    ['name' => 'semester_id', 'type' => 'select', 'required' => true, 'label_ar' => 'الفصل الدراسي الحالي', 'label_en' => 'Current Semester'],
                    ['name' => 'requested_courses', 'type' => 'course_selector', 'required' => true, 'label_ar' => 'المساقات المطلوب تسجيلها', 'label_en' => 'Courses to Register'],
                    ['name' => 'reason', 'type' => 'textarea', 'required' => true, 'label_ar' => 'سبب الطلب', 'label_en' => 'Reason'],
                    ['name' => 'fees_paid', 'type' => 'boolean', 'required' => true, 'label_ar' => 'هل تم دفع الرسوم؟', 'label_en' => 'Fees Paid?'],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => [],
                'optional_attachments' => ['INSTRUCTOR_SUPPORT_LETTER', 'DEPARTMENT_SUPPORT_LETTER', 'PAYMENT_RECEIPT'],
            ],

            // طلب تأجيل فصل
            'SEMESTER_POSTPONE' => [
                'fields' => [
                    ['name' => 'program_id', 'type' => 'select', 'required' => true, 'label_ar' => 'البرنامج', 'label_en' => 'Program'],
                    ['name' => 'department_id', 'type' => 'select', 'required' => true, 'label_ar' => 'التخصص', 'label_en' => 'Major'],
                    ['name' => 'semester_id', 'type' => 'select', 'required' => true, 'label_ar' => 'الفصل المطلوب تأجيله', 'label_en' => 'Semester to Postpone'],
                    ['name' => 'previous_postponements_count', 'type' => 'number', 'required' => true, 'label_ar' => 'عدد مرات التأجيل السابقة', 'label_en' => 'Previous Postponements'],
                    ['name' => 'postponement_reason_type', 'type' => 'select', 'required' => true, 'label_ar' => 'نوع السبب', 'label_en' => 'Reason Type', 'options' => [
                        ['value' => 'MEDICAL', 'label_ar' => 'صحي', 'label_en' => 'Medical'],
                        ['value' => 'SOCIAL', 'label_ar' => 'اجتماعي', 'label_en' => 'Social'],
                        ['value' => 'FINANCIAL', 'label_ar' => 'مالي', 'label_en' => 'Financial'],
                        ['value' => 'MILITARY', 'label_ar' => 'عسكري', 'label_en' => 'Military'],
                        ['value' => 'WORK', 'label_ar' => 'عمل', 'label_en' => 'Work'],
                        ['value' => 'OTHER', 'label_ar' => 'أخرى', 'label_en' => 'Other'],
                    ]],
                    ['name' => 'reason', 'type' => 'textarea', 'required' => true, 'label_ar' => 'سبب التأجيل', 'label_en' => 'Reason'],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => [],
                'optional_attachments' => ['MEDICAL_REPORT', 'OFFICIAL_DOCUMENT', 'OTHER'],
            ],

            // طلب تجميد فصل
            'SEMESTER_FREEZE' => [
                'fields' => [
                    ['name' => 'program_id', 'type' => 'select', 'required' => true, 'label_ar' => 'البرنامج', 'label_en' => 'Program'],
                    ['name' => 'department_id', 'type' => 'select', 'required' => true, 'label_ar' => 'التخصص', 'label_en' => 'Major'],
                    ['name' => 'semester_id', 'type' => 'select', 'required' => true, 'label_ar' => 'الفصل المطلوب تجميده', 'label_en' => 'Semester to Freeze'],
                    ['name' => 'previous_postponements_count', 'type' => 'number', 'required' => true, 'label_ar' => 'عدد مرات التأجيل/التجميد السابقة', 'label_en' => 'Previous Postponements/Freezes'],
                    ['name' => 'postponement_reason_type', 'type' => 'select', 'required' => true, 'label_ar' => 'نوع السبب', 'label_en' => 'Reason Type', 'options' => [
                        ['value' => 'MEDICAL', 'label_ar' => 'صحي', 'label_en' => 'Medical'],
                        ['value' => 'SOCIAL', 'label_ar' => 'اجتماعي', 'label_en' => 'Social'],
                        ['value' => 'FINANCIAL', 'label_ar' => 'مالي', 'label_en' => 'Financial'],
                        ['value' => 'MILITARY', 'label_ar' => 'عسكري', 'label_en' => 'Military'],
                        ['value' => 'WORK', 'label_ar' => 'عمل', 'label_en' => 'Work'],
                        ['value' => 'OTHER', 'label_ar' => 'أخرى', 'label_en' => 'Other'],
                    ]],
                    ['name' => 'reason', 'type' => 'textarea', 'required' => true, 'label_ar' => 'سبب التجميد', 'label_en' => 'Reason'],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => [],
                'optional_attachments' => ['MEDICAL_REPORT', 'OFFICIAL_DOCUMENT', 'OTHER'],
            ],

            // الانسحاب من فصل كامل
            'SEMESTER_WITHDRAWAL' => [
                'fields' => [
                    ['name' => 'program_id', 'type' => 'select', 'required' => true, 'label_ar' => 'البرنامج', 'label_en' => 'Program'],
                    ['name' => 'department_id', 'type' => 'select', 'required' => true, 'label_ar' => 'التخصص', 'label_en' => 'Major'],
                    ['name' => 'semester_id', 'type' => 'select', 'required' => true, 'label_ar' => 'الفصل المطلوب الانسحاب منه', 'label_en' => 'Semester to Withdraw From'],
                    ['name' => 'reason', 'type' => 'textarea', 'required' => true, 'label_ar' => 'سبب الانسحاب', 'label_en' => 'Withdrawal Reason'],
                    ['name' => 'previous_withdrawals_count', 'type' => 'number', 'required' => true, 'label_ar' => 'عدد الانسحابات السابقة', 'label_en' => 'Previous Withdrawals'],
                    ['name' => 'return_next_semester', 'type' => 'boolean', 'required' => true, 'label_ar' => 'هل يرغب بالعودة الفصل القادم؟', 'label_en' => 'Return Next Semester?'],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => [],
                'optional_attachments' => ['MEDICAL_REPORT', 'OFFICIAL_DOCUMENT', 'OTHER'],
            ],

            // إعادة القيد
            'RE_ENROLLMENT' => [
                'fields' => [
                    ['name' => 'department_id', 'type' => 'select', 'required' => true, 'label_ar' => 'التخصص', 'label_en' => 'Major'],
                    ['name' => 'return_semester_id', 'type' => 'select', 'required' => true, 'label_ar' => 'الفصل المطلوب العودة فيه', 'label_en' => 'Return Semester'],
                    ['name' => 'postponement_date', 'type' => 'date', 'required' => true, 'label_ar' => 'تاريخ التأجيل/التجميد', 'label_en' => 'Postponement/Freeze Date'],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => [],
                'optional_attachments' => ['OFFICIAL_DOCUMENT'],
            ],

            // طلب معادلة مواد
            'COURSE_EQUIVALENCY' => [
                'fields' => [
                    ['name' => 'program_id', 'type' => 'select', 'required' => true, 'label_ar' => 'البرنامج', 'label_en' => 'Program'],
                    ['name' => 'department_id', 'type' => 'select', 'required' => true, 'label_ar' => 'التخصص', 'label_en' => 'Major'],
                    ['name' => 'previous_institution', 'type' => 'text', 'required' => true, 'label_ar' => 'الجامعة/الجهة التي درس بها سابقًا', 'label_en' => 'Previous Institution'],
                    ['name' => 'courses_to_equate', 'type' => 'equivalency_table', 'required' => true, 'label_ar' => 'قائمة المواد المطلوب معادلتها', 'label_en' => 'Courses to Equate'],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => ['TRANSCRIPT', 'COURSE_DESCRIPTION'],
                'optional_attachments' => [],
            ],

            // طلب إعادة امتحان
            'EXAM_RETAKE' => [
                'fields' => [
                    ['name' => 'course_id', 'type' => 'select', 'required' => true, 'label_ar' => 'المساق', 'label_en' => 'Course'],
                    ['name' => 'exam_type', 'type' => 'select', 'required' => true, 'label_ar' => 'نوع الامتحان', 'label_en' => 'Exam Type', 'options' => [
                        ['value' => 'FIRST', 'label_ar' => 'أول', 'label_en' => 'First'],
                        ['value' => 'MIDTERM', 'label_ar' => 'نصفي', 'label_en' => 'Midterm'],
                        ['value' => 'FINAL', 'label_ar' => 'نهائي', 'label_en' => 'Final'],
                    ]],
                    ['name' => 'absence_reason', 'type' => 'textarea', 'required' => true, 'label_ar' => 'سبب عدم التقديم', 'label_en' => 'Absence Reason'],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => ['MEDICAL_REPORT'],
                'optional_attachments' => ['OFFICIAL_DOCUMENT'],
            ],

            // طلب مراجعة علامة
            'GRADE_REVIEW' => [
                'fields' => [
                    ['name' => 'course_id', 'type' => 'select', 'required' => true, 'label_ar' => 'المساق', 'label_en' => 'Course'],
                    ['name' => 'exam_type', 'type' => 'select', 'required' => true, 'label_ar' => 'نوع الامتحان', 'label_en' => 'Exam Type', 'options' => [
                        ['value' => 'QUIZ', 'label_ar' => 'كويز', 'label_en' => 'Quiz'],
                        ['value' => 'MIDTERM', 'label_ar' => 'ميد', 'label_en' => 'Midterm'],
                        ['value' => 'FINAL', 'label_ar' => 'فاينال', 'label_en' => 'Final'],
                    ]],
                    ['name' => 'objection_reason', 'type' => 'textarea', 'required' => true, 'label_ar' => 'سبب الاعتراض', 'label_en' => 'Objection Reason'],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => [],
                'optional_attachments' => [],
            ],

            // طلب تغيير تخصص
            'MAJOR_CHANGE' => [
                'fields' => [
                    ['name' => 'current_department_id', 'type' => 'select', 'required' => true, 'label_ar' => 'التخصص الحالي', 'label_en' => 'Current Major'],
                    ['name' => 'requested_department_id', 'type' => 'select', 'required' => true, 'label_ar' => 'التخصص المطلوب', 'label_en' => 'Requested Major'],
                    ['name' => 'reason', 'type' => 'textarea', 'required' => true, 'label_ar' => 'سبب التغيير', 'label_en' => 'Reason for Change'],
                    ['name' => 'earned_credits', 'type' => 'number', 'required' => true, 'label_ar' => 'عدد الساعات المكتسبة', 'label_en' => 'Earned Credits'],
                    ['name' => 'current_gpa', 'type' => 'number', 'required' => true, 'label_ar' => 'المعدل الحالي', 'label_en' => 'Current GPA', 'step' => '0.01', 'min' => 0, 'max' => 4],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => [],
                'optional_attachments' => ['OFFICIAL_DOCUMENT'],
            ],

            // طلب تمديد فصول دراسية
            'STUDY_PLAN_EXTENSION' => [
                'fields' => [
                    ['name' => 'program_id', 'type' => 'select', 'required' => true, 'label_ar' => 'البرنامج', 'label_en' => 'Program'],
                    ['name' => 'department_id', 'type' => 'select', 'required' => true, 'label_ar' => 'التخصص', 'label_en' => 'Major'],
                    ['name' => 'current_study_plan', 'type' => 'text', 'required' => true, 'label_ar' => 'الخطة الحالية', 'label_en' => 'Current Plan'],
                    ['name' => 'requested_study_plan', 'type' => 'text', 'required' => true, 'label_ar' => 'الخطة المطلوبة', 'label_en' => 'Requested Plan'],
                    ['name' => 'reason', 'type' => 'textarea', 'required' => true, 'label_ar' => 'سبب التغيير', 'label_en' => 'Reason'],
                    ['name' => 'phone', 'type' => 'tel', 'required' => true, 'label_ar' => 'رقم الهاتف', 'label_en' => 'Phone'],
                ],
                'required_attachments' => [],
                'optional_attachments' => ['OFFICIAL_DOCUMENT'],
            ],
        ];
    }

    /**
     * قائمة طلبات الطالب
     */
    public function index(Request $request): JsonResponse
    {
        $studentId = $request->query('student_id');
        $type = $request->query('type');
        $status = $request->query('status');

        $query = StudentRequestForm::query()
            ->with(['student', 'department', 'program', 'semester', 'approvals']);

        if ($studentId) {
            $query->forStudent($studentId);
        }

        if ($type) {
            $query->ofType($type);
        }

        if ($status) {
            $query->status($status);
        }

        $requests = $query->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * عرض تفاصيل طلب
     */
    public function show(int $id): JsonResponse
    {
        $requestForm = StudentRequestForm::with([
            'student',
            'department',
            'program',
            'semester',
            'course',
            'currentDepartment',
            'requestedDepartment',
            'attachments',
            'approvals',
            'requestCourses.course',
            'equivalencies.targetCourse',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $requestForm,
        ]);
    }

    /**
     * إنشاء طلب جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'request_type' => ['required', Rule::in(array_keys(StudentRequestForm::REQUEST_TYPES))],
            'program_id' => 'nullable|exists:programs,id',
            'department_id' => 'nullable|exists:departments,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'phone' => 'nullable|string',
            'reason' => 'nullable|string',
            'fees_paid' => 'nullable|boolean',
            'previous_postponements_count' => 'nullable|integer|min:0',
            'postponement_reason_type' => 'nullable|string',
            'previous_withdrawals_count' => 'nullable|integer|min:0',
            'return_next_semester' => 'nullable|boolean',
            'postponement_date' => 'nullable|date',
            'return_semester_id' => 'nullable|exists:semesters,id',
            'previous_institution' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
            'exam_type' => 'nullable|string',
            'absence_reason' => 'nullable|string',
            'objection_reason' => 'nullable|string',
            'current_department_id' => 'nullable|exists:departments,id',
            'requested_department_id' => 'nullable|exists:departments,id',
            'earned_credits' => 'nullable|integer|min:0',
            'current_gpa' => 'nullable|numeric|min:0|max:4',
            'current_study_plan' => 'nullable|string',
            'requested_study_plan' => 'nullable|string',
            'student_notes' => 'nullable|string',
            'submit' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            // Generate request number
            $validated['request_number'] = StudentRequestForm::generateRequestNumber($validated['request_type']);
            $validated['status'] = 'DRAFT';

            $requestForm = StudentRequestForm::create($validated);

            // إذا كان الطلب يتضمن مساقات للتسجيل
            if ($request->has('courses') && is_array($request->courses)) {
                foreach ($request->courses as $course) {
                    StudentRequestCourse::create([
                        'student_request_form_id' => $requestForm->id,
                        'course_id' => $course['course_id'],
                        'section' => $course['section'] ?? null,
                        'reason' => $course['reason'] ?? null,
                    ]);
                }
            }

            // إذا كان الطلب يتضمن مواد للمعادلة
            if ($request->has('equivalencies') && is_array($request->equivalencies)) {
                foreach ($request->equivalencies as $eq) {
                    StudentRequestEquivalency::create([
                        'student_request_form_id' => $requestForm->id,
                        'target_course_id' => $eq['target_course_id'],
                        'source_course_code' => $eq['source_course_code'],
                        'source_course_name_ar' => $eq['source_course_name_ar'] ?? null,
                        'source_course_name_en' => $eq['source_course_name_en'] ?? null,
                        'source_credits' => $eq['source_credits'] ?? null,
                        'source_grade' => $eq['source_grade'] ?? null,
                    ]);
                }
            }

            // تقديم الطلب مباشرة إذا طلب ذلك
            if ($request->boolean('submit')) {
                $this->workflowService->submitRequest($requestForm);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء الطلب بنجاح',
                'data' => $requestForm->load(['attachments', 'approvals', 'requestCourses', 'equivalencies']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنشاء الطلب',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * تحديث طلب (مسودة فقط)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $requestForm = StudentRequestForm::findOrFail($id);

        if (!in_array($requestForm->status, ['DRAFT'])) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تعديل الطلب بعد تقديمه',
            ], 400);
        }

        $validated = $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'department_id' => 'nullable|exists:departments,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'phone' => 'nullable|string',
            'reason' => 'nullable|string',
            'fees_paid' => 'nullable|boolean',
            'previous_postponements_count' => 'nullable|integer|min:0',
            'postponement_reason_type' => 'nullable|string',
            'previous_withdrawals_count' => 'nullable|integer|min:0',
            'return_next_semester' => 'nullable|boolean',
            'postponement_date' => 'nullable|date',
            'return_semester_id' => 'nullable|exists:semesters,id',
            'previous_institution' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
            'exam_type' => 'nullable|string',
            'absence_reason' => 'nullable|string',
            'objection_reason' => 'nullable|string',
            'current_department_id' => 'nullable|exists:departments,id',
            'requested_department_id' => 'nullable|exists:departments,id',
            'earned_credits' => 'nullable|integer|min:0',
            'current_gpa' => 'nullable|numeric|min:0|max:4',
            'current_study_plan' => 'nullable|string',
            'requested_study_plan' => 'nullable|string',
            'student_notes' => 'nullable|string',
        ]);

        $requestForm->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الطلب بنجاح',
            'data' => $requestForm->fresh(),
        ]);
    }

    /**
     * تقديم الطلب
     */
    public function submit(int $id): JsonResponse
    {
        $requestForm = StudentRequestForm::findOrFail($id);

        if ($requestForm->status !== 'DRAFT') {
            return response()->json([
                'success' => false,
                'message' => 'الطلب مقدم بالفعل',
            ], 400);
        }

        $this->workflowService->submitRequest($requestForm);

        return response()->json([
            'success' => true,
            'message' => 'تم تقديم الطلب بنجاح',
            'data' => $requestForm->fresh(['approvals']),
        ]);
    }

    /**
     * رفع مرفق
     */
    public function uploadAttachment(Request $request, int $id): JsonResponse
    {
        $requestForm = StudentRequestForm::findOrFail($id);

        // SECURITY: Add MIME type validation to prevent executable uploads
        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB max
            'attachment_type' => ['required', Rule::in(array_keys(StudentRequestAttachment::ATTACHMENT_TYPES))],
            'description' => 'nullable|string',
        ]);

        $file = $request->file('file');

        // SECURITY: Verify MIME type matches extension (prevent MIME spoofing)
        $allowedMimes = [
            'application/pdf' => 'pdf',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        ];

        $fileMime = $file->getMimeType();
        if (!isset($allowedMimes[$fileMime])) {
            return response()->json([
                'success' => false,
                'message' => 'نوع الملف غير مسموح. الأنواع المسموحة: PDF, JPG, PNG, DOC, DOCX',
                'message_en' => 'Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX',
            ], 422);
        }

        // SECURITY: Generate secure UUID filename to prevent path traversal
        $secureFilename = \Illuminate\Support\Str::uuid() . '.' . $allowedMimes[$fileMime];

        // SECURITY: Store in PRIVATE disk - not publicly accessible
        $path = $file->storeAs('student-requests/' . $requestForm->id, $secureFilename, 'local');

        $attachment = StudentRequestAttachment::create([
            'student_request_form_id' => $requestForm->id,
            'attachment_type' => $validated['attachment_type'],
            'file_name' => $file->getClientOriginalName(), // Keep original name for display
            'file_path' => $path,
            'file_type' => $fileMime,
            'file_size' => $file->getSize(),
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفع المرفق بنجاح',
            'data' => $attachment,
        ]);
    }

    /**
     * حذف مرفق
     */
    public function deleteAttachment(int $id, int $attachmentId): JsonResponse
    {
        $attachment = StudentRequestAttachment::where('student_request_form_id', $id)
            ->findOrFail($attachmentId);

        // SECURITY: Delete from private storage
        Storage::disk('local')->delete($attachment->file_path);
        $attachment->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المرفق بنجاح',
        ]);
    }

    /**
     * الموافقة على الطلب (للمسؤولين)
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $requestForm = StudentRequestForm::findOrFail($id);

        $validated = $request->validate([
            'comments' => 'nullable|string',
        ]);

        $approverId = auth()->id() ?? 1; // استخدام ID المستخدم الحالي

        $success = $this->workflowService->approveStep(
            $requestForm,
            $approverId,
            $validated['comments'] ?? null
        );

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن الموافقة على هذا الطلب',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'تمت الموافقة بنجاح',
            'data' => $requestForm->fresh(['approvals']),
        ]);
    }

    /**
     * رفض الطلب (للمسؤولين)
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $requestForm = StudentRequestForm::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
            'comments' => 'nullable|string',
        ]);

        $approverId = auth()->id() ?? 1;

        $success = $this->workflowService->rejectStep(
            $requestForm,
            $approverId,
            $validated['reason'],
            $validated['comments'] ?? null
        );

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن رفض هذا الطلب',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم رفض الطلب',
            'data' => $requestForm->fresh(['approvals']),
        ]);
    }

    /**
     * إرجاع الطلب للتعديل
     */
    public function returnForRevision(Request $request, int $id): JsonResponse
    {
        $requestForm = StudentRequestForm::findOrFail($id);

        $validated = $request->validate([
            'comments' => 'required|string',
        ]);

        $approverId = auth()->id() ?? 1;

        $success = $this->workflowService->returnForRevision(
            $requestForm,
            $approverId,
            $validated['comments']
        );

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن إرجاع هذا الطلب',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إرجاع الطلب للتعديل',
            'data' => $requestForm->fresh(['approvals']),
        ]);
    }

    /**
     * إلغاء الطلب
     */
    public function cancel(int $id): JsonResponse
    {
        $requestForm = StudentRequestForm::findOrFail($id);

        if (in_array($requestForm->status, ['APPROVED', 'COMPLETED', 'CANCELLED'])) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن إلغاء هذا الطلب',
            ], 400);
        }

        $this->workflowService->cancelRequest($requestForm);

        return response()->json([
            'success' => true,
            'message' => 'تم إلغاء الطلب',
        ]);
    }

    /**
     * الطلبات المعلقة لدور معين
     */
    public function pendingForRole(Request $request): JsonResponse
    {
        $role = $request->query('role');
        $departmentId = $request->query('department_id');
        $collegeId = $request->query('college_id');

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'يجب تحديد الدور',
            ], 400);
        }

        $requests = $this->workflowService->getPendingRequestsForRole(
            $role,
            $departmentId,
            $collegeId
        );

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * إحصائيات الطلبات
     */
    public function statistics(Request $request): JsonResponse
    {
        $departmentId = $request->query('department_id');
        $collegeId = $request->query('college_id');

        $stats = $this->workflowService->getRequestStatistics($departmentId, $collegeId);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
