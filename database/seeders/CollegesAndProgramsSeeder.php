<?php

namespace Database\Seeders;

use App\Models\College;
use App\Models\Department;
use App\Models\Program;
use Illuminate\Database\Seeder;

class CollegesAndProgramsSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // كلية إدارة الأعمال - College of Business Administration
        // ==========================================
        $businessCollege = College::create([
            'name_ar' => 'كلية إدارة الأعمال',
            'name_en' => 'College of Business Administration',
            'code' => 'CBA',
            'description' => 'College of Business Administration offering undergraduate and graduate programs in business, management, finance, and related fields.',
        ]);

        // قسم إدارة الأعمال - Department of Business Administration
        $deptBA = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم إدارة الأعمال',
            'name_en' => 'Department of Business Administration',
            'code' => 'BA',
        ]);
        Program::create([
            'department_id' => $deptBA->id,
            'name_ar' => 'بكالوريوس إدارة الأعمال',
            'name_en' => 'Bachelor of Business Administration',
            'code' => 'BBA',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم نظم المعلومات الإدارية - Department of Management Information Systems
        $deptMIS = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم نظم المعلومات الإدارية',
            'name_en' => 'Department of Management Information Systems',
            'code' => 'MIS',
        ]);
        Program::create([
            'department_id' => $deptMIS->id,
            'name_ar' => 'بكالوريوس نظم المعلومات الإدارية',
            'name_en' => 'Bachelor of Management Information Systems',
            'code' => 'BMIS',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم إدارة الموارد البشرية - Department of Human Resources Management
        $deptHR = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم إدارة الموارد البشرية',
            'name_en' => 'Department of Human Resources Management',
            'code' => 'HRM',
        ]);
        Program::create([
            'department_id' => $deptHR->id,
            'name_ar' => 'بكالوريوس إدارة الموارد البشرية',
            'name_en' => 'Bachelor of Human Resources Management',
            'code' => 'BHRM',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);
        Program::create([
            'department_id' => $deptHR->id,
            'name_ar' => 'ماجستير إدارة الموارد البشرية',
            'name_en' => 'Master of Human Resources Management',
            'code' => 'MHRM',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);

        // قسم المالية والاقتصاد - Department of Finance & Economics
        $deptFE = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم المالية والاقتصاد',
            'name_en' => 'Department of Finance & Economics',
            'code' => 'FE',
        ]);
        Program::create([
            'department_id' => $deptFE->id,
            'name_ar' => 'بكالوريوس المالية والاقتصاد',
            'name_en' => 'Bachelor of Finance & Economics',
            'code' => 'BFE',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم المحاسبة - Department of Accounting
        $deptACC = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم المحاسبة',
            'name_en' => 'Department of Accounting',
            'code' => 'ACC',
        ]);
        Program::create([
            'department_id' => $deptACC->id,
            'name_ar' => 'بكالوريوس المحاسبة',
            'name_en' => 'Bachelor of Accounting',
            'code' => 'BACC',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم التسويق - Department of Marketing
        $deptMKT = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم التسويق',
            'name_en' => 'Department of Marketing',
            'code' => 'MKT',
        ]);
        Program::create([
            'department_id' => $deptMKT->id,
            'name_ar' => 'بكالوريوس التسويق الرقمي',
            'name_en' => 'Bachelor of Digital Marketing',
            'code' => 'BDM',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);
        Program::create([
            'department_id' => $deptMKT->id,
            'name_ar' => 'ماجستير التسويق الرقمي',
            'name_en' => 'Master of Digital Marketing',
            'code' => 'MDM',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);
        Program::create([
            'department_id' => $deptMKT->id,
            'name_ar' => 'دكتوراه في التسويق',
            'name_en' => 'PhD in Marketing',
            'code' => 'PHDMKT',
            'type' => 'PHD',
            'total_credits' => 54,
        ]);

        // قسم التجارة الإلكترونية - Department of E-Commerce
        $deptEC = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم التجارة الإلكترونية',
            'name_en' => 'Department of E-Commerce',
            'code' => 'EC',
        ]);
        Program::create([
            'department_id' => $deptEC->id,
            'name_ar' => 'بكالوريوس التجارة الإلكترونية',
            'name_en' => 'Bachelor of E-Commerce',
            'code' => 'BEC',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم المخاطر والتأمين - Department of Risk Management & Insurance
        $deptRMI = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم المخاطر والتأمين',
            'name_en' => 'Department of Risk Management & Insurance',
            'code' => 'RMI',
        ]);
        Program::create([
            'department_id' => $deptRMI->id,
            'name_ar' => 'بكالوريوس إدارة المخاطر والتأمين',
            'name_en' => 'Bachelor of Risk Management & Insurance',
            'code' => 'BRMI',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم الخدمات اللوجستية وسلاسل الإمداد - Department of Logistics & Supply Chain
        $deptLSC = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم الخدمات اللوجستية وسلاسل الإمداد',
            'name_en' => 'Department of Logistics & Supply Chain',
            'code' => 'LSC',
        ]);
        Program::create([
            'department_id' => $deptLSC->id,
            'name_ar' => 'بكالوريوس اللوجستيات وسلاسل الإمداد',
            'name_en' => 'Bachelor of Logistics & Supply Chain',
            'code' => 'BLSC',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم التكنولوجيا المالية - Department of Financial Technology
        $deptFT = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم التكنولوجيا المالية',
            'name_en' => 'Department of Financial Technology',
            'code' => 'FT',
        ]);
        Program::create([
            'department_id' => $deptFT->id,
            'name_ar' => 'بكالوريوس التكنولوجيا المالية',
            'name_en' => 'Bachelor of Financial Technology',
            'code' => 'BFT',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);
        Program::create([
            'department_id' => $deptFT->id,
            'name_ar' => 'ماجستير التكنولوجيا المالية',
            'name_en' => 'Master of Financial Technology',
            'code' => 'MFT',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);

        // قسم الإدارة (للدراسات العليا) - Department of Management (Graduate)
        $deptMGMT = Department::create([
            'college_id' => $businessCollege->id,
            'name_ar' => 'قسم الإدارة',
            'name_en' => 'Department of Management',
            'code' => 'MGMT',
        ]);
        Program::create([
            'department_id' => $deptMGMT->id,
            'name_ar' => 'ماجستير إدارة المشاريع',
            'name_en' => 'Master of Project Management',
            'code' => 'MPM',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);
        Program::create([
            'department_id' => $deptMGMT->id,
            'name_ar' => 'ماجستير إدارة الأعمال',
            'name_en' => 'Master of Business Administration',
            'code' => 'MBA',
            'type' => 'MASTER',
            'total_credits' => 42,
        ]);
        Program::create([
            'department_id' => $deptMGMT->id,
            'name_ar' => 'دكتوراه في الإدارة',
            'name_en' => 'PhD in Management',
            'code' => 'PHDMGMT',
            'type' => 'PHD',
            'total_credits' => 54,
        ]);

        // قسم نظم المعلومات (للدراسات العليا)
        Program::create([
            'department_id' => $deptMIS->id,
            'name_ar' => 'ماجستير إدارة نظم المعلومات',
            'name_en' => 'Master of Management Information Systems',
            'code' => 'MMIS',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);

        // ==========================================
        // كلية الهندسة وتكنولوجيا المعلومات - College of Engineering & IT
        // ==========================================
        $engineeringCollege = College::create([
            'name_ar' => 'كلية الهندسة وتكنولوجيا المعلومات',
            'name_en' => 'College of Engineering & IT',
            'code' => 'CEIT',
            'description' => 'College of Engineering and Information Technology offering cutting-edge programs in computer engineering, software, AI, and cybersecurity.',
        ]);

        // قسم هندسة الحاسوب - Department of Computer Engineering
        $deptCE = Department::create([
            'college_id' => $engineeringCollege->id,
            'name_ar' => 'قسم هندسة الحاسوب',
            'name_en' => 'Department of Computer Engineering',
            'code' => 'CE',
        ]);
        Program::create([
            'department_id' => $deptCE->id,
            'name_ar' => 'بكالوريوس هندسة الحاسوب',
            'name_en' => 'Bachelor of Computer Engineering',
            'code' => 'BCE',
            'type' => 'BACHELOR',
            'total_credits' => 160,
        ]);
        Program::create([
            'department_id' => $deptCE->id,
            'name_ar' => 'ماجستير هندسة الحاسوب',
            'name_en' => 'Master of Computer Engineering',
            'code' => 'MCE',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);
        Program::create([
            'department_id' => $deptCE->id,
            'name_ar' => 'دكتوراه هندسة الحاسوب',
            'name_en' => 'PhD in Computer Engineering',
            'code' => 'PHDCE',
            'type' => 'PHD',
            'total_credits' => 54,
        ]);

        // قسم هندسة البرمجيات - Department of Software Engineering
        $deptSE = Department::create([
            'college_id' => $engineeringCollege->id,
            'name_ar' => 'قسم هندسة البرمجيات',
            'name_en' => 'Department of Software Engineering',
            'code' => 'SE',
        ]);
        Program::create([
            'department_id' => $deptSE->id,
            'name_ar' => 'بكالوريوس هندسة البرمجيات',
            'name_en' => 'Bachelor of Software Engineering',
            'code' => 'BSE',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم الذكاء الاصطناعي - Department of Artificial Intelligence
        $deptAI = Department::create([
            'college_id' => $engineeringCollege->id,
            'name_ar' => 'قسم الذكاء الاصطناعي',
            'name_en' => 'Department of Artificial Intelligence',
            'code' => 'AI',
        ]);
        Program::create([
            'department_id' => $deptAI->id,
            'name_ar' => 'بكالوريوس الذكاء الاصطناعي',
            'name_en' => 'Bachelor of Artificial Intelligence',
            'code' => 'BAI',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);
        Program::create([
            'department_id' => $deptAI->id,
            'name_ar' => 'ماجستير الذكاء الاصطناعي',
            'name_en' => 'Master of Artificial Intelligence',
            'code' => 'MAI',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);

        // قسم نظم المعلومات الحاسوبية - Department of Computer Information Systems
        $deptCIS = Department::create([
            'college_id' => $engineeringCollege->id,
            'name_ar' => 'قسم نظم المعلومات الحاسوبية',
            'name_en' => 'Department of Computer Information Systems',
            'code' => 'CIS',
        ]);
        Program::create([
            'department_id' => $deptCIS->id,
            'name_ar' => 'بكالوريوس نظم المعلومات الحاسوبية',
            'name_en' => 'Bachelor of Computer Information Systems',
            'code' => 'BCIS',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);
        Program::create([
            'department_id' => $deptCIS->id,
            'name_ar' => 'ماجستير نظم المعلومات الحاسوبية',
            'name_en' => 'Master of Computer Information Systems',
            'code' => 'MCIS',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);

        // قسم الأمن السيبراني - Department of Cybersecurity
        $deptCS = Department::create([
            'college_id' => $engineeringCollege->id,
            'name_ar' => 'قسم الأمن السيبراني',
            'name_en' => 'Department of Cybersecurity',
            'code' => 'CYBER',
        ]);
        Program::create([
            'department_id' => $deptCS->id,
            'name_ar' => 'بكالوريوس الأمن السيبراني',
            'name_en' => 'Bachelor of Cybersecurity',
            'code' => 'BCYBER',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);
        Program::create([
            'department_id' => $deptCS->id,
            'name_ar' => 'ماجستير الأمن السيبراني',
            'name_en' => 'Master of Cybersecurity',
            'code' => 'MCYBER',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);

        // قسم الوسائط الرقمية - Department of Digital Media
        $deptDM = Department::create([
            'college_id' => $engineeringCollege->id,
            'name_ar' => 'قسم الوسائط الرقمية',
            'name_en' => 'Department of Digital Media',
            'code' => 'DM',
        ]);
        Program::create([
            'department_id' => $deptDM->id,
            'name_ar' => 'بكالوريوس هندسة الوسائط الرقمية',
            'name_en' => 'Bachelor of Digital Media Engineering',
            'code' => 'BDME',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم تقنية المعلومات - Department of Information Technology
        $deptIT = Department::create([
            'college_id' => $engineeringCollege->id,
            'name_ar' => 'قسم تقنية المعلومات',
            'name_en' => 'Department of Information Technology',
            'code' => 'IT',
        ]);
        Program::create([
            'department_id' => $deptIT->id,
            'name_ar' => 'بكالوريوس تقنية المعلومات',
            'name_en' => 'Bachelor of Information Technology',
            'code' => 'BIT',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // ==========================================
        // كلية العلوم الصحية والبيئية - College of Health & Environmental Sciences
        // ==========================================
        $healthCollege = College::create([
            'name_ar' => 'كلية العلوم الصحية والبيئية',
            'name_en' => 'College of Health & Environmental Sciences',
            'code' => 'CHES',
            'description' => 'College of Health and Environmental Sciences offering programs in health management, emergency management, and health informatics.',
        ]);

        // قسم إدارة الطوارئ والكوارث الصحية - Department of Health Emergency & Disaster Management
        $deptHEDM = Department::create([
            'college_id' => $healthCollege->id,
            'name_ar' => 'قسم إدارة الطوارئ والكوارث الصحية',
            'name_en' => 'Department of Health Emergency & Disaster Management',
            'code' => 'HEDM',
        ]);
        Program::create([
            'department_id' => $deptHEDM->id,
            'name_ar' => 'بكالوريوس إدارة الطوارئ والكوارث الصحية',
            'name_en' => 'Bachelor of Health Emergency & Disaster Management',
            'code' => 'BHEDM',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);
        Program::create([
            'department_id' => $deptHEDM->id,
            'name_ar' => 'ماجستير إدارة الطوارئ والكوارث الصحية',
            'name_en' => 'Master of Health Emergency & Disaster Management',
            'code' => 'MHEDM',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);
        Program::create([
            'department_id' => $deptHEDM->id,
            'name_ar' => 'دكتوراه إدارة الطوارئ والكوارث الصحية',
            'name_en' => 'PhD in Health Emergency & Disaster Management',
            'code' => 'PHDHEDM',
            'type' => 'PHD',
            'total_credits' => 54,
        ]);

        // قسم الإدارة الصحية - Department of Health Administration
        $deptHA = Department::create([
            'college_id' => $healthCollege->id,
            'name_ar' => 'قسم الإدارة الصحية',
            'name_en' => 'Department of Health Administration',
            'code' => 'HA',
        ]);
        Program::create([
            'department_id' => $deptHA->id,
            'name_ar' => 'بكالوريوس الإدارة الصحية',
            'name_en' => 'Bachelor of Health Administration',
            'code' => 'BHA',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);
        Program::create([
            'department_id' => $deptHA->id,
            'name_ar' => 'ماجستير الإدارة الصحية',
            'name_en' => 'Master of Health Administration',
            'code' => 'MHA',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);
        Program::create([
            'department_id' => $deptHA->id,
            'name_ar' => 'دكتوراه الإدارة الصحية',
            'name_en' => 'PhD in Health Administration',
            'code' => 'PHDHA',
            'type' => 'PHD',
            'total_credits' => 54,
        ]);

        // قسم تكنولوجيا المعلومات الصحية - Department of Health Information Technology
        $deptHIT = Department::create([
            'college_id' => $healthCollege->id,
            'name_ar' => 'قسم تكنولوجيا المعلومات الصحية',
            'name_en' => 'Department of Health Information Technology',
            'code' => 'HIT',
        ]);
        Program::create([
            'department_id' => $deptHIT->id,
            'name_ar' => 'بكالوريوس تكنولوجيا المعلومات الصحية',
            'name_en' => 'Bachelor of Health Information Technology',
            'code' => 'BHIT',
            'type' => 'BACHELOR',
            'total_credits' => 132,
        ]);

        // قسم إدارة المستشفيات - Department of Hospital Management
        $deptHM = Department::create([
            'college_id' => $healthCollege->id,
            'name_ar' => 'قسم إدارة المستشفيات',
            'name_en' => 'Department of Hospital Management',
            'code' => 'HM',
        ]);
        Program::create([
            'department_id' => $deptHM->id,
            'name_ar' => 'ماجستير إدارة المستشفيات',
            'name_en' => 'Master of Hospital Management',
            'code' => 'MHM',
            'type' => 'MASTER',
            'total_credits' => 36,
        ]);

        $this->command->info('Colleges, Departments, and Programs seeded successfully!');
        $this->command->info('Created:');
        $this->command->info('- 3 Colleges');
        $this->command->info('- ' . Department::count() . ' Departments');
        $this->command->info('- ' . Program::count() . ' Programs');
    }
}
