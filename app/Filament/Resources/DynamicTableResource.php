<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DynamicTableResource\Pages;
use App\Filament\Resources\DynamicTableResource\RelationManagers;
use App\Models\DynamicTable;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class DynamicTableResource extends Resource
{
    protected static ?string $model = DynamicTable::class;

    protected static ?string $navigationIcon = 'heroicon-o-table-cells';

    protected static ?int $navigationSort = 2;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.dynamic_content');
    }

    public static function getModelLabel(): string
    {
        return __('filament.dynamic_table.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.dynamic_table.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.dynamic_tables');
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    /**
     * Get available data sources (database tables)
     */
    public static function getAvailableDataSources(): array
    {
        return [
            'students' => app()->getLocale() === 'ar' ? '🎓 الطلاب' : '🎓 Students',
            'courses' => app()->getLocale() === 'ar' ? '📚 المقررات' : '📚 Courses',
            'enrollments' => app()->getLocale() === 'ar' ? '📝 التسجيلات' : '📝 Enrollments',
            'grades' => app()->getLocale() === 'ar' ? '📊 الدرجات' : '📊 Grades',
            'programs' => app()->getLocale() === 'ar' ? '🎯 البرامج' : '🎯 Programs',
            'departments' => app()->getLocale() === 'ar' ? '🏛️ الأقسام' : '🏛️ Departments',
            'colleges' => app()->getLocale() === 'ar' ? '🏫 الكليات' : '🏫 Colleges',
            'semesters' => app()->getLocale() === 'ar' ? '📅 الفصول' : '📅 Semesters',
            'financial_records' => app()->getLocale() === 'ar' ? '💰 السجلات المالية' : '💰 Financial Records',
            'announcements' => app()->getLocale() === 'ar' ? '📢 الإعلانات' : '📢 Announcements',
            'service_requests' => app()->getLocale() === 'ar' ? '📋 طلبات الخدمة' : '📋 Service Requests',
            'users' => app()->getLocale() === 'ar' ? '👥 المستخدمين' : '👥 Users',
        ];
    }

    /**
     * Get table templates
     */
    public static function getTableTemplates(): array
    {
        return [
            'blank' => [
                'name' => app()->getLocale() === 'ar' ? 'جدول فارغ' : 'Blank Table',
                'description' => app()->getLocale() === 'ar' ? 'ابدأ من الصفر' : 'Start from scratch',
            ],
            'student_list' => [
                'name' => app()->getLocale() === 'ar' ? 'قائمة الطلاب' : 'Student List',
                'description' => app()->getLocale() === 'ar' ? 'جدول يعرض بيانات الطلاب' : 'Table showing student data',
                'settings' => [
                    'data_source' => 'students',
                    'data_model' => 'App\\Models\\Student',
                    'is_searchable' => true,
                    'is_exportable' => true,
                ],
            ],
            'course_catalog' => [
                'name' => app()->getLocale() === 'ar' ? 'كتالوج المقررات' : 'Course Catalog',
                'description' => app()->getLocale() === 'ar' ? 'جدول المقررات الدراسية' : 'Course offerings table',
                'settings' => [
                    'data_source' => 'courses',
                    'data_model' => 'App\\Models\\Course',
                    'is_searchable' => true,
                    'is_filterable' => true,
                ],
            ],
            'grades_report' => [
                'name' => app()->getLocale() === 'ar' ? 'تقرير الدرجات' : 'Grades Report',
                'description' => app()->getLocale() === 'ar' ? 'جدول درجات الطلاب' : 'Student grades table',
                'settings' => [
                    'data_source' => 'grades',
                    'data_model' => 'App\\Models\\Grade',
                    'is_exportable' => true,
                ],
            ],
            'financial' => [
                'name' => app()->getLocale() === 'ar' ? 'السجلات المالية' : 'Financial Records',
                'description' => app()->getLocale() === 'ar' ? 'جدول المعاملات المالية' : 'Financial transactions table',
                'settings' => [
                    'data_source' => 'financial_records',
                    'data_model' => 'App\\Models\\FinancialRecord',
                    'is_exportable' => true,
                    'allowed_roles' => ['ADMIN', 'FINANCE'],
                ],
            ],
        ];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Wizard::make([
                    // Step 1: Choose Template or Data Source
                    Forms\Components\Wizard\Step::make('template')
                        ->label(app()->getLocale() === 'ar' ? 'اختر البيانات' : 'Choose Data')
                        ->description(app()->getLocale() === 'ar' ? 'حدد مصدر البيانات للجدول' : 'Select the data source for your table')
                        ->icon('heroicon-o-circle-stack')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'قوالب جاهزة' : 'Ready Templates')
                                ->description(app()->getLocale() === 'ar' ? 'اختر قالبًا للبدء بسرعة' : 'Choose a template to get started quickly')
                                ->schema([
                                    Forms\Components\Radio::make('template')
                                        ->label('')
                                        ->options([
                                            'blank' => app()->getLocale() === 'ar' ? '📄 جدول فارغ - ابدأ من الصفر' : '📄 Blank Table - Start from scratch',
                                            'student_list' => app()->getLocale() === 'ar' ? '🎓 قائمة الطلاب - جدول يعرض بيانات الطلاب' : '🎓 Student List - Table showing student data',
                                            'course_catalog' => app()->getLocale() === 'ar' ? '📚 كتالوج المقررات - جدول المقررات الدراسية' : '📚 Course Catalog - Course offerings table',
                                            'grades_report' => app()->getLocale() === 'ar' ? '📊 تقرير الدرجات - جدول درجات الطلاب' : '📊 Grades Report - Student grades table',
                                            'financial' => app()->getLocale() === 'ar' ? '💰 السجلات المالية - جدول المعاملات المالية' : '💰 Financial Records - Financial transactions',
                                        ])
                                        ->default('blank')
                                        ->live()
                                        ->afterStateUpdated(function (Forms\Get $get, Forms\Set $set, ?string $state) {
                                            $templates = self::getTableTemplates();
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
                        ->description(app()->getLocale() === 'ar' ? 'أدخل اسم ووصف الجدول' : 'Enter table name and description')
                        ->icon('heroicon-o-information-circle')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'هوية الجدول' : 'Table Identity')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\TextInput::make('code')
                                        ->label(app()->getLocale() === 'ar' ? 'الكود' : 'Code')
                                        ->helperText(app()->getLocale() === 'ar' ? 'معرف فريد للجدول (حروف وأرقام)' : 'Unique identifier (letters and numbers)')
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
                                    Forms\Components\Toggle::make('is_active')
                                        ->label(app()->getLocale() === 'ar' ? 'نشط' : 'Active')
                                        ->helperText(app()->getLocale() === 'ar' ? 'هل الجدول متاح للعرض؟' : 'Is this table available?')
                                        ->default(true)
                                        ->inline(false),
                                    Forms\Components\TextInput::make('name_en')
                                        ->label(app()->getLocale() === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)')
                                        ->required()
                                        ->maxLength(255)
                                        ->placeholder('e.g., Active Students'),
                                    Forms\Components\TextInput::make('name_ar')
                                        ->label(app()->getLocale() === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)')
                                        ->required()
                                        ->maxLength(255)
                                        ->placeholder('مثال: الطلاب النشطين'),
                                    Forms\Components\Textarea::make('description_en')
                                        ->label(app()->getLocale() === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)')
                                        ->rows(2),
                                    Forms\Components\Textarea::make('description_ar')
                                        ->label(app()->getLocale() === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)')
                                        ->rows(2),
                                ]),
                        ]),

                    // Step 3: Data Source
                    Forms\Components\Wizard\Step::make('data_source')
                        ->label(app()->getLocale() === 'ar' ? 'مصدر البيانات' : 'Data Source')
                        ->description(app()->getLocale() === 'ar' ? 'حدد من أين تأتي البيانات' : 'Specify where data comes from')
                        ->icon('heroicon-o-circle-stack')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'اختر مصدر البيانات' : 'Choose Data Source')
                                ->description(app()->getLocale() === 'ar' ? 'حدد الجدول أو النموذج الذي يحتوي على البيانات' : 'Select the table or model containing the data')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\Select::make('data_source')
                                        ->label(app()->getLocale() === 'ar' ? 'مصدر البيانات' : 'Data Source')
                                        ->options(self::getAvailableDataSources())
                                        ->searchable()
                                        ->helperText(app()->getLocale() === 'ar' ? 'اختر جدول قاعدة البيانات' : 'Choose the database table'),
                                    Forms\Components\TextInput::make('data_model')
                                        ->label(app()->getLocale() === 'ar' ? 'نموذج Laravel (اختياري)' : 'Laravel Model (Optional)')
                                        ->placeholder('App\\Models\\Student')
                                        ->helperText(app()->getLocale() === 'ar' ? 'المسار الكامل للنموذج' : 'Full model class path'),
                                ]),
                        ]),

                    // Step 4: Features
                    Forms\Components\Wizard\Step::make('features')
                        ->label(app()->getLocale() === 'ar' ? 'الميزات' : 'Features')
                        ->description(app()->getLocale() === 'ar' ? 'تفعيل/تعطيل ميزات الجدول' : 'Enable/disable table features')
                        ->icon('heroicon-o-cog-6-tooth')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'ميزات الجدول' : 'Table Features')
                                ->description(app()->getLocale() === 'ar' ? 'اختر الميزات التي تريد تفعيلها' : 'Choose features you want to enable')
                                ->columns(4)
                                ->schema([
                                    Forms\Components\Toggle::make('is_paginated')
                                        ->label(app()->getLocale() === 'ar' ? '📄 تقسيم الصفحات' : '📄 Pagination')
                                        ->helperText(app()->getLocale() === 'ar' ? 'تقسيم البيانات إلى صفحات' : 'Split data into pages')
                                        ->default(true)
                                        ->inline(false),
                                    Forms\Components\Toggle::make('is_searchable')
                                        ->label(app()->getLocale() === 'ar' ? '🔍 البحث' : '🔍 Search')
                                        ->helperText(app()->getLocale() === 'ar' ? 'إضافة مربع بحث' : 'Add search box')
                                        ->default(true)
                                        ->inline(false),
                                    Forms\Components\Toggle::make('is_filterable')
                                        ->label(app()->getLocale() === 'ar' ? '🎛️ الفلاتر' : '🎛️ Filters')
                                        ->helperText(app()->getLocale() === 'ar' ? 'إضافة خيارات تصفية' : 'Add filter options')
                                        ->default(true)
                                        ->inline(false),
                                    Forms\Components\Toggle::make('is_sortable')
                                        ->label(app()->getLocale() === 'ar' ? '↕️ الترتيب' : '↕️ Sorting')
                                        ->helperText(app()->getLocale() === 'ar' ? 'السماح بترتيب الأعمدة' : 'Allow column sorting')
                                        ->default(true)
                                        ->inline(false),
                                    Forms\Components\Toggle::make('is_exportable')
                                        ->label(app()->getLocale() === 'ar' ? '📥 التصدير' : '📥 Export')
                                        ->helperText(app()->getLocale() === 'ar' ? 'السماح بتصدير البيانات' : 'Allow data export')
                                        ->default(true)
                                        ->inline(false),
                                    Forms\Components\Toggle::make('show_row_numbers')
                                        ->label(app()->getLocale() === 'ar' ? '🔢 أرقام الصفوف' : '🔢 Row Numbers')
                                        ->helperText(app()->getLocale() === 'ar' ? 'عرض أرقام الصفوف' : 'Show row numbers')
                                        ->default(false)
                                        ->inline(false),
                                    Forms\Components\Toggle::make('show_selection')
                                        ->label(app()->getLocale() === 'ar' ? '☑️ التحديد' : '☑️ Selection')
                                        ->helperText(app()->getLocale() === 'ar' ? 'السماح بتحديد الصفوف' : 'Allow row selection')
                                        ->default(true)
                                        ->inline(false),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'صيغ التصدير' : 'Export Formats')
                                ->description(app()->getLocale() === 'ar' ? 'اختر صيغ الملفات للتصدير' : 'Choose file formats for export')
                                ->schema([
                                    Forms\Components\CheckboxList::make('export_formats')
                                        ->label('')
                                        ->options([
                                            'excel' => app()->getLocale() === 'ar' ? '📊 Excel (.xlsx)' : '📊 Excel (.xlsx)',
                                            'csv' => app()->getLocale() === 'ar' ? '📄 CSV' : '📄 CSV',
                                            'pdf' => app()->getLocale() === 'ar' ? '📕 PDF' : '📕 PDF',
                                        ])
                                        ->columns(3)
                                        ->default(['excel', 'csv']),
                                ]),
                        ]),

                    // Step 5: Access Control
                    Forms\Components\Wizard\Step::make('access')
                        ->label(app()->getLocale() === 'ar' ? 'الصلاحيات' : 'Access')
                        ->description(app()->getLocale() === 'ar' ? 'من يمكنه رؤية هذا الجدول؟' : 'Who can see this table?')
                        ->icon('heroicon-o-lock-closed')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'التحكم في الوصول' : 'Access Control')
                                ->description(app()->getLocale() === 'ar' ? 'اتركه فارغًا للسماح للجميع' : 'Leave empty to allow everyone')
                                ->schema([
                                    Forms\Components\CheckboxList::make('allowed_roles')
                                        ->label(app()->getLocale() === 'ar' ? 'الأدوار المسموحة' : 'Allowed Roles')
                                        ->options([
                                            'ADMIN' => app()->getLocale() === 'ar' ? '👑 المدير' : '👑 Admin',
                                            'FINANCE' => app()->getLocale() === 'ar' ? '💰 المالية' : '💰 Finance',
                                            'LECTURER' => app()->getLocale() === 'ar' ? '👨‍🏫 المحاضر' : '👨‍🏫 Lecturer',
                                            'STUDENT' => app()->getLocale() === 'ar' ? '🎓 الطالب' : '🎓 Student',
                                        ])
                                        ->columns(4),
                                    Forms\Components\TextInput::make('sort_order')
                                        ->label(app()->getLocale() === 'ar' ? 'ترتيب العرض' : 'Display Order')
                                        ->numeric()
                                        ->default(0)
                                        ->helperText(app()->getLocale() === 'ar' ? 'رقم أقل = يظهر أولاً' : 'Lower number = appears first'),
                                ]),
                        ]),

                    // Step 6: Advanced (Optional)
                    Forms\Components\Wizard\Step::make('advanced')
                        ->label(app()->getLocale() === 'ar' ? 'خيارات متقدمة' : 'Advanced')
                        ->description(app()->getLocale() === 'ar' ? 'إعدادات متقدمة (اختياري)' : 'Advanced settings (optional)')
                        ->icon('heroicon-o-wrench-screwdriver')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'تقسيم الصفحات' : 'Pagination')
                                ->collapsed()
                                ->columns(2)
                                ->schema([
                                    Forms\Components\TextInput::make('default_page_size')
                                        ->label(app()->getLocale() === 'ar' ? 'عدد الصفوف الافتراضي' : 'Default Page Size')
                                        ->numeric()
                                        ->default(25),
                                    Forms\Components\TagsInput::make('page_size_options')
                                        ->label(app()->getLocale() === 'ar' ? 'خيارات حجم الصفحة' : 'Page Size Options')
                                        ->placeholder(app()->getLocale() === 'ar' ? 'أضف حجم...' : 'Add size...')
                                        ->default(['10', '25', '50', '100']),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'شروط البيانات' : 'Query Conditions')
                                ->description(app()->getLocale() === 'ar' ? 'فلترة البيانات قبل عرضها' : 'Filter data before display')
                                ->collapsed()
                                ->schema([
                                    Forms\Components\Repeater::make('base_query')
                                        ->label(app()->getLocale() === 'ar' ? 'شروط الاستعلام' : 'Query Conditions')
                                        ->schema([
                                            Forms\Components\TextInput::make('field')
                                                ->label(app()->getLocale() === 'ar' ? 'الحقل' : 'Field')
                                                ->required(),
                                            Forms\Components\Select::make('operator')
                                                ->label(app()->getLocale() === 'ar' ? 'العملية' : 'Operator')
                                                ->options([
                                                    '=' => '=',
                                                    '!=' => '!=',
                                                    '>' => '>',
                                                    '<' => '<',
                                                    'like' => 'LIKE',
                                                ])
                                                ->default('='),
                                            Forms\Components\TextInput::make('value')
                                                ->label(app()->getLocale() === 'ar' ? 'القيمة' : 'Value')
                                                ->required(),
                                        ])
                                        ->columns(3)
                                        ->defaultItems(0)
                                        ->addActionLabel(app()->getLocale() === 'ar' ? 'إضافة شرط' : 'Add Condition'),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'الترتيب الافتراضي' : 'Default Sorting')
                                ->collapsed()
                                ->schema([
                                    Forms\Components\Repeater::make('default_sort')
                                        ->label(app()->getLocale() === 'ar' ? 'ترتيب البيانات' : 'Data Sorting')
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
                    ->description(fn (DynamicTable $record): string => $record->description_en ?? ''),
                Tables\Columns\TextColumn::make('name_ar')
                    ->label(__('filament.fields.name_ar'))
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('data_source')
                    ->label(app()->getLocale() === 'ar' ? 'مصدر البيانات' : 'Data Source')
                    ->badge()
                    ->color('info'),
                Tables\Columns\TextColumn::make('columns_count')
                    ->label(app()->getLocale() === 'ar' ? 'الأعمدة' : 'Columns')
                    ->counts('columns')
                    ->badge()
                    ->color('success'),
                Tables\Columns\TextColumn::make('filters_count')
                    ->label(app()->getLocale() === 'ar' ? 'الفلاتر' : 'Filters')
                    ->counts('filters')
                    ->badge()
                    ->color('warning'),
                Tables\Columns\IconColumn::make('is_exportable')
                    ->label(app()->getLocale() === 'ar' ? 'قابل للتصدير' : 'Exportable')
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
                Tables\Filters\SelectFilter::make('data_source')
                    ->label(app()->getLocale() === 'ar' ? 'مصدر البيانات' : 'Data Source')
                    ->options(self::getAvailableDataSources()),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label(__('filament.fields.is_active')),
                Tables\Filters\TernaryFilter::make('is_exportable')
                    ->label(app()->getLocale() === 'ar' ? 'قابل للتصدير' : 'Exportable'),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->label(app()->getLocale() === 'ar' ? 'عرض' : 'View'),
                    Tables\Actions\EditAction::make()
                        ->label(app()->getLocale() === 'ar' ? 'تعديل' : 'Edit'),
                    Tables\Actions\Action::make('add_columns')
                        ->label(app()->getLocale() === 'ar' ? 'إضافة أعمدة' : 'Add Columns')
                        ->icon('heroicon-o-plus-circle')
                        ->url(fn (DynamicTable $record): string => static::getUrl('edit', ['record' => $record]) . '#relationManager=columns')
                        ->color('success'),
                    Tables\Actions\Action::make('preview')
                        ->label(app()->getLocale() === 'ar' ? 'معاينة' : 'Preview')
                        ->icon('heroicon-o-eye')
                        ->url(fn (DynamicTable $record): string => "/api/dynamic-tables/{$record->code}/preview")
                        ->openUrlInNewTab(),
                    Tables\Actions\Action::make('duplicate')
                        ->label(app()->getLocale() === 'ar' ? 'نسخ' : 'Duplicate')
                        ->icon('heroicon-o-document-duplicate')
                        ->requiresConfirmation()
                        ->action(function (DynamicTable $record) {
                            $newTable = $record->replicate();
                            $newTable->code = $record->code . '_copy_' . time();
                            $newTable->name_en = $record->name_en . ' (Copy)';
                            $newTable->name_ar = $record->name_ar . ' (نسخة)';
                            $newTable->save();

                            foreach ($record->columns as $column) {
                                $newColumn = $column->replicate();
                                $newColumn->table_id = $newTable->id;
                                $newColumn->save();
                            }

                            foreach ($record->filters as $filter) {
                                $newFilter = $filter->replicate();
                                $newFilter->table_id = $newTable->id;
                                $newFilter->save();
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
            ->emptyStateHeading(app()->getLocale() === 'ar' ? 'لا توجد جداول بعد' : 'No tables yet')
            ->emptyStateDescription(app()->getLocale() === 'ar' ? 'أنشئ جدولك الأول لعرض البيانات' : 'Create your first table to display data')
            ->emptyStateIcon('heroicon-o-table-cells')
            ->defaultSort('sort_order')
            ->reorderable('sort_order');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ColumnsRelationManager::class,
            RelationManagers\FiltersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDynamicTables::route('/'),
            'create' => Pages\CreateDynamicTable::route('/create'),
            'view' => Pages\ViewDynamicTable::route('/{record}'),
            'edit' => Pages\EditDynamicTable::route('/{record}/edit'),
        ];
    }
}
