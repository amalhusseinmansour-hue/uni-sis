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
use App\Http\Controllers\Api\DocumentVerificationController;
use App\Http\Controllers\Api\DynamicFormController;
use App\Http\Controllers\Api\DynamicTableController;
use App\Http\Controllers\Api\DynamicReportController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\MoodleWebhookController;
use App\Http\Controllers\Api\MoodleSyncController;
use App\Http\Controllers\Api\GraduationController;
use App\Http\Controllers\Api\GradingScaleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==========================================
// PUBLIC ROUTES (with Rate Limiting)
// ==========================================

// Login with rate limiting (5 attempts per minute per IP)
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

// Password reset with rate limiting (3 attempts per minute)
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:3,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->middleware('throttle:3,1');

// Public announcements
Route::get('/announcements/published', [AnnouncementController::class, 'published']);

// ==========================================
// SECURITY: DISABLED SEED ROUTES
// Use php artisan db:seed instead
// ==========================================
/* DISABLED FOR SECURITY - Use artisan commands instead
// Seed colleges and programs (one-time use)
Route::get('/seed-colleges-programs', function () {
    $stats = ['colleges' => 0, 'departments' => 0, 'programs' => 0];

    // كلية إدارة الأعمال
    $businessCollege = \App\Models\College::firstOrCreate(
        ['code' => 'CBA'],
        [
            'name_ar' => 'كلية إدارة الأعمال',
            'name_en' => 'College of Business Administration',
            'description' => 'College of Business Administration',
        ]
    );
    if ($businessCollege->wasRecentlyCreated) $stats['colleges']++;

    $businessDepts = [
        ['code' => 'BA', 'name_ar' => 'قسم إدارة الأعمال', 'name_en' => 'Department of Business Administration', 'programs' => [
            ['code' => 'BBA', 'name_ar' => 'بكالوريوس إدارة الأعمال', 'name_en' => 'Bachelor of Business Administration', 'type' => 'BACHELOR', 'credits' => 132],
        ]],
        ['code' => 'ACC', 'name_ar' => 'قسم المحاسبة', 'name_en' => 'Department of Accounting', 'programs' => [
            ['code' => 'BACC', 'name_ar' => 'بكالوريوس المحاسبة', 'name_en' => 'Bachelor of Accounting', 'type' => 'BACHELOR', 'credits' => 132],
        ]],
        ['code' => 'MKT', 'name_ar' => 'قسم التسويق', 'name_en' => 'Department of Marketing', 'programs' => [
            ['code' => 'BDM', 'name_ar' => 'بكالوريوس التسويق الرقمي', 'name_en' => 'Bachelor of Digital Marketing', 'type' => 'BACHELOR', 'credits' => 132],
        ]],
        ['code' => 'FT', 'name_ar' => 'قسم التكنولوجيا المالية', 'name_en' => 'Department of Financial Technology', 'programs' => [
            ['code' => 'BFT', 'name_ar' => 'بكالوريوس التكنولوجيا المالية', 'name_en' => 'Bachelor of Financial Technology', 'type' => 'BACHELOR', 'credits' => 132],
        ]],
        ['code' => 'MIS', 'name_ar' => 'قسم نظم المعلومات الإدارية', 'name_en' => 'Department of Management Information Systems', 'programs' => [
            ['code' => 'BMIS', 'name_ar' => 'بكالوريوس نظم المعلومات الإدارية', 'name_en' => 'Bachelor of Management Information Systems', 'type' => 'BACHELOR', 'credits' => 132],
        ]],
        ['code' => 'MGMT', 'name_ar' => 'قسم الإدارة', 'name_en' => 'Department of Management', 'programs' => [
            ['code' => 'MPM', 'name_ar' => 'ماجستير إدارة المشاريع', 'name_en' => 'Master of Project Management', 'type' => 'MASTER', 'credits' => 36],
            ['code' => 'MBA', 'name_ar' => 'ماجستير إدارة الأعمال', 'name_en' => 'Master of Business Administration', 'type' => 'MASTER', 'credits' => 42],
            ['code' => 'PHDMGMT', 'name_ar' => 'دكتوراه في الإدارة', 'name_en' => 'PhD in Management', 'type' => 'PHD', 'credits' => 54],
        ]],
    ];

    foreach ($businessDepts as $d) {
        $dept = \App\Models\Department::firstOrCreate(['code' => $d['code']], ['college_id' => $businessCollege->id, 'name_ar' => $d['name_ar'], 'name_en' => $d['name_en']]);
        if ($dept->wasRecentlyCreated) $stats['departments']++;
        foreach ($d['programs'] as $p) {
            $prog = \App\Models\Program::firstOrCreate(['code' => $p['code']], ['department_id' => $dept->id, 'name_ar' => $p['name_ar'], 'name_en' => $p['name_en'], 'type' => $p['type'], 'total_credits' => $p['credits']]);
            if ($prog->wasRecentlyCreated) $stats['programs']++;
        }
    }

    // كلية الهندسة وتكنولوجيا المعلومات
    $engCollege = \App\Models\College::firstOrCreate(
        ['code' => 'CEIT'],
        ['name_ar' => 'كلية الهندسة وتكنولوجيا المعلومات', 'name_en' => 'College of Engineering & IT', 'description' => 'College of Engineering and IT']
    );
    if ($engCollege->wasRecentlyCreated) $stats['colleges']++;

    $engDepts = [
        ['code' => 'CE', 'name_ar' => 'قسم هندسة الحاسوب', 'name_en' => 'Department of Computer Engineering', 'programs' => [
            ['code' => 'BCE', 'name_ar' => 'بكالوريوس هندسة الحاسوب', 'name_en' => 'Bachelor of Computer Engineering', 'type' => 'BACHELOR', 'credits' => 160],
            ['code' => 'MCE', 'name_ar' => 'ماجستير هندسة الحاسوب', 'name_en' => 'Master of Computer Engineering', 'type' => 'MASTER', 'credits' => 36],
        ]],
        ['code' => 'SE', 'name_ar' => 'قسم هندسة البرمجيات', 'name_en' => 'Department of Software Engineering', 'programs' => [
            ['code' => 'BSE', 'name_ar' => 'بكالوريوس هندسة البرمجيات', 'name_en' => 'Bachelor of Software Engineering', 'type' => 'BACHELOR', 'credits' => 132],
        ]],
        ['code' => 'AI', 'name_ar' => 'قسم الذكاء الاصطناعي', 'name_en' => 'Department of Artificial Intelligence', 'programs' => [
            ['code' => 'BAI', 'name_ar' => 'بكالوريوس الذكاء الاصطناعي', 'name_en' => 'Bachelor of Artificial Intelligence', 'type' => 'BACHELOR', 'credits' => 132],
            ['code' => 'MAI', 'name_ar' => 'ماجستير الذكاء الاصطناعي', 'name_en' => 'Master of Artificial Intelligence', 'type' => 'MASTER', 'credits' => 36],
        ]],
        ['code' => 'CYBER', 'name_ar' => 'قسم الأمن السيبراني', 'name_en' => 'Department of Cybersecurity', 'programs' => [
            ['code' => 'BCYBER', 'name_ar' => 'بكالوريوس الأمن السيبراني', 'name_en' => 'Bachelor of Cybersecurity', 'type' => 'BACHELOR', 'credits' => 132],
        ]],
    ];

    foreach ($engDepts as $d) {
        $dept = \App\Models\Department::firstOrCreate(['code' => $d['code']], ['college_id' => $engCollege->id, 'name_ar' => $d['name_ar'], 'name_en' => $d['name_en']]);
        if ($dept->wasRecentlyCreated) $stats['departments']++;
        foreach ($d['programs'] as $p) {
            $prog = \App\Models\Program::firstOrCreate(['code' => $p['code']], ['department_id' => $dept->id, 'name_ar' => $p['name_ar'], 'name_en' => $p['name_en'], 'type' => $p['type'], 'total_credits' => $p['credits']]);
            if ($prog->wasRecentlyCreated) $stats['programs']++;
        }
    }

    // كلية العلوم الصحية والبيئية
    $healthCollege = \App\Models\College::firstOrCreate(
        ['code' => 'CHES'],
        ['name_ar' => 'كلية العلوم الصحية والبيئية', 'name_en' => 'College of Health & Environmental Sciences', 'description' => 'College of Health and Environmental Sciences']
    );
    if ($healthCollege->wasRecentlyCreated) $stats['colleges']++;

    $healthDepts = [
        ['code' => 'HEDM', 'name_ar' => 'قسم إدارة الطوارئ والكوارث الصحية', 'name_en' => 'Department of Health Emergency & Disaster Management', 'programs' => [
            ['code' => 'BHEDM', 'name_ar' => 'بكالوريوس إدارة الطوارئ والكوارث الصحية', 'name_en' => 'Bachelor of Health Emergency & Disaster Management', 'type' => 'BACHELOR', 'credits' => 132],
            ['code' => 'MHEDM', 'name_ar' => 'ماجستير إدارة الطوارئ والكوارث الصحية', 'name_en' => 'Master of Health Emergency & Disaster Management', 'type' => 'MASTER', 'credits' => 36],
            ['code' => 'PHDHEDM', 'name_ar' => 'دكتوراه إدارة الطوارئ والكوارث الصحية', 'name_en' => 'PhD in Health Emergency & Disaster Management', 'type' => 'PHD', 'credits' => 54],
        ]],
        ['code' => 'HA', 'name_ar' => 'قسم الإدارة الصحية', 'name_en' => 'Department of Health Administration', 'programs' => [
            ['code' => 'BHA', 'name_ar' => 'بكالوريوس الإدارة الصحية', 'name_en' => 'Bachelor of Health Administration', 'type' => 'BACHELOR', 'credits' => 132],
            ['code' => 'MHA', 'name_ar' => 'ماجستير الإدارة الصحية', 'name_en' => 'Master of Health Administration', 'type' => 'MASTER', 'credits' => 36],
            ['code' => 'PHDHA', 'name_ar' => 'دكتوراه الإدارة الصحية', 'name_en' => 'PhD in Health Administration', 'type' => 'PHD', 'credits' => 54],
        ]],
    ];

    foreach ($healthDepts as $d) {
        $dept = \App\Models\Department::firstOrCreate(['code' => $d['code']], ['college_id' => $healthCollege->id, 'name_ar' => $d['name_ar'], 'name_en' => $d['name_en']]);
        if ($dept->wasRecentlyCreated) $stats['departments']++;
        foreach ($d['programs'] as $p) {
            $prog = \App\Models\Program::firstOrCreate(['code' => $p['code']], ['department_id' => $dept->id, 'name_ar' => $p['name_ar'], 'name_en' => $p['name_en'], 'type' => $p['type'], 'total_credits' => $p['credits']]);
            if ($prog->wasRecentlyCreated) $stats['programs']++;
        }
    }

    return response()->json([
        'success' => true,
        'message' => 'تم إضافة البيانات بنجاح',
        'added' => $stats,
        'totals' => [
            'colleges' => \App\Models\College::count(),
            'departments' => \App\Models\Department::count(),
            'programs' => \App\Models\Program::count(),
        ]
    ]);
});

// Seed common first semester courses for Bachelor programs (one-time use)
Route::get('/seed-common-courses', function () {
    $stats = ['courses_created' => 0, 'courses_assigned' => 0];

    // Get any department to assign courses to (using first department as university-wide)
    $department = \App\Models\Department::first();
    if (!$department) {
        return response()->json(['error' => 'No departments found. Run seed-colleges-programs first.'], 400);
    }

    // Common first semester courses for Bachelor programs
    $commonCourses = [
        ['code' => 'BVTU1301', 'name_en' => 'English 1', 'name_ar' => 'اللغة الإنجليزية 1', 'credits' => 3, 'order' => 1],
        ['code' => 'BVTU1302', 'name_en' => 'Computer Skills', 'name_ar' => 'مهارات الحاسوب', 'credits' => 3, 'order' => 2],
        ['code' => 'BVTU1303', 'name_en' => 'Mathematics', 'name_ar' => 'الرياضيات', 'credits' => 3, 'order' => 3],
        ['code' => 'BVTU1304', 'name_en' => 'Introduction to Management', 'name_ar' => 'مقدمة في الإدارة', 'credits' => 3, 'order' => 4],
        ['code' => 'BVTU1305', 'name_en' => 'Communication Skills', 'name_ar' => 'مهارات الاتصال', 'credits' => 3, 'order' => 5],
    ];

    // Create courses if they don't exist
    $courseIds = [];
    foreach ($commonCourses as $courseData) {
        $course = \App\Models\Course::firstOrCreate(
            ['code' => $courseData['code']],
            [
                'department_id' => $department->id,
                'name_en' => $courseData['name_en'],
                'name_ar' => $courseData['name_ar'],
                'credits' => $courseData['credits'],
                'capacity' => 100,
                'enrolled' => 0,
                'is_active' => true,
            ]
        );
        if ($course->wasRecentlyCreated) {
            $stats['courses_created']++;
        }
        $courseIds[$courseData['code']] = [
            'id' => $course->id,
            'order' => $courseData['order'],
        ];
    }

    // Add courses to all Bachelor programs
    $bachelorPrograms = \App\Models\Program::where('type', 'BACHELOR')->get();

    foreach ($bachelorPrograms as $program) {
        foreach ($courseIds as $code => $data) {
            // Check if course already exists in program
            if (!$program->courses()->where('course_id', $data['id'])->exists()) {
                $program->courses()->attach($data['id'], [
                    'semester' => 1,
                    'type' => 'UNIVERSITY',
                    'is_common' => true,
                    'order' => $data['order'],
                ]);
                $stats['courses_assigned']++;
            }
        }
    }

    return response()->json([
        'success' => true,
        'message' => 'Common first semester courses seeded successfully',
        'stats' => $stats,
        'programs_updated' => $bachelorPrograms->count(),
        'courses' => array_keys($courseIds),
    ]);
});

// Seed AI Engineering Major Requirements (19 courses - 57 credits)
Route::get('/seed-ai-major-courses', function () {
    // Find the AI Engineering program
    $program = \App\Models\Program::where('code', 'BAIT')
        ->orWhere('code', 'AIE')
        ->orWhere('code', 'AI')
        ->orWhere('name_en', 'like', '%artificial%intelligence%')
        ->orWhere('name_ar', 'like', '%ذكاء اصطناعي%')
        ->first();

    if (!$program) {
        $allPrograms = \App\Models\Program::all(['id', 'code', 'name_en', 'name_ar'])->toArray();
        return response()->json([
            'success' => false,
            'message' => 'AI Engineering program not found',
            'available_programs' => $allPrograms
        ], 404);
    }

    // Find department for AI courses
    $aiDepartment = \App\Models\Department::where('code', 'AI')
        ->orWhere('code', 'AIE')
        ->orWhere('code', 'IT')
        ->orWhere('code', 'ENG')
        ->first();

    // AI Engineering Major Requirements (19 courses - 57 credits)
    $majorRequirements = [
        ['code' => 'BAIT4304', 'name_en' => 'Computer Networks', 'name_ar' => 'شبكات الكمبيوتر', 'credits' => 3, 'description_ar' => 'مفاهيم وهندسة شبكات الكمبيوتر باستخدام نماذج OSI وTCP/IP مع فهم عميق لهندسة شبكات الكمبيوتر.'],
        ['code' => 'BAIT4303', 'name_en' => 'Database Systems', 'name_ar' => 'أنظمة قواعد البيانات', 'credits' => 3, 'description_ar' => 'المعرفة الأساسية بأنظمة قواعد البيانات وأنواعها وكيفية إنشائها والتعامل معها والأسس النظرية والرياضية (SQL).'],
        ['code' => 'BAIT5303', 'name_en' => 'Python Programming', 'name_ar' => 'برمجة Python', 'credits' => 3, 'description_ar' => 'مقدمة إلى Python، لغة برمجة قوية وسهلة التعلم. وهو يغطي أساسيات بناء الجملة، وأنواع البيانات، وهياكل التحكم، والوظائف، والبرمجة الموجهة للكائنات وإمكانية تطبيقها على الذكاء الاصطناعي.'],
        ['code' => 'BAIT7304', 'name_en' => 'Software Engineering', 'name_ar' => 'هندسة البرمجيات', 'credits' => 3, 'description_ar' => 'المفاهيم الأساسية لهندسة البرمجيات ووظائفها وأهدافها والمنهجيات المستخدمة عادة في تطوير البرمجيات.'],
        ['code' => 'BAIT3302', 'name_en' => 'Introduction to Artificial Intelligence', 'name_ar' => 'مقدمة في الذكاء الاصطناعي', 'credits' => 3, 'description_ar' => 'يغطي التاريخ واستراتيجيات البحث وطرق حل المشكلات في الذكاء الاصطناعي.'],
        ['code' => 'BAIT5301', 'name_en' => 'Data Structures and Algorithms', 'name_ar' => 'هياكل البيانات والخوارزميات', 'credits' => 3, 'description_ar' => 'يغطي تنظيم البيانات وخوارزميات الفرز/البحث وتحليل التعقيد.'],
        ['code' => 'BAIT6301', 'name_en' => 'Image Processing', 'name_ar' => 'معالجة الصور', 'credits' => 3, 'description_ar' => 'معالجة الإشارات الرقمية، رقمنة الصور، النظام البصري بين الإنسان والآلة، الألوان، العملية والخوارزميات على الصور، تحسين الصورة وتنقيحها، تحويل الصورة، ضغط الصورة.'],
        ['code' => 'BAIT4302', 'name_en' => 'Machine Learning Fundamentals', 'name_ar' => 'أساسيات تعلم الآلة', 'credits' => 3, 'description_ar' => 'يقدم تقنيات الانحدار والتصنيف وتقييم النماذج.'],
        ['code' => 'BAIT7302', 'name_en' => 'Deep Learning and Neural Networks', 'name_ar' => 'التعلم العميق والشبكات العصبية', 'credits' => 3, 'description_ar' => 'يغطي شبكات CNN وRNN والتدريب على النماذج باستخدام الأطر الحديثة.'],
        ['code' => 'BAIT7301', 'name_en' => 'Computer Vision', 'name_ar' => 'رؤية الكمبيوتر', 'credits' => 3, 'description_ar' => 'يستكشف تقنيات معالجة الصور والتعرف عليها والكشف عن الأجسام.'],
        ['code' => 'BAIT6305', 'name_en' => 'Natural Language Processing', 'name_ar' => 'معالجة اللغات الطبيعية', 'credits' => 3, 'description_ar' => 'يقدم المعالجة اللغوية وتحليل المشاعر وبرامج الدردشة.'],
        ['code' => 'BAIT6302', 'name_en' => 'Data Mining and Big Data', 'name_ar' => 'استخراج البيانات والبيانات الضخمة', 'credits' => 3, 'description_ar' => 'يغطي تحليل البيانات على نطاق واسع واكتشاف الأنماط والأدوات المستندة إلى Hadoop.'],
        ['code' => 'BAIT8303', 'name_en' => 'Robotics and Autonomous Systems', 'name_ar' => 'الروبوتات والأنظمة المستقلة', 'credits' => 3, 'description_ar' => 'يقدم تصميم الروبوت، وأنظمة التحكم، وتكامل أجهزة الاستشعار.'],
        ['code' => 'BAIT8304', 'name_en' => 'Reinforcement Learning', 'name_ar' => 'التعلم المعزز', 'credits' => 3, 'description_ar' => 'يشرح التعلم القائم على المكافآت، والتعلم Q-learning، وعمليات اتخاذ القرار في ماركوف.'],
        ['code' => 'BAIT6304', 'name_en' => 'Web Application Development', 'name_ar' => 'تطوير تطبيقات الويب', 'credits' => 3, 'description_ar' => 'تصميم واجهات مستخدم جذابة باستخدام HTML وCSS وJavaScript وإنشاء أنظمة خلفية ديناميكية باستخدام لغات مثل PHP أو Python.'],
        ['code' => 'BAIT7303', 'name_en' => 'AI Systems Development', 'name_ar' => 'تطوير أنظمة الذكاء الاصطناعي', 'credits' => 3, 'description_ar' => 'يركز على تصميم حلول الذكاء الاصطناعي المتكاملة ونشرها.'],
        ['code' => 'BAIT5304', 'name_en' => 'Embedded Systems for AI Applications', 'name_ar' => 'الأنظمة المدمجة لتطبيقات الذكاء الاصطناعي', 'credits' => 3, 'description_ar' => 'يدمج وحدات التحكم الدقيقة ونماذج الذكاء الاصطناعي في الأجهزة المضمنة في الوقت الفعلي.'],
        ['code' => 'BAIT5302', 'name_en' => 'Cloud Computing for AI', 'name_ar' => 'الحوسبة السحابية للذكاء الاصطناعي', 'credits' => 3, 'description_ar' => 'تعلم الأنظمة الأساسية السحابية وواجهات برمجة التطبيقات ونشر تطبيقات الذكاء الاصطناعي الموزعة.'],
        ['code' => 'BAIT6303', 'name_en' => 'Information Security', 'name_ar' => 'أمن المعلومات', 'credits' => 3, 'description_ar' => 'المفاهيم الأساسية ذات الصلة بأمن الكمبيوتر وحماية أنظمة الكمبيوتر والبيانات من التهديدات التي قد تعرض السلامة أو التوفر أو السرية للخطر.'],
    ];

    $addedCount = 0;
    $updatedCount = 0;
    $order = 1;
    $totalCredits = 0;
    $coursesAdded = [];

    foreach ($majorRequirements as $courseData) {
        // Determine semester from course code
        $numericPart = preg_replace('/[^0-9]/', '', substr($courseData['code'], 4));
        $semester = !empty($numericPart) ? (int)$numericPart[0] : 1;

        // Check if course exists
        $existingCourse = \App\Models\Course::where('code', $courseData['code'])->first();

        if ($existingCourse) {
            $existingCourse->update([
                'name_en' => $courseData['name_en'],
                'name_ar' => $courseData['name_ar'],
                'credits' => $courseData['credits'],
                'description' => $courseData['description_ar'],
                'department_id' => $aiDepartment?->id,
                'capacity' => 40,
                'is_active' => true,
            ]);
            $course = $existingCourse;
            $status = 'updated';
            $updatedCount++;
        } else {
            $course = \App\Models\Course::create([
                'code' => $courseData['code'],
                'name_en' => $courseData['name_en'],
                'name_ar' => $courseData['name_ar'],
                'credits' => $courseData['credits'],
                'description' => $courseData['description_ar'],
                'department_id' => $aiDepartment?->id,
                'capacity' => 40,
                'enrolled' => 0,
                'is_active' => true,
            ]);
            $status = 'added';
            $addedCount++;
        }

        // Link to program
        $existingLink = \Illuminate\Support\Facades\DB::table('program_courses')
            ->where('program_id', $program->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$existingLink) {
            \Illuminate\Support\Facades\DB::table('program_courses')->insert([
                'program_id' => $program->id,
                'course_id' => $course->id,
                'semester' => $semester,
                'type' => 'MAJOR',
                'is_common' => false,
                'order' => $order,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $status .= ' + linked';
        } else {
            \Illuminate\Support\Facades\DB::table('program_courses')
                ->where('program_id', $program->id)
                ->where('course_id', $course->id)
                ->update([
                    'semester' => $semester,
                    'type' => 'MAJOR',
                    'updated_at' => now(),
                ]);
        }

        $totalCredits += $courseData['credits'];
        $coursesAdded[] = [
            'code' => $courseData['code'],
            'name_ar' => $courseData['name_ar'],
            'credits' => $courseData['credits'],
            'semester' => $semester,
            'status' => $status
        ];
        $order++;
    }

    return response()->json([
        'success' => true,
        'message' => 'تم إضافة متطلبات التخصص بنجاح',
        'program' => [
            'id' => $program->id,
            'code' => $program->code,
            'name_en' => $program->name_en,
            'name_ar' => $program->name_ar
        ],
        'courses' => $coursesAdded,
        'summary' => [
            'total_courses' => count($majorRequirements),
            'total_credits' => $totalCredits,
            'added' => $addedCount,
            'updated' => $updatedCount
        ]
    ]);
});
END DISABLED SEED ROUTES */

// ==========================================
// SECURITY: Protected Admin-Only Debug Routes
// ==========================================
Route::middleware(['auth:sanctum'])->group(function () {
    // Clear cache endpoint - Admin only
    Route::get('/clear-cache', function (Request $request) {
        // SECURITY: Only ADMIN can clear cache
        if (!in_array($request->user()->role, ['ADMIN'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        try {
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            \Illuminate\Support\Facades\Artisan::call('config:clear');
            \Illuminate\Support\Facades\Artisan::call('route:clear');
            \Illuminate\Support\Facades\Artisan::call('view:clear');
            if (function_exists('opcache_reset')) {
                opcache_reset();
            }
            return response()->json(['success' => true, 'message' => 'All caches cleared including opcache']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    });
}); // End protected debug routes

// ==========================================
// SECURITY: DISABLED DANGEROUS DEBUG ENDPOINTS
// These endpoints have been disabled for security
// Use php artisan commands for database seeding
// ==========================================

/* DISABLED FOR SECURITY - Use artisan commands instead
// Add grading scales data
Route::get('/add-grades-data', function () {
    try {
        $now = now();
        \Illuminate\Support\Facades\DB::table('grading_scales')->delete();

        $data = [
            ['letter_grade' => 'A+', 'min_score' => 96, 'max_score' => 100, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A', 'min_score' => 90, 'max_score' => 95.99, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A-', 'min_score' => 85, 'max_score' => 89.99, 'grade_points' => 3.70, 'description_en' => 'Very Good', 'description_ar' => 'جيد جدا', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B+', 'min_score' => 80, 'max_score' => 84.99, 'grade_points' => 3.30, 'description_en' => 'Very Good', 'description_ar' => 'جيد جدا', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B', 'min_score' => 75, 'max_score' => 79.99, 'grade_points' => 3.00, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B-', 'min_score' => 70, 'max_score' => 74.99, 'grade_points' => 2.70, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C+', 'min_score' => 65, 'max_score' => 69.99, 'grade_points' => 2.30, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C', 'min_score' => 60, 'max_score' => 64.99, 'grade_points' => 2.00, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C-', 'min_score' => 55, 'max_score' => 59.99, 'grade_points' => 1.70, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'D+', 'min_score' => 50, 'max_score' => 54.99, 'grade_points' => 1.30, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'D', 'min_score' => 45, 'max_score' => 49.99, 'grade_points' => 1.00, 'description_en' => 'Poor', 'description_ar' => 'ضعيف', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'F', 'min_score' => 0, 'max_score' => 44.99, 'grade_points' => 0.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'BACHELOR', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A+', 'min_score' => 96, 'max_score' => 100, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A', 'min_score' => 90, 'max_score' => 95.99, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'A-', 'min_score' => 85, 'max_score' => 89.99, 'grade_points' => 3.70, 'description_en' => 'Very Good', 'description_ar' => 'جيد جدا', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B+', 'min_score' => 80, 'max_score' => 84.99, 'grade_points' => 3.30, 'description_en' => 'Very Good', 'description_ar' => 'جيد جدا', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B', 'min_score' => 75, 'max_score' => 79.99, 'grade_points' => 3.00, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'B-', 'min_score' => 70, 'max_score' => 74.99, 'grade_points' => 2.70, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C+', 'min_score' => 65, 'max_score' => 69.99, 'grade_points' => 2.30, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C', 'min_score' => 60, 'max_score' => 64.99, 'grade_points' => 2.00, 'description_en' => 'Pass', 'description_ar' => 'مقبول', 'is_passing' => 1, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'C-', 'min_score' => 55, 'max_score' => 59.99, 'grade_points' => 1.70, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'D+', 'min_score' => 50, 'max_score' => 54.99, 'grade_points' => 1.30, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'D', 'min_score' => 45, 'max_score' => 49.99, 'grade_points' => 1.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
            ['letter_grade' => 'F', 'min_score' => 0, 'max_score' => 44.99, 'grade_points' => 0.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => 0, 'is_active' => 1, 'program_type' => 'GRADUATE', 'created_at' => $now, 'updated_at' => $now],
        ];

        \Illuminate\Support\Facades\DB::table('grading_scales')->insert($data);
        $count = \Illuminate\Support\Facades\DB::table('grading_scales')->count();

        return response()->json(['success' => true, 'count' => $count]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});

/* SECURITY: DISABLED - Debug endpoints removed for production
// Debug endpoint
Route::get('/debug-db', function () {
    try {
        $count = \Illuminate\Support\Facades\DB::table('grading_scales')->count();
        $data = \Illuminate\Support\Facades\DB::table('grading_scales')->limit(5)->get();
        return response()->json([
            'success' => true,
            'count' => $count,
            'sample' => $data,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
        ], 500);
    }
});

// Simple insert test
Route::get('/test-insert', function () {
    try {
        $now = now();
        \Illuminate\Support\Facades\DB::table('grading_scales')->insert([
            'letter_grade' => 'A+',
            'min_score' => 96,
            'max_score' => 100,
            'grade_points' => 4.00,
            'description_en' => 'Excellent',
            'description_ar' => 'ممتاز',
            'is_passing' => 1,
            'is_active' => 1,
            'program_type' => 'BACHELOR',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        return response()->json(['success' => true, 'message' => 'Inserted one row']);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});

// Seed grading scales - Step 1: Create table
Route::get('/create-grading-table', function () {
    try {
        \Illuminate\Support\Facades\DB::statement("
            CREATE TABLE IF NOT EXISTS grading_scales (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                letter_grade VARCHAR(5) NOT NULL,
                min_score DECIMAL(5,2) NOT NULL,
                max_score DECIMAL(5,2) NOT NULL,
                grade_points DECIMAL(3,2) NOT NULL,
                description_en VARCHAR(255) NULL,
                description_ar VARCHAR(255) NULL,
                is_passing TINYINT(1) DEFAULT 1,
                is_active TINYINT(1) DEFAULT 1,
                program_type ENUM('BACHELOR', 'GRADUATE') DEFAULT 'BACHELOR',
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        return response()->json(['success' => true, 'message' => 'Table created']);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});
// Seed grading scales - DISABLED
// Route::get('/seed-grading-scales', ...);
// END DISABLED DEBUG ENDPOINTS */

// Current semester (public)
Route::get('/semesters/current', [SemesterController::class, 'current']);

// Academic Calendar (public)
Route::get('/academic-calendar/upcoming', [AcademicCalendarController::class, 'upcoming']);
Route::get('/academic-calendar/month', [AcademicCalendarController::class, 'currentMonth']);
Route::get('/academic-calendar/holidays', [AcademicCalendarController::class, 'holidays']);

// Admission application (public - for applicants)
Route::post('/admission/apply', [AdmissionApplicationController::class, 'store']);

// Student ID Card Verification (public endpoint)
Route::get('/verify/student/{encryptedData}', [StudentIdCardController::class, 'verifyFromUrl']);
Route::post('/verify/student', [StudentIdCardController::class, 'verify']);

// Document Verification (public endpoint)
Route::get('/verify/document/{code}', [DocumentVerificationController::class, 'verifyByCode']);
Route::post('/verify/certificate', [DocumentVerificationController::class, 'verifyCertificate']);

// Programs and Courses (public endpoint for study plan display)
Route::get('/programs', [ProgramController::class, 'index']);
Route::get('/programs/{program}', [ProgramController::class, 'show']);
Route::get('/programs/{program}/courses', [ProgramController::class, 'courses']);

// ==========================================
// WEBHOOK ENDPOINTS (for WordPress integration)
// SECURITY: Added rate limiting to prevent abuse
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
    // ==========================================
    // استقبال العلامات من Moodle
    Route::post('/moodle/grades', [MoodleWebhookController::class, 'receiveGrades']);
    Route::post('/moodle/grades/bulk', [MoodleWebhookController::class, 'receiveBulkGrades']);
    Route::post('/moodle/completion', [MoodleWebhookController::class, 'receiveCompletion']);
});

// ==========================================
// SECURITY: DISABLED - ENROLLMENT DIAGNOSTICS
// These endpoints expose sensitive data and have been disabled
// ==========================================
/* DISABLED FOR SECURITY
Route::prefix('enrollment-debug')->group(function () {
    Route::get('/diagnose', function (Request $request) {
        $semesters = \App\Models\Semester::orderBy('start_date')->get(['id', 'name', 'name_en', 'name_ar', 'academic_year', 'is_current']);

        $studentId = $request->student_id ? (int)$request->student_id : null;

        $query = \Illuminate\Support\Facades\DB::table('enrollments')
            ->leftJoin('students', 'enrollments.student_id', '=', 'students.id')
            ->leftJoin('courses', 'enrollments.course_id', '=', 'courses.id')
            ->leftJoin('semesters', 'enrollments.semester_id', '=', 'semesters.id')
            ->select([
                'enrollments.id as enrollment_id',
                'enrollments.student_id',
                'enrollments.course_id',
                'enrollments.semester_id',
                'enrollments.status',
                'students.student_id as student_number',
                'students.name_en as student_name',
                'courses.code as course_code',
                'courses.name_en as course_name',
                'semesters.name as semester_name',
                'semesters.academic_year'
            ]);

        if ($studentId) {
            $query->where('enrollments.student_id', $studentId);
        }

        $enrollments = $query->orderBy('students.student_id')
            ->orderBy('enrollments.semester_id')
            ->orderBy('courses.code')
            ->limit(500)
            ->get();

        return response()->json([
            'success' => true,
            'semesters' => $semesters,
            'enrollments' => $enrollments,
            'total' => count($enrollments),
        ]);
    });

    Route::get('/fix', function (Request $request) {
        $enrollmentId = (int)$request->enrollment_id;
        $newSemesterId = (int)$request->new_semester_id;

        if (!$enrollmentId || !$newSemesterId) {
            return response()->json(['error' => 'enrollment_id and new_semester_id are required'], 400);
        }

        \Illuminate\Support\Facades\DB::table('enrollments')
            ->where('id', $enrollmentId)
            ->update(['semester_id' => $newSemesterId, 'updated_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Enrollment updated',
            'message_ar' => 'تم تحديث التسجيل',
        ]);
    });

    Route::get('/bulk-fix', function (Request $request) {
        $courseId = (int)$request->course_id;
        $toSemesterId = (int)$request->to_semester_id;
        $fromSemesterId = $request->from_semester_id ? (int)$request->from_semester_id : null;

        if (!$courseId || !$toSemesterId) {
            return response()->json(['error' => 'course_id and to_semester_id are required'], 400);
        }

        $query = \Illuminate\Support\Facades\DB::table('enrollments')->where('course_id', $courseId);
        if ($fromSemesterId) {
            $query->where('semester_id', $fromSemesterId);
        }

        $count = $query->update(['semester_id' => $toSemesterId, 'updated_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => "Updated $count enrollments",
            'message_ar' => "تم تحديث $count تسجيل",
            'updated_count' => $count,
        ]);
    });
});
END DISABLED ENROLLMENT-DEBUG ROUTES */

// ==========================================
// GRADING SCALES (Public read)
// ==========================================
Route::get('/grading-scales', [GradingScaleController::class, 'index']);
Route::get('/grading-scales/{gradingScale}', [GradingScaleController::class, 'show']);
Route::post('/grading-scales/for-score', [GradingScaleController::class, 'getForScore']);

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

        // Student self-update profile (personal data only)
        Route::get('/my-student-profile', [StudentController::class, 'getMyProfile']);
        Route::put('/my-student-profile', [StudentController::class, 'updateMyProfile']);

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
        // Get LMS grades for student
        Route::get('/my-lms-grades', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }

            // Get LMS grades with course and semester info using joins
            $lmsGrades = \Illuminate\Support\Facades\DB::table('moodle_grades')
                ->join('enrollments', 'moodle_grades.enrollment_id', '=', 'enrollments.id')
                ->join('courses', 'enrollments.course_id', '=', 'courses.id')
                ->leftJoin('semesters', 'enrollments.semester_id', '=', 'semesters.id')
                ->where('enrollments.student_id', $student->id)
                ->select([
                    'moodle_grades.*',
                    'enrollments.id as enrollment_id',
                    'enrollments.course_id',
                    'enrollments.semester_id',
                    'courses.code as course_code',
                    'courses.name_en as course_name_en',
                    'courses.name_ar as course_name_ar',
                    'courses.credits',
                    'semesters.name as semester_name',
                    'semesters.name_en as semester_name_en',
                    'semesters.academic_year',
                ])
                ->orderBy('semesters.academic_year', 'desc')
                ->orderBy('semesters.id', 'desc')
                ->get();

            $result = $lmsGrades->map(function ($grade) {
                return [
                    'enrollment_id' => $grade->enrollment_id,
                    'course_id' => $grade->course_id,
                    'course_code' => $grade->course_code,
                    'course_name_en' => $grade->course_name_en,
                    'course_name_ar' => $grade->course_name_ar,
                    'credits' => $grade->credits,
                    'semester_id' => $grade->semester_id,
                    'semester_name' => $grade->semester_name ?? $grade->semester_name_en,
                    'academic_year' => $grade->academic_year,
                    'moodle_grade' => $grade->moodle_grade,
                    'moodle_grade_max' => $grade->moodle_grade_max,
                    'percentage' => $grade->moodle_grade_max > 0
                        ? round(($grade->moodle_grade / $grade->moodle_grade_max) * 100, 2)
                        : null,
                    'completion_status' => $grade->completion_status,
                    'completed_at' => $grade->completed_at,
                    'grade_items' => json_decode($grade->grade_items, true),
                    'synced_to_sis' => $grade->synced_to_sis,
                    'received_at' => $grade->received_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $result,
                'count' => $result->count(),
            ]);
        });

        // Get courses from LMS for student
        Route::get('/my-lms-courses', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }

            try {
                // Get Moodle user ID for this student
                $moodleUser = \Illuminate\Support\Facades\DB::table('moodle_users')
                    ->where('student_id', $student->id)
                    ->first();

                if (!$moodleUser || !$moodleUser->moodle_user_id) {
                    // Fallback to SIS enrollments if no Moodle user
                    return response()->json([
                        'success' => true,
                        'source' => 'SIS',
                        'data' => [],
                        'message' => 'Student not synced with LMS',
                    ]);
                }

                // Get courses from Moodle
                $moodleService = app(\App\Services\MoodleIntegrationService::class);
                $lmsCourses = $moodleService->getUserEnrolledCourses($moodleUser->moodle_user_id);

                // Match with SIS courses
                $coursesWithSisInfo = collect($lmsCourses)->map(function ($lmsCourse) {
                    // Try to find matching SIS course by moodle_course_id
                    $moodleCourse = \Illuminate\Support\Facades\DB::table('moodle_courses')
                        ->where('moodle_course_id', $lmsCourse['moodle_course_id'])
                        ->first();

                    $sisCourse = null;
                    $enrollment = null;
                    if ($moodleCourse) {
                        $sisCourse = \App\Models\Course::find($moodleCourse->course_id);
                        // Get enrollment for semester info
                        $enrollment = \Illuminate\Support\Facades\DB::table('enrollments')
                            ->leftJoin('semesters', 'enrollments.semester_id', '=', 'semesters.id')
                            ->where('enrollments.course_id', $moodleCourse->course_id)
                            ->select('enrollments.*', 'semesters.name as semester_name', 'semesters.academic_year')
                            ->first();
                    }

                    return [
                        'moodle_course_id' => $lmsCourse['moodle_course_id'],
                        'shortname' => $lmsCourse['shortname'],
                        'fullname' => $lmsCourse['fullname'],
                        'startdate' => $lmsCourse['startdate'],
                        'enddate' => $lmsCourse['enddate'],
                        'progress' => $lmsCourse['progress'],
                        'completed' => $lmsCourse['completed'],
                        // SIS info
                        'sis_course_id' => $sisCourse?->id,
                        'course_code' => $sisCourse?->code ?? $lmsCourse['shortname'],
                        'course_name_en' => $sisCourse?->name_en ?? $lmsCourse['fullname'],
                        'course_name_ar' => $sisCourse?->name_ar ?? null,
                        'credits' => $sisCourse?->credits ?? 3,
                        'semester_name' => $enrollment?->semester_name ?? null,
                        'academic_year' => $enrollment?->academic_year ?? null,
                    ];
                });

                return response()->json([
                    'success' => true,
                    'source' => 'LMS',
                    'data' => $coursesWithSisInfo,
                    'count' => $coursesWithSisInfo->count(),
                ]);
            } catch (\Exception $e) {
                \Log::error('Error fetching LMS courses: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch courses from LMS',
                    'error' => $e->getMessage(),
                ], 500);
            }
        });

        Route::get('/my-academic-summary', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }
            return app(ReportController::class)->academicSummary($student);
        });

        // Get student's exams based on enrolled courses
        Route::get('/my-exams', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }

            // Get student's enrolled course names
            $enrolledCourses = \App\Models\Enrollment::where('student_id', $student->id)
                ->where('status', 'ENROLLED')
                ->with('course')
                ->get()
                ->pluck('course')
                ->filter();

            $courseNames = $enrolledCourses->map(function($course) {
                return [
                    'name_en' => $course->name_en,
                    'name_ar' => $course->name_ar,
                    'code' => $course->code,
                ];
            })->toArray();

            // Get current semester
            $semester = \App\Models\Semester::where('is_current', true)->first();

            // Get all exams for the current semester
            $examsQuery = \App\Models\AcademicEvent::where('type', 'EXAM')
                ->where('is_published', true);

            if ($semester) {
                $examsQuery->where('semester_id', $semester->id);
            }

            $allExams = $examsQuery->orderBy('start_date')->get();

            // Filter exams that match student's enrolled courses
            $studentExams = $allExams->filter(function($exam) use ($courseNames) {
                foreach ($courseNames as $course) {
                    // Check if exam title contains course name
                    if (stripos($exam->title_en, $course['name_en']) !== false ||
                        stripos($exam->title_ar ?? '', $course['name_ar'] ?? '') !== false) {
                        return true;
                    }
                }
                return false;
            })->values();

            return response()->json([
                'success' => true,
                'data' => $studentExams,
                'count' => $studentExams->count(),
                'enrolled_courses' => count($courseNames),
            ]);
        });

        // Get student's lectures for today
        Route::get('/lectures/today', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }

            $today = now()->format('Y-m-d');

            // Get student's enrolled course IDs
            $courseIds = \App\Models\Enrollment::where('student_id', $student->id)
                ->where('status', 'ENROLLED')
                ->pluck('course_id');

            $lectures = \App\Models\Lecture::whereIn('course_id', $courseIds)
                ->where('lecture_date', $today)
                ->with('course')
                ->orderBy('start_time')
                ->get();

            return response()->json($lectures);
        });

        // Get student's upcoming lectures
        Route::get('/lectures/upcoming', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }

            $today = now()->format('Y-m-d');
            $limit = $request->input('limit', 10);

            // Get student's enrolled course IDs
            $courseIds = \App\Models\Enrollment::where('student_id', $student->id)
                ->where('status', 'ENROLLED')
                ->pluck('course_id');

            $lectures = \App\Models\Lecture::whereIn('course_id', $courseIds)
                ->where('lecture_date', '>=', $today)
                ->with('course')
                ->orderBy('lecture_date')
                ->orderBy('start_time')
                ->limit($limit)
                ->get();

            return response()->json($lectures);
        });

        // Get student's attendance records
        Route::get('/my-attendance', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }

            $attendance = \App\Models\LectureAttendance::where('student_id', $student->id)
                ->with(['lecture.course'])
                ->orderBy('created_at', 'desc')
                ->paginate($request->input('per_page', 20));

            return response()->json(['attendance' => $attendance]);
        });

        // Get student's LMS profile data
        Route::get('/my-lms-profile', function (Request $request) {
            $student = $request->user()->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
            }

            try {
                // Get Moodle user for this student
                $moodleUser = \Illuminate\Support\Facades\DB::table('moodle_users')
                    ->where('student_id', $student->id)
                    ->first();

                if (!$moodleUser || !$moodleUser->moodle_user_id) {
                    return response()->json([
                        'success' => false,
                        'connected' => false,
                        'message' => 'Student not synced with LMS',
                        'message_ar' => 'الطالب غير مرتبط بنظام التعلم',
                    ]);
                }

                // Get Moodle service
                $moodleService = app(\App\Services\MoodleIntegrationService::class);

                // Get user info from Moodle API
                $moodleUserInfo = null;
                try {
                    $response = \Illuminate\Support\Facades\Http::timeout(30)->asForm()->post(
                        rtrim(config('services.moodle.url', ''), '/') . '/webservice/rest/server.php',
                        [
                            'wstoken' => config('services.moodle.token', ''),
                            'wsfunction' => 'core_user_get_users_by_field',
                            'moodlewsrestformat' => 'json',
                            'field' => 'id',
                            'values[0]' => $moodleUser->moodle_user_id,
                        ]
                    );

                    if ($response->successful()) {
                        $users = $response->json();
                        $moodleUserInfo = $users[0] ?? null;
                    }
                } catch (\Exception $e) {
                    \Log::error('Error fetching Moodle user info: ' . $e->getMessage());
                }

                // Get enrolled courses from LMS
                $lmsCourses = $moodleService->getUserEnrolledCourses($moodleUser->moodle_user_id);

                // Get course grades from moodle_grades
                $lmsGrades = \Illuminate\Support\Facades\DB::table('moodle_grades')
                    ->join('enrollments', 'moodle_grades.enrollment_id', '=', 'enrollments.id')
                    ->join('courses', 'enrollments.course_id', '=', 'courses.id')
                    ->join('semesters', 'enrollments.semester_id', '=', 'semesters.id')
                    ->where('enrollments.student_id', $student->id)
                    ->select(
                        'moodle_grades.*',
                        'courses.code as course_code',
                        'courses.name_en as course_name_en',
                        'courses.name_ar as course_name_ar',
                        'courses.credits',
                        'semesters.name as semester_name',
                        'semesters.academic_year'
                    )
                    ->get();

                // Calculate LMS statistics
                $completedCourses = collect($lmsCourses)->filter(fn($c) => $c['completed'])->count();
                $totalProgress = collect($lmsCourses)->avg('progress') ?? 0;

                return response()->json([
                    'success' => true,
                    'connected' => true,
                    'moodle_user_id' => $moodleUser->moodle_user_id,
                    'username' => $moodleUser->username,
                    'last_synced_at' => $moodleUser->last_synced_at,
                    'profile' => $moodleUserInfo ? [
                        'id' => $moodleUserInfo['id'],
                        'username' => $moodleUserInfo['username'] ?? '',
                        'firstname' => $moodleUserInfo['firstname'] ?? '',
                        'lastname' => $moodleUserInfo['lastname'] ?? '',
                        'fullname' => $moodleUserInfo['fullname'] ?? '',
                        'email' => $moodleUserInfo['email'] ?? '',
                        'department' => $moodleUserInfo['department'] ?? '',
                        'country' => $moodleUserInfo['country'] ?? '',
                        'city' => $moodleUserInfo['city'] ?? '',
                        'profile_image' => $moodleUserInfo['profileimageurl'] ?? null,
                        'profile_image_small' => $moodleUserInfo['profileimageurlsmall'] ?? null,
                        'last_access' => isset($moodleUserInfo['lastaccess']) && $moodleUserInfo['lastaccess'] > 0
                            ? date('Y-m-d H:i:s', $moodleUserInfo['lastaccess'])
                            : null,
                        'first_access' => isset($moodleUserInfo['firstaccess']) && $moodleUserInfo['firstaccess'] > 0
                            ? date('Y-m-d H:i:s', $moodleUserInfo['firstaccess'])
                            : null,
                    ] : null,
                    'statistics' => [
                        'enrolled_courses' => count($lmsCourses),
                        'completed_courses' => $completedCourses,
                        'in_progress_courses' => count($lmsCourses) - $completedCourses,
                        'average_progress' => round($totalProgress, 1),
                        'grades_received' => $lmsGrades->count(),
                    ],
                    'courses' => collect($lmsCourses)->map(function ($course) use ($student) {
                        // Try to find SIS course
                        $moodleCourse = \Illuminate\Support\Facades\DB::table('moodle_courses')
                            ->where('moodle_course_id', $course['moodle_course_id'])
                            ->first();

                        $sisCourse = null;
                        if ($moodleCourse) {
                            $sisCourse = \App\Models\Course::find($moodleCourse->course_id);
                        }

                        return [
                            'moodle_course_id' => $course['moodle_course_id'],
                            'shortname' => $course['shortname'],
                            'fullname' => $course['fullname'],
                            'startdate' => $course['startdate'],
                            'enddate' => $course['enddate'],
                            'progress' => $course['progress'],
                            'completed' => $course['completed'],
                            'sis_course_id' => $sisCourse?->id,
                            'course_code' => $sisCourse?->code ?? $course['shortname'],
                            'credits' => $sisCourse?->credits ?? 3,
                        ];
                    }),
                    'grades' => $lmsGrades->map(function ($grade) {
                        return [
                            'course_code' => $grade->course_code,
                            'course_name_en' => $grade->course_name_en,
                            'course_name_ar' => $grade->course_name_ar,
                            'credits' => $grade->credits,
                            'semester' => $grade->semester_name,
                            'academic_year' => $grade->academic_year,
                            'moodle_grade' => $grade->moodle_grade,
                            'moodle_grade_max' => $grade->moodle_grade_max,
                            'percentage' => $grade->moodle_grade_max > 0
                                ? round(($grade->moodle_grade / $grade->moodle_grade_max) * 100, 1)
                                : null,
                            'completion_status' => $grade->completion_status,
                            'completed_at' => $grade->completed_at,
                        ];
                    }),
                ]);
            } catch (\Exception $e) {
                \Log::error('Error fetching LMS profile: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch LMS profile',
                    'error' => $e->getMessage(),
                ], 500);
            }
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
    // STUDENT AFFAIRS ROUTES (شؤون الطلاب)
    // ==========================================
    Route::middleware('role:STUDENT_AFFAIRS,ADMIN')->group(function () {
        // Students management - إدارة ملفات الطلاب
        Route::apiResource('students', StudentController::class)->only(['index', 'show', 'store', 'update']);

        // Student Documents - رفع وإدارة المستندات
        Route::get('/student-documents', [StudentDocumentController::class, 'index']);
        Route::get('/student-documents/{studentDocument}', [StudentDocumentController::class, 'show']);
        Route::post('/student-documents', [StudentDocumentController::class, 'store']);
        Route::put('/student-documents/{studentDocument}', [StudentDocumentController::class, 'update']);
        Route::post('/student-documents/{studentDocument}/verify', [StudentDocumentController::class, 'verify']);
        Route::post('/student-documents/{studentDocument}/reject', [StudentDocumentController::class, 'reject']);
        Route::get('/student-documents/{studentDocument}/download', [StudentDocumentController::class, 'download']);

        // Admission Applications - إدارة طلبات القبول
        Route::get('/admission-applications', [AdmissionApplicationController::class, 'index']);
        Route::get('/admission-applications/{admissionApplication}', [AdmissionApplicationController::class, 'show']);
        Route::post('/admission-applications', [AdmissionApplicationController::class, 'store']);
        Route::put('/admission-applications/{admissionApplication}', [AdmissionApplicationController::class, 'update']);
        Route::post('/admission-applications/{admissionApplication}/start-review', [AdmissionApplicationController::class, 'startReview']);
        Route::post('/admission-applications/{admissionApplication}/verify-documents', [AdmissionApplicationController::class, 'verifyDocuments']);
        Route::post('/admission-applications/{admissionApplication}/request-payment', [AdmissionApplicationController::class, 'requestPayment']);
        Route::post('/admission-applications/{admissionApplication}/approve', [AdmissionApplicationController::class, 'approve']);
        Route::post('/admission-applications/{admissionApplication}/reject', [AdmissionApplicationController::class, 'reject']);
        Route::post('/admission-applications/{admissionApplication}/waitlist', [AdmissionApplicationController::class, 'waitlist']);
        Route::get('/admission-applications/{admissionApplication}/workflow-logs', [AdmissionApplicationController::class, 'workflowLogs']);
        Route::get('/admission-applications-statistics', [AdmissionApplicationController::class, 'statistics']);

        // Enrollments management - تسجيل المساقات
        Route::apiResource('enrollments', EnrollmentController::class);
        Route::post('/enrollments/{enrollment}/drop', [EnrollmentController::class, 'drop']);
        Route::post('/enrollments/{enrollment}/withdraw', [EnrollmentController::class, 'withdraw']);

        // Late Registration - التسجيل المتأخر بإذن إداري
        Route::post('/enrollments/late-registration', [EnrollmentController::class, 'lateRegistration']);

        // Section Change - تغيير الشعبة
        Route::post('/enrollments/{enrollment}/change-section', [EnrollmentController::class, 'changeSection']);

        // ==========================================
        // GRADUATION MANAGEMENT - إدارة التخرج
        // ==========================================
        Route::prefix('graduation')->group(function () {
            // Applications
            Route::get('/applications', [GraduationController::class, 'index']);
            Route::get('/applications/{application}', [GraduationController::class, 'show']);
            Route::post('/applications', [GraduationController::class, 'store']);
            Route::post('/applications/{application}/review', [GraduationController::class, 'startReview']);
            Route::post('/applications/{application}/approve', [GraduationController::class, 'approve']);
            Route::post('/applications/{application}/reject', [GraduationController::class, 'reject']);
            Route::post('/applications/{application}/graduate', [GraduationController::class, 'markGraduated']);
            Route::post('/applications/{application}/documents', [GraduationController::class, 'issueDocument']);

            // Eligibility
            Route::get('/eligibility/{student}', [GraduationController::class, 'checkEligibility']);
            Route::get('/requirements/{programId}', [GraduationController::class, 'getProgramRequirements']);

            // Statistics
            Route::get('/statistics', [GraduationController::class, 'statistics']);
        });

        // Open/Close Registration - فتح/إغلاق التسجيل لطالب معين
        Route::post('/students/{student}/open-registration', [StudentController::class, 'openRegistration']);
        Route::post('/students/{student}/close-registration', [StudentController::class, 'closeRegistration']);

        // Student File Uploads - رفع الملفات
        Route::post('/students/{student}/upload-photo', [StudentController::class, 'uploadProfilePicture']);
        Route::post('/students/{student}/upload-document', [StudentController::class, 'uploadDocument']);
        Route::get('/students/{student}/documents', [StudentController::class, 'documents']);
        Route::delete('/students/{student}/documents/{documentId}', [StudentController::class, 'deleteDocument']);

        // Study Plans - الخطط الدراسية
        Route::get('/students/{student}/study-plan', [StudentController::class, 'studyPlan']);
        Route::post('/students/{student}/assign-study-plan', [StudentController::class, 'assignStudyPlan']);
        Route::post('/students/{student}/transfer-major', [StudentController::class, 'transferMajor']);

        // Programs - Read access for assigning study plans
        Route::get('/programs', [ProgramController::class, 'index']);
        Route::get('/programs/{program}', [ProgramController::class, 'show']);
        Route::get('/programs/{program}/students', [ProgramController::class, 'students']);

        // Reports - تقارير شؤون الطلاب
        Route::prefix('reports')->group(function () {
            Route::get('/students/{student}/transcript', [ReportController::class, 'transcript']);
            Route::get('/students/{student}/grades', [ReportController::class, 'gradeReport']);
            Route::get('/students/{student}/enrollments', [ReportController::class, 'enrollmentReport']);
            Route::get('/students/{student}/academic-summary', [ReportController::class, 'academicSummary']);
        });

        // Student ID Cards
        Route::prefix('id-cards')->group(function () {
            Route::get('/students/{student}', [StudentIdCardController::class, 'show']);
            Route::post('/students/{student}/generate', [StudentIdCardController::class, 'generatePdf']);
            Route::get('/students/{student}/download', [StudentIdCardController::class, 'downloadPdf']);
            Route::post('/students/{student}/photo', [StudentIdCardController::class, 'uploadPhoto']);
        });
    });

    // ==========================================
    // ADMIN ROUTES (Full access to all resources)
    // ==========================================
    Route::middleware('role:ADMIN')->group(function () {
        // User Management
        Route::prefix('users')->group(function () {
            $userController = \App\Http\Controllers\Api\Admin\UserController::class;
            Route::get('/', [$userController, 'index']);
            Route::get('/stats', [$userController, 'stats']);
            Route::post('/', [$userController, 'store']);
            Route::get('/{id}', [$userController, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [$userController, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [$userController, 'destroy'])->where('id', '[0-9]+');
        });

        // Students management - Admin can archive/restore/delete (STUDENT_AFFAIRS has other operations)
        Route::delete('/students/{student}', [StudentController::class, 'destroy']);
        Route::post('/students/{student}/restore', [StudentController::class, 'restore']);
        Route::delete('/students/{student}/force', [StudentController::class, 'forceDelete']);

        // Courses management
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
        Route::post('/courses/{course}/activate', [CourseController::class, 'activate']);
        Route::post('/courses/{course}/deactivate', [CourseController::class, 'deactivate']);
        Route::post('/courses/{course}/assign-programs', [CourseController::class, 'assignPrograms']);

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

        // Program Courses management
        Route::get('/programs/{program}/courses', [ProgramController::class, 'courses']);
        Route::post('/programs/{program}/courses', [ProgramController::class, 'addCourse']);
        Route::put('/programs/{program}/courses/{courseId}', [ProgramController::class, 'updateCourse']);
        Route::delete('/programs/{program}/courses/{courseId}', [ProgramController::class, 'removeCourse']);
        Route::post('/programs/bachelor/common-courses', [ProgramController::class, 'addCommonCoursesToBachelor']);

        // Enrollments - Admin only operations (STUDENT_AFFAIRS has CRUD in their section)
        Route::delete('/enrollments/{enrollment}', [EnrollmentController::class, 'destroy']);

        // Semesters management
        Route::post('/semesters', [SemesterController::class, 'store']);
        Route::put('/semesters/{semester}', [SemesterController::class, 'update']);
        Route::delete('/semesters/{semester}', [SemesterController::class, 'destroy']);
        Route::post('/semesters/{semester}/set-current', [SemesterController::class, 'setCurrent']);
        Route::post('/semesters/{semester}/close', [SemesterController::class, 'close']);
        Route::post('/semesters/{semester}/reopen', [SemesterController::class, 'reopen']);
        Route::post('/semesters/{semester}/open-registration', [SemesterController::class, 'openRegistration']);
        Route::post('/semesters/{semester}/close-registration', [SemesterController::class, 'closeRegistration']);

        // Service Requests management
        Route::put('/service-requests/{serviceRequest}', [ServiceRequestController::class, 'update']);
        Route::delete('/service-requests/{serviceRequest}', [ServiceRequestController::class, 'destroy']);
        Route::post('/service-requests/{serviceRequest}/process', [ServiceRequestController::class, 'process']);
        Route::post('/service-requests/{serviceRequest}/complete', [ServiceRequestController::class, 'complete']);
        Route::post('/service-requests/{serviceRequest}/reject', [ServiceRequestController::class, 'reject']);

        // Admission Applications - Admin can delete (STUDENT_AFFAIRS has other operations)
        Route::delete('/admission-applications/{admissionApplication}', [AdmissionApplicationController::class, 'destroy']);

        // Student Documents - Admin only delete (STUDENT_AFFAIRS has other operations)
        Route::delete('/student-documents/{studentDocument}', [StudentDocumentController::class, 'destroy']);

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

        // Enrollment Management (Admin only)
        Route::prefix('enrollment-management')->group(function () {
            // View all enrollments with semester info (for debugging)
            Route::get('/diagnose', function (Request $request) {
                $query = \App\Models\Enrollment::with(['student', 'course', 'semesterRecord'])
                    ->select('enrollments.*');

                if ($request->student_id) {
                    $query->where('student_id', $request->student_id);
                }

                $enrollments = $query->orderBy('student_id')->orderBy('semester_id')->get();

                $data = $enrollments->map(function ($e) {
                    return [
                        'enrollment_id' => $e->id,
                        'student_id' => $e->student_id,
                        'student_name' => $e->student->name_en ?? $e->student->name_ar ?? 'N/A',
                        'student_number' => $e->student->student_id ?? 'N/A',
                        'course_id' => $e->course_id,
                        'course_code' => $e->course->code ?? 'N/A',
                        'course_name' => $e->course->name_en ?? 'N/A',
                        'current_semester_id' => $e->semester_id,
                        'current_semester_name' => $e->semesterRecord->name ?? $e->semesterRecord->name_en ?? 'N/A',
                        'status' => $e->status,
                    ];
                });

                $semesters = \App\Models\Semester::orderBy('start_date')->get(['id', 'name', 'name_en', 'name_ar', 'academic_year', 'is_current']);

                return response()->json([
                    'success' => true,
                    'enrollments' => $data,
                    'available_semesters' => $semesters,
                    'total' => $data->count(),
                ]);
            });

            // Update enrollment semester
            Route::put('/fix-semester', function (Request $request) {
                $validated = $request->validate([
                    'enrollment_id' => 'required|exists:enrollments,id',
                    'new_semester_id' => 'required|exists:semesters,id',
                ]);

                $enrollment = \App\Models\Enrollment::find($validated['enrollment_id']);
                $oldSemesterId = $enrollment->semester_id;
                $enrollment->semester_id = $validated['new_semester_id'];
                $enrollment->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Enrollment semester updated',
                    'message_ar' => 'تم تحديث فصل التسجيل',
                    'old_semester_id' => $oldSemesterId,
                    'new_semester_id' => $validated['new_semester_id'],
                ]);
            });

            // Bulk update enrollments semester by course
            Route::put('/bulk-fix-semester', function (Request $request) {
                $validated = $request->validate([
                    'course_id' => 'required|exists:courses,id',
                    'from_semester_id' => 'nullable|exists:semesters,id',
                    'to_semester_id' => 'required|exists:semesters,id',
                ]);

                $query = \App\Models\Enrollment::where('course_id', $validated['course_id']);
                if ($validated['from_semester_id']) {
                    $query->where('semester_id', $validated['from_semester_id']);
                }

                $count = $query->count();
                $query->update(['semester_id' => $validated['to_semester_id']]);

                return response()->json([
                    'success' => true,
                    'message' => "Updated {$count} enrollments",
                    'message_ar' => "تم تحديث {$count} تسجيل",
                    'updated_count' => $count,
                ]);
            });

            // Move all enrollments for a student from one semester to another
            Route::put('/fix-student-enrollments', function (Request $request) {
                $validated = $request->validate([
                    'student_id' => 'required|exists:students,id',
                    'from_semester_id' => 'required|exists:semesters,id',
                    'to_semester_id' => 'required|exists:semesters,id',
                ]);

                $count = \App\Models\Enrollment::where('student_id', $validated['student_id'])
                    ->where('semester_id', $validated['from_semester_id'])
                    ->update(['semester_id' => $validated['to_semester_id']]);

                return response()->json([
                    'success' => true,
                    'message' => "Moved {$count} enrollments to new semester",
                    'message_ar' => "تم نقل {$count} تسجيل للفصل الجديد",
                    'updated_count' => $count,
                ]);
            });
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
// MOODLE LMS INTEGRATION (Admin)
// ==========================================
Route::middleware(['auth:sanctum'])->prefix('moodle')->group(function () {
    // حالة الاتصال والإحصائيات
    Route::get('/status', [MoodleSyncController::class, 'getStatus']);
    Route::get('/sync/status', [MoodleSyncController::class, 'getSyncStatus']);
    Route::post('/test-connection', [MoodleSyncController::class, 'testConnection']);

    // عرض الطلاب من LMS
    Route::get('/students', [MoodleSyncController::class, 'getLmsStudents']);

    // مزامنة البيانات إلى Moodle (Admin only)
    Route::middleware('role:ADMIN')->group(function () {
        Route::post('/sync/students', [MoodleSyncController::class, 'syncStudents']);
        Route::post('/sync/lecturers', [MoodleSyncController::class, 'syncLecturers']);
        Route::post('/sync/courses', [MoodleSyncController::class, 'syncCourses']);
        Route::post('/sync/enrollments', [MoodleSyncController::class, 'syncEnrollments']);

        // استيراد الطلاب من Moodle إلى SIS
        Route::post('/import/students', [MoodleSyncController::class, 'importStudentsFromLms']);

        // مزامنة الصور الشخصية من Moodle
        Route::post('/sync/profile-pictures', [MoodleSyncController::class, 'syncProfilePictures']);

        // استيراد العلامات من Moodle
        Route::post('/import/grades', [MoodleSyncController::class, 'importGrades']);
        Route::post('/import/all-grades', [MoodleSyncController::class, 'importAllGrades']);
        Route::get('/grades/by-semester', [MoodleSyncController::class, 'getGradesBySemester']);
        Route::post('/sync/grades-to-sis', [MoodleSyncController::class, 'syncGradesToSis']);

        // إدارة درجات LMS يدوياً
        Route::get('/grades', function (Request $request) {
            try {
                // Check if table exists
                if (!\Illuminate\Support\Facades\Schema::hasTable('moodle_grades')) {
                    return response()->json([
                        'success' => true,
                        'data' => [],
                        'count' => 0,
                        'message' => 'Table not yet created',
                    ]);
                }

                $query = \Illuminate\Support\Facades\DB::table('moodle_grades')
                    ->join('enrollments', 'moodle_grades.enrollment_id', '=', 'enrollments.id')
                    ->join('students', 'enrollments.student_id', '=', 'students.id')
                    ->join('courses', 'enrollments.course_id', '=', 'courses.id')
                    ->leftJoin('semesters', 'enrollments.semester_id', '=', 'semesters.id')
                    ->select([
                        'moodle_grades.*',
                        'enrollments.student_id',
                        'enrollments.course_id',
                        'enrollments.semester_id',
                        'students.student_id as student_number',
                        'students.name_en as student_name_en',
                        'students.name_ar as student_name_ar',
                        'courses.code as course_code',
                        'courses.name_en as course_name_en',
                        'courses.name_ar as course_name_ar',
                        'courses.credits',
                        'semesters.name as semester_name',
                        'semesters.name_en as semester_name_en',
                        'semesters.academic_year',
                    ]);

                // Filter by semester
                if ($request->semester_id) {
                    $query->where('enrollments.semester_id', $request->semester_id);
                }

                // Filter by course
                if ($request->course_id) {
                    $query->where('enrollments.course_id', $request->course_id);
                }

                // Filter by student
                if ($request->student_id) {
                    $query->where('enrollments.student_id', $request->student_id);
                }

                $grades = $query->orderBy('moodle_grades.updated_at', 'desc')->get();

                return response()->json([
                    'success' => true,
                    'data' => $grades,
                    'count' => $grades->count(),
                ]);
            } catch (\Exception $e) {
                \Log::error('Error fetching LMS grades: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'data' => [],
                    'count' => 0,
                    'error' => $e->getMessage(),
                ]);
            }
        });

        Route::post('/grades', function (Request $request) {
            try {
                $validated = $request->validate([
                    'enrollment_id' => 'required|exists:enrollments,id',
                    'moodle_grade' => 'required|numeric|min:0',
                    'moodle_grade_max' => 'required|numeric|min:1',
                    'completion_status' => 'required|in:IN_PROGRESS,COMPLETED,FAILED',
                    'grade_items' => 'nullable|array',
                ]);

                // Ensure moodle_grades table exists
                if (!\Illuminate\Support\Facades\Schema::hasTable('moodle_grades')) {
                    \Illuminate\Support\Facades\Schema::create('moodle_grades', function ($table) {
                        $table->id();
                        $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
                        $table->unsignedInteger('moodle_user_id')->default(0);
                        $table->unsignedInteger('moodle_course_id')->default(0);
                        $table->decimal('moodle_grade', 8, 2)->nullable();
                        $table->decimal('moodle_grade_max', 8, 2)->default(100);
                        $table->enum('completion_status', ['IN_PROGRESS', 'COMPLETED', 'FAILED'])->default('IN_PROGRESS');
                        $table->timestamp('completed_at')->nullable();
                        $table->boolean('synced_to_sis')->default(false);
                        $table->timestamp('received_at')->nullable();
                        $table->json('grade_items')->nullable();
                        $table->timestamps();
                        $table->unique('enrollment_id');
                    });
                }

                // Check if grade already exists
                $existing = \Illuminate\Support\Facades\DB::table('moodle_grades')
                    ->where('enrollment_id', $validated['enrollment_id'])
                    ->first();

                if ($existing) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Grade already exists for this enrollment',
                        'message_ar' => 'الدرجة موجودة مسبقاً لهذا التسجيل',
                    ], 422);
                }

                // Get enrollment details for moodle IDs
                $enrollment = \App\Models\Enrollment::with(['student', 'course'])->find($validated['enrollment_id']);

                if (!$enrollment) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Enrollment not found',
                        'message_ar' => 'التسجيل غير موجود',
                    ], 404);
                }

                $id = \Illuminate\Support\Facades\DB::table('moodle_grades')->insertGetId([
                    'enrollment_id' => $validated['enrollment_id'],
                    'moodle_user_id' => $enrollment->student->id ?? 0,
                    'moodle_course_id' => $enrollment->course->id ?? 0,
                    'moodle_grade' => $validated['moodle_grade'],
                    'moodle_grade_max' => $validated['moodle_grade_max'],
                    'completion_status' => $validated['completion_status'],
                    'grade_items' => isset($validated['grade_items']) ? json_encode($validated['grade_items']) : null,
                    'synced_to_sis' => false,
                    'received_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Grade added successfully',
                    'message_ar' => 'تمت إضافة الدرجة بنجاح',
                    'id' => $id,
                ], 201);
            } catch (\Illuminate\Validation\ValidationException $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'message_ar' => 'خطأ في البيانات المدخلة',
                    'errors' => $e->errors(),
                ], 422);
            } catch (\Exception $e) {
                \Log::error('Error adding LMS grade: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Error adding grade: ' . $e->getMessage(),
                    'message_ar' => 'خطأ في إضافة الدرجة',
                ], 500);
            }
        });

        Route::put('/grades/{id}', function (Request $request, $id) {
            $validated = $request->validate([
                'moodle_grade' => 'sometimes|numeric|min:0',
                'moodle_grade_max' => 'sometimes|numeric|min:1',
                'completion_status' => 'sometimes|in:IN_PROGRESS,COMPLETED,FAILED',
                'grade_items' => 'nullable|array',
            ]);

            $updateData = array_filter([
                'moodle_grade' => $validated['moodle_grade'] ?? null,
                'moodle_grade_max' => $validated['moodle_grade_max'] ?? null,
                'completion_status' => $validated['completion_status'] ?? null,
                'grade_items' => isset($validated['grade_items']) ? json_encode($validated['grade_items']) : null,
                'updated_at' => now(),
            ], fn($v) => $v !== null);

            \Illuminate\Support\Facades\DB::table('moodle_grades')
                ->where('id', $id)
                ->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Grade updated successfully',
            ]);
        });

        Route::delete('/grades/{id}', function ($id) {
            \Illuminate\Support\Facades\DB::table('moodle_grades')->where('id', $id)->delete();
            return response()->json([
                'success' => true,
                'message' => 'Grade deleted successfully',
            ]);
        });

        // إعادة محاولة المزامنات الفاشلة
        Route::post('/retry-failed', [MoodleSyncController::class, 'retryFailed']);

        // سجل المزامنة
        Route::get('/logs', [MoodleSyncController::class, 'getLogs']);
    });
});

// ==========================================
// GRADING SCALES ADMIN ROUTES
// ==========================================
Route::middleware(['auth:sanctum', 'role:ADMIN,REGISTRAR'])->group(function () {
    Route::post('/grading-scales', [GradingScaleController::class, 'store']);
    Route::put('/grading-scales/{gradingScale}', [GradingScaleController::class, 'update']);
    Route::delete('/grading-scales/{gradingScale}', [GradingScaleController::class, 'destroy']);
    Route::post('/grading-scales/reset', [GradingScaleController::class, 'reset']);

    // Admin Grades Management
    Route::put('/admin/grades/{grade}', [GradeController::class, 'update']);
    Route::delete('/admin/grades/{grade}', [GradeController::class, 'destroy']);
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
