<?php
/**
 * Web-accessible seeder for University Requirements
 * Access via: https://sis.vertexuniversity.edu.eu/run-university-seeder.php?key=VTX2026SecureKey
 * DELETE THIS FILE AFTER USE!
 */

// Security key - must match to run
$securityKey = 'VTX2026SecureKey';

if (!isset($_GET['key']) || $_GET['key'] !== $securityKey) {
    http_response_code(403);
    die('Access denied. Invalid security key.');
}

// Set content type for proper display
header('Content-Type: text/plain; charset=utf-8');

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Course;
use App\Models\Program;
use Illuminate\Support\Facades\DB;

echo "===========================================\n";
echo "Adding University Requirements (26 credits)\n";
echo "===========================================\n\n";

// University requirement courses
$courses = [
    [
        'code' => 'BVTU1301',
        'name_en' => 'English I',
        'name_ar' => 'الإنجليزية I',
        'credits' => 3,
        'description' => 'المهارات الأساسية في القراءة والكتابة والتحدث والاستماع في السياقات الأكاديمية واليومية.',
        'level' => 1,
    ],
    [
        'code' => 'BVTU1302',
        'name_en' => 'Computer Skills',
        'name_ar' => 'مهارات الحاسوب',
        'credits' => 3,
        'description' => 'محو الأمية الرقمية الأساسية والمهارات العملية لاستخدام أجهزة الكمبيوتر والبرامج الشائعة.',
        'level' => 1,
    ],
    [
        'code' => 'BVTU1303',
        'name_en' => 'Mathematics',
        'name_ar' => 'الرياضيات',
        'credits' => 3,
        'description' => 'تتضمن المواضيع الجبر والدوال والمعادلات وحساب التفاضل والتكامل الأساسي',
        'level' => 1,
    ],
    [
        'code' => 'BVTU1304',
        'name_en' => 'English II',
        'name_ar' => 'الإنجليزية II',
        'credits' => 3,
        'description' => 'يعزز مهارات الطلاب في الكتابة الأكاديمية والتفكير النقدي والبحث',
        'level' => 1,
    ],
    [
        'code' => 'BVTU1305',
        'name_en' => 'Innovation and Entrepreneurship',
        'name_ar' => 'الابتكار وريادة الأعمال',
        'credits' => 2,
        'description' => 'يتعرف الطلاب على مبادئ ريادة الأعمال ويعزز التفكير الإبداعي والإبداع.',
        'level' => 1,
    ],
    [
        'code' => 'BVTU2306',
        'name_en' => 'Introduction to Management',
        'name_ar' => 'مقدمة في إدارة',
        'credits' => 2,
        'description' => 'يوفر نظرة عامة على مفاهيم وممارسات العمل الأساسية.',
        'level' => 2,
    ],
    [
        'code' => 'BVTU2307',
        'name_en' => 'Academic Skills',
        'name_ar' => 'المهارات الأكاديمية',
        'credits' => 2,
        'description' => 'المهارات الأساسية للنجاح في الدراسات الجامعية.',
        'level' => 2,
    ],
    [
        'code' => 'BVTU2308',
        'name_en' => 'Communication Skills',
        'name_ar' => 'مهارات الاتصال',
        'credits' => 2,
        'description' => 'يركز على تطوير قدرة الطلاب على التواصل بفعالية في سياقات مختلفة.',
        'level' => 2,
    ],
    [
        'code' => 'BVTU2309',
        'name_en' => 'Occupational Health and Safety',
        'name_ar' => 'الصحة و السلامة المهنية',
        'credits' => 3,
        'description' => 'يركز على تزويد الطلاب بالمعرفة والمهارات اللازمة لتطبيق مبادئ الصحة والسلامة في بيئة العمل.',
        'level' => 2,
    ],
    [
        'code' => 'BVTU2310',
        'name_en' => 'Fundamentals of Artificial Intelligence',
        'name_ar' => 'أساسيات الذكاء الاصطناعي',
        'credits' => 3,
        'description' => 'مقدمة شاملة لمفاهيم وتقنيات الذكاء الاصطناعي وتطبيقاته في مختلف المجالات.',
        'level' => 2,
    ],
];

$courseIds = [];
$totalCredits = 0;

foreach ($courses as $courseData) {
    $existingCourse = Course::where('code', $courseData['code'])->first();

    if ($existingCourse) {
        echo "EXISTS: {$courseData['code']} - {$courseData['name_ar']}\n";
        $courseIds[] = $existingCourse->id;
        $totalCredits += $existingCourse->credits;
    } else {
        $course = Course::create([
            'code' => $courseData['code'],
            'name_en' => $courseData['name_en'],
            'name_ar' => $courseData['name_ar'],
            'credits' => $courseData['credits'],
            'description' => $courseData['description'],
            'level' => $courseData['level'],
            'semester' => $courseData['level'],
            'status' => 'active',
        ]);
        $courseIds[] = $course->id;
        $totalCredits += $course->credits;
        echo "CREATED: {$courseData['code']} - {$courseData['name_ar']} ({$courseData['credits']} credits)\n";
    }
}

echo "\nTotal credits: {$totalCredits}\n\n";

// Get all bachelor programs
$bachelorPrograms = Program::where('degree', 'Bachelor')->get();

if ($bachelorPrograms->isEmpty()) {
    echo "No 'Bachelor' degree programs. Getting all programs...\n";
    $bachelorPrograms = Program::all();
}

echo "Programs found: {$bachelorPrograms->count()}\n\n";

$linkedCount = 0;
foreach ($bachelorPrograms as $program) {
    echo "Linking to: {$program->name_ar}\n";

    foreach ($courseIds as $courseId) {
        $exists = DB::table('program_courses')
            ->where('program_id', $program->id)
            ->where('course_id', $courseId)
            ->exists();

        if (!$exists) {
            DB::table('program_courses')->insert([
                'program_id' => $program->id,
                'course_id' => $courseId,
                'type' => 'UNIVERSITY',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $linkedCount++;
        }
    }
}

echo "\n===========================================\n";
echo "DONE! University Requirements Added!\n";
echo "===========================================\n";
echo "Courses: " . count($courses) . "\n";
echo "Credits: {$totalCredits}\n";
echo "Programs: {$bachelorPrograms->count()}\n";
echo "New Links: {$linkedCount}\n";
echo "\n⚠️ DELETE THIS FILE NOW FOR SECURITY!\n";
