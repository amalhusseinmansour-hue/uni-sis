<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Program;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ArtificialIntelligenceCoursesSeeder extends Seeder
{
    public function run(): void
    {
        // Find the AI Engineering program (try multiple possible codes)
        $program = Program::where('code', 'BAIT')
            ->orWhere('code', 'AIE')
            ->orWhere('code', 'AI')
            ->orWhere('name_en', 'like', '%artificial%intelligence%')
            ->orWhere('name_ar', 'like', '%ذكاء اصطناعي%')
            ->first();

        if (!$program) {
            $this->command->error('AI Engineering program not found! Please create the program first.');
            $this->command->info('Looking for existing programs...');
            $allPrograms = Program::all(['code', 'name_en', 'name_ar']);
            foreach ($allPrograms as $p) {
                $this->command->line("  - {$p->code}: {$p->name_en} ({$p->name_ar})");
            }
            return;
        }

        $this->command->info("Found program: {$program->code} - {$program->name_en}");

        // Update total credits to 130
        $program->update(['total_credits' => 130]);

        // Find AI or Engineering department for major courses
        $aiDepartment = Department::where('code', 'AI')
            ->orWhere('code', 'AIE')
            ->orWhere('code', 'IT')
            ->orWhere('code', 'ENG')
            ->first();

        // ==========================================
        // 1- University Requirements (26 credits) - Same as BBA, shared courses
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
        // 2- College Requirements - Engineering & IT (33 credits)
        // ==========================================
        $collegeRequirements = [
            ['code' => 'BTEC2301', 'name_en' => 'Calculus', 'name_ar' => 'التفاضل والتكامل', 'credits' => 3, 'description_ar' => 'تقنيات التكامل والتسلسل. أيضا، تقنيات التكامل وحساب التفاضل والتكامل متعدد المتغيرات.'],
            ['code' => 'BTEC3304', 'name_en' => 'Discrete Mathematics', 'name_ar' => 'الرياضيات المتقطعة', 'credits' => 3, 'description_ar' => 'المنطق، والمجموعات، والتوافقية، ونظرية الرسم البياني.'],
            ['code' => 'BTEC4406', 'name_en' => 'Statistical Linear Algebra', 'name_ar' => 'الجبر الخطي الإحصائي', 'credits' => 3, 'description_ar' => 'المسافات المتجهة، وعمليات المصفوفة، والقيم الذاتية، وتحليل القيمة المفرد—متغيرات عشوائية، وتوزيعات، وتوقع، وتباين مشترك.'],
            ['code' => 'BTEC2402', 'name_en' => 'Physics for Engineers I', 'name_ar' => 'الفيزياء للمهندسين I', 'credits' => 4, 'description_ar' => 'يغطي مبادئ الميكانيكا والحركة والطاقة في الفيزياء.'],
            ['code' => 'BTEC3401', 'name_en' => 'Physics for Engineers II', 'name_ar' => 'الفيزياء للمهندسين II', 'credits' => 4, 'description_ar' => 'يستمر مع الكهرباء والمغناطيسية والأمواج.'],
            ['code' => 'BTEC3302', 'name_en' => 'Introduction to Programming', 'name_ar' => 'مقدمة في البرمجة', 'credits' => 3, 'description_ar' => 'يقدم البرمجة المنظمة باستخدام Python أو Java لحل المشاكل الهندسية.'],
            ['code' => 'BTEC4304', 'name_en' => 'Object-Oriented Programming', 'name_ar' => 'برمجة كائنية التوجه', 'credits' => 3, 'description_ar' => 'تعلم مفاهيم OOP وتطوير تطبيقات Java.'],
            ['code' => 'BTEC3403', 'name_en' => 'Digital Logic Design and Microcontrollers', 'name_ar' => 'تصميم المنطق الرقمي وأجهزة التحكم الدقيقة', 'credits' => 4, 'description_ar' => 'يشرح البوابات المنطقية والدوائر وتصميم الأنظمة الرقمية.'],
            ['code' => 'BTEC5301', 'name_en' => 'Introduction to Human-Computer Interaction', 'name_ar' => 'مقدمة في التفاعل بين الإنسان والحاسوب', 'credits' => 3, 'description_ar' => 'يستكشف تصميم وتقييم واجهات المستخدم، مع التركيز على كيفية تفاعل الأشخاص مع أجهزة الكمبيوتر والأنظمة الرقمية.'],
            ['code' => 'BTEC4305', 'name_en' => 'Technical Writing for Engineers', 'name_ar' => 'الكتابة الفنية للمهندسين', 'credits' => 3, 'description_ar' => 'يعزز التوثيق الفني وكتابة التقارير ومهارات الاتصال الرسمية.'],
        ];

        // ==========================================
        // 3- Major Requirements - AI Engineering (57 credits)
        // ==========================================
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

        // ==========================================
        // 4- Electives (9 credits - students choose 3 courses)
        // ==========================================
        $electives = [
            ['code' => 'BAITE601', 'name_en' => 'Biological Artificial Intelligence', 'name_ar' => 'الذكاء الاصطناعي البيولوجي', 'credits' => 3, 'description_ar' => 'يستكشف الخوارزميات الجينية وذكاء السرب ونماذج الحوسبة البيولوجية.'],
            ['code' => 'BAITE602', 'name_en' => 'AI in Healthcare', 'name_ar' => 'الذكاء الاصطناعي في الرعاية الصحية', 'credits' => 3, 'description_ar' => 'يفحص التشخيصات التي تعتمد على الذكاء الاصطناعي، والتصوير الطبي، وأنظمة رعاية المرضى.'],
            ['code' => 'BAITE703', 'name_en' => 'Smart Cities and IoT Systems', 'name_ar' => 'المدن الذكية وأنظمة إنترنت الأشياء', 'credits' => 3, 'description_ar' => 'يغطي شبكات الاستشعار والبنية التحتية الذكية وتحليل الذكاء الاصطناعي في الوقت الحقيقي.'],
            ['code' => 'BAITE604', 'name_en' => 'AI for Cybersecurity', 'name_ar' => 'الذكاء الاصطناعي للأمن السيبراني', 'credits' => 3, 'description_ar' => 'يقدم آليات الكشف عن التهديدات والكشف عن الحالات الشاذة والحماية التي تعتمد على الذكاء الاصطناعي.'],
            ['code' => 'BAITE505', 'name_en' => 'Virtual and Augmented Reality', 'name_ar' => 'الواقع الافتراضي والمعزز', 'credits' => 3, 'description_ar' => 'يغطي تصميم التجربة الغامرة ودور الذكاء الاصطناعي في أنظمة الواقع الافتراضي/الواقع المعزز.'],
            ['code' => 'BAITE706', 'name_en' => 'Machine Learning for Robotics', 'name_ar' => 'تعلم الآلة للروبوتات', 'credits' => 3, 'description_ar' => 'يركز على تطبيق خوارزميات تعلم الآلة على الروبوتات من أجل الإدراك والحركة والتحكم.'],
            ['code' => 'BAITE507', 'name_en' => 'AI Ethics and Responsible Innovation', 'name_ar' => 'أخلاقيات الذكاء الاصطناعي والابتكار المسؤول', 'credits' => 3, 'description_ar' => 'يدرس المخاوف الأخلاقية والتحيز والعدالة في أنظمة الذكاء الاصطناعي وتطبيقاته.'],
            ['code' => 'BAITE708', 'name_en' => 'Advanced Topics in Neural Networks', 'name_ar' => 'مواضيع متقدمة في الشبكات العصبية', 'credits' => 3, 'description_ar' => 'يغطي التحسين والبنى المتقدمة (على سبيل المثال، المحولات والشبكات).'],
            ['code' => 'BAITE609', 'name_en' => 'AI for Game Development', 'name_ar' => 'الذكاء الاصطناعي لتطوير الألعاب', 'credits' => 3, 'description_ar' => 'يطبق الذكاء الاصطناعي في خلق سلوكيات ذكية في الألعاب التفاعلية.'],
            ['code' => 'BAITE710', 'name_en' => 'Data Privacy and Security in AI', 'name_ar' => 'خصوصية البيانات وأمنها في الذكاء الاصطناعي', 'credits' => 3, 'description_ar' => 'يغطي كيفية حماية البيانات وضمان نشر نموذج الذكاء الاصطناعي بشكل آمن.'],
            ['code' => 'BAITE511', 'name_en' => 'AI and Internet of Things (AIoT)', 'name_ar' => 'الذكاء الاصطناعي وإنترنت الأشياء (AIoT)', 'credits' => 3, 'description_ar' => 'يدمج تقنيات الذكاء الاصطناعي في تطبيقات إنترنت الأشياء والأجهزة الذكية.'],
            ['code' => 'BAITE512', 'name_en' => 'Information Retrieval', 'name_ar' => 'استرداد المعلومات', 'credits' => 3, 'description_ar' => 'الخوارزميات وتصميم وتنفيذ أنظمة استرجاع المعلومات الحديثة. تتضمن المواضيع: تصميم محرك البحث وتنفيذه، وتقنيات تحليل النص، ونماذج البحث.'],
        ];

        // ==========================================
        // 5- Graduation Project (5 credits)
        // ==========================================
        $graduationProject = [
            ['code' => 'BAIT8501', 'name_en' => 'Graduation Project', 'name_ar' => 'مشروع التخرج', 'credits' => 5, 'description_ar' => 'مشروع شامل حيث يقوم الطلاب بتطوير وتقديم حل ذكاء اصطناعي واقعي تحت إشراف أعضاء هيئة التدريس.'],
        ];

        // Create courses and link to program
        $this->command->info('Creating University Requirements courses...');
        $this->createAndLinkCourses($universityRequirements, $program, 'UNIVERSITY', $aiDepartment);

        $this->command->info('Creating College Requirements courses (Engineering & IT)...');
        $this->createAndLinkCourses($collegeRequirements, $program, 'COLLEGE', $aiDepartment);

        $this->command->info('Creating Major Requirements courses (AI Engineering)...');
        $this->createAndLinkCourses($majorRequirements, $program, 'MAJOR', $aiDepartment);

        $this->command->info('Creating Elective courses...');
        $this->createAndLinkCourses($electives, $program, 'ELECTIVE', $aiDepartment);

        $this->command->info('Creating Graduation Project...');
        $this->createAndLinkCourses($graduationProject, $program, 'MAJOR', $aiDepartment);

        // Summary
        $universityCredits = collect($universityRequirements)->sum('credits');
        $collegeCredits = collect($collegeRequirements)->sum('credits');
        $majorCredits = collect($majorRequirements)->sum('credits');
        $electiveCredits = 9; // Students choose 3 courses of 3 credits each
        $projectCredits = 5;

        $this->command->info('');
        $this->command->info('=== AI Engineering Courses Added Successfully ===');
        $this->command->info("University Requirements: " . count($universityRequirements) . " courses ({$universityCredits} credits)");
        $this->command->info("College Requirements: " . count($collegeRequirements) . " courses ({$collegeCredits} credits)");
        $this->command->info("Major Requirements: " . count($majorRequirements) . " courses ({$majorCredits} credits)");
        $this->command->info("Electives: " . count($electives) . " courses available (students choose 9 credits)");
        $this->command->info("Graduation Project: 1 course ({$projectCredits} credits)");
        $this->command->info("Program Total Credits: 130");
    }

    private function createAndLinkCourses(array $courses, Program $program, string $type, ?Department $department): void
    {
        $order = 1;

        foreach ($courses as $courseData) {
            // Create or update the course
            $course = Course::updateOrCreate(
                ['code' => $courseData['code']],
                [
                    'name_en' => $courseData['name_en'],
                    'name_ar' => $courseData['name_ar'],
                    'credits' => $courseData['credits'],
                    'description' => $courseData['description_ar'] ?? null,
                    'department_id' => $department?->id,
                    'capacity' => 40,
                    'is_active' => true,
                ]
            );

            // Determine semester from course code
            $semester = $this->getSemesterFromCode($courseData['code']);

            // Link to program if not already linked
            if (!$program->courses()->where('course_id', $course->id)->exists()) {
                $program->courses()->attach($course->id, [
                    'semester' => $semester,
                    'type' => $type,
                    'is_common' => $type === 'UNIVERSITY',
                    'order' => $order,
                ]);
            }

            $order++;
        }
    }

    /**
     * Extract semester number from course code
     * BVTU1301 -> 1 (first digit after letters)
     * BTEC2301 -> 2
     * BAIT5304 -> 5
     * BAIT8501 -> 8
     * BAITE601 -> 6 (elective)
     */
    private function getSemesterFromCode(string $code): int
    {
        // For elective courses with 'E' pattern (e.g., BAITE601)
        if (preg_match('/BAITE(\d)/', $code, $matches)) {
            return (int) $matches[1];
        }

        // Remove prefix letters to get the numeric part
        $numericPart = preg_replace('/[^0-9]/', '', substr($code, 4));

        if (!empty($numericPart)) {
            // First digit represents the semester
            return (int) $numericPart[0];
        }

        return 1; // Default to semester 1
    }
}
