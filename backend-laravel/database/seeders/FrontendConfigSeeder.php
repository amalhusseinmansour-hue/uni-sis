<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\DashboardWidget;
use App\Models\DashboardLayout;
use App\Models\UiTheme;
use Illuminate\Database\Seeder;

class FrontendConfigSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedThemes();
        $this->seedMenus();
        $this->seedWidgets();
        $this->seedLayouts();
    }

    protected function seedThemes(): void
    {
        // Light Theme
        UiTheme::updateOrCreate(
            ['code' => 'light'],
            [
                'name_en' => 'Light Theme',
                'name_ar' => 'الثيم الفاتح',
                'is_dark' => false,
                'is_default' => true,
                'is_active' => true,
                'colors' => [
                    'primary' => '#3B82F6',
                    'secondary' => '#6B7280',
                    'accent' => '#8B5CF6',
                    'success' => '#10B981',
                    'warning' => '#F59E0B',
                    'danger' => '#EF4444',
                    'info' => '#3B82F6',
                    'background' => '#FFFFFF',
                    'surface' => '#F9FAFB',
                    'text' => '#1F2937',
                ],
                'typography' => [
                    'family' => 'Inter, sans-serif',
                    'family_ar' => 'Tajawal, sans-serif',
                    'size_base' => '1rem',
                ],
                'spacing' => [
                    'xs' => '0.25rem',
                    'sm' => '0.5rem',
                    'md' => '1rem',
                    'lg' => '1.5rem',
                ],
                'borders' => [
                    'radius_sm' => '0.25rem',
                    'radius_md' => '0.5rem',
                    'radius_lg' => '1rem',
                ],
                'shadows' => [
                    'sm' => '0 1px 2px rgba(0,0,0,0.05)',
                    'md' => '0 4px 6px rgba(0,0,0,0.1)',
                    'lg' => '0 10px 15px rgba(0,0,0,0.1)',
                ],
            ]
        );

        // Dark Theme
        UiTheme::updateOrCreate(
            ['code' => 'dark'],
            [
                'name_en' => 'Dark Theme',
                'name_ar' => 'الثيم الداكن',
                'is_dark' => true,
                'is_default' => false,
                'is_active' => true,
                'colors' => [
                    'primary' => '#60A5FA',
                    'secondary' => '#9CA3AF',
                    'accent' => '#A78BFA',
                    'success' => '#34D399',
                    'warning' => '#FBBF24',
                    'danger' => '#F87171',
                    'info' => '#60A5FA',
                    'background' => '#111827',
                    'surface' => '#1F2937',
                    'text' => '#F9FAFB',
                ],
                'typography' => [
                    'family' => 'Inter, sans-serif',
                    'family_ar' => 'Tajawal, sans-serif',
                    'size_base' => '1rem',
                ],
                'spacing' => [
                    'xs' => '0.25rem',
                    'sm' => '0.5rem',
                    'md' => '1rem',
                    'lg' => '1.5rem',
                ],
                'borders' => [
                    'radius_sm' => '0.25rem',
                    'radius_md' => '0.5rem',
                    'radius_lg' => '1rem',
                ],
                'shadows' => [
                    'sm' => '0 1px 2px rgba(0,0,0,0.3)',
                    'md' => '0 4px 6px rgba(0,0,0,0.4)',
                    'lg' => '0 10px 15px rgba(0,0,0,0.5)',
                ],
            ]
        );
    }

    protected function seedMenus(): void
    {
        // Student Menu
        $studentMenu = Menu::updateOrCreate(
            ['code' => 'student_sidebar'],
            [
                'name_en' => 'Student Sidebar',
                'name_ar' => 'القائمة الجانبية للطالب',
                'location' => 'sidebar',
                'roles' => ['STUDENT'],
                'is_active' => true,
            ]
        );

        $this->createMenuItems($studentMenu, [
            ['title_en' => 'Dashboard', 'title_ar' => 'الرئيسية', 'icon' => 'heroicon-o-home', 'route' => '/', 'order' => 1],
            ['title_en' => 'Academic', 'title_ar' => 'الشؤون الأكاديمية', 'icon' => 'heroicon-o-academic-cap', 'route' => '/academic', 'order' => 2],
            ['title_en' => 'Registration', 'title_ar' => 'التسجيل', 'icon' => 'heroicon-o-clipboard-document-list', 'route' => '/registration', 'order' => 3],
            ['title_en' => 'Requests', 'title_ar' => 'الطلبات', 'icon' => 'heroicon-o-document-text', 'route' => '/requests', 'order' => 4],
            ['title_en' => 'Schedule', 'title_ar' => 'الجدول', 'icon' => 'heroicon-o-calendar', 'route' => '/schedule', 'order' => 5],
            ['title_en' => 'Exams', 'title_ar' => 'الامتحانات', 'icon' => 'heroicon-o-clipboard-document-check', 'route' => '/exams', 'order' => 6],
            ['title_en' => 'Attendance', 'title_ar' => 'الحضور', 'icon' => 'heroicon-o-clock', 'route' => '/attendance', 'order' => 7],
            ['title_en' => 'Transcript', 'title_ar' => 'السجل الأكاديمي', 'icon' => 'heroicon-o-document-chart-bar', 'route' => '/transcript', 'order' => 8],
            ['title_en' => 'Finance', 'title_ar' => 'المالية', 'icon' => 'heroicon-o-currency-dollar', 'route' => '/finance', 'order' => 9],
            ['title_en' => 'ID Card', 'title_ar' => 'بطاقة الهوية', 'icon' => 'heroicon-o-identification', 'route' => '/id-card', 'order' => 10],
            ['title_en' => 'Profile', 'title_ar' => 'الملف الشخصي', 'icon' => 'heroicon-o-user', 'route' => '/profile', 'order' => 11],
            ['title_en' => 'Support', 'title_ar' => 'الدعم', 'icon' => 'heroicon-o-question-mark-circle', 'route' => '/support', 'order' => 12],
        ]);

        // Admin Menu
        $adminMenu = Menu::updateOrCreate(
            ['code' => 'admin_sidebar'],
            [
                'name_en' => 'Admin Sidebar',
                'name_ar' => 'القائمة الجانبية للإدارة',
                'location' => 'sidebar',
                'roles' => ['ADMIN'],
                'is_active' => true,
            ]
        );

        $this->createMenuItems($adminMenu, [
            ['title_en' => 'Dashboard', 'title_ar' => 'الرئيسية', 'icon' => 'heroicon-o-home', 'route' => '/', 'order' => 1],
            ['title_en' => 'Admissions', 'title_ar' => 'القبول', 'icon' => 'heroicon-o-user-plus', 'route' => '/admissions', 'order' => 2],
            ['title_en' => 'Students', 'title_ar' => 'الطلاب', 'icon' => 'heroicon-o-users', 'route' => '/students', 'order' => 3],
            ['title_en' => 'Courses', 'title_ar' => 'المقررات', 'icon' => 'heroicon-o-book-open', 'route' => '/courses', 'order' => 4],
            ['title_en' => 'Finance', 'title_ar' => 'المالية', 'icon' => 'heroicon-o-currency-dollar', 'route' => '/finance', 'order' => 5],
            ['title_en' => 'Reports', 'title_ar' => 'التقارير', 'icon' => 'heroicon-o-chart-bar', 'route' => '/reports', 'order' => 6],
            ['title_en' => 'Schedule', 'title_ar' => 'الجداول', 'icon' => 'heroicon-o-calendar', 'route' => '/schedule', 'order' => 7],
        ]);

        // Admin Panel submenu
        $adminPanel = MenuItem::updateOrCreate(
            ['menu_id' => $adminMenu->id, 'title_en' => 'Admin Panel'],
            [
                'title_ar' => 'لوحة الإدارة',
                'icon' => 'heroicon-o-cog-6-tooth',
                'route' => null,
                'order' => 8,
                'is_visible' => true,
                'is_active' => true,
            ]
        );

        $this->createMenuItems($adminMenu, [
            ['title_en' => 'Table Builder', 'title_ar' => 'منشئ الجداول', 'icon' => 'heroicon-o-table-cells', 'route' => '/admin/tables', 'order' => 1, 'parent_id' => $adminPanel->id],
            ['title_en' => 'Form Builder', 'title_ar' => 'منشئ النماذج', 'icon' => 'heroicon-o-document-text', 'route' => '/admin/forms', 'order' => 2, 'parent_id' => $adminPanel->id],
            ['title_en' => 'Report Builder', 'title_ar' => 'منشئ التقارير', 'icon' => 'heroicon-o-chart-pie', 'route' => '/admin/reports', 'order' => 3, 'parent_id' => $adminPanel->id],
            ['title_en' => 'System Settings', 'title_ar' => 'إعدادات النظام', 'icon' => 'heroicon-o-cog', 'route' => '/admin/settings', 'order' => 4, 'parent_id' => $adminPanel->id],
            ['title_en' => 'Menus & Dashboard', 'title_ar' => 'القوائم ولوحة التحكم', 'icon' => 'heroicon-o-squares-2x2', 'route' => '/admin/menus', 'order' => 5, 'parent_id' => $adminPanel->id],
        ]);

        // Lecturer Menu
        $lecturerMenu = Menu::updateOrCreate(
            ['code' => 'lecturer_sidebar'],
            [
                'name_en' => 'Lecturer Sidebar',
                'name_ar' => 'القائمة الجانبية للمحاضر',
                'location' => 'sidebar',
                'roles' => ['LECTURER'],
                'is_active' => true,
            ]
        );

        $this->createMenuItems($lecturerMenu, [
            ['title_en' => 'Dashboard', 'title_ar' => 'الرئيسية', 'icon' => 'heroicon-o-home', 'route' => '/', 'order' => 1],
            ['title_en' => 'My Courses', 'title_ar' => 'مقرراتي', 'icon' => 'heroicon-o-book-open', 'route' => '/lecturer', 'order' => 2],
            ['title_en' => 'Schedule', 'title_ar' => 'الجدول', 'icon' => 'heroicon-o-calendar', 'route' => '/schedule', 'order' => 3],
            ['title_en' => 'Exams', 'title_ar' => 'الامتحانات', 'icon' => 'heroicon-o-clipboard-document-check', 'route' => '/exams', 'order' => 4],
            ['title_en' => 'Attendance', 'title_ar' => 'الحضور', 'icon' => 'heroicon-o-clock', 'route' => '/attendance', 'order' => 5],
            ['title_en' => 'Profile', 'title_ar' => 'الملف الشخصي', 'icon' => 'heroicon-o-user', 'route' => '/profile', 'order' => 6],
            ['title_en' => 'Support', 'title_ar' => 'الدعم', 'icon' => 'heroicon-o-question-mark-circle', 'route' => '/support', 'order' => 7],
        ]);

        // Finance Menu
        $financeMenu = Menu::updateOrCreate(
            ['code' => 'finance_sidebar'],
            [
                'name_en' => 'Finance Sidebar',
                'name_ar' => 'القائمة الجانبية للمالية',
                'location' => 'sidebar',
                'roles' => ['FINANCE'],
                'is_active' => true,
            ]
        );

        $this->createMenuItems($financeMenu, [
            ['title_en' => 'Dashboard', 'title_ar' => 'الرئيسية', 'icon' => 'heroicon-o-home', 'route' => '/', 'order' => 1],
            ['title_en' => 'Payments', 'title_ar' => 'المدفوعات', 'icon' => 'heroicon-o-banknotes', 'route' => '/payments', 'order' => 2],
            ['title_en' => 'Invoices', 'title_ar' => 'الفواتير', 'icon' => 'heroicon-o-document-text', 'route' => '/invoices', 'order' => 3],
            ['title_en' => 'Reports', 'title_ar' => 'التقارير', 'icon' => 'heroicon-o-chart-bar', 'route' => '/reports', 'order' => 4],
            ['title_en' => 'Students', 'title_ar' => 'الطلاب', 'icon' => 'heroicon-o-users', 'route' => '/students', 'order' => 5],
            ['title_en' => 'Profile', 'title_ar' => 'الملف الشخصي', 'icon' => 'heroicon-o-user', 'route' => '/profile', 'order' => 6],
        ]);
    }

    protected function createMenuItems(Menu $menu, array $items): void
    {
        foreach ($items as $item) {
            MenuItem::updateOrCreate(
                [
                    'menu_id' => $menu->id,
                    'title_en' => $item['title_en'],
                    'parent_id' => $item['parent_id'] ?? null,
                ],
                [
                    'title_ar' => $item['title_ar'],
                    'icon' => $item['icon'],
                    'route' => $item['route'],
                    'order' => $item['order'],
                    'is_visible' => true,
                    'is_active' => true,
                ]
            );
        }
    }

    protected function seedWidgets(): void
    {
        // Stats Widgets
        DashboardWidget::updateOrCreate(
            ['code' => 'total_students'],
            [
                'name_en' => 'Total Students',
                'name_ar' => 'إجمالي الطلاب',
                'type' => 'stat_card',
                'size' => 'small',
                'roles' => ['ADMIN'],
                'is_active' => true,
                'data_source' => [
                    'type' => 'query',
                    'model' => 'App\\Models\\Student',
                    'aggregation' => ['function' => 'count', 'field' => '*'],
                ],
                'settings' => [
                    'icon' => 'heroicon-o-users',
                    'color' => 'blue',
                    'description' => 'Active students in system',
                ],
            ]
        );

        DashboardWidget::updateOrCreate(
            ['code' => 'total_courses'],
            [
                'name_en' => 'Total Courses',
                'name_ar' => 'إجمالي المقررات',
                'type' => 'stat_card',
                'size' => 'small',
                'roles' => ['ADMIN', 'LECTURER'],
                'is_active' => true,
                'data_source' => [
                    'type' => 'query',
                    'model' => 'App\\Models\\Course',
                    'aggregation' => ['function' => 'count', 'field' => '*'],
                ],
                'settings' => [
                    'icon' => 'heroicon-o-book-open',
                    'color' => 'green',
                    'description' => 'Available courses',
                ],
            ]
        );

        DashboardWidget::updateOrCreate(
            ['code' => 'pending_applications'],
            [
                'name_en' => 'Pending Applications',
                'name_ar' => 'طلبات القبول المعلقة',
                'type' => 'stat_card',
                'size' => 'small',
                'roles' => ['ADMIN'],
                'is_active' => true,
                'data_source' => [
                    'type' => 'query',
                    'model' => 'App\\Models\\AdmissionApplication',
                    'aggregation' => ['function' => 'count', 'field' => '*'],
                    'filters' => [
                        ['field' => 'status', 'operator' => '=', 'default' => 'PENDING'],
                    ],
                ],
                'settings' => [
                    'icon' => 'heroicon-o-document-text',
                    'color' => 'yellow',
                    'description' => 'Awaiting review',
                ],
            ]
        );

        DashboardWidget::updateOrCreate(
            ['code' => 'pending_payments'],
            [
                'name_en' => 'Pending Payments',
                'name_ar' => 'المدفوعات المعلقة',
                'type' => 'stat_card',
                'size' => 'small',
                'roles' => ['ADMIN', 'FINANCE'],
                'is_active' => true,
                'data_source' => [
                    'type' => 'query',
                    'model' => 'App\\Models\\FinancialRecord',
                    'aggregation' => ['function' => 'sum', 'field' => 'amount'],
                    'filters' => [
                        ['field' => 'status', 'operator' => '=', 'default' => 'PENDING'],
                    ],
                ],
                'settings' => [
                    'icon' => 'heroicon-o-currency-dollar',
                    'color' => 'red',
                    'description' => 'Outstanding balance',
                ],
            ]
        );

        // Student Widgets
        DashboardWidget::updateOrCreate(
            ['code' => 'my_gpa'],
            [
                'name_en' => 'My GPA',
                'name_ar' => 'المعدل التراكمي',
                'type' => 'stat_card',
                'size' => 'small',
                'roles' => ['STUDENT'],
                'is_active' => true,
                'data_source' => [
                    'type' => 'api',
                    'endpoint' => '/api/students/my-profile',
                ],
                'settings' => [
                    'icon' => 'heroicon-o-academic-cap',
                    'color' => 'purple',
                    'field' => 'gpa',
                ],
            ]
        );

        DashboardWidget::updateOrCreate(
            ['code' => 'my_balance'],
            [
                'name_en' => 'My Balance',
                'name_ar' => 'رصيدي',
                'type' => 'stat_card',
                'size' => 'small',
                'roles' => ['STUDENT'],
                'is_active' => true,
                'data_source' => [
                    'type' => 'api',
                    'endpoint' => '/api/students/my-profile',
                ],
                'settings' => [
                    'icon' => 'heroicon-o-wallet',
                    'color' => 'green',
                    'field' => 'balance',
                ],
            ]
        );

        // Chart Widget
        DashboardWidget::updateOrCreate(
            ['code' => 'enrollment_chart'],
            [
                'name_en' => 'Enrollment Statistics',
                'name_ar' => 'إحصائيات التسجيل',
                'type' => 'chart',
                'size' => 'medium',
                'roles' => ['ADMIN'],
                'is_active' => true,
                'data_source' => [
                    'type' => 'query',
                    'model' => 'App\\Models\\Enrollment',
                    'group_by' => 'status',
                ],
                'settings' => [
                    'chart_type' => 'doughnut',
                    'color' => 'blue',
                ],
            ]
        );

        // List Widget
        DashboardWidget::updateOrCreate(
            ['code' => 'recent_applications'],
            [
                'name_en' => 'Recent Applications',
                'name_ar' => 'آخر طلبات القبول',
                'type' => 'list',
                'size' => 'medium',
                'roles' => ['ADMIN'],
                'is_active' => true,
                'data_source' => [
                    'type' => 'query',
                    'model' => 'App\\Models\\AdmissionApplication',
                    'limit' => 5,
                ],
                'settings' => [
                    'icon' => 'heroicon-o-document-plus',
                ],
            ]
        );
    }

    protected function seedLayouts(): void
    {
        // Student Dashboard
        DashboardLayout::updateOrCreate(
            ['code' => 'student_dashboard'],
            [
                'name_en' => 'Student Dashboard',
                'name_ar' => 'لوحة تحكم الطالب',
                'role' => 'STUDENT',
                'is_default' => false,
                'is_active' => true,
                'grid_settings' => [
                    'columns' => 4,
                    'gap' => '1rem',
                ],
                'widgets' => [
                    ['code' => 'my_gpa', 'position' => ['x' => 0, 'y' => 0, 'width' => 1]],
                    ['code' => 'my_balance', 'position' => ['x' => 1, 'y' => 0, 'width' => 1]],
                ],
            ]
        );

        // Admin Dashboard
        DashboardLayout::updateOrCreate(
            ['code' => 'admin_dashboard'],
            [
                'name_en' => 'Admin Dashboard',
                'name_ar' => 'لوحة تحكم المدير',
                'role' => 'ADMIN',
                'is_default' => true,
                'is_active' => true,
                'grid_settings' => [
                    'columns' => 4,
                    'gap' => '1rem',
                ],
                'widgets' => [
                    ['code' => 'total_students', 'position' => ['x' => 0, 'y' => 0, 'width' => 1]],
                    ['code' => 'total_courses', 'position' => ['x' => 1, 'y' => 0, 'width' => 1]],
                    ['code' => 'pending_applications', 'position' => ['x' => 2, 'y' => 0, 'width' => 1]],
                    ['code' => 'pending_payments', 'position' => ['x' => 3, 'y' => 0, 'width' => 1]],
                    ['code' => 'enrollment_chart', 'position' => ['x' => 0, 'y' => 1, 'width' => 2]],
                    ['code' => 'recent_applications', 'position' => ['x' => 2, 'y' => 1, 'width' => 2]],
                ],
            ]
        );

        // Lecturer Dashboard
        DashboardLayout::updateOrCreate(
            ['code' => 'lecturer_dashboard'],
            [
                'name_en' => 'Lecturer Dashboard',
                'name_ar' => 'لوحة تحكم المحاضر',
                'role' => 'LECTURER',
                'is_default' => false,
                'is_active' => true,
                'grid_settings' => [
                    'columns' => 4,
                    'gap' => '1rem',
                ],
                'widgets' => [
                    ['code' => 'total_courses', 'position' => ['x' => 0, 'y' => 0, 'width' => 1]],
                ],
            ]
        );

        // Finance Dashboard
        DashboardLayout::updateOrCreate(
            ['code' => 'finance_dashboard'],
            [
                'name_en' => 'Finance Dashboard',
                'name_ar' => 'لوحة تحكم المالية',
                'role' => 'FINANCE',
                'is_default' => false,
                'is_active' => true,
                'grid_settings' => [
                    'columns' => 4,
                    'gap' => '1rem',
                ],
                'widgets' => [
                    ['code' => 'pending_payments', 'position' => ['x' => 0, 'y' => 0, 'width' => 1]],
                ],
            ]
        );
    }
}
