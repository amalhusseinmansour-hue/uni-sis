<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DynamicReportResource\Pages;
use App\Filament\Resources\DynamicReportResource\RelationManagers;
use App\Models\DynamicReport;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class DynamicReportResource extends Resource
{
    protected static ?string $model = DynamicReport::class;

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?int $navigationSort = 3;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.dynamic_content');
    }

    public static function getModelLabel(): string
    {
        return __('filament.dynamic_report.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.dynamic_report.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.dynamic_reports');
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    /**
     * Get report templates
     */
    public static function getReportTemplates(): array
    {
        return [
            'blank' => [
                'name' => app()->getLocale() === 'ar' ? 'تقرير فارغ' : 'Blank Report',
                'description' => app()->getLocale() === 'ar' ? 'ابدأ من الصفر' : 'Start from scratch',
            ],
            'student_enrollment' => [
                'name' => app()->getLocale() === 'ar' ? 'تقرير تسجيل الطلاب' : 'Student Enrollment Report',
                'description' => app()->getLocale() === 'ar' ? 'إحصائيات تسجيل الطلاب' : 'Student enrollment statistics',
                'settings' => [
                    'category' => 'enrollment',
                    'report_type' => 'mixed',
                    'data_source_type' => 'model',
                    'data_source' => 'enrollments',
                    'model_class' => 'App\\Models\\Enrollment',
                ],
            ],
            'grades_summary' => [
                'name' => app()->getLocale() === 'ar' ? 'ملخص الدرجات' : 'Grades Summary',
                'description' => app()->getLocale() === 'ar' ? 'تقرير أداء الطلاب' : 'Student performance report',
                'settings' => [
                    'category' => 'academic',
                    'report_type' => 'summary',
                    'data_source_type' => 'model',
                    'data_source' => 'grades',
                    'model_class' => 'App\\Models\\Grade',
                ],
            ],
            'financial_statement' => [
                'name' => app()->getLocale() === 'ar' ? 'كشف مالي' : 'Financial Statement',
                'description' => app()->getLocale() === 'ar' ? 'تقرير المعاملات المالية' : 'Financial transactions report',
                'settings' => [
                    'category' => 'financial',
                    'report_type' => 'table',
                    'data_source_type' => 'model',
                    'data_source' => 'financial_records',
                    'model_class' => 'App\\Models\\FinancialRecord',
                    'allowed_roles' => ['ADMIN', 'FINANCE'],
                ],
            ],
            'attendance' => [
                'name' => app()->getLocale() === 'ar' ? 'تقرير الحضور' : 'Attendance Report',
                'description' => app()->getLocale() === 'ar' ? 'تتبع حضور الطلاب' : 'Student attendance tracking',
                'settings' => [
                    'category' => 'attendance',
                    'report_type' => 'chart',
                ],
            ],
            'statistics' => [
                'name' => app()->getLocale() === 'ar' ? 'إحصائيات عامة' : 'General Statistics',
                'description' => app()->getLocale() === 'ar' ? 'نظرة عامة على البيانات' : 'Data overview dashboard',
                'settings' => [
                    'category' => 'statistics',
                    'report_type' => 'chart',
                ],
            ],
        ];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Wizard::make([
                    // Step 1: Choose Template
                    Forms\Components\Wizard\Step::make('template')
                        ->label(app()->getLocale() === 'ar' ? 'نوع التقرير' : 'Report Type')
                        ->description(app()->getLocale() === 'ar' ? 'اختر نوع التقرير الذي تريد إنشاءه' : 'Choose the type of report you want to create')
                        ->icon('heroicon-o-document-chart-bar')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'قوالب التقارير' : 'Report Templates')
                                ->description(app()->getLocale() === 'ar' ? 'اختر قالبًا للبدء بسرعة' : 'Choose a template to get started quickly')
                                ->schema([
                                    Forms\Components\Radio::make('template')
                                        ->label('')
                                        ->options([
                                            'blank' => app()->getLocale() === 'ar' ? '📄 تقرير فارغ - ابدأ من الصفر' : '📄 Blank Report - Start from scratch',
                                            'student_enrollment' => app()->getLocale() === 'ar' ? '📝 تقرير تسجيل الطلاب - إحصائيات التسجيل' : '📝 Student Enrollment - Registration statistics',
                                            'grades_summary' => app()->getLocale() === 'ar' ? '📊 ملخص الدرجات - تقرير أداء الطلاب' : '📊 Grades Summary - Student performance',
                                            'financial_statement' => app()->getLocale() === 'ar' ? '💰 كشف مالي - المعاملات المالية' : '💰 Financial Statement - Financial transactions',
                                            'attendance' => app()->getLocale() === 'ar' ? '📅 تقرير الحضور - تتبع حضور الطلاب' : '📅 Attendance Report - Student attendance',
                                            'statistics' => app()->getLocale() === 'ar' ? '📈 إحصائيات عامة - نظرة عامة على البيانات' : '📈 General Statistics - Data overview',
                                        ])
                                        ->default('blank')
                                        ->live()
                                        ->afterStateUpdated(function (Forms\Get $get, Forms\Set $set, ?string $state) {
                                            $templates = self::getReportTemplates();
                                            if (isset($templates[$state]['settings'])) {
                                                foreach ($templates[$state]['settings'] as $key => $value) {
                                                    $set($key, $value);
                                                }
                                            }
                                        }),
                                ]),
                        ]),

                    // Step 2: Basic Information
                    Forms\Components\Wizard\Step::make('basic_info')
                        ->label(app()->getLocale() === 'ar' ? 'المعلومات الأساسية' : 'Basic Information')
                        ->description(app()->getLocale() === 'ar' ? 'أدخل اسم ووصف التقرير' : 'Enter report name and description')
                        ->icon('heroicon-o-information-circle')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'هوية التقرير' : 'Report Identity')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\TextInput::make('code')
                                        ->label(app()->getLocale() === 'ar' ? 'الكود' : 'Code')
                                        ->helperText(app()->getLocale() === 'ar' ? 'معرف فريد للتقرير (حروف وأرقام)' : 'Unique identifier (letters and numbers)')
                                        ->required()
                                        ->unique(ignoreRecord: true)
                                        ->maxLength(50)
                                        ->alphaDash()
                                        ->live(onBlur: true)
                                        ->afterStateUpdated(function (Forms\Get $get, Forms\Set $set, ?string $state) {
                                            if (!$get('name_en') && $state) {
                                                $set('name_en', Str::headline($state));
                                            }
                                        }),
                                    Forms\Components\Select::make('category')
                                        ->label(app()->getLocale() === 'ar' ? 'التصنيف' : 'Category')
                                        ->options([
                                            'academic' => app()->getLocale() === 'ar' ? '📚 أكاديمي' : '📚 Academic',
                                            'financial' => app()->getLocale() === 'ar' ? '💰 مالي' : '💰 Financial',
                                            'attendance' => app()->getLocale() === 'ar' ? '📅 الحضور' : '📅 Attendance',
                                            'enrollment' => app()->getLocale() === 'ar' ? '📝 التسجيل' : '📝 Enrollment',
                                            'performance' => app()->getLocale() === 'ar' ? '📈 الأداء' : '📈 Performance',
                                            'statistics' => app()->getLocale() === 'ar' ? '📊 إحصائيات' : '📊 Statistics',
                                            'custom' => app()->getLocale() === 'ar' ? '⚙️ مخصص' : '⚙️ Custom',
                                        ])
                                        ->searchable()
                                        ->required(),
                                    Forms\Components\TextInput::make('name_en')
                                        ->label(app()->getLocale() === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)')
                                        ->required()
                                        ->maxLength(255)
                                        ->placeholder('e.g., Monthly Grades Report'),
                                    Forms\Components\TextInput::make('name_ar')
                                        ->label(app()->getLocale() === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)')
                                        ->required()
                                        ->maxLength(255)
                                        ->placeholder('مثال: تقرير الدرجات الشهري'),
                                    Forms\Components\Textarea::make('description_en')
                                        ->label(app()->getLocale() === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)')
                                        ->rows(2),
                                    Forms\Components\Textarea::make('description_ar')
                                        ->label(app()->getLocale() === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)')
                                        ->rows(2),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'نوع التقرير' : 'Report Type')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\Select::make('report_type')
                                        ->label(app()->getLocale() === 'ar' ? 'طريقة العرض' : 'Display Type')
                                        ->options([
                                            'table' => app()->getLocale() === 'ar' ? '📋 جدول - عرض البيانات في صفوف وأعمدة' : '📋 Table - Data in rows and columns',
                                            'summary' => app()->getLocale() === 'ar' ? '📝 ملخص - أرقام وإحصائيات رئيسية' : '📝 Summary - Key numbers and stats',
                                            'chart' => app()->getLocale() === 'ar' ? '📊 رسم بياني - تمثيل مرئي للبيانات' : '📊 Chart - Visual data representation',
                                            'mixed' => app()->getLocale() === 'ar' ? '🎨 مختلط - جدول + رسوم بيانية' : '🎨 Mixed - Table + Charts',
                                        ])
                                        ->default('table')
                                        ->required()
                                        ->helperText(app()->getLocale() === 'ar' ? 'كيف تريد عرض البيانات؟' : 'How do you want to display data?'),
                                    Forms\Components\Toggle::make('is_active')
                                        ->label(app()->getLocale() === 'ar' ? 'نشط' : 'Active')
                                        ->helperText(app()->getLocale() === 'ar' ? 'هل التقرير متاح للاستخدام؟' : 'Is this report available?')
                                        ->default(true)
                                        ->inline(false),
                                ]),
                        ]),

                    // Step 3: Data Source (Simplified)
                    Forms\Components\Wizard\Step::make('data_source')
                        ->label(app()->getLocale() === 'ar' ? 'مصدر البيانات' : 'Data Source')
                        ->description(app()->getLocale() === 'ar' ? 'من أين تأتي بيانات التقرير؟' : 'Where does the report data come from?')
                        ->icon('heroicon-o-circle-stack')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'مصدر البيانات' : 'Data Source')
                                ->description(app()->getLocale() === 'ar' ? 'اختر مصدر البيانات للتقرير' : 'Choose the data source for this report')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\Select::make('data_source_type')
                                        ->label(app()->getLocale() === 'ar' ? 'نوع المصدر' : 'Source Type')
                                        ->options([
                                            'model' => app()->getLocale() === 'ar' ? '📦 نموذج Laravel - البيانات من قاعدة البيانات' : '📦 Laravel Model - Data from database',
                                            'query' => app()->getLocale() === 'ar' ? '🔍 استعلام SQL - استعلام مخصص' : '🔍 SQL Query - Custom query',
                                        ])
                                        ->default('model')
                                        ->required()
                                        ->live()
                                        ->helperText(app()->getLocale() === 'ar' ? 'كيف تريد جلب البيانات؟' : 'How do you want to fetch data?'),
                                    Forms\Components\Select::make('data_source')
                                        ->label(app()->getLocale() === 'ar' ? 'مصدر البيانات' : 'Data Source')
                                        ->options([
                                            'students' => app()->getLocale() === 'ar' ? '🎓 الطلاب' : '🎓 Students',
                                            'courses' => app()->getLocale() === 'ar' ? '📚 المقررات' : '📚 Courses',
                                            'enrollments' => app()->getLocale() === 'ar' ? '📝 التسجيلات' : '📝 Enrollments',
                                            'grades' => app()->getLocale() === 'ar' ? '📊 الدرجات' : '📊 Grades',
                                            'financial_records' => app()->getLocale() === 'ar' ? '💰 السجلات المالية' : '💰 Financial Records',
                                            'programs' => app()->getLocale() === 'ar' ? '🎯 البرامج' : '🎯 Programs',
                                            'departments' => app()->getLocale() === 'ar' ? '🏛️ الأقسام' : '🏛️ Departments',
                                        ])
                                        ->searchable()
                                        ->visible(fn (Forms\Get $get) => $get('data_source_type') === 'model'),
                                    Forms\Components\TextInput::make('model_class')
                                        ->label(app()->getLocale() === 'ar' ? 'نموذج Laravel' : 'Laravel Model')
                                        ->placeholder('App\\Models\\Student')
                                        ->helperText(app()->getLocale() === 'ar' ? 'المسار الكامل للنموذج' : 'Full model class path')
                                        ->visible(fn (Forms\Get $get) => $get('data_source_type') === 'model'),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'استعلام SQL' : 'SQL Query')
                                ->visible(fn (Forms\Get $get) => $get('data_source_type') === 'query')
                                ->schema([
                                    Forms\Components\Textarea::make('query')
                                        ->label(app()->getLocale() === 'ar' ? 'استعلام SQL' : 'SQL Query')
                                        ->rows(5)
                                        ->helperText(app()->getLocale() === 'ar' ? 'استخدم :param_name للمعاملات' : 'Use :param_name for parameters')
                                        ->placeholder('SELECT * FROM students WHERE status = :status'),
                                ]),
                        ]),

                    // Step 4: Output Settings
                    Forms\Components\Wizard\Step::make('output')
                        ->label(app()->getLocale() === 'ar' ? 'إعدادات الإخراج' : 'Output Settings')
                        ->description(app()->getLocale() === 'ar' ? 'تخصيص شكل التقرير' : 'Customize report appearance')
                        ->icon('heroicon-o-document')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'إعدادات الصفحة' : 'Page Settings')
                                ->columns(3)
                                ->schema([
                                    Forms\Components\Select::make('page_orientation')
                                        ->label(app()->getLocale() === 'ar' ? 'اتجاه الصفحة' : 'Page Orientation')
                                        ->options([
                                            'portrait' => app()->getLocale() === 'ar' ? '📄 عمودي' : '📄 Portrait',
                                            'landscape' => app()->getLocale() === 'ar' ? '📄 أفقي' : '📄 Landscape',
                                        ])
                                        ->default('portrait'),
                                    Forms\Components\Select::make('page_size')
                                        ->label(app()->getLocale() === 'ar' ? 'حجم الصفحة' : 'Page Size')
                                        ->options([
                                            'a4' => 'A4',
                                            'a3' => 'A3',
                                            'letter' => 'Letter',
                                            'legal' => 'Legal',
                                        ])
                                        ->default('a4'),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'عناصر التقرير' : 'Report Elements')
                                ->columns(3)
                                ->schema([
                                    Forms\Components\Toggle::make('show_logo')
                                        ->label(app()->getLocale() === 'ar' ? '🏛️ عرض الشعار' : '🏛️ Show Logo')
                                        ->default(true)
                                        ->inline(false),
                                    Forms\Components\Toggle::make('show_date')
                                        ->label(app()->getLocale() === 'ar' ? '📅 عرض التاريخ' : '📅 Show Date')
                                        ->default(true)
                                        ->inline(false),
                                    Forms\Components\Toggle::make('show_page_numbers')
                                        ->label(app()->getLocale() === 'ar' ? '#️⃣ أرقام الصفحات' : '#️⃣ Page Numbers')
                                        ->default(true)
                                        ->inline(false),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'صيغ التصدير' : 'Export Formats')
                                ->description(app()->getLocale() === 'ar' ? 'اختر صيغ الملفات المتاحة' : 'Choose available file formats')
                                ->schema([
                                    Forms\Components\CheckboxList::make('export_formats')
                                        ->label('')
                                        ->options([
                                            'pdf' => app()->getLocale() === 'ar' ? '📕 PDF' : '📕 PDF',
                                            'excel' => app()->getLocale() === 'ar' ? '📊 Excel (.xlsx)' : '📊 Excel (.xlsx)',
                                            'csv' => app()->getLocale() === 'ar' ? '📄 CSV' : '📄 CSV',
                                        ])
                                        ->columns(3)
                                        ->default(['pdf', 'excel']),
                                ]),
                        ]),

                    // Step 5: Access & Scheduling
                    Forms\Components\Wizard\Step::make('access')
                        ->label(app()->getLocale() === 'ar' ? 'الوصول والجدولة' : 'Access & Scheduling')
                        ->description(app()->getLocale() === 'ar' ? 'من يمكنه الوصول وكيف يتم تشغيله' : 'Who can access and how it runs')
                        ->icon('heroicon-o-lock-closed')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'التحكم في الوصول' : 'Access Control')
                                ->description(app()->getLocale() === 'ar' ? 'حدد من يمكنه رؤية هذا التقرير' : 'Specify who can view this report')
                                ->schema([
                                    Forms\Components\Toggle::make('is_public')
                                        ->label(app()->getLocale() === 'ar' ? '🌐 تقرير عام' : '🌐 Public Report')
                                        ->helperText(app()->getLocale() === 'ar' ? 'يمكن الوصول إليه بدون تسجيل دخول' : 'Accessible without login')
                                        ->default(false)
                                        ->inline(false),
                                    Forms\Components\CheckboxList::make('allowed_roles')
                                        ->label(app()->getLocale() === 'ar' ? 'الأدوار المسموحة' : 'Allowed Roles')
                                        ->options([
                                            'ADMIN' => app()->getLocale() === 'ar' ? '👑 المدير' : '👑 Admin',
                                            'FINANCE' => app()->getLocale() === 'ar' ? '💰 المالية' : '💰 Finance',
                                            'LECTURER' => app()->getLocale() === 'ar' ? '👨‍🏫 المحاضر' : '👨‍🏫 Lecturer',
                                            'STUDENT' => app()->getLocale() === 'ar' ? '🎓 الطالب' : '🎓 Student',
                                        ])
                                        ->columns(4)
                                        ->helperText(app()->getLocale() === 'ar' ? 'اتركه فارغًا للسماح للجميع' : 'Leave empty to allow everyone'),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'الجدولة التلقائية' : 'Automatic Scheduling')
                                ->description(app()->getLocale() === 'ar' ? 'تشغيل التقرير تلقائيًا' : 'Run report automatically')
                                ->collapsed()
                                ->schema([
                                    Forms\Components\Toggle::make('is_scheduled')
                                        ->label(app()->getLocale() === 'ar' ? '⏰ تفعيل الجدولة' : '⏰ Enable Scheduling')
                                        ->default(false)
                                        ->live()
                                        ->inline(false),
                                    Forms\Components\Select::make('schedule_frequency')
                                        ->label(app()->getLocale() === 'ar' ? 'التكرار' : 'Frequency')
                                        ->options([
                                            'daily' => app()->getLocale() === 'ar' ? 'يومي' : 'Daily',
                                            'weekly' => app()->getLocale() === 'ar' ? 'أسبوعي' : 'Weekly',
                                            'monthly' => app()->getLocale() === 'ar' ? 'شهري' : 'Monthly',
                                        ])
                                        ->visible(fn (Forms\Get $get) => $get('is_scheduled')),
                                    Forms\Components\TagsInput::make('schedule_recipients')
                                        ->label(app()->getLocale() === 'ar' ? 'المستلمون' : 'Recipients')
                                        ->placeholder(app()->getLocale() === 'ar' ? 'أضف بريد إلكتروني...' : 'Add email...')
                                        ->visible(fn (Forms\Get $get) => $get('is_scheduled')),
                                ]),
                        ]),

                    // Step 6: Advanced (Optional)
                    Forms\Components\Wizard\Step::make('advanced')
                        ->label(app()->getLocale() === 'ar' ? 'خيارات متقدمة' : 'Advanced Options')
                        ->description(app()->getLocale() === 'ar' ? 'إعدادات إضافية (اختياري)' : 'Additional settings (optional)')
                        ->icon('heroicon-o-wrench-screwdriver')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'التجميع والترتيب' : 'Grouping & Sorting')
                                ->collapsed()
                                ->schema([
                                    Forms\Components\Repeater::make('aggregations')
                                        ->label(app()->getLocale() === 'ar' ? 'دوال التجميع' : 'Aggregate Functions')
                                        ->schema([
                                            Forms\Components\TextInput::make('field')
                                                ->label(app()->getLocale() === 'ar' ? 'الحقل' : 'Field')
                                                ->required(),
                                            Forms\Components\Select::make('function')
                                                ->label(app()->getLocale() === 'ar' ? 'الدالة' : 'Function')
                                                ->options([
                                                    'sum' => app()->getLocale() === 'ar' ? 'المجموع' : 'Sum',
                                                    'avg' => app()->getLocale() === 'ar' ? 'المتوسط' : 'Average',
                                                    'count' => app()->getLocale() === 'ar' ? 'العدد' : 'Count',
                                                    'min' => app()->getLocale() === 'ar' ? 'الأدنى' : 'Minimum',
                                                    'max' => app()->getLocale() === 'ar' ? 'الأقصى' : 'Maximum',
                                                ])
                                                ->required(),
                                            Forms\Components\TextInput::make('label')
                                                ->label(app()->getLocale() === 'ar' ? 'التسمية' : 'Label'),
                                        ])
                                        ->columns(3)
                                        ->defaultItems(0)
                                        ->addActionLabel(app()->getLocale() === 'ar' ? 'إضافة تجميع' : 'Add Aggregation'),
                                    Forms\Components\Repeater::make('sorting')
                                        ->label(app()->getLocale() === 'ar' ? 'الترتيب' : 'Sorting')
                                        ->schema([
                                            Forms\Components\TextInput::make('field')
                                                ->label(app()->getLocale() === 'ar' ? 'الحقل' : 'Field')
                                                ->required(),
                                            Forms\Components\Select::make('direction')
                                                ->label(app()->getLocale() === 'ar' ? 'الاتجاه' : 'Direction')
                                                ->options([
                                                    'asc' => app()->getLocale() === 'ar' ? 'تصاعدي' : 'Ascending',
                                                    'desc' => app()->getLocale() === 'ar' ? 'تنازلي' : 'Descending',
                                                ])
                                                ->default('asc'),
                                        ])
                                        ->columns(2)
                                        ->defaultItems(0)
                                        ->addActionLabel(app()->getLocale() === 'ar' ? 'إضافة ترتيب' : 'Add Sort'),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'التخزين المؤقت' : 'Caching')
                                ->collapsed()
                                ->columns(2)
                                ->schema([
                                    Forms\Components\TextInput::make('cache_duration')
                                        ->label(app()->getLocale() === 'ar' ? 'مدة التخزين (دقائق)' : 'Cache Duration (minutes)')
                                        ->numeric()
                                        ->default(0)
                                        ->helperText(app()->getLocale() === 'ar' ? '0 = بدون تخزين مؤقت' : '0 = no caching'),
                                    Forms\Components\TextInput::make('sort_order')
                                        ->label(app()->getLocale() === 'ar' ? 'ترتيب العرض' : 'Display Order')
                                        ->numeric()
                                        ->default(0),
                                ]),
                        ]),
                ])
                ->columnSpanFull()
                ->skippable()
                ->persistStepInQueryString(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->label(__('filament.fields.code'))
                    ->searchable()
                    ->sortable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('name_en')
                    ->label(__('filament.fields.name_en'))
                    ->searchable()
                    ->sortable()
                    ->description(fn (DynamicReport $record): string => $record->description_en ?? ''),
                Tables\Columns\TextColumn::make('name_ar')
                    ->label(__('filament.fields.name_ar'))
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\BadgeColumn::make('category')
                    ->label(__('filament.fields.category'))
                    ->colors([
                        'primary' => 'academic',
                        'success' => 'financial',
                        'warning' => 'attendance',
                        'danger' => 'enrollment',
                        'info' => 'performance',
                        'gray' => 'statistics',
                    ]),
                Tables\Columns\BadgeColumn::make('report_type')
                    ->label(app()->getLocale() === 'ar' ? 'النوع' : 'Type')
                    ->colors([
                        'primary' => 'table',
                        'success' => 'summary',
                        'warning' => 'chart',
                        'info' => 'mixed',
                    ]),
                Tables\Columns\TextColumn::make('charts_count')
                    ->label(app()->getLocale() === 'ar' ? 'الرسوم' : 'Charts')
                    ->counts('charts')
                    ->badge()
                    ->color('info'),
                Tables\Columns\IconColumn::make('is_scheduled')
                    ->label(app()->getLocale() === 'ar' ? 'مجدول' : 'Scheduled')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label(__('filament.fields.is_active'))
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament.fields.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category')
                    ->options([
                        'academic' => app()->getLocale() === 'ar' ? 'أكاديمي' : 'Academic',
                        'financial' => app()->getLocale() === 'ar' ? 'مالي' : 'Financial',
                        'attendance' => app()->getLocale() === 'ar' ? 'الحضور' : 'Attendance',
                        'enrollment' => app()->getLocale() === 'ar' ? 'التسجيل' : 'Enrollment',
                        'performance' => app()->getLocale() === 'ar' ? 'الأداء' : 'Performance',
                        'statistics' => app()->getLocale() === 'ar' ? 'إحصائيات' : 'Statistics',
                    ]),
                Tables\Filters\SelectFilter::make('report_type')
                    ->label(app()->getLocale() === 'ar' ? 'النوع' : 'Type')
                    ->options([
                        'table' => app()->getLocale() === 'ar' ? 'جدول' : 'Table',
                        'summary' => app()->getLocale() === 'ar' ? 'ملخص' : 'Summary',
                        'chart' => app()->getLocale() === 'ar' ? 'رسم بياني' : 'Chart',
                        'mixed' => app()->getLocale() === 'ar' ? 'مختلط' : 'Mixed',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active'),
                Tables\Filters\TernaryFilter::make('is_scheduled')
                    ->label(app()->getLocale() === 'ar' ? 'مجدول' : 'Scheduled'),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->label(app()->getLocale() === 'ar' ? 'عرض' : 'View'),
                    Tables\Actions\EditAction::make()
                        ->label(app()->getLocale() === 'ar' ? 'تعديل' : 'Edit'),
                    Tables\Actions\Action::make('add_charts')
                        ->label(app()->getLocale() === 'ar' ? 'إضافة رسوم بيانية' : 'Add Charts')
                        ->icon('heroicon-o-chart-bar')
                        ->url(fn (DynamicReport $record): string => static::getUrl('edit', ['record' => $record]) . '#relationManager=charts')
                        ->color('success'),
                    Tables\Actions\Action::make('generate')
                        ->label(app()->getLocale() === 'ar' ? 'تشغيل التقرير' : 'Generate Report')
                        ->icon('heroicon-o-document-arrow-down')
                        ->url(fn (DynamicReport $record): string => "/api/dynamic-reports/{$record->code}/generate")
                        ->openUrlInNewTab()
                        ->color('warning'),
                    Tables\Actions\Action::make('duplicate')
                        ->label(app()->getLocale() === 'ar' ? 'نسخ' : 'Duplicate')
                        ->icon('heroicon-o-document-duplicate')
                        ->requiresConfirmation()
                        ->action(function (DynamicReport $record) {
                            $newReport = $record->replicate();
                            $newReport->code = $record->code . '_copy_' . time();
                            $newReport->name_en = $record->name_en . ' (Copy)';
                            $newReport->name_ar = $record->name_ar . ' (نسخة)';
                            $newReport->save();

                            foreach ($record->fields as $field) {
                                $newField = $field->replicate();
                                $newField->report_id = $newReport->id;
                                $newField->save();
                            }

                            foreach ($record->reportParameters as $param) {
                                $newParam = $param->replicate();
                                $newParam->report_id = $newReport->id;
                                $newParam->save();
                            }

                            foreach ($record->charts as $chart) {
                                $newChart = $chart->replicate();
                                $newChart->report_id = $newReport->id;
                                $newChart->save();
                            }
                        }),
                    Tables\Actions\DeleteAction::make()
                        ->label(app()->getLocale() === 'ar' ? 'حذف' : 'Delete'),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('activate')
                        ->label(app()->getLocale() === 'ar' ? 'تفعيل' : 'Activate')
                        ->icon('heroicon-o-check-circle')
                        ->action(fn ($records) => $records->each->update(['is_active' => true])),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label(app()->getLocale() === 'ar' ? 'إلغاء التفعيل' : 'Deactivate')
                        ->icon('heroicon-o-x-circle')
                        ->action(fn ($records) => $records->each->update(['is_active' => false])),
                ]),
            ])
            ->emptyStateHeading(app()->getLocale() === 'ar' ? 'لا توجد تقارير بعد' : 'No reports yet')
            ->emptyStateDescription(app()->getLocale() === 'ar' ? 'أنشئ تقريرك الأول لعرض البيانات' : 'Create your first report to display data')
            ->emptyStateIcon('heroicon-o-chart-bar')
            ->defaultSort('sort_order')
            ->reorderable('sort_order');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\FieldsRelationManager::class,
            RelationManagers\ParametersRelationManager::class,
            RelationManagers\ChartsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDynamicReports::route('/'),
            'create' => Pages\CreateDynamicReport::route('/create'),
            'view' => Pages\ViewDynamicReport::route('/{record}'),
            'edit' => Pages\EditDynamicReport::route('/{record}/edit'),
        ];
    }
}
