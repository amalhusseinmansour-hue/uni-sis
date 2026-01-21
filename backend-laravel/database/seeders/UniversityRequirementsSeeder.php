<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Course;
use App\Models\Program;

class UniversityRequirementsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Adding University Requirements (26 credits) for all Bachelor programs...');

        // University requirement courses
        $courses = [
            [
                'code' => 'BVTU1301',
                'name_en' => 'English I',
                'name_ar' => 'الإنجليزية I',
                'credits' => 3,
                'description' => 'المهارات الأساسية في القراءة والكتابة والتحدث والاستماع في السياقات الأكاديمية واليومية. ويؤكد على القواعد النحوية، وبناء الجملة، وكتابة الفقرات، والتكوين الأساسي',
                'level' => 1,
            ],
            [
                'code' => 'BVTU1302',
                'name_en' => 'Computer Skills',
                'name_ar' => 'مهارات الحاسوب',
                'credits' => 3,
                'description' => 'محو الأمية الرقمية الأساسية والمهارات العملية لاستخدام أجهزة الكمبيوتر والبرامج الشائعة. تتضمن المواضيع عادة أنظمة التشغيل وإدارة الملفات ومعالجة الكلمات وجداول البيانات والعروض التقديمية التنقل عبر الإنترنت واستخدام البريد الإلكتروني وممارسات الأمن الإلكتروني الأساسية.',
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
                'description' => 'يوفر نظرة عامة على مفاهيم وممارسات العمل الأساسية. وهو يغطي مجالات رئيسية مثل الإدارة والتسويق والتمويل والعمليات والموارد البشرية',
                'level' => 2,
            ],
            [
                'code' => 'BVTU2307',
                'name_en' => 'Academic Skills',
                'name_ar' => 'المهارات الأكاديمية',
                'credits' => 2,
                'description' => 'المهارات الأساسية للنجاح في الدراسات الجامعية. وهو يركز على التفكير النقدي، والقراءة الفعالة وتدوين الملاحظات، والكتابة الأكاديمية، وإدارة الوقت، وتقنيات البحث، ومهارات العرض التقديمي.',
                'level' => 2,
            ],
            [
                'code' => 'BVTU2308',
                'name_en' => 'Communication Skills',
                'name_ar' => 'مهارات الاتصال',
                'credits' => 2,
                'description' => 'يركز على تطوير قدرة الطلاب على التواصل بفعالية في سياقات مختلفة. وهو يغطي التواصل اللفظي وغير اللفظي، ومهارات الاستماع، والتواصل بين الأشخاص، والخطابة العامة، والكتابة المهنية.',
                'level' => 2,
            ],
            [
                'code' => 'BVTU2309',
                'name_en' => 'Occupational Health and Safety',
                'name_ar' => 'الصحة و السلامة المهنية',
                'credits' => 3,
                'description' => 'يركز على تزويد الطلاب بالمعرفة والمهارات اللازمة لتطبيق مبادئ الصحة والسلامة في بيئة العمل. يشمل ذلك فهم المخاطر المحتملة، وتقييمها، وتنفيذ التدابير الوقائية، والالتزام بالتشريعات المحلية والدولية. الهدف هو تمكين الخريجين من العمل كأخصائيين في مجال الصحة والسلامة المهنية، قادرين على تعزيز بيئة عمل آمنة وصحية.',
                'level' => 2,
            ],
            [
                'code' => 'BVTU2310',
                'name_en' => 'Fundamentals of Artificial Intelligence',
                'name_ar' => 'أساسيات الذكاء الاصطناعي',
                'credits' => 3,
                'description' => 'مقدمة شاملة لمفاهيم وتقنيات الذكاء الاصطناعي وتطبيقاته في مختلف المجالات. يعرّف الطلبة بمبادئ تعلم الآلة، ومعالجة البيانات، وأهم الأدوات البرمجية المستخدمة. يهدف المساق إلى تنمية فهم أساسي يمكّن الطلبة من استيعاب دور الذكاء الاصطناعي في الابتكار وحل المشكلات.',
                'level' => 2,
            ],
        ];

        $courseIds = [];
        $totalCredits = 0;

        foreach ($courses as $courseData) {
            // Check if course already exists
            $existingCourse = Course::where('code', $courseData['code'])->first();

            if ($existingCourse) {
                $this->command->info("Course {$courseData['code']} already exists, using existing record.");
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
                    'semester' => $courseData['level'], // Same as level for simplicity
                    'status' => 'active',
                ]);
                $courseIds[] = $course->id;
                $totalCredits += $course->credits;
                $this->command->info("Created course: {$courseData['code']} - {$courseData['name_ar']} ({$courseData['credits']} credits)");
            }
        }

        $this->command->info("Total university requirement credits: {$totalCredits}");

        // Get all bachelor programs
        $bachelorPrograms = Program::where('degree', 'Bachelor')->get();

        if ($bachelorPrograms->isEmpty()) {
            $this->command->warn('No bachelor programs found. Fetching all programs...');
            $bachelorPrograms = Program::all();
        }

        $this->command->info("Found {$bachelorPrograms->count()} programs to update.");

        // Link courses to all bachelor programs as UNIVERSITY requirements
        foreach ($bachelorPrograms as $program) {
            $this->command->info("Adding university requirements to: {$program->name_ar} ({$program->code})");

            foreach ($courseIds as $courseId) {
                // Check if relationship already exists
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
                }
            }
        }

        $this->command->info('');
        $this->command->info('===========================================');
        $this->command->info('University Requirements Added Successfully!');
        $this->command->info('===========================================');
        $this->command->info("Total Courses: " . count($courses));
        $this->command->info("Total Credits: {$totalCredits}");
        $this->command->info("Programs Updated: {$bachelorPrograms->count()}");
    }
}
