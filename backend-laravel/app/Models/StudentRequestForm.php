<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentRequestForm extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'request_number',
        'request_type',
        'program_id',
        'department_id',
        'semester_id',
        'phone',
        'reason',
        // طلب التسجيل الاستثنائي
        'requested_courses',
        'fees_paid',
        // طلب التأجيل / التجميد
        'previous_postponements_count',
        'postponement_reason_type',
        // الانسحاب من فصل
        'previous_withdrawals_count',
        'return_next_semester',
        // إعادة القيد
        'postponement_date',
        'return_semester_id',
        // معادلة المواد
        'courses_to_equate',
        'previous_institution',
        // إعادة الامتحان
        'course_id',
        'exam_type',
        'absence_reason',
        // مراجعة العلامة
        'objection_reason',
        // تغيير التخصص
        'current_department_id',
        'requested_department_id',
        'earned_credits',
        'current_gpa',
        // تمديد الخطة
        'current_study_plan',
        'requested_study_plan',
        // الحالة والموافقات
        'status',
        'approval_workflow',
        'current_approval_step',
        'student_notes',
        'admin_notes',
        'rejection_reason',
        'submitted_by',
        'reviewed_by',
        'approved_by',
        'submitted_at',
        'reviewed_at',
        'approved_at',
        'completed_at',
    ];

    protected $casts = [
        'requested_courses' => 'array',
        'courses_to_equate' => 'array',
        'approval_workflow' => 'array',
        'fees_paid' => 'boolean',
        'return_next_semester' => 'boolean',
        'current_gpa' => 'decimal:2',
        'postponement_date' => 'date',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // أنواع الطلبات مع وصفها
    public const REQUEST_TYPES = [
        'EXCEPTIONAL_REGISTRATION' => [
            'name_ar' => 'طلب تسجيل استثنائي / متأخر',
            'name_en' => 'Exceptional/Late Registration Request',
            'workflow' => ['DEPT_HEAD', 'DEAN'],
        ],
        'SEMESTER_POSTPONE' => [
            'name_ar' => 'طلب تأجيل فصل',
            'name_en' => 'Semester Postponement Request',
            'workflow' => ['STUDENT_AFFAIRS', 'DEPT_HEAD', 'FINANCE', 'ACADEMIC_AFFAIRS'],
        ],
        'SEMESTER_FREEZE' => [
            'name_ar' => 'طلب تجميد فصل',
            'name_en' => 'Semester Freeze Request',
            'workflow' => ['STUDENT_AFFAIRS', 'DEPT_HEAD', 'FINANCE', 'ACADEMIC_AFFAIRS'],
        ],
        'SEMESTER_WITHDRAWAL' => [
            'name_ar' => 'الانسحاب من فصل كامل',
            'name_en' => 'Full Semester Withdrawal',
            'workflow' => ['DEPT_HEAD', 'ACADEMIC_AFFAIRS', 'STUDENT_AFFAIRS', 'FINANCE'],
        ],
        'RE_ENROLLMENT' => [
            'name_ar' => 'إعادة القيد',
            'name_en' => 'Re-enrollment Request',
            'workflow' => ['ADMISSIONS', 'ACADEMIC_AFFAIRS'],
        ],
        'COURSE_EQUIVALENCY' => [
            'name_ar' => 'طلب معادلة مواد',
            'name_en' => 'Course Equivalency Request',
            'workflow' => ['ACADEMIC_AFFAIRS', 'FINANCE', 'DEAN'],
        ],
        'EXAM_RETAKE' => [
            'name_ar' => 'طلب إعادة امتحان',
            'name_en' => 'Exam Retake Request',
            'workflow' => ['COURSE_INSTRUCTOR', 'STUDENT_AFFAIRS'],
        ],
        'GRADE_REVIEW' => [
            'name_ar' => 'طلب مراجعة علامة',
            'name_en' => 'Grade Review Request',
            'workflow' => ['COURSE_INSTRUCTOR', 'DEPT_HEAD'],
        ],
        'MAJOR_CHANGE' => [
            'name_ar' => 'طلب تغيير تخصص',
            'name_en' => 'Major Change Request',
            'workflow' => ['CURRENT_DEPT_HEAD', 'NEW_DEPT_HEAD', 'ACADEMIC_AFFAIRS', 'STUDENT_AFFAIRS', 'FINANCE'],
        ],
        'STUDY_PLAN_EXTENSION' => [
            'name_ar' => 'طلب تمديد فصول دراسية',
            'name_en' => 'Study Plan Extension Request',
            'workflow' => ['DEPT_HEAD', 'ACADEMIC_AFFAIRS'],
        ],
    ];

    public const APPROVAL_ROLES = [
        'DEPT_HEAD' => ['name_ar' => 'رئيس القسم', 'name_en' => 'Department Head'],
        'CURRENT_DEPT_HEAD' => ['name_ar' => 'رئيس القسم الحالي', 'name_en' => 'Current Department Head'],
        'NEW_DEPT_HEAD' => ['name_ar' => 'رئيس القسم الجديد', 'name_en' => 'New Department Head'],
        'DEAN' => ['name_ar' => 'عميد الكلية', 'name_en' => 'College Dean'],
        'ACADEMIC_AFFAIRS' => ['name_ar' => 'الشؤون الأكاديمية', 'name_en' => 'Academic Affairs'],
        'STUDENT_AFFAIRS' => ['name_ar' => 'شؤون الطلبة', 'name_en' => 'Student Affairs'],
        'FINANCE' => ['name_ar' => 'المالية', 'name_en' => 'Finance'],
        'ADMISSIONS' => ['name_ar' => 'القبول والتسجيل', 'name_en' => 'Admissions & Registration'],
        'COURSE_INSTRUCTOR' => ['name_ar' => 'مدرس المساق', 'name_en' => 'Course Instructor'],
    ];

    // Generate unique request number
    public static function generateRequestNumber(string $requestType): string
    {
        $prefix = match($requestType) {
            'EXCEPTIONAL_REGISTRATION' => 'ER',
            'SEMESTER_POSTPONE' => 'SP',
            'SEMESTER_FREEZE' => 'SF',
            'SEMESTER_WITHDRAWAL' => 'SW',
            'RE_ENROLLMENT' => 'RE',
            'COURSE_EQUIVALENCY' => 'CE',
            'EXAM_RETAKE' => 'EX',
            'GRADE_REVIEW' => 'GR',
            'MAJOR_CHANGE' => 'MC',
            'STUDY_PLAN_EXTENSION' => 'PE',
            default => 'RQ',
        };

        $year = date('Y');
        $count = self::whereYear('created_at', $year)
            ->where('request_type', $requestType)
            ->count() + 1;

        return sprintf('%s-%s-%05d', $prefix, $year, $count);
    }

    // Get workflow for request type
    public function getWorkflow(): array
    {
        return self::REQUEST_TYPES[$this->request_type]['workflow'] ?? [];
    }

    // Initialize approval workflow
    public function initializeWorkflow(): void
    {
        $workflow = $this->getWorkflow();
        $approvalSteps = [];

        foreach ($workflow as $index => $role) {
            $approvalSteps[] = [
                'step' => $index + 1,
                'role' => $role,
                'role_ar' => self::APPROVAL_ROLES[$role]['name_ar'] ?? $role,
                'role_en' => self::APPROVAL_ROLES[$role]['name_en'] ?? $role,
                'status' => 'PENDING',
            ];
        }

        $this->approval_workflow = $approvalSteps;
        $this->current_approval_step = 1;
        $this->save();
    }

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function returnSemester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'return_semester_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function currentDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'current_department_id');
    }

    public function requestedDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'requested_department_id');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(StudentRequestAttachment::class);
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(StudentRequestApproval::class);
    }

    public function requestCourses(): HasMany
    {
        return $this->hasMany(StudentRequestCourse::class);
    }

    public function equivalencies(): HasMany
    {
        return $this->hasMany(StudentRequestEquivalency::class);
    }

    // Scopes
    public function scopeOfType($query, string $type)
    {
        return $query->where('request_type', $type);
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->whereNotIn('status', ['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']);
    }

    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }
}
