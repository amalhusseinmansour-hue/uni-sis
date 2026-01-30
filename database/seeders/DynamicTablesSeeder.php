<?php

namespace Database\Seeders;

use App\Models\DynamicTable;
use App\Models\DynamicTableColumn;
use App\Models\DynamicTableFilter;
use Illuminate\Database\Seeder;

class DynamicTablesSeeder extends Seeder
{
    public function run(): void
    {
        // Students Table
        $studentsTable = DynamicTable::create([
            'code' => 'students_list',
            'name_en' => 'Students List',
            'name_ar' => 'قائمة الطلاب',
            'description_en' => 'Complete list of all registered students',
            'description_ar' => 'قائمة كاملة بجميع الطلاب المسجلين',
            'model_class' => 'App\\Models\\Student',
            'is_active' => true,
            'settings' => [
                'is_paginated' => true,
                'default_page_size' => 25,
                'page_size_options' => [10, 25, 50, 100],
                'is_searchable' => true,
                'search_fields' => ['student_id', 'full_name', 'email'],
                'is_sortable' => true,
                'default_sort' => 'created_at',
                'default_sort_direction' => 'desc',
                'is_filterable' => true,
                'is_exportable' => true,
                'export_formats' => ['excel', 'csv', 'pdf'],
                'show_selection' => true,
                'show_row_numbers' => true,
                'row_actions' => [
                    ['key' => 'view', 'label_en' => 'View', 'label_ar' => 'عرض', 'icon' => 'eye', 'color' => 'blue'],
                    ['key' => 'edit', 'label_en' => 'Edit', 'label_ar' => 'تعديل', 'icon' => 'edit', 'color' => 'green'],
                    ['key' => 'delete', 'label_en' => 'Delete', 'label_ar' => 'حذف', 'icon' => 'trash', 'color' => 'red'],
                ],
                'bulk_actions' => [
                    ['key' => 'export', 'label_en' => 'Export Selected', 'label_ar' => 'تصدير المحدد', 'color' => 'blue'],
                    ['key' => 'delete', 'label_en' => 'Delete Selected', 'label_ar' => 'حذف المحدد', 'color' => 'red'],
                ],
            ],
        ]);

        // Students Table Columns
        $studentColumns = [
            ['column_key' => 'student_id', 'field_name' => 'student_id', 'header_en' => 'Student ID', 'header_ar' => 'رقم الطالب', 'data_type' => 'string', 'is_visible' => true, 'is_sortable' => true, 'order' => 1, 'width' => '120px'],
            ['column_key' => 'full_name', 'field_name' => 'full_name', 'header_en' => 'Full Name', 'header_ar' => 'الاسم الكامل', 'data_type' => 'string', 'is_visible' => true, 'is_sortable' => true, 'order' => 2],
            ['column_key' => 'email', 'field_name' => 'email', 'header_en' => 'Email', 'header_ar' => 'البريد الإلكتروني', 'data_type' => 'string', 'is_visible' => true, 'is_sortable' => true, 'order' => 3],
            ['column_key' => 'program', 'field_name' => 'program.name_en', 'header_en' => 'Program', 'header_ar' => 'البرنامج', 'data_type' => 'relation', 'is_visible' => true, 'is_sortable' => false, 'order' => 4],
            ['column_key' => 'gpa', 'field_name' => 'gpa', 'header_en' => 'GPA', 'header_ar' => 'المعدل', 'data_type' => 'number', 'is_visible' => true, 'is_sortable' => true, 'order' => 5, 'width' => '80px', 'format' => ['decimals' => 2]],
            ['column_key' => 'status', 'field_name' => 'status', 'header_en' => 'Status', 'header_ar' => 'الحالة', 'data_type' => 'status', 'is_visible' => true, 'is_sortable' => true, 'order' => 6, 'width' => '120px', 'format' => [
                'ACTIVE' => ['label_en' => 'Active', 'label_ar' => 'نشط', 'color' => 'green'],
                'INACTIVE' => ['label_en' => 'Inactive', 'label_ar' => 'غير نشط', 'color' => 'gray'],
                'GRADUATED' => ['label_en' => 'Graduated', 'label_ar' => 'متخرج', 'color' => 'blue'],
                'SUSPENDED' => ['label_en' => 'Suspended', 'label_ar' => 'موقوف', 'color' => 'red'],
            ]],
            ['column_key' => 'created_at', 'field_name' => 'created_at', 'header_en' => 'Registered', 'header_ar' => 'تاريخ التسجيل', 'data_type' => 'date', 'is_visible' => true, 'is_sortable' => true, 'order' => 7, 'format' => ['type' => 'date']],
        ];

        foreach ($studentColumns as $col) {
            DynamicTableColumn::create(array_merge($col, ['dynamic_table_id' => $studentsTable->id]));
        }

        // Students Table Filters
        $studentFilters = [
            ['filter_key' => 'status', 'label_en' => 'Status', 'label_ar' => 'الحالة', 'filter_type' => 'select', 'field_name' => 'status', 'is_visible' => true, 'order' => 1, 'options' => [
                ['value' => 'ACTIVE', 'label' => 'Active'],
                ['value' => 'INACTIVE', 'label' => 'Inactive'],
                ['value' => 'GRADUATED', 'label' => 'Graduated'],
                ['value' => 'SUSPENDED', 'label' => 'Suspended'],
            ]],
            ['filter_key' => 'program_id', 'label_en' => 'Program', 'label_ar' => 'البرنامج', 'filter_type' => 'select', 'field_name' => 'program_id', 'is_visible' => true, 'order' => 2, 'data_source' => ['model' => 'Program', 'value' => 'id', 'label' => 'name_en']],
            ['filter_key' => 'gpa_range', 'label_en' => 'GPA Range', 'label_ar' => 'نطاق المعدل', 'filter_type' => 'range', 'field_name' => 'gpa', 'is_visible' => true, 'order' => 3],
        ];

        foreach ($studentFilters as $filter) {
            DynamicTableFilter::create(array_merge($filter, ['dynamic_table_id' => $studentsTable->id]));
        }

        // Admissions Table
        $admissionsTable = DynamicTable::create([
            'code' => 'admissions_list',
            'name_en' => 'Admission Applications',
            'name_ar' => 'طلبات القبول',
            'description_en' => 'All admission applications',
            'description_ar' => 'جميع طلبات القبول',
            'model_class' => 'App\\Models\\AdmissionApplication',
            'is_active' => true,
            'settings' => [
                'is_paginated' => true,
                'default_page_size' => 25,
                'page_size_options' => [10, 25, 50, 100],
                'is_searchable' => true,
                'search_fields' => ['full_name', 'email', 'national_id'],
                'is_sortable' => true,
                'default_sort' => 'created_at',
                'default_sort_direction' => 'desc',
                'is_filterable' => true,
                'is_exportable' => true,
                'export_formats' => ['excel', 'pdf'],
                'show_selection' => true,
                'row_actions' => [
                    ['key' => 'view', 'label_en' => 'View', 'label_ar' => 'عرض', 'icon' => 'eye', 'color' => 'blue'],
                    ['key' => 'process', 'label_en' => 'Process', 'label_ar' => 'معالجة', 'icon' => 'play', 'color' => 'green'],
                ],
            ],
        ]);

        $admissionColumns = [
            ['column_key' => 'id', 'field_name' => 'id', 'header_en' => 'ID', 'header_ar' => 'الرقم', 'data_type' => 'number', 'is_visible' => true, 'is_sortable' => true, 'order' => 1, 'width' => '80px'],
            ['column_key' => 'full_name', 'field_name' => 'full_name', 'header_en' => 'Applicant Name', 'header_ar' => 'اسم المتقدم', 'data_type' => 'string', 'is_visible' => true, 'is_sortable' => true, 'order' => 2],
            ['column_key' => 'email', 'field_name' => 'email', 'header_en' => 'Email', 'header_ar' => 'البريد', 'data_type' => 'string', 'is_visible' => true, 'is_sortable' => true, 'order' => 3],
            ['column_key' => 'phone', 'field_name' => 'phone', 'header_en' => 'Phone', 'header_ar' => 'الهاتف', 'data_type' => 'string', 'is_visible' => true, 'is_sortable' => false, 'order' => 4],
            ['column_key' => 'program', 'field_name' => 'program.name_en', 'header_en' => 'Program', 'header_ar' => 'البرنامج', 'data_type' => 'relation', 'is_visible' => true, 'order' => 5],
            ['column_key' => 'status', 'field_name' => 'status', 'header_en' => 'Status', 'header_ar' => 'الحالة', 'data_type' => 'status', 'is_visible' => true, 'is_sortable' => true, 'order' => 6, 'format' => [
                'PENDING' => ['label_en' => 'Pending', 'label_ar' => 'قيد الانتظار', 'color' => 'yellow'],
                'UNDER_REVIEW' => ['label_en' => 'Under Review', 'label_ar' => 'قيد المراجعة', 'color' => 'blue'],
                'DOCUMENTS_VERIFIED' => ['label_en' => 'Documents Verified', 'label_ar' => 'تم التحقق', 'color' => 'indigo'],
                'PENDING_PAYMENT' => ['label_en' => 'Pending Payment', 'label_ar' => 'في انتظار الدفع', 'color' => 'orange'],
                'PAYMENT_RECEIVED' => ['label_en' => 'Payment Received', 'label_ar' => 'تم الدفع', 'color' => 'teal'],
                'APPROVED' => ['label_en' => 'Approved', 'label_ar' => 'مقبول', 'color' => 'green'],
                'REJECTED' => ['label_en' => 'Rejected', 'label_ar' => 'مرفوض', 'color' => 'red'],
            ]],
            ['column_key' => 'created_at', 'field_name' => 'created_at', 'header_en' => 'Applied', 'header_ar' => 'تاريخ التقديم', 'data_type' => 'date', 'is_visible' => true, 'is_sortable' => true, 'order' => 7],
        ];

        foreach ($admissionColumns as $col) {
            DynamicTableColumn::create(array_merge($col, ['dynamic_table_id' => $admissionsTable->id]));
        }

        $admissionFilters = [
            ['filter_key' => 'status', 'label_en' => 'Status', 'label_ar' => 'الحالة', 'filter_type' => 'select', 'field_name' => 'status', 'is_visible' => true, 'order' => 1, 'options' => [
                ['value' => 'PENDING', 'label' => 'Pending'],
                ['value' => 'UNDER_REVIEW', 'label' => 'Under Review'],
                ['value' => 'APPROVED', 'label' => 'Approved'],
                ['value' => 'REJECTED', 'label' => 'Rejected'],
            ]],
            ['filter_key' => 'program_id', 'label_en' => 'Program', 'label_ar' => 'البرنامج', 'filter_type' => 'select', 'field_name' => 'program_id', 'is_visible' => true, 'order' => 2],
            ['filter_key' => 'date_range', 'label_en' => 'Date Range', 'label_ar' => 'نطاق التاريخ', 'filter_type' => 'date_range', 'field_name' => 'created_at', 'is_visible' => true, 'order' => 3],
        ];

        foreach ($admissionFilters as $filter) {
            DynamicTableFilter::create(array_merge($filter, ['dynamic_table_id' => $admissionsTable->id]));
        }

        // Courses Table
        $coursesTable = DynamicTable::create([
            'code' => 'courses_list',
            'name_en' => 'Courses',
            'name_ar' => 'المقررات',
            'description_en' => 'All available courses',
            'description_ar' => 'جميع المقررات المتاحة',
            'model_class' => 'App\\Models\\Course',
            'is_active' => true,
            'settings' => [
                'is_paginated' => true,
                'default_page_size' => 25,
                'is_searchable' => true,
                'search_fields' => ['code', 'name_en', 'name_ar'],
                'is_sortable' => true,
                'is_filterable' => true,
                'is_exportable' => true,
                'export_formats' => ['excel', 'csv'],
            ],
        ]);

        $courseColumns = [
            ['column_key' => 'code', 'field_name' => 'code', 'header_en' => 'Code', 'header_ar' => 'الرمز', 'data_type' => 'string', 'is_visible' => true, 'is_sortable' => true, 'order' => 1, 'width' => '100px'],
            ['column_key' => 'name', 'field_name' => 'name_en', 'header_en' => 'Course Name', 'header_ar' => 'اسم المقرر', 'data_type' => 'string', 'is_visible' => true, 'is_sortable' => true, 'order' => 2],
            ['column_key' => 'credits', 'field_name' => 'credit_hours', 'header_en' => 'Credits', 'header_ar' => 'الساعات', 'data_type' => 'number', 'is_visible' => true, 'is_sortable' => true, 'order' => 3, 'width' => '80px'],
            ['column_key' => 'department', 'field_name' => 'department.name_en', 'header_en' => 'Department', 'header_ar' => 'القسم', 'data_type' => 'relation', 'is_visible' => true, 'order' => 4],
            ['column_key' => 'is_active', 'field_name' => 'is_active', 'header_en' => 'Active', 'header_ar' => 'نشط', 'data_type' => 'boolean', 'is_visible' => true, 'is_sortable' => true, 'order' => 5, 'width' => '80px'],
        ];

        foreach ($courseColumns as $col) {
            DynamicTableColumn::create(array_merge($col, ['dynamic_table_id' => $coursesTable->id]));
        }

        $this->command->info('Dynamic tables seeded successfully!');
    }
}
