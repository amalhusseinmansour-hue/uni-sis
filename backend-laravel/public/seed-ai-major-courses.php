<?php
/**
 * Seed AI Engineering Major Requirements (19 courses - 57 credits)
 * Run this via browser: http://localhost/universe-sis/backend-laravel/public/seed-ai-major-courses.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;
use App\Models\Program;
use App\Models\Department;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/html; charset=utf-8');
echo "<html dir='rtl'><head><meta charset='UTF-8'><title>إضافة مواد متطلبات التخصص - هندسة الذكاء الاصطناعي</title>";
echo "<style>body{font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;} .success{color:green;} .error{color:red;} .info{color:blue;} table{border-collapse:collapse;width:100%;margin-top:20px;} th,td{border:1px solid #ddd;padding:8px;text-align:right;} th{background:#4CAF50;color:white;} tr:nth-child(even){background:#f2f2f2;}</style></head><body>";
echo "<h1>إضافة مواد متطلبات التخصص - هندسة الذكاء الاصطناعي (57 ساعة معتمدة)</h1>";

try {
    // Find the AI Engineering program
    $program = Program::where('code', 'BAIT')
        ->orWhere('code', 'AIE')
        ->orWhere('code', 'AI')
        ->orWhere('name_en', 'like', '%artificial%intelligence%')
        ->orWhere('name_ar', 'like', '%ذكاء اصطناعي%')
        ->first();

    if (!$program) {
        echo "<p class='error'>خطأ: لم يتم العثور على برنامج هندسة الذكاء الاصطناعي!</p>";
        echo "<p>البرامج المتاحة:</p><ul>";
        $allPrograms = Program::all(['id', 'code', 'name_en', 'name_ar']);
        foreach ($allPrograms as $p) {
            echo "<li>{$p->code}: {$p->name_en} ({$p->name_ar})</li>";
        }
        echo "</ul>";
        exit;
    }

    echo "<p class='info'>تم العثور على البرنامج: {$program->code} - {$program->name_en} ({$program->name_ar})</p>";

    // Find department for AI courses
    $aiDepartment = Department::where('code', 'AI')
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

    echo "<h2>إضافة المواد...</h2>";
    echo "<table><tr><th>#</th><th>رمز المساق</th><th>اسم المساق</th><th>الساعات</th><th>الفصل</th><th>الحالة</th></tr>";

    $addedCount = 0;
    $updatedCount = 0;
    $order = 1;
    $totalCredits = 0;

    foreach ($majorRequirements as $courseData) {
        // Determine semester from course code
        $numericPart = preg_replace('/[^0-9]/', '', substr($courseData['code'], 4));
        $semester = !empty($numericPart) ? (int)$numericPart[0] : 1;

        // Check if course exists
        $existingCourse = Course::where('code', $courseData['code'])->first();
        $status = '';

        if ($existingCourse) {
            // Update existing course
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
            $status = "<span class='info'>تم التحديث</span>";
            $updatedCount++;
        } else {
            // Create new course
            $course = Course::create([
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
            $status = "<span class='success'>تمت الإضافة</span>";
            $addedCount++;
        }

        // Link to program if not already linked
        $existingLink = DB::table('program_courses')
            ->where('program_id', $program->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$existingLink) {
            DB::table('program_courses')->insert([
                'program_id' => $program->id,
                'course_id' => $course->id,
                'semester' => $semester,
                'type' => 'MAJOR',
                'is_common' => false,
                'order' => $order,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $status .= " + ربط بالبرنامج";
        } else {
            // Update existing link
            DB::table('program_courses')
                ->where('program_id', $program->id)
                ->where('course_id', $course->id)
                ->update([
                    'semester' => $semester,
                    'type' => 'MAJOR',
                    'updated_at' => now(),
                ]);
        }

        $totalCredits += $courseData['credits'];
        echo "<tr><td>{$order}</td><td>{$courseData['code']}</td><td>{$courseData['name_ar']}</td><td>{$courseData['credits']}</td><td>{$semester}</td><td>{$status}</td></tr>";
        $order++;
    }

    echo "</table>";

    echo "<h2>ملخص</h2>";
    echo "<ul>";
    echo "<li>إجمالي المواد: " . count($majorRequirements) . " مادة</li>";
    echo "<li>إجمالي الساعات المعتمدة: {$totalCredits} ساعة</li>";
    echo "<li class='success'>مواد جديدة: {$addedCount}</li>";
    echo "<li class='info'>مواد محدثة: {$updatedCount}</li>";
    echo "</ul>";

    echo "<p class='success' style='font-size:18px;font-weight:bold;'>تم إضافة متطلبات التخصص بنجاح!</p>";

} catch (Exception $e) {
    echo "<p class='error'>خطأ: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "</body></html>";
