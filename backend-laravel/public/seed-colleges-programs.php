<?php
/**
 * إضافة الكليات والتخصصات لجامعة فيرتكس
 * يمكن تشغيل هذا الملف عبر: php seed-colleges-programs.php
 * أو عبر المتصفح: https://your-domain/seed-colleges-programs.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\College;
use App\Models\Department;
use App\Models\Program;

header('Content-Type: text/html; charset=utf-8');

echo "<html dir='rtl'><head><meta charset='utf-8'><title>إضافة الكليات والتخصصات</title>";
echo "<style>body{font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;} .success{color:green;} .info{color:blue;} .header{background:#2563eb;color:white;padding:15px;border-radius:8px;margin-bottom:20px;} .section{background:white;padding:15px;border-radius:8px;margin-bottom:15px;box-shadow:0 2px 4px rgba(0,0,0,0.1);}</style></head><body>";

echo "<div class='header'><h1>إضافة بيانات الكليات والتخصصات - جامعة فيرتكس</h1></div>";

try {
    $stats = ['colleges' => 0, 'departments' => 0, 'programs' => 0];

    // ==========================================
    // كلية إدارة الأعمال
    // ==========================================
    echo "<div class='section'><h2>1. كلية إدارة الأعمال</h2>";

    $businessCollege = College::firstOrCreate(
        ['code' => 'CBA'],
        [
            'name_ar' => 'كلية إدارة الأعمال',
            'name_en' => 'College of Business Administration',
            'description' => 'College of Business Administration offering undergraduate and graduate programs in business, management, finance, and related fields.',
        ]
    );
    if ($businessCollege->wasRecentlyCreated) {
        echo "<p class='success'>✓ تم إنشاء كلية إدارة الأعمال</p>";
        $stats['colleges']++;
    } else {
        echo "<p class='info'>ℹ كلية إدارة الأعمال موجودة مسبقاً</p>";
    }

    // أقسام وبرامج كلية إدارة الأعمال
    $businessDepartments = [
        [
            'code' => 'BA',
            'name_ar' => 'قسم إدارة الأعمال',
            'name_en' => 'Department of Business Administration',
            'programs' => [
                ['code' => 'BBA', 'name_ar' => 'بكالوريوس إدارة الأعمال', 'name_en' => 'Bachelor of Business Administration', 'type' => 'BACHELOR', 'credits' => 132],
            ]
        ],
        [
            'code' => 'ACC',
            'name_ar' => 'قسم المحاسبة',
            'name_en' => 'Department of Accounting',
            'programs' => [
                ['code' => 'BACC', 'name_ar' => 'بكالوريوس المحاسبة', 'name_en' => 'Bachelor of Accounting', 'type' => 'BACHELOR', 'credits' => 132],
            ]
        ],
        [
            'code' => 'MKT',
            'name_ar' => 'قسم التسويق',
            'name_en' => 'Department of Marketing',
            'programs' => [
                ['code' => 'BDM', 'name_ar' => 'بكالوريوس التسويق الرقمي', 'name_en' => 'Bachelor of Digital Marketing', 'type' => 'BACHELOR', 'credits' => 132],
            ]
        ],
        [
            'code' => 'FT',
            'name_ar' => 'قسم التكنولوجيا المالية',
            'name_en' => 'Department of Financial Technology',
            'programs' => [
                ['code' => 'BFT', 'name_ar' => 'بكالوريوس التكنولوجيا المالية', 'name_en' => 'Bachelor of Financial Technology', 'type' => 'BACHELOR', 'credits' => 132],
            ]
        ],
        [
            'code' => 'MIS',
            'name_ar' => 'قسم نظم المعلومات الإدارية',
            'name_en' => 'Department of Management Information Systems',
            'programs' => [
                ['code' => 'BMIS', 'name_ar' => 'بكالوريوس نظم المعلومات الإدارية', 'name_en' => 'Bachelor of Management Information Systems', 'type' => 'BACHELOR', 'credits' => 132],
            ]
        ],
        [
            'code' => 'MGMT',
            'name_ar' => 'قسم الإدارة',
            'name_en' => 'Department of Management',
            'programs' => [
                ['code' => 'MPM', 'name_ar' => 'ماجستير إدارة المشاريع', 'name_en' => 'Master of Project Management', 'type' => 'MASTER', 'credits' => 36],
                ['code' => 'MBA', 'name_ar' => 'ماجستير إدارة الأعمال', 'name_en' => 'Master of Business Administration', 'type' => 'MASTER', 'credits' => 42],
                ['code' => 'PHDMGMT', 'name_ar' => 'دكتوراه في الإدارة', 'name_en' => 'PhD in Management', 'type' => 'PHD', 'credits' => 54],
            ]
        ],
    ];

    foreach ($businessDepartments as $deptData) {
        $dept = Department::firstOrCreate(
            ['code' => $deptData['code']],
            [
                'college_id' => $businessCollege->id,
                'name_ar' => $deptData['name_ar'],
                'name_en' => $deptData['name_en'],
            ]
        );
        if ($dept->wasRecentlyCreated) {
            echo "<p class='success'>  ✓ تم إنشاء {$deptData['name_ar']}</p>";
            $stats['departments']++;
        }

        foreach ($deptData['programs'] as $progData) {
            $prog = Program::firstOrCreate(
                ['code' => $progData['code']],
                [
                    'department_id' => $dept->id,
                    'name_ar' => $progData['name_ar'],
                    'name_en' => $progData['name_en'],
                    'type' => $progData['type'],
                    'total_credits' => $progData['credits'],
                ]
            );
            if ($prog->wasRecentlyCreated) {
                echo "<p class='success'>    ✓ تم إنشاء برنامج: {$progData['name_ar']}</p>";
                $stats['programs']++;
            }
        }
    }
    echo "</div>";

    // ==========================================
    // كلية الهندسة وتكنولوجيا المعلومات
    // ==========================================
    echo "<div class='section'><h2>2. كلية الهندسة وتكنولوجيا المعلومات</h2>";

    $engineeringCollege = College::firstOrCreate(
        ['code' => 'CEIT'],
        [
            'name_ar' => 'كلية الهندسة وتكنولوجيا المعلومات',
            'name_en' => 'College of Engineering & IT',
            'description' => 'College of Engineering and Information Technology offering cutting-edge programs in computer engineering, software, AI, and cybersecurity.',
        ]
    );
    if ($engineeringCollege->wasRecentlyCreated) {
        echo "<p class='success'>✓ تم إنشاء كلية الهندسة وتكنولوجيا المعلومات</p>";
        $stats['colleges']++;
    } else {
        echo "<p class='info'>ℹ كلية الهندسة وتكنولوجيا المعلومات موجودة مسبقاً</p>";
    }

    $engineeringDepartments = [
        [
            'code' => 'CE',
            'name_ar' => 'قسم هندسة الحاسوب',
            'name_en' => 'Department of Computer Engineering',
            'programs' => [
                ['code' => 'BCE', 'name_ar' => 'بكالوريوس هندسة الحاسوب', 'name_en' => 'Bachelor of Computer Engineering', 'type' => 'BACHELOR', 'credits' => 160],
                ['code' => 'MCE', 'name_ar' => 'ماجستير هندسة الحاسوب', 'name_en' => 'Master of Computer Engineering', 'type' => 'MASTER', 'credits' => 36],
            ]
        ],
        [
            'code' => 'SE',
            'name_ar' => 'قسم هندسة البرمجيات',
            'name_en' => 'Department of Software Engineering',
            'programs' => [
                ['code' => 'BSE', 'name_ar' => 'بكالوريوس هندسة البرمجيات', 'name_en' => 'Bachelor of Software Engineering', 'type' => 'BACHELOR', 'credits' => 132],
            ]
        ],
        [
            'code' => 'AI',
            'name_ar' => 'قسم الذكاء الاصطناعي',
            'name_en' => 'Department of Artificial Intelligence',
            'programs' => [
                ['code' => 'BAI', 'name_ar' => 'بكالوريوس الذكاء الاصطناعي', 'name_en' => 'Bachelor of Artificial Intelligence', 'type' => 'BACHELOR', 'credits' => 132],
                ['code' => 'MAI', 'name_ar' => 'ماجستير الذكاء الاصطناعي', 'name_en' => 'Master of Artificial Intelligence', 'type' => 'MASTER', 'credits' => 36],
            ]
        ],
        [
            'code' => 'CYBER',
            'name_ar' => 'قسم الأمن السيبراني',
            'name_en' => 'Department of Cybersecurity',
            'programs' => [
                ['code' => 'BCYBER', 'name_ar' => 'بكالوريوس الأمن السيبراني', 'name_en' => 'Bachelor of Cybersecurity', 'type' => 'BACHELOR', 'credits' => 132],
            ]
        ],
    ];

    foreach ($engineeringDepartments as $deptData) {
        $dept = Department::firstOrCreate(
            ['code' => $deptData['code']],
            [
                'college_id' => $engineeringCollege->id,
                'name_ar' => $deptData['name_ar'],
                'name_en' => $deptData['name_en'],
            ]
        );
        if ($dept->wasRecentlyCreated) {
            echo "<p class='success'>  ✓ تم إنشاء {$deptData['name_ar']}</p>";
            $stats['departments']++;
        }

        foreach ($deptData['programs'] as $progData) {
            $prog = Program::firstOrCreate(
                ['code' => $progData['code']],
                [
                    'department_id' => $dept->id,
                    'name_ar' => $progData['name_ar'],
                    'name_en' => $progData['name_en'],
                    'type' => $progData['type'],
                    'total_credits' => $progData['credits'],
                ]
            );
            if ($prog->wasRecentlyCreated) {
                echo "<p class='success'>    ✓ تم إنشاء برنامج: {$progData['name_ar']}</p>";
                $stats['programs']++;
            }
        }
    }
    echo "</div>";

    // ==========================================
    // كلية العلوم الصحية والبيئية
    // ==========================================
    echo "<div class='section'><h2>3. كلية العلوم الصحية والبيئية</h2>";

    $healthCollege = College::firstOrCreate(
        ['code' => 'CHES'],
        [
            'name_ar' => 'كلية العلوم الصحية والبيئية',
            'name_en' => 'College of Health & Environmental Sciences',
            'description' => 'College of Health and Environmental Sciences offering programs in health management, emergency management, and health informatics.',
        ]
    );
    if ($healthCollege->wasRecentlyCreated) {
        echo "<p class='success'>✓ تم إنشاء كلية العلوم الصحية والبيئية</p>";
        $stats['colleges']++;
    } else {
        echo "<p class='info'>ℹ كلية العلوم الصحية والبيئية موجودة مسبقاً</p>";
    }

    $healthDepartments = [
        [
            'code' => 'HEDM',
            'name_ar' => 'قسم إدارة الطوارئ والكوارث الصحية',
            'name_en' => 'Department of Health Emergency & Disaster Management',
            'programs' => [
                ['code' => 'BHEDM', 'name_ar' => 'بكالوريوس إدارة الطوارئ والكوارث الصحية', 'name_en' => 'Bachelor of Health Emergency & Disaster Management', 'type' => 'BACHELOR', 'credits' => 132],
                ['code' => 'MHEDM', 'name_ar' => 'ماجستير إدارة الطوارئ والكوارث الصحية', 'name_en' => 'Master of Health Emergency & Disaster Management', 'type' => 'MASTER', 'credits' => 36],
                ['code' => 'PHDHEDM', 'name_ar' => 'دكتوراه إدارة الطوارئ والكوارث الصحية', 'name_en' => 'PhD in Health Emergency & Disaster Management', 'type' => 'PHD', 'credits' => 54],
            ]
        ],
        [
            'code' => 'HA',
            'name_ar' => 'قسم الإدارة الصحية',
            'name_en' => 'Department of Health Administration',
            'programs' => [
                ['code' => 'BHA', 'name_ar' => 'بكالوريوس الإدارة الصحية', 'name_en' => 'Bachelor of Health Administration', 'type' => 'BACHELOR', 'credits' => 132],
                ['code' => 'MHA', 'name_ar' => 'ماجستير الإدارة الصحية', 'name_en' => 'Master of Health Administration', 'type' => 'MASTER', 'credits' => 36],
                ['code' => 'PHDHA', 'name_ar' => 'دكتوراه الإدارة الصحية', 'name_en' => 'PhD in Health Administration', 'type' => 'PHD', 'credits' => 54],
            ]
        ],
    ];

    foreach ($healthDepartments as $deptData) {
        $dept = Department::firstOrCreate(
            ['code' => $deptData['code']],
            [
                'college_id' => $healthCollege->id,
                'name_ar' => $deptData['name_ar'],
                'name_en' => $deptData['name_en'],
            ]
        );
        if ($dept->wasRecentlyCreated) {
            echo "<p class='success'>  ✓ تم إنشاء {$deptData['name_ar']}</p>";
            $stats['departments']++;
        }

        foreach ($deptData['programs'] as $progData) {
            $prog = Program::firstOrCreate(
                ['code' => $progData['code']],
                [
                    'department_id' => $dept->id,
                    'name_ar' => $progData['name_ar'],
                    'name_en' => $progData['name_en'],
                    'type' => $progData['type'],
                    'total_credits' => $progData['credits'],
                ]
            );
            if ($prog->wasRecentlyCreated) {
                echo "<p class='success'>    ✓ تم إنشاء برنامج: {$progData['name_ar']}</p>";
                $stats['programs']++;
            }
        }
    }
    echo "</div>";

    // ==========================================
    // ملخص النتائج
    // ==========================================
    echo "<div class='section' style='background:#e8f5e9;'>";
    echo "<h2>✅ تم الانتهاء بنجاح!</h2>";
    echo "<p><strong>الإضافات الجديدة:</strong></p>";
    echo "<ul>";
    echo "<li>الكليات: {$stats['colleges']}</li>";
    echo "<li>الأقسام: {$stats['departments']}</li>";
    echo "<li>البرامج: {$stats['programs']}</li>";
    echo "</ul>";

    echo "<p><strong>الإجمالي في قاعدة البيانات:</strong></p>";
    echo "<ul>";
    echo "<li>إجمالي الكليات: " . College::count() . "</li>";
    echo "<li>إجمالي الأقسام: " . Department::count() . "</li>";
    echo "<li>إجمالي البرامج: " . Program::count() . "</li>";
    echo "</ul>";
    echo "</div>";

    // عرض جميع البيانات
    echo "<div class='section'>";
    echo "<h2>📋 جميع البيانات المسجلة</h2>";

    $colleges = College::with(['departments.programs'])->get();
    foreach ($colleges as $college) {
        echo "<h3 style='color:#2563eb;'>🎓 {$college->name_ar}</h3>";
        foreach ($college->departments as $dept) {
            echo "<p style='margin-right:20px;'><strong>📁 {$dept->name_ar}</strong></p>";
            foreach ($dept->programs as $prog) {
                $typeLabel = match($prog->type) {
                    'BACHELOR' => 'بكالوريوس',
                    'MASTER' => 'ماجستير',
                    'PHD' => 'دكتوراه',
                    default => $prog->type
                };
                echo "<p style='margin-right:40px;'>📚 {$prog->name_ar} ({$typeLabel})</p>";
            }
        }
    }
    echo "</div>";

} catch (Exception $e) {
    echo "<div class='section' style='background:#ffebee;'>";
    echo "<h2 style='color:red;'>❌ حدث خطأ</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "</div>";
}

echo "</body></html>";
