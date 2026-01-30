<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedGeneralSettings();
        $this->seedEmailSettings();
        $this->seedSecuritySettings();
        $this->seedNotificationSettings();
        $this->seedDatabaseSettings();
        $this->seedLmsSettings();
        $this->seedEnrollmentSettings();
    }

    protected function seedGeneralSettings(): void
    {
        $settings = [
            [
                'group' => 'general',
                'key' => 'site_name_en',
                'value' => 'University SIS',
                'type' => 'string',
                'label_en' => 'Site Name (English)',
                'label_ar' => 'اسم الموقع (إنجليزي)',
                'is_public' => true,
                'order' => 1,
            ],
            [
                'group' => 'general',
                'key' => 'site_name_ar',
                'value' => 'نظام معلومات الطلاب',
                'type' => 'string',
                'label_en' => 'Site Name (Arabic)',
                'label_ar' => 'اسم الموقع (عربي)',
                'is_public' => true,
                'order' => 2,
            ],
            [
                'group' => 'general',
                'key' => 'support_email',
                'value' => 'support@university.edu',
                'type' => 'string',
                'label_en' => 'Support Email',
                'label_ar' => 'بريد الدعم',
                'is_public' => true,
                'order' => 3,
            ],
            [
                'group' => 'general',
                'key' => 'support_phone',
                'value' => '+1234567890',
                'type' => 'string',
                'label_en' => 'Support Phone',
                'label_ar' => 'هاتف الدعم',
                'is_public' => true,
                'order' => 4,
            ],
            [
                'group' => 'general',
                'key' => 'default_language',
                'value' => 'en',
                'type' => 'string',
                'label_en' => 'Default Language',
                'label_ar' => 'اللغة الافتراضية',
                'is_public' => true,
                'order' => 5,
            ],
            [
                'group' => 'general',
                'key' => 'timezone',
                'value' => 'UTC',
                'type' => 'string',
                'label_en' => 'Timezone',
                'label_ar' => 'المنطقة الزمنية',
                'is_public' => true,
                'order' => 6,
            ],
            [
                'group' => 'general',
                'key' => 'academic_year',
                'value' => '2024-2025',
                'type' => 'string',
                'label_en' => 'Academic Year',
                'label_ar' => 'السنة الأكاديمية',
                'is_public' => true,
                'order' => 7,
            ],
            [
                'group' => 'general',
                'key' => 'current_semester',
                'value' => 'fall',
                'type' => 'string',
                'label_en' => 'Current Semester',
                'label_ar' => 'الفصل الحالي',
                'is_public' => true,
                'order' => 8,
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    protected function seedEmailSettings(): void
    {
        $settings = [
            [
                'group' => 'email',
                'key' => 'smtp_host',
                'value' => 'smtp.example.com',
                'type' => 'string',
                'label_en' => 'SMTP Host',
                'label_ar' => 'خادم SMTP',
                'is_public' => false,
                'order' => 1,
            ],
            [
                'group' => 'email',
                'key' => 'smtp_port',
                'value' => '587',
                'type' => 'number',
                'label_en' => 'SMTP Port',
                'label_ar' => 'منفذ SMTP',
                'is_public' => false,
                'order' => 2,
            ],
            [
                'group' => 'email',
                'key' => 'smtp_username',
                'value' => '',
                'type' => 'string',
                'label_en' => 'SMTP Username',
                'label_ar' => 'اسم مستخدم SMTP',
                'is_public' => false,
                'order' => 3,
            ],
            [
                'group' => 'email',
                'key' => 'smtp_password',
                'value' => '',
                'type' => 'string',
                'label_en' => 'SMTP Password',
                'label_ar' => 'كلمة مرور SMTP',
                'is_public' => false,
                'is_encrypted' => true,
                'order' => 4,
            ],
            [
                'group' => 'email',
                'key' => 'smtp_encryption',
                'value' => 'tls',
                'type' => 'string',
                'label_en' => 'Encryption',
                'label_ar' => 'التشفير',
                'is_public' => false,
                'order' => 5,
            ],
            [
                'group' => 'email',
                'key' => 'from_address',
                'value' => 'noreply@university.edu',
                'type' => 'string',
                'label_en' => 'From Address',
                'label_ar' => 'عنوان المرسل',
                'is_public' => false,
                'order' => 6,
            ],
            [
                'group' => 'email',
                'key' => 'from_name',
                'value' => 'University SIS',
                'type' => 'string',
                'label_en' => 'From Name',
                'label_ar' => 'اسم المرسل',
                'is_public' => false,
                'order' => 7,
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    protected function seedSecuritySettings(): void
    {
        $settings = [
            [
                'group' => 'security',
                'key' => 'session_timeout',
                'value' => '60',
                'type' => 'number',
                'label_en' => 'Session Timeout (minutes)',
                'label_ar' => 'مهلة الجلسة (دقائق)',
                'is_public' => false,
                'order' => 1,
            ],
            [
                'group' => 'security',
                'key' => 'max_login_attempts',
                'value' => '5',
                'type' => 'number',
                'label_en' => 'Max Login Attempts',
                'label_ar' => 'الحد الأقصى لمحاولات الدخول',
                'is_public' => false,
                'order' => 2,
            ],
            [
                'group' => 'security',
                'key' => 'password_min_length',
                'value' => '8',
                'type' => 'number',
                'label_en' => 'Min Password Length',
                'label_ar' => 'الحد الأدنى لطول كلمة المرور',
                'is_public' => false,
                'order' => 3,
            ],
            [
                'group' => 'security',
                'key' => 'require_strong_password',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Require Strong Password',
                'label_ar' => 'طلب كلمة مرور قوية',
                'is_public' => false,
                'order' => 4,
            ],
            [
                'group' => 'security',
                'key' => 'enable_two_factor',
                'value' => false,
                'type' => 'boolean',
                'label_en' => 'Enable Two-Factor Auth',
                'label_ar' => 'تفعيل التحقق بخطوتين',
                'is_public' => false,
                'order' => 5,
            ],
            [
                'group' => 'security',
                'key' => 'allow_remember_me',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Allow Remember Me',
                'label_ar' => 'السماح بتذكرني',
                'is_public' => false,
                'order' => 6,
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    protected function seedNotificationSettings(): void
    {
        $settings = [
            [
                'group' => 'notifications',
                'key' => 'enable_email_notifications',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Email Notifications',
                'label_ar' => 'إشعارات البريد',
                'is_public' => false,
                'order' => 1,
            ],
            [
                'group' => 'notifications',
                'key' => 'enable_sms_notifications',
                'value' => false,
                'type' => 'boolean',
                'label_en' => 'SMS Notifications',
                'label_ar' => 'إشعارات الرسائل',
                'is_public' => false,
                'order' => 2,
            ],
            [
                'group' => 'notifications',
                'key' => 'enable_push_notifications',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Push Notifications',
                'label_ar' => 'الإشعارات الفورية',
                'is_public' => false,
                'order' => 3,
            ],
            [
                'group' => 'notifications',
                'key' => 'notify_on_new_student',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Notify on New Student',
                'label_ar' => 'إشعار عند طالب جديد',
                'is_public' => false,
                'order' => 4,
            ],
            [
                'group' => 'notifications',
                'key' => 'notify_on_payment',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Notify on Payment',
                'label_ar' => 'إشعار عند الدفع',
                'is_public' => false,
                'order' => 5,
            ],
            [
                'group' => 'notifications',
                'key' => 'notify_on_grade',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Notify on Grade Posted',
                'label_ar' => 'إشعار عند نشر الدرجة',
                'is_public' => false,
                'order' => 6,
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    protected function seedDatabaseSettings(): void
    {
        $settings = [
            [
                'group' => 'database',
                'key' => 'backup_enabled',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Auto Backup',
                'label_ar' => 'النسخ الاحتياطي التلقائي',
                'is_public' => false,
                'order' => 1,
            ],
            [
                'group' => 'database',
                'key' => 'backup_frequency',
                'value' => 'daily',
                'type' => 'string',
                'label_en' => 'Backup Frequency',
                'label_ar' => 'تكرار النسخ الاحتياطي',
                'is_public' => false,
                'order' => 2,
            ],
            [
                'group' => 'database',
                'key' => 'backup_retention',
                'value' => '30',
                'type' => 'number',
                'label_en' => 'Backup Retention (days)',
                'label_ar' => 'الاحتفاظ بالنسخ (أيام)',
                'is_public' => false,
                'order' => 3,
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    protected function seedLmsSettings(): void
    {
        $settings = [
            [
                'group' => 'lms',
                'key' => 'lms_enabled',
                'value' => false,
                'type' => 'boolean',
                'label_en' => 'Enable LMS Integration',
                'label_ar' => 'تفعيل تكامل LMS',
                'description_en' => 'Enable integration with Learning Management System',
                'description_ar' => 'تفعيل التكامل مع نظام إدارة التعلم',
                'is_public' => false,
                'order' => 1,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_api_url',
                'value' => '',
                'type' => 'string',
                'label_en' => 'LMS API URL',
                'label_ar' => 'رابط API للـ LMS',
                'description_en' => 'The base URL for the LMS API endpoint',
                'description_ar' => 'الرابط الأساسي لـ API نظام إدارة التعلم',
                'is_public' => false,
                'order' => 2,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_api_key',
                'value' => '',
                'type' => 'string',
                'label_en' => 'API Key',
                'label_ar' => 'مفتاح API',
                'description_en' => 'The API key/token for authentication',
                'description_ar' => 'مفتاح API للمصادقة',
                'is_public' => false,
                'is_encrypted' => true,
                'order' => 3,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_api_secret',
                'value' => '',
                'type' => 'string',
                'label_en' => 'API Secret',
                'label_ar' => 'كلمة سر API',
                'description_en' => 'The API secret for authentication',
                'description_ar' => 'كلمة السر للمصادقة',
                'is_public' => false,
                'is_encrypted' => true,
                'order' => 4,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_sync_courses',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Sync Courses',
                'label_ar' => 'مزامنة المقررات',
                'description_en' => 'Synchronize courses with LMS',
                'description_ar' => 'مزامنة المقررات مع نظام إدارة التعلم',
                'is_public' => false,
                'order' => 5,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_sync_students',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Sync Students',
                'label_ar' => 'مزامنة الطلاب',
                'description_en' => 'Synchronize student accounts with LMS',
                'description_ar' => 'مزامنة حسابات الطلاب مع نظام إدارة التعلم',
                'is_public' => false,
                'order' => 6,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_sync_grades',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Sync Grades',
                'label_ar' => 'مزامنة الدرجات',
                'description_en' => 'Import grades from LMS',
                'description_ar' => 'استيراد الدرجات من نظام إدارة التعلم',
                'is_public' => false,
                'order' => 7,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_sync_attendance',
                'value' => false,
                'type' => 'boolean',
                'label_en' => 'Sync Attendance',
                'label_ar' => 'مزامنة الحضور',
                'description_en' => 'Synchronize attendance data with LMS',
                'description_ar' => 'مزامنة بيانات الحضور مع نظام إدارة التعلم',
                'is_public' => false,
                'order' => 8,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_auto_sync',
                'value' => false,
                'type' => 'boolean',
                'label_en' => 'Auto Sync',
                'label_ar' => 'مزامنة تلقائية',
                'description_en' => 'Automatically sync data with LMS at scheduled intervals',
                'description_ar' => 'مزامنة البيانات تلقائياً مع نظام إدارة التعلم',
                'is_public' => false,
                'order' => 9,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_sync_frequency',
                'value' => 'daily',
                'type' => 'string',
                'label_en' => 'Sync Frequency',
                'label_ar' => 'تكرار المزامنة',
                'description_en' => 'How often to automatically sync with LMS',
                'description_ar' => 'عدد مرات المزامنة التلقائية',
                'options' => json_encode([
                    'hourly' => ['en' => 'Hourly', 'ar' => 'كل ساعة'],
                    '6hours' => ['en' => 'Every 6 Hours', 'ar' => 'كل 6 ساعات'],
                    '12hours' => ['en' => 'Every 12 Hours', 'ar' => 'كل 12 ساعة'],
                    'daily' => ['en' => 'Daily', 'ar' => 'يومي'],
                    'manual' => ['en' => 'Manual Only', 'ar' => 'يدوي فقط'],
                ]),
                'is_public' => false,
                'order' => 10,
            ],
            [
                'group' => 'lms',
                'key' => 'lms_last_sync',
                'value' => null,
                'type' => 'string',
                'label_en' => 'Last Sync',
                'label_ar' => 'آخر مزامنة',
                'description_en' => 'Timestamp of the last successful sync',
                'description_ar' => 'وقت آخر مزامنة ناجحة',
                'is_public' => false,
                'order' => 11,
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    protected function seedEnrollmentSettings(): void
    {
        $settings = [
            [
                'group' => 'enrollment',
                'key' => 'enrollment.max_credits',
                'value' => '21',
                'type' => 'number',
                'label_en' => 'Maximum Credits Per Semester',
                'label_ar' => 'الحد الأقصى للساعات المعتمدة في الفصل',
                'description_en' => 'Maximum number of credit hours a student can register in a semester',
                'description_ar' => 'الحد الأقصى لعدد الساعات المعتمدة التي يمكن للطالب تسجيلها في الفصل',
                'is_public' => true,
                'order' => 1,
            ],
            [
                'group' => 'enrollment',
                'key' => 'enrollment.min_credits',
                'value' => '12',
                'type' => 'number',
                'label_en' => 'Minimum Credits Per Semester',
                'label_ar' => 'الحد الأدنى للساعات المعتمدة في الفصل',
                'description_en' => 'Minimum number of credit hours for full-time status',
                'description_ar' => 'الحد الأدنى لعدد الساعات المعتمدة للتفرغ الكامل',
                'is_public' => true,
                'order' => 2,
            ],
            [
                'group' => 'enrollment',
                'key' => 'enrollment.overload_credits',
                'value' => '24',
                'type' => 'number',
                'label_en' => 'Overload Credits Limit',
                'label_ar' => 'حد الساعات الزائدة',
                'description_en' => 'Maximum credits with dean approval (overload)',
                'description_ar' => 'الحد الأقصى للساعات بموافقة العميد (التحميل الزائد)',
                'is_public' => true,
                'order' => 3,
            ],
            [
                'group' => 'enrollment',
                'key' => 'enrollment.allow_prerequisites_override',
                'value' => false,
                'type' => 'boolean',
                'label_en' => 'Allow Prerequisites Override',
                'label_ar' => 'السماح بتجاوز المتطلبات السابقة',
                'description_en' => 'Allow staff to override prerequisite requirements',
                'description_ar' => 'السماح للموظفين بتجاوز متطلبات المتطلبات السابقة',
                'is_public' => false,
                'order' => 4,
            ],
            [
                'group' => 'enrollment',
                'key' => 'enrollment.enforce_registration_period',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Enforce Registration Period',
                'label_ar' => 'تطبيق فترة التسجيل',
                'description_en' => 'Prevent students from registering outside the registration period',
                'description_ar' => 'منع الطلاب من التسجيل خارج فترة التسجيل',
                'is_public' => false,
                'order' => 5,
            ],
            [
                'group' => 'enrollment',
                'key' => 'enrollment.enforce_add_drop_period',
                'value' => true,
                'type' => 'boolean',
                'label_en' => 'Enforce Add/Drop Period',
                'label_ar' => 'تطبيق فترة الإضافة والحذف',
                'description_en' => 'Prevent students from adding/dropping courses outside the add/drop period',
                'description_ar' => 'منع الطلاب من إضافة/حذف المقررات خارج فترة الإضافة والحذف',
                'is_public' => false,
                'order' => 6,
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
