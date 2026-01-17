<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\College;
use App\Models\Department;
use App\Models\Program;
use App\Models\Course;
use App\Models\Semester;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\FinancialRecord;
use App\Models\Announcement;
use App\Models\AdmissionApplication;
use App\Models\ServiceRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeders.
     *
     * php artisan db:seed                           - Run all seeders
     * php artisan db:seed --class=CollegesAndProgramsSeeder - Run only colleges seeder
     */
    public function run(): void
    {
        // Seed colleges, departments, and programs first
        $this->call(CollegesAndProgramsSeeder::class);

        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@university.edu',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
        ]);

        // Create Finance User
        User::create([
            'name' => 'Finance Manager',
            'email' => 'finance@university.edu',
            'password' => Hash::make('password'),
            'role' => 'FINANCE',
        ]);

        // Create Lecturer User
        User::create([
            'name' => 'Dr. Ahmed Mohammed',
            'email' => 'lecturer@university.edu',
            'password' => Hash::make('password'),
            'role' => 'LECTURER',
        ]);

        // Use existing College from CollegesAndProgramsSeeder
        $college = College::first();

        // Use existing Department from CollegesAndProgramsSeeder
        $department = Department::first();

        // Create Program - use the first available program from seeder
        $program = Program::first();

        // Create Courses
        $courses = [
            ['code' => 'CS101', 'name_en' => 'Introduction to Programming', 'name_ar' => 'مقدمة في البرمجة', 'credits' => 3],
            ['code' => 'CS102', 'name_en' => 'Data Structures', 'name_ar' => 'هياكل البيانات', 'credits' => 3],
            ['code' => 'CS201', 'name_en' => 'Algorithms', 'name_ar' => 'الخوارزميات', 'credits' => 3],
            ['code' => 'CS202', 'name_en' => 'Database Systems', 'name_ar' => 'قواعد البيانات', 'credits' => 3],
            ['code' => 'CS301', 'name_en' => 'Software Engineering', 'name_ar' => 'هندسة البرمجيات', 'credits' => 3],
            ['code' => 'CS302', 'name_en' => 'Web Development', 'name_ar' => 'تطوير الويب', 'credits' => 3],
            ['code' => 'CS303', 'name_en' => 'Mobile App Development', 'name_ar' => 'تطوير تطبيقات الجوال', 'credits' => 3],
            ['code' => 'CS401', 'name_en' => 'Artificial Intelligence', 'name_ar' => 'الذكاء الاصطناعي', 'credits' => 3],
            ['code' => 'CS402', 'name_en' => 'Machine Learning', 'name_ar' => 'تعلم الآلة', 'credits' => 3],
        ];

        $createdCourses = [];
        foreach ($courses as $course) {
            $createdCourses[] = Course::create([
                'department_id' => $department->id,
                'code' => $course['code'],
                'name_en' => $course['name_en'],
                'name_ar' => $course['name_ar'],
                'credits' => $course['credits'],
                'capacity' => 30,
                'is_active' => true,
            ]);
        }

        // Create Semesters
        $pastSemester = Semester::create([
            'name' => 'Spring 2024',
            'academic_year' => '2023-2024',
            'start_date' => '2024-01-15',
            'end_date' => '2024-05-30',
            'registration_start' => '2024-01-01',
            'registration_end' => '2024-01-20',
            'is_current' => false,
        ]);

        $currentSemester = Semester::create([
            'name' => 'Fall 2024',
            'academic_year' => '2024-2025',
            'start_date' => '2024-09-01',
            'end_date' => '2024-12-31',
            'registration_start' => '2024-08-15',
            'registration_end' => '2024-09-15',
            'is_current' => true,
        ]);

        // Create Student Users and Students
        $students = [
            [
                'name' => 'Mohammed Ali Hassan',
                'email' => 'mohammed.ali@student.university.edu',
                'student_id' => '2024001',
                'name_en' => 'Mohammed Ali Hassan',
                'name_ar' => 'محمد علي حسن',
                'national_id' => '1234567890',
                'date_of_birth' => '2000-05-15',
                'gender' => 'MALE',
            ],
            [
                'name' => 'Sara Ahmed Mohammed',
                'email' => 'sara.ahmed@student.university.edu',
                'student_id' => '2024002',
                'name_en' => 'Sara Ahmed Mohammed',
                'name_ar' => 'سارة أحمد محمد',
                'national_id' => '1234567891',
                'date_of_birth' => '2001-03-20',
                'gender' => 'FEMALE',
            ],
            [
                'name' => 'Omar Khalid Ibrahim',
                'email' => 'omar.khalid@student.university.edu',
                'student_id' => '2024003',
                'name_en' => 'Omar Khalid Ibrahim',
                'name_ar' => 'عمر خالد إبراهيم',
                'national_id' => '1234567892',
                'date_of_birth' => '2000-11-10',
                'gender' => 'MALE',
            ],
            [
                'name' => 'Fatima Yusuf Ali',
                'email' => 'fatima.yusuf@student.university.edu',
                'student_id' => '2024004',
                'name_en' => 'Fatima Yusuf Ali',
                'name_ar' => 'فاطمة يوسف علي',
                'national_id' => '1234567893',
                'date_of_birth' => '2001-07-25',
                'gender' => 'FEMALE',
            ],
            [
                'name' => 'Ahmed Hassan Mahmoud',
                'email' => 'ahmed.hassan@student.university.edu',
                'student_id' => '2024005',
                'name_en' => 'Ahmed Hassan Mahmoud',
                'name_ar' => 'أحمد حسن محمود',
                'national_id' => '1234567894',
                'date_of_birth' => '2000-09-05',
                'gender' => 'MALE',
            ],
        ];

        $createdStudents = [];
        foreach ($students as $studentData) {
            $user = User::create([
                'name' => $studentData['name'],
                'email' => $studentData['email'],
                'password' => Hash::make('password'),
                'role' => 'STUDENT',
            ]);

            $createdStudents[] = Student::create([
                'user_id' => $user->id,
                'program_id' => $program->id,
                'student_id' => $studentData['student_id'],
                'name_en' => $studentData['name_en'],
                'name_ar' => $studentData['name_ar'],
                'national_id' => $studentData['national_id'],
                'date_of_birth' => $studentData['date_of_birth'],
                'gender' => $studentData['gender'],
                'personal_email' => $studentData['email'],
                'university_email' => $studentData['email'],
                'phone' => '+966' . rand(500000000, 599999999),
                'admission_date' => '2024-09-01',
                'status' => 'ACTIVE',
                'nationality' => 'Saudi Arabian',
            ]);
        }

        // Create Enrollments for students
        foreach ($createdStudents as $index => $student) {
            // Enroll in 3-4 courses
            $courseCount = rand(3, 4);
            $enrolledCourses = array_slice($createdCourses, 0, $courseCount);

            foreach ($enrolledCourses as $course) {
                Enrollment::create([
                    'student_id' => $student->id,
                    'course_id' => $course->id,
                    'semester_id' => $currentSemester->id,
                    'semester' => 'Fall 2024',
                    'academic_year' => '2024-2025',
                    'status' => 'ENROLLED',
                    'attendance' => rand(70, 100),
                ]);
            }
        }

        // Create some completed grades for past semester
        foreach (array_slice($createdStudents, 0, 3) as $student) {
            foreach (array_slice($createdCourses, 0, 2) as $course) {
                $midterm = rand(60, 95);
                $final = rand(60, 95);
                $coursework = rand(70, 100);
                $total = ($midterm * 0.3) + ($final * 0.5) + ($coursework * 0.2);
                $gradeData = Grade::calculateGrade($total);

                Grade::create([
                    'student_id' => $student->id,
                    'course_id' => $course->id,
                    'semester_id' => $pastSemester->id,
                    'semester' => 'Spring 2024',
                    'midterm' => $midterm,
                    'final' => $final,
                    'coursework' => $coursework,
                    'total' => $total,
                    'grade' => $gradeData['grade'],
                    'points' => $gradeData['points'],
                    'status' => 'APPROVED',
                ]);
            }
        }

        // Create Financial Records
        foreach ($createdStudents as $student) {
            // Tuition fee (debit)
            FinancialRecord::create([
                'student_id' => $student->id,
                'date' => '2024-09-01',
                'description' => 'Tuition Fee - Fall 2024',
                'amount' => 15000,
                'type' => 'DEBIT',
                'status' => rand(0, 1) ? 'PAID' : 'PENDING',
                'reference_number' => 'TF-' . $student->student_id . '-F24',
            ]);

            // Some payments (credit)
            if (rand(0, 1)) {
                FinancialRecord::create([
                    'student_id' => $student->id,
                    'date' => '2024-09-15',
                    'description' => 'Payment Received',
                    'amount' => rand(5000, 15000),
                    'type' => 'CREDIT',
                    'status' => 'PAID',
                    'reference_number' => 'PAY-' . $student->student_id . '-' . rand(1000, 9999),
                ]);
            }
        }

        // Create Announcements
        Announcement::create([
            'title' => 'Welcome to the New Academic Year - أهلاً بكم في العام الدراسي الجديد',
            'content' => '<p>We are pleased to welcome all students to the new academic year 2024-2025. We wish you all success in your studies.</p><p>يسعدنا أن نرحب بجميع الطلاب في العام الدراسي الجديد 2024-2025. نتمنى لكم جميعاً التوفيق في دراستكم.</p>',
            'type' => 'GENERAL',
            'is_published' => true,
            'published_at' => now(),
        ]);

        Announcement::create([
            'title' => 'Registration for Fall 2024 is Now Open - التسجيل لفصل خريف 2024 مفتوح الآن',
            'content' => '<p>Course registration for Fall 2024 semester is now open. Please log in to your student portal to register for your courses.</p><p>تسجيل المقررات لفصل خريف 2024 مفتوح الآن. يرجى تسجيل الدخول إلى بوابة الطالب للتسجيل في مقرراتك.</p>',
            'type' => 'ACADEMIC',
            'is_published' => true,
            'published_at' => now(),
        ]);

        Announcement::create([
            'title' => 'Tuition Payment Deadline - الموعد النهائي لدفع الرسوم الدراسية',
            'content' => '<p>Please note that the tuition payment deadline for Fall 2024 is September 30, 2024. Late payments will incur additional fees.</p><p>يرجى ملاحظة أن الموعد النهائي لدفع الرسوم الدراسية لفصل خريف 2024 هو 30 سبتمبر 2024. المدفوعات المتأخرة ستتحمل رسوماً إضافية.</p>',
            'type' => 'FINANCIAL',
            'is_published' => true,
            'published_at' => now(),
        ]);

        // Create Admission Applications
        AdmissionApplication::create([
            'program_id' => $program->id,
            'full_name' => 'Khalid Mohammed Ali',
            'national_id' => '9876543210',
            'email' => 'khalid.new@gmail.com',
            'phone' => '+966501234567',
            'date_of_birth' => '2004-03-15',
            'gender' => 'MALE',
            'nationality' => 'Saudi Arabian',
            'address' => 'Riyadh, Saudi Arabia',
            'high_school_name' => 'Al-Riyadh High School',
            'high_school_score' => 92.5,
            'high_school_year' => 2024,
            'status' => 'PENDING',
            'date' => now(),
        ]);

        AdmissionApplication::create([
            'program_id' => $program->id,
            'full_name' => 'Noura Abdullah Ahmed',
            'national_id' => '9876543211',
            'email' => 'noura.new@gmail.com',
            'phone' => '+966507654321',
            'date_of_birth' => '2005-01-20',
            'gender' => 'FEMALE',
            'nationality' => 'Saudi Arabian',
            'address' => 'Jeddah, Saudi Arabia',
            'high_school_name' => 'Al-Madinah High School',
            'high_school_score' => 88.0,
            'high_school_year' => 2024,
            'status' => 'PENDING',
            'date' => now(),
        ]);

        // Create Service Requests
        ServiceRequest::create([
            'student_id' => $createdStudents[0]->id,
            'request_type' => 'TRANSCRIPT',
            'subject' => 'Official Transcript Request',
            'description' => 'I need an official transcript for scholarship application.',
            'priority' => 'MEDIUM',
            'date' => now(),
            'request_date' => now(),
            'status' => 'PENDING',
        ]);

        ServiceRequest::create([
            'student_id' => $createdStudents[1]->id,
            'request_type' => 'ENROLLMENT_LETTER',
            'subject' => 'Enrollment Verification Letter',
            'description' => 'I need an enrollment letter for visa application.',
            'priority' => 'HIGH',
            'date' => now(),
            'request_date' => now(),
            'status' => 'PENDING',
        ]);

        // Seed Dynamic Content System
        $this->call([
            DynamicTablesSeeder::class,
            // DynamicReportsSeeder::class, // Temporarily skipped due to cast issues
            SystemSettingsSeeder::class,
        ]);

        echo "Database seeded successfully!\n";
        echo "Login credentials:\n";
        echo "- Admin: admin@university.edu / password\n";
        echo "- Finance: finance@university.edu / password\n";
        echo "- Lecturer: lecturer@university.edu / password\n";
        echo "- Student: mohammed.ali@student.university.edu / password\n";
    }
}
