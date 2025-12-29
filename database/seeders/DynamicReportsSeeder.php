<?php

namespace Database\Seeders;

use App\Models\DynamicReport;
use App\Models\DynamicReportField;
use App\Models\DynamicReportParameter;
use App\Models\DynamicReportChart;
use Illuminate\Database\Seeder;

class DynamicReportsSeeder extends Seeder
{
    public function run(): void
    {
        // Enrollment Report
        $enrollmentReport = DynamicReport::create([
            'code' => 'enrollment_report',
            'name_en' => 'Enrollment Statistics Report',
            'name_ar' => 'تقرير إحصائيات التسجيل',
            'description_en' => 'Comprehensive enrollment statistics and trends',
            'description_ar' => 'إحصائيات شاملة عن التسجيل والاتجاهات',
            'category' => 'enrollment',
            'report_type' => 'statistics',
            'data_source' => [
                'type' => 'query',
                'model' => 'App\\Models\\Student',
                'aggregations' => [
                    ['field' => 'id', 'function' => 'count', 'alias' => 'total_students'],
                    ['field' => 'gpa', 'function' => 'avg', 'alias' => 'average_gpa'],
                ],
                'groupBy' => ['status', 'program_id'],
            ],
            'is_active' => true,
            'settings' => [
                'is_exportable' => true,
                'export_formats' => ['pdf', 'excel'],
                'is_printable' => true,
                'is_schedulable' => true,
                'cache_duration' => 3600,
                'layout' => 'dashboard',
            ],
        ]);

        // Enrollment Report Charts
        DynamicReportChart::create([
            'dynamic_report_id' => $enrollmentReport->id,
            'chart_key' => 'enrollment_trend',
            'title_en' => 'Enrollment Trend',
            'title_ar' => 'اتجاه التسجيل',
            'chart_type' => 'line',
            'data_source' => [
                'query' => 'monthly_enrollment',
                'x_field' => 'month',
                'y_field' => 'count',
            ],
            'options' => [
                'colors' => ['#3B82F6', '#10B981'],
                'showLegend' => true,
                'showGrid' => true,
            ],
            'order' => 1,
            'width' => 'half',
        ]);

        DynamicReportChart::create([
            'dynamic_report_id' => $enrollmentReport->id,
            'chart_key' => 'department_distribution',
            'title_en' => 'Students by Department',
            'title_ar' => 'الطلاب حسب القسم',
            'chart_type' => 'pie',
            'data_source' => [
                'query' => 'department_distribution',
                'label_field' => 'department_name',
                'value_field' => 'student_count',
            ],
            'options' => [
                'colors' => ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
                'showLegend' => true,
                'donut' => true,
            ],
            'order' => 2,
            'width' => 'half',
        ]);

        DynamicReportChart::create([
            'dynamic_report_id' => $enrollmentReport->id,
            'chart_key' => 'gpa_distribution',
            'title_en' => 'GPA Distribution',
            'title_ar' => 'توزيع المعدلات',
            'chart_type' => 'bar',
            'data_source' => [
                'query' => 'gpa_distribution',
                'x_field' => 'range',
                'y_field' => 'count',
            ],
            'options' => [
                'colors' => ['#8B5CF6'],
                'showGrid' => true,
            ],
            'order' => 3,
            'width' => 'full',
        ]);

        // Financial Report
        $financialReport = DynamicReport::create([
            'code' => 'financial_report',
            'name_en' => 'Financial Summary Report',
            'name_ar' => 'تقرير الملخص المالي',
            'description_en' => 'Financial overview including revenue and payments',
            'description_ar' => 'نظرة عامة مالية تشمل الإيرادات والمدفوعات',
            'category' => 'financial',
            'report_type' => 'summary',
            'data_source' => [
                'type' => 'multiple',
                'sources' => [
                    ['model' => 'App\\Models\\Payment', 'alias' => 'payments'],
                    ['model' => 'App\\Models\\Invoice', 'alias' => 'invoices'],
                ],
            ],
            'is_active' => true,
            'settings' => [
                'is_exportable' => true,
                'export_formats' => ['pdf', 'excel'],
                'is_printable' => true,
                'is_schedulable' => true,
                'layout' => 'dashboard',
            ],
        ]);

        // Financial Report Parameters
        DynamicReportParameter::create([
            'dynamic_report_id' => $financialReport->id,
            'param_key' => 'date_from',
            'label_en' => 'From Date',
            'label_ar' => 'من تاريخ',
            'param_type' => 'date',
            'is_required' => true,
            'default_value' => 'first_day_of_year',
            'order' => 1,
        ]);

        DynamicReportParameter::create([
            'dynamic_report_id' => $financialReport->id,
            'param_key' => 'date_to',
            'label_en' => 'To Date',
            'label_ar' => 'إلى تاريخ',
            'param_type' => 'date',
            'is_required' => true,
            'default_value' => 'today',
            'order' => 2,
        ]);

        DynamicReportParameter::create([
            'dynamic_report_id' => $financialReport->id,
            'param_key' => 'payment_status',
            'label_en' => 'Payment Status',
            'label_ar' => 'حالة الدفع',
            'param_type' => 'select',
            'is_required' => false,
            'options' => [
                ['value' => 'all', 'label_en' => 'All', 'label_ar' => 'الكل'],
                ['value' => 'paid', 'label_en' => 'Paid', 'label_ar' => 'مدفوع'],
                ['value' => 'pending', 'label_en' => 'Pending', 'label_ar' => 'معلق'],
                ['value' => 'overdue', 'label_en' => 'Overdue', 'label_ar' => 'متأخر'],
            ],
            'default_value' => 'all',
            'order' => 3,
        ]);

        // Financial Report Charts
        DynamicReportChart::create([
            'dynamic_report_id' => $financialReport->id,
            'chart_key' => 'monthly_revenue',
            'title_en' => 'Monthly Revenue',
            'title_ar' => 'الإيرادات الشهرية',
            'chart_type' => 'area',
            'data_source' => [
                'query' => 'monthly_revenue',
                'x_field' => 'month',
                'y_fields' => ['tuition', 'fees', 'other'],
            ],
            'options' => [
                'colors' => ['#3B82F6', '#10B981', '#F59E0B'],
                'stacked' => true,
                'showLegend' => true,
            ],
            'order' => 1,
            'width' => 'full',
        ]);

        DynamicReportChart::create([
            'dynamic_report_id' => $financialReport->id,
            'chart_key' => 'revenue_breakdown',
            'title_en' => 'Revenue Breakdown',
            'title_ar' => 'تفصيل الإيرادات',
            'chart_type' => 'pie',
            'data_source' => [
                'query' => 'revenue_by_type',
                'label_field' => 'type',
                'value_field' => 'amount',
            ],
            'options' => [
                'colors' => ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
                'showLegend' => true,
            ],
            'order' => 2,
            'width' => 'half',
        ]);

        DynamicReportChart::create([
            'dynamic_report_id' => $financialReport->id,
            'chart_key' => 'payment_status',
            'title_en' => 'Payment Status',
            'title_ar' => 'حالة المدفوعات',
            'chart_type' => 'donut',
            'data_source' => [
                'query' => 'payment_status_distribution',
                'label_field' => 'status',
                'value_field' => 'count',
            ],
            'options' => [
                'colors' => ['#10B981', '#F59E0B', '#EF4444'],
            ],
            'order' => 3,
            'width' => 'half',
        ]);

        // Academic Performance Report
        $academicReport = DynamicReport::create([
            'code' => 'academic_performance',
            'name_en' => 'Academic Performance Report',
            'name_ar' => 'تقرير الأداء الأكاديمي',
            'description_en' => 'Student academic performance analysis',
            'description_ar' => 'تحليل الأداء الأكاديمي للطلاب',
            'category' => 'academic',
            'report_type' => 'analysis',
            'data_source' => [
                'type' => 'query',
                'model' => 'App\\Models\\Grade',
                'joins' => ['student', 'course'],
            ],
            'is_active' => true,
            'settings' => [
                'is_exportable' => true,
                'export_formats' => ['pdf', 'excel'],
                'is_printable' => true,
                'layout' => 'dashboard',
            ],
        ]);

        DynamicReportChart::create([
            'dynamic_report_id' => $academicReport->id,
            'chart_key' => 'performance_radar',
            'title_en' => 'Performance Metrics',
            'title_ar' => 'مقاييس الأداء',
            'chart_type' => 'radar',
            'data_source' => [
                'metrics' => ['assignments', 'exams', 'projects', 'attendance', 'participation'],
            ],
            'options' => [
                'colors' => ['#3B82F6', '#94A3B8'],
                'showLegend' => true,
            ],
            'order' => 1,
            'width' => 'half',
        ]);

        DynamicReportChart::create([
            'dynamic_report_id' => $academicReport->id,
            'chart_key' => 'grade_distribution',
            'title_en' => 'Grade Distribution',
            'title_ar' => 'توزيع الدرجات',
            'chart_type' => 'bar',
            'data_source' => [
                'query' => 'grade_distribution',
                'x_field' => 'grade',
                'y_field' => 'count',
            ],
            'options' => [
                'colors' => ['#10B981'],
                'horizontal' => false,
            ],
            'order' => 2,
            'width' => 'half',
        ]);

        // Admission Statistics Report
        $admissionReport = DynamicReport::create([
            'code' => 'admission_statistics',
            'name_en' => 'Admission Statistics',
            'name_ar' => 'إحصائيات القبول',
            'description_en' => 'Admission applications statistics and trends',
            'description_ar' => 'إحصائيات طلبات القبول والاتجاهات',
            'category' => 'admission',
            'report_type' => 'statistics',
            'data_source' => [
                'type' => 'query',
                'model' => 'App\\Models\\AdmissionApplication',
            ],
            'is_active' => true,
            'settings' => [
                'is_exportable' => true,
                'export_formats' => ['pdf', 'excel'],
                'layout' => 'dashboard',
            ],
        ]);

        DynamicReportField::create([
            'dynamic_report_id' => $admissionReport->id,
            'field_key' => 'total_applications',
            'label_en' => 'Total Applications',
            'label_ar' => 'إجمالي الطلبات',
            'field_type' => 'stat_card',
            'aggregation' => 'count',
            'format' => ['type' => 'number'],
            'order' => 1,
        ]);

        DynamicReportField::create([
            'dynamic_report_id' => $admissionReport->id,
            'field_key' => 'approved',
            'label_en' => 'Approved',
            'label_ar' => 'مقبول',
            'field_type' => 'stat_card',
            'aggregation' => 'count',
            'filter' => ['status' => 'APPROVED'],
            'format' => ['type' => 'number', 'color' => 'green'],
            'order' => 2,
        ]);

        DynamicReportField::create([
            'dynamic_report_id' => $admissionReport->id,
            'field_key' => 'pending',
            'label_en' => 'Pending',
            'label_ar' => 'قيد الانتظار',
            'field_type' => 'stat_card',
            'aggregation' => 'count',
            'filter' => ['status' => 'PENDING'],
            'format' => ['type' => 'number', 'color' => 'yellow'],
            'order' => 3,
        ]);

        DynamicReportField::create([
            'dynamic_report_id' => $admissionReport->id,
            'field_key' => 'rejected',
            'label_en' => 'Rejected',
            'label_ar' => 'مرفوض',
            'field_type' => 'stat_card',
            'aggregation' => 'count',
            'filter' => ['status' => 'REJECTED'],
            'format' => ['type' => 'number', 'color' => 'red'],
            'order' => 4,
        ]);

        DynamicReportChart::create([
            'dynamic_report_id' => $admissionReport->id,
            'chart_key' => 'status_distribution',
            'title_en' => 'Applications by Status',
            'title_ar' => 'الطلبات حسب الحالة',
            'chart_type' => 'pie',
            'data_source' => [
                'group_by' => 'status',
                'count' => 'id',
            ],
            'options' => [
                'colors' => ['#F59E0B', '#3B82F6', '#6366F1', '#F97316', '#14B8A6', '#10B981', '#EF4444'],
            ],
            'order' => 1,
            'width' => 'half',
        ]);

        DynamicReportChart::create([
            'dynamic_report_id' => $admissionReport->id,
            'chart_key' => 'monthly_applications',
            'title_en' => 'Monthly Applications',
            'title_ar' => 'الطلبات الشهرية',
            'chart_type' => 'bar',
            'data_source' => [
                'query' => 'monthly_applications',
                'x_field' => 'month',
                'y_field' => 'count',
            ],
            'options' => [
                'colors' => ['#3B82F6'],
            ],
            'order' => 2,
            'width' => 'half',
        ]);

        $this->command->info('Dynamic reports seeded successfully!');
    }
}
