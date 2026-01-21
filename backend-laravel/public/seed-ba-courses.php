<?php

/**
 * Business Administration Courses Seeder
 *
 * This script adds all Business Administration program courses
 * Run via browser: http://your-domain/seed-ba-courses.php
 *
 * توزيع الساعات المعتمدة:
 * - متطلبات الجامعة: 26 ساعة
 * - متطلبات الكلية: 42 ساعة
 * - متطلبات التخصص: 51 ساعة
 * - مشروع التخرج: 5 ساعات
 * - المجموع: 124 ساعة
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Course;
use App\Models\Program;
use App\Models\Department;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html dir='rtl'><head><meta charset='UTF-8'><title>إضافة مقررات إدارة الأعمال</title>";
echo "<style>body{font-family:Arial,sans-serif;margin:20px;direction:rtl;} .success{color:green;} .error{color:red;} table{border-collapse:collapse;width:100%;margin:10px 0;} th,td{border:1px solid #ddd;padding:8px;text-align:right;} th{background:#f4f4f4;}</style>";
echo "</head><body>";

echo "<h1>إضافة مقررات تخصص إدارة الأعمال</h1>";

try {
    // Find the Business Administration program
    $program = Program::where('code', 'BBA')->first();

    if (!$program) {
        throw new Exception('برنامج بكالوريوس إدارة الأعمال (BBA) غير موجود!');
    }

    echo "<p class='success'>تم العثور على البرنامج: {$program->name_ar}</p>";

    // Update total credits to 124
    $program->update(['total_credits' => 124]);
    echo "<p class='success'>تم تحديث إجمالي الساعات المعتمدة إلى 124 ساعة</p>";

    // Find BA department
    $baDepartment = Department::where('code', 'BA')->first();

    // ==========================================
    // 1- University Requirements (26 credits)
    // ==========================================
    $universityRequirements = [
        ['code' => 'BVTU1301', 'name_en' => 'English I', 'name_ar' => 'الإنجليزية I', 'credits' => 3],
        ['code' => 'BVTU1303', 'name_en' => 'Mathematics', 'name_ar' => 'الرياضيات', 'credits' => 3],
        ['code' => 'BVTU2301', 'name_en' => 'English II', 'name_ar' => 'الإنجليزية II', 'credits' => 3],
        ['code' => 'BVTU3202', 'name_en' => 'Innovation & Entrepreneurship', 'name_ar' => 'الابتكار وريادة الأعمال', 'credits' => 2],
        ['code' => 'BVTU1204', 'name_en' => 'Introduction to Business', 'name_ar' => 'مقدمة في الإدارة', 'credits' => 2],
        ['code' => 'BVTU1205', 'name_en' => 'Communication and Academic Skills', 'name_ar' => 'مهارات الاتصال', 'credits' => 2],
        ['code' => 'BVTU1302', 'name_en' => 'Fundamentals of Information Systems', 'name_ar' => 'مهارات الحاسوب', 'credits' => 3],
        ['code' => 'BVTU2203', 'name_en' => 'Academic Skills', 'name_ar' => 'المهارات الأكاديمية', 'credits' => 2],
        ['code' => 'BVTU3301', 'name_en' => 'Occupational Health and Safety', 'name_ar' => 'الصحة و السلامة المهنية', 'credits' => 3],
        ['code' => 'BVTU2302', 'name_en' => 'Fundamentals of Artificial Intelligence', 'name_ar' => 'أساسيات الذكاء الاصطناعي', 'credits' => 3],
    ];

    // ==========================================
    // 2- College Requirements (42 credits)
    // ==========================================
    $collegeRequirements = [
        ['code' => 'BBAC3304', 'name_en' => 'Organizational Behavior', 'name_ar' => 'السلوك التنظيمي', 'credits' => 3],
        ['code' => 'BBAC2305', 'name_en' => 'Principles of Accounting', 'name_ar' => 'مبادئ محاسبة (1)', 'credits' => 3],
        ['code' => 'BBAC2304', 'name_en' => 'Principles of Statistics', 'name_ar' => 'مبادئ إحصاء', 'credits' => 3],
        ['code' => 'BBAC3303', 'name_en' => 'Marketing Management', 'name_ar' => 'إدارة التسويق', 'credits' => 3],
        ['code' => 'BBAC3305', 'name_en' => 'Cost Accounting', 'name_ar' => 'محاسبة التكاليف', 'credits' => 3],
        ['code' => 'BBAC4301', 'name_en' => 'Financial Management', 'name_ar' => 'إدارة مالية', 'credits' => 3],
        ['code' => 'BBAC4305', 'name_en' => 'Macroeconomics', 'name_ar' => 'الاقتصاد كلي', 'credits' => 3],
        ['code' => 'BBAC3306', 'name_en' => 'Microeconomics', 'name_ar' => 'الاقتصاد الجزئي', 'credits' => 3],
        ['code' => 'BBAC4302', 'name_en' => 'Research Methods', 'name_ar' => 'مناهج البحث العلمي', 'credits' => 3],
        ['code' => 'BBAC4303', 'name_en' => 'Human Resource Management', 'name_ar' => 'إدارة الموارد البشرية', 'credits' => 3],
        ['code' => 'BBAC4304', 'name_en' => 'Operations Management', 'name_ar' => 'مقدمة في إدارة العمليات', 'credits' => 3],
        ['code' => 'BBAC5301', 'name_en' => 'Logistics Management', 'name_ar' => 'إدارة اللوجستيات', 'credits' => 3],
        ['code' => 'BBAC5302', 'name_en' => 'Computer Information Systems', 'name_ar' => 'نظم المعلومات المحاسبية', 'credits' => 3],
        ['code' => 'BBAC5303', 'name_en' => 'Introduction to International Affairs', 'name_ar' => 'مدخل في الاعمال الدولية', 'credits' => 3],
    ];

    // ==========================================
    // 3- Major Requirements (51 credits)
    // ==========================================
    $majorRequirements = [
        ['code' => 'BBUA5304', 'name_en' => 'Operations Research in Management', 'name_ar' => 'بحوث العمليات في الإدارة', 'credits' => 3],
        ['code' => 'BBUA5305', 'name_en' => 'Total Quality Management (TQM)', 'name_ar' => 'إدارة الجودة الشاملة', 'credits' => 3],
        ['code' => 'BBUA6301', 'name_en' => 'Strategic Management', 'name_ar' => 'الإدارة الإستراتيجية', 'credits' => 3],
        ['code' => 'BBUA6302', 'name_en' => 'International Business Management', 'name_ar' => 'إدارة الاعمال الدولية', 'credits' => 3],
        ['code' => 'BBUA6303', 'name_en' => 'Contemporary Administrative Issues', 'name_ar' => 'قضايا اداريه معاصرة', 'credits' => 3],
        ['code' => 'BBUA6304', 'name_en' => 'Project Management', 'name_ar' => 'إدارة المشاريع', 'credits' => 3],
        ['code' => 'BBUA6305', 'name_en' => 'Change and Crisis Management', 'name_ar' => 'إدارة التغيير والازمات', 'credits' => 3],
        ['code' => 'BBUA7301', 'name_en' => 'E-Marketing', 'name_ar' => 'التسويق الإلكتروني', 'credits' => 3],
        ['code' => 'BBUA7302', 'name_en' => 'Managerial Accounting', 'name_ar' => 'المحاسبة الادارية', 'credits' => 3],
        ['code' => 'BBUA7303', 'name_en' => 'E-Business Strategies and Models', 'name_ar' => 'إستراتيجيات ونماذج الأعمال الإلكترونية', 'credits' => 3],
        ['code' => 'BBUA7304', 'name_en' => 'Sales Management', 'name_ar' => 'إدارة المبيعات', 'credits' => 3],
        ['code' => 'BBUA7305', 'name_en' => 'Organization Theory', 'name_ar' => 'نظرية المنظمة', 'credits' => 3],
        ['code' => 'BBUA8301', 'name_en' => 'Digital Transformation and Smart Business Management', 'name_ar' => 'التحول الرقمي وادارة الاعمال الذكية', 'credits' => 3],
        ['code' => 'BBUA8302', 'name_en' => 'Administrative Communication', 'name_ar' => 'الاتصالات الإدارية', 'credits' => 3],
        ['code' => 'BBUA4306', 'name_en' => 'IT Audit and Compliance', 'name_ar' => 'تدقيق تكنولوجيا المعلومات والامتثال', 'credits' => 3],
        ['code' => 'BBUA8303', 'name_en' => 'Risk Management', 'name_ar' => 'ادارة المخاطر', 'credits' => 3],
        ['code' => 'BBUA8304', 'name_en' => 'Feasibility Study and Project Evaluation', 'name_ar' => 'دراسة الجدوى الاقتصادية وتقييم المشاريع', 'credits' => 3],
    ];

    // ==========================================
    // 5- Graduation Project (5 credits)
    // ==========================================
    $graduationProject = [
        ['code' => 'BBUA8P05', 'name_en' => 'Graduation Project', 'name_ar' => 'مشروع التخرج', 'credits' => 5],
    ];

    /**
     * Extract semester number from course code
     */
    function getSemesterFromCode(string $code): int {
        $numericPart = preg_replace('/[^0-9]/', '', substr($code, 4));
        if (!empty($numericPart)) {
            return (int) $numericPart[0];
        }
        return 1;
    }

    /**
     * Create courses and link to program
     */
    function createAndLinkCourses(array $courses, Program $program, string $type, ?Department $department): array {
        $created = 0;
        $linked = 0;
        $order = 1;

        foreach ($courses as $courseData) {
            $course = Course::updateOrCreate(
                ['code' => $courseData['code']],
                [
                    'name_en' => $courseData['name_en'],
                    'name_ar' => $courseData['name_ar'],
                    'credits' => $courseData['credits'],
                    'department_id' => $department?->id,
                    'capacity' => 40,
                    'is_active' => true,
                ]
            );

            if ($course->wasRecentlyCreated) {
                $created++;
            }

            $semester = getSemesterFromCode($courseData['code']);

            if (!$program->courses()->where('course_id', $course->id)->exists()) {
                $program->courses()->attach($course->id, [
                    'semester' => $semester,
                    'type' => $type,
                    'is_common' => $type === 'UNIVERSITY',
                    'order' => $order,
                ]);
                $linked++;
            }

            $order++;
        }

        return ['created' => $created, 'linked' => $linked];
    }

    // Process each category
    echo "<h2>1- متطلبات الجامعة (26 ساعة معتمدة)</h2>";
    $result1 = createAndLinkCourses($universityRequirements, $program, 'UNIVERSITY', $baDepartment);
    echo "<p>تم إنشاء {$result1['created']} مقرر جديد وربط {$result1['linked']} مقرر بالبرنامج</p>";
    echo "<table><tr><th>رمز المساق</th><th>اسم المساق</th><th>Course Title</th><th>الساعات</th></tr>";
    foreach ($universityRequirements as $c) {
        echo "<tr><td>{$c['code']}</td><td>{$c['name_ar']}</td><td>{$c['name_en']}</td><td>{$c['credits']}</td></tr>";
    }
    echo "</table>";

    echo "<h2>2- متطلبات الكلية (42 ساعة معتمدة)</h2>";
    $result2 = createAndLinkCourses($collegeRequirements, $program, 'COLLEGE', $baDepartment);
    echo "<p>تم إنشاء {$result2['created']} مقرر جديد وربط {$result2['linked']} مقرر بالبرنامج</p>";
    echo "<table><tr><th>رمز المساق</th><th>اسم المساق</th><th>Course Title</th><th>الساعات</th></tr>";
    foreach ($collegeRequirements as $c) {
        echo "<tr><td>{$c['code']}</td><td>{$c['name_ar']}</td><td>{$c['name_en']}</td><td>{$c['credits']}</td></tr>";
    }
    echo "</table>";

    echo "<h2>3- متطلبات التخصص (51 ساعة معتمدة)</h2>";
    $result3 = createAndLinkCourses($majorRequirements, $program, 'MAJOR', $baDepartment);
    echo "<p>تم إنشاء {$result3['created']} مقرر جديد وربط {$result3['linked']} مقرر بالبرنامج</p>";
    echo "<table><tr><th>رمز المساق</th><th>اسم المساق</th><th>Course Title</th><th>الساعات</th></tr>";
    foreach ($majorRequirements as $c) {
        echo "<tr><td>{$c['code']}</td><td>{$c['name_ar']}</td><td>{$c['name_en']}</td><td>{$c['credits']}</td></tr>";
    }
    echo "</table>";

    echo "<h2>4- مشروع التخرج (5 ساعات معتمدة)</h2>";
    $result4 = createAndLinkCourses($graduationProject, $program, 'MAJOR', $baDepartment);
    echo "<p>تم إنشاء {$result4['created']} مقرر جديد وربط {$result4['linked']} مقرر بالبرنامج</p>";
    echo "<table><tr><th>رمز المساق</th><th>اسم المساق</th><th>Course Title</th><th>الساعات</th></tr>";
    foreach ($graduationProject as $c) {
        echo "<tr><td>{$c['code']}</td><td>{$c['name_ar']}</td><td>{$c['name_en']}</td><td>{$c['credits']}</td></tr>";
    }
    echo "</table>";

    // Summary
    $totalCourses = count($universityRequirements) + count($collegeRequirements) + count($majorRequirements) + count($graduationProject);
    $totalCreated = $result1['created'] + $result2['created'] + $result3['created'] + $result4['created'];
    $totalLinked = $result1['linked'] + $result2['linked'] + $result3['linked'] + $result4['linked'];

    echo "<h2>ملخص</h2>";
    echo "<table>";
    echo "<tr><th>الفئة</th><th>عدد المقررات</th><th>الساعات المعتمدة</th></tr>";
    echo "<tr><td>متطلبات الجامعة</td><td>" . count($universityRequirements) . "</td><td>26</td></tr>";
    echo "<tr><td>متطلبات الكلية</td><td>" . count($collegeRequirements) . "</td><td>42</td></tr>";
    echo "<tr><td>متطلبات التخصص</td><td>" . count($majorRequirements) . "</td><td>51</td></tr>";
    echo "<tr><td>مشروع التخرج</td><td>" . count($graduationProject) . "</td><td>5</td></tr>";
    echo "<tr style='font-weight:bold;background:#e0e0e0;'><td>المجموع</td><td>{$totalCourses}</td><td>124</td></tr>";
    echo "</table>";

    echo "<p class='success' style='font-size:18px;font-weight:bold;'>تم إضافة جميع المقررات بنجاح!</p>";
    echo "<p>تم إنشاء {$totalCreated} مقرر جديد</p>";
    echo "<p>تم ربط {$totalLinked} مقرر بالبرنامج</p>";

} catch (Exception $e) {
    echo "<p class='error'>خطأ: " . $e->getMessage() . "</p>";
}

echo "</body></html>";
