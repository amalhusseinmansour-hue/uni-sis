<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Program;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BusinessAdministrationCoursesSeeder extends Seeder
{
    public function run(): void
    {
        // Find the Business Administration program
        $program = Program::where('code', 'BBA')->first();

        if (!$program) {
            $this->command->error('Business Administration program (BBA) not found!');
            return;
        }

        // Update total credits to 124
        $program->update(['total_credits' => 124]);

        // Find BA department for major courses
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

        // Create courses and link to program
        $this->command->info('Creating University Requirements courses...');
        $this->createAndLinkCourses($universityRequirements, $program, 'UNIVERSITY', $baDepartment);

        $this->command->info('Creating College Requirements courses...');
        $this->createAndLinkCourses($collegeRequirements, $program, 'COLLEGE', $baDepartment);

        $this->command->info('Creating Major Requirements courses...');
        $this->createAndLinkCourses($majorRequirements, $program, 'MAJOR', $baDepartment);

        $this->command->info('Creating Graduation Project...');
        $this->createAndLinkCourses($graduationProject, $program, 'MAJOR', $baDepartment);

        // Summary
        $this->command->info('');
        $this->command->info('=== Business Administration Courses Added Successfully ===');
        $this->command->info('University Requirements: ' . count($universityRequirements) . ' courses (26 credits)');
        $this->command->info('College Requirements: ' . count($collegeRequirements) . ' courses (42 credits)');
        $this->command->info('Major Requirements: ' . count($majorRequirements) . ' courses (51 credits)');
        $this->command->info('Graduation Project: 1 course (5 credits)');
        $this->command->info('Total: ' . (count($universityRequirements) + count($collegeRequirements) + count($majorRequirements) + count($graduationProject)) . ' courses (124 credits)');
    }

    private function createAndLinkCourses(array $courses, Program $program, string $type, ?Department $department): void
    {
        $order = 1;

        // Determine semester based on course code prefix
        foreach ($courses as $courseData) {
            // Create or update the course
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
     * BBAC3304 -> 3
     * BBUA5304 -> 5
     * BBUA8P05 -> 8
     */
    private function getSemesterFromCode(string $code): int
    {
        // Remove prefix letters to get the numeric part
        $numericPart = preg_replace('/[^0-9]/', '', substr($code, 4));

        if (!empty($numericPart)) {
            // First digit represents the semester
            return (int) $numericPart[0];
        }

        return 1; // Default to semester 1
    }
}
