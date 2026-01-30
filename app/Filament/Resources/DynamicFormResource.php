<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DynamicFormResource\Pages;
use App\Filament\Resources\DynamicFormResource\RelationManagers;
use App\Models\DynamicForm;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class DynamicFormResource extends Resource
{
    protected static ?string $model = DynamicForm::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?int $navigationSort = 1;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.dynamic_content');
    }

    public static function getModelLabel(): string
    {
        return __('filament.dynamic_form.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.dynamic_form.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.dynamic_forms');
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    /**
     * Get form templates for quick start
     */
    public static function getFormTemplates(): array
    {
        return [
            'blank' => [
                'name' => app()->getLocale() === 'ar' ? 'نموذج فارغ' : 'Blank Form',
                'description' => app()->getLocale() === 'ar' ? 'ابدأ من الصفر' : 'Start from scratch',
                'icon' => 'heroicon-o-document',
                'color' => 'gray',
                'settings' => [],
            ],
            'student_request' => [
                'name' => app()->getLocale() === 'ar' ? 'طلب طالب' : 'Student Request',
                'description' => app()->getLocale() === 'ar' ? 'نموذج لطلبات الطلاب' : 'Form for student requests',
                'icon' => 'heroicon-o-academic-cap',
                'color' => 'primary',
                'settings' => [
                    'category' => 'services',
                    'requires_auth' => true,
                    'allowed_roles' => ['STUDENT'],
                ],
            ],
            'admission' => [
                'name' => app()->getLocale() === 'ar' ? 'طلب قبول' : 'Admission Application',
                'description' => app()->getLocale() === 'ar' ? 'نموذج التقديم للجامعة' : 'University application form',
                'icon' => 'heroicon-o-user-plus',
                'color' => 'success',
                'settings' => [
                    'category' => 'admission',
                    'requires_auth' => false,
                ],
            ],
            'survey' => [
                'name' => app()->getLocale() === 'ar' ? 'استبيان' : 'Survey',
                'description' => app()->getLocale() === 'ar' ? 'نموذج استطلاع رأي' : 'Opinion survey form',
                'icon' => 'heroicon-o-clipboard-document-list',
                'color' => 'warning',
                'settings' => [
                    'category' => 'survey',
                    'requires_auth' => true,
                ],
            ],
            'registration' => [
                'name' => app()->getLocale() === 'ar' ? 'تسجيل مقررات' : 'Course Registration',
                'description' => app()->getLocale() === 'ar' ? 'نموذج تسجيل المقررات' : 'Course enrollment form',
                'icon' => 'heroicon-o-book-open',
                'color' => 'info',
                'settings' => [
                    'category' => 'registration',
                    'requires_auth' => true,
                    'allowed_roles' => ['STUDENT'],
                ],
            ],
        ];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // Step 1: Template Selection with Visual Cards
                Forms\Components\Wizard::make([
                    Forms\Components\Wizard\Step::make('template')
                        ->label(app()->getLocale() === 'ar' ? 'اختر قالب' : 'Choose Template')
                        ->description(app()->getLocale() === 'ar' ? 'ابدأ بقالب جاهز أو من الصفر' : 'Start with a template or from scratch')
                        ->icon('heroicon-o-squares-2x2')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'القوالب المتاحة' : 'Available Templates')
                                ->description(app()->getLocale() === 'ar' ? 'اختر قالبًا للبدء بسرعة' : 'Choose a template to get started quickly')
                                ->schema([
                                    Forms\Components\Radio::make('template')
                                        ->label('')
                                        ->options([
                                            'blank' => app()->getLocale() === 'ar' ? '📄 نموذج فارغ - ابدأ من الصفر' : '📄 Blank Form - Start from scratch',
                                            'student_request' => app()->getLocale() === 'ar' ? '🎓 طلب طالب - نموذج لطلبات الطلاب' : '🎓 Student Request - Form for student requests',
                                            'admission' => app()->getLocale() === 'ar' ? '👤 طلب قبول - نموذج التقديم للجامعة' : '👤 Admission Application - University application form',
                                            'survey' => app()->getLocale() === 'ar' ? '📋 استبيان - نموذج استطلاع رأي' : '📋 Survey - Opinion survey form',
                                            'registration' => app()->getLocale() === 'ar' ? '📚 تسجيل مقررات - نموذج تسجيل المقررات' : '📚 Course Registration - Course enrollment form',
                                        ])
                                        ->default('blank')
                                        ->live()
                                        ->afterStateUpdated(function (Forms\Get $get, Forms\Set $set, ?string $state) {
                                            $templates = self::getFormTemplates();
                                            if (isset($templates[$state]) && $state !== 'blank') {
                                                $settings = $templates[$state]['settings'];
                                                foreach ($settings as $key => $value) {
                                                    $set($key, $value);
                                                }
                                            }
                                        }),
                                ]),
                        ]),

                    // Step 2: Basic Information
                    Forms\Components\Wizard\Step::make('basic_info')
                        ->label(app()->getLocale() === 'ar' ? 'المعلومات الأساسية' : 'Basic Information')
                        ->description(app()->getLocale() === 'ar' ? 'أدخل اسم ووصف النموذج' : 'Enter form name and description')
                        ->icon('heroicon-o-information-circle')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'هوية النموذج' : 'Form Identity')
                                ->description(app()->getLocale() === 'ar' ? 'هذه المعلومات ستظهر للمستخدمين' : 'This information will be visible to users')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\TextInput::make('code')
                                        ->label(app()->getLocale() === 'ar' ? 'الكود' : 'Code')
                                        ->helperText(app()->getLocale() === 'ar' ? 'معرف فريد للنموذج (حروف وأرقام فقط)' : 'Unique identifier (letters and numbers only)')
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
                                        ->helperText(app()->getLocale() === 'ar' ? 'يساعد في تنظيم النماذج' : 'Helps organize your forms')
                                        ->options([
                                            'admission' => app()->getLocale() === 'ar' ? 'القبول' : 'Admission',
                                            'registration' => app()->getLocale() === 'ar' ? 'التسجيل' : 'Registration',
                                            'academic' => app()->getLocale() === 'ar' ? 'أكاديمي' : 'Academic',
                                            'financial' => app()->getLocale() === 'ar' ? 'مالي' : 'Financial',
                                            'services' => app()->getLocale() === 'ar' ? 'خدمات' : 'Services',
                                            'survey' => app()->getLocale() === 'ar' ? 'استبيان' : 'Survey',
                                            'other' => app()->getLocale() === 'ar' ? 'أخرى' : 'Other',
                                        ])
                                        ->searchable()
                                        ->required(),
                                    Forms\Components\TextInput::make('name_en')
                                        ->label(app()->getLocale() === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)')
                                        ->required()
                                        ->maxLength(255)
                                        ->placeholder('e.g., Student Leave Request'),
                                    Forms\Components\TextInput::make('name_ar')
                                        ->label(app()->getLocale() === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)')
                                        ->required()
                                        ->maxLength(255)
                                        ->placeholder('مثال: طلب إجازة طالب'),
                                    Forms\Components\Textarea::make('description_en')
                                        ->label(app()->getLocale() === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)')
                                        ->rows(2)
                                        ->placeholder('Brief description of what this form is for...'),
                                    Forms\Components\Textarea::make('description_ar')
                                        ->label(app()->getLocale() === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)')
                                        ->rows(2)
                                        ->placeholder('وصف مختصر عن الغرض من هذا النموذج...'),
                                ]),
                        ]),

                    // Step 3: Settings (Simplified)
                    Forms\Components\Wizard\Step::make('settings')
                        ->label(app()->getLocale() === 'ar' ? 'الإعدادات' : 'Settings')
                        ->description(app()->getLocale() === 'ar' ? 'تحكم في سلوك النموذج' : 'Control form behavior')
                        ->icon('heroicon-o-cog-6-tooth')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'إعدادات النموذج' : 'Form Settings')
                                ->description(app()->getLocale() === 'ar' ? 'الإعدادات الأساسية للنموذج' : 'Basic form configuration')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\Toggle::make('is_active')
                                        ->label(app()->getLocale() === 'ar' ? 'نشط' : 'Active')
                                        ->helperText(app()->getLocale() === 'ar' ? 'هل النموذج متاح للاستخدام؟' : 'Is this form available for use?')
                                        ->default(true)
                                        ->inline(false),
                                    Forms\Components\Toggle::make('requires_auth')
                                        ->label(app()->getLocale() === 'ar' ? 'يتطلب تسجيل دخول' : 'Requires Login')
                                        ->helperText(app()->getLocale() === 'ar' ? 'هل يجب أن يكون المستخدم مسجلاً؟' : 'Must user be logged in?')
                                        ->default(true)
                                        ->inline(false),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'من يمكنه استخدام هذا النموذج؟' : 'Who can use this form?')
                                ->description(app()->getLocale() === 'ar' ? 'اتركه فارغًا للسماح للجميع' : 'Leave empty to allow everyone')
                                ->schema([
                                    Forms\Components\CheckboxList::make('allowed_roles')
                                        ->label('')
                                        ->options([
                                            'ADMIN' => app()->getLocale() === 'ar' ? '👑 المدير' : '👑 Admin',
                                            'FINANCE' => app()->getLocale() === 'ar' ? '💰 المالية' : '💰 Finance',
                                            'LECTURER' => app()->getLocale() === 'ar' ? '👨‍🏫 المحاضر' : '👨‍🏫 Lecturer',
                                            'STUDENT' => app()->getLocale() === 'ar' ? '🎓 الطالب' : '🎓 Student',
                                        ])
                                        ->columns(4),
                                ]),
                        ]),

                    // Step 4: Advanced (Optional, Collapsed)
                    Forms\Components\Wizard\Step::make('advanced')
                        ->label(app()->getLocale() === 'ar' ? 'خيارات متقدمة' : 'Advanced Options')
                        ->description(app()->getLocale() === 'ar' ? 'إعدادات إضافية (اختياري)' : 'Additional settings (optional)')
                        ->icon('heroicon-o-wrench-screwdriver')
                        ->schema([
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'مصدر البيانات' : 'Data Source')
                                ->description(app()->getLocale() === 'ar' ? 'حدد أين تُخزن البيانات (اختياري)' : 'Specify where data is stored (optional)')
                                ->collapsed()
                                ->schema([
                                    Forms\Components\TextInput::make('target_table')
                                        ->label(app()->getLocale() === 'ar' ? 'جدول قاعدة البيانات' : 'Database Table')
                                        ->helperText(app()->getLocale() === 'ar' ? 'اسم الجدول لحفظ البيانات' : 'Table name to store submissions'),
                                    Forms\Components\TextInput::make('target_model')
                                        ->label(app()->getLocale() === 'ar' ? 'نموذج Laravel' : 'Laravel Model')
                                        ->placeholder('App\\Models\\ModelName')
                                        ->helperText(app()->getLocale() === 'ar' ? 'المسار الكامل للنموذج' : 'Full model class path'),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'سير العمل' : 'Workflow')
                                ->description(app()->getLocale() === 'ar' ? 'إضافة خطوات تلقائية بعد الإرسال' : 'Add automatic steps after submission')
                                ->collapsed()
                                ->schema([
                                    Forms\Components\Repeater::make('workflow')
                                        ->label(app()->getLocale() === 'ar' ? 'خطوات سير العمل' : 'Workflow Steps')
                                        ->schema([
                                            Forms\Components\TextInput::make('step')
                                                ->label(app()->getLocale() === 'ar' ? 'اسم الخطوة' : 'Step Name')
                                                ->required(),
                                            Forms\Components\Select::make('action')
                                                ->label(app()->getLocale() === 'ar' ? 'الإجراء' : 'Action')
                                                ->options([
                                                    'notify_email' => app()->getLocale() === 'ar' ? 'إرسال بريد إلكتروني' : 'Send Email',
                                                    'notify_system' => app()->getLocale() === 'ar' ? 'إشعار في النظام' : 'System Notification',
                                                    'update_status' => app()->getLocale() === 'ar' ? 'تحديث الحالة' : 'Update Status',
                                                ])
                                                ->required(),
                                        ])
                                        ->columns(2)
                                        ->defaultItems(0)
                                        ->addActionLabel(app()->getLocale() === 'ar' ? 'إضافة خطوة' : 'Add Step'),
                                ]),
                            Forms\Components\Section::make(app()->getLocale() === 'ar' ? 'إعدادات إضافية' : 'Additional Settings')
                                ->collapsed()
                                ->schema([
                                    Forms\Components\TextInput::make('sort_order')
                                        ->label(app()->getLocale() === 'ar' ? 'ترتيب العرض' : 'Display Order')
                                        ->numeric()
                                        ->default(0),
                                    Forms\Components\KeyValue::make('settings')
                                        ->label(app()->getLocale() === 'ar' ? 'إعدادات مخصصة' : 'Custom Settings')
                                        ->keyLabel(app()->getLocale() === 'ar' ? 'المفتاح' : 'Key')
                                        ->valueLabel(app()->getLocale() === 'ar' ? 'القيمة' : 'Value')
                                        ->addActionLabel(app()->getLocale() === 'ar' ? 'إضافة إعداد' : 'Add Setting'),
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
                    ->description(fn (DynamicForm $record): string => $record->description_en ?? ''),
                Tables\Columns\TextColumn::make('name_ar')
                    ->label(__('filament.fields.name_ar'))
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\BadgeColumn::make('category')
                    ->label(__('filament.fields.category'))
                    ->colors([
                        'primary' => 'admission',
                        'success' => 'registration',
                        'warning' => 'academic',
                        'danger' => 'financial',
                        'info' => 'services',
                        'gray' => 'survey',
                    ]),
                Tables\Columns\TextColumn::make('fields_count')
                    ->label(app()->getLocale() === 'ar' ? 'الحقول' : 'Fields')
                    ->counts('fields')
                    ->badge()
                    ->color('success'),
                Tables\Columns\TextColumn::make('submissions_count')
                    ->label(app()->getLocale() === 'ar' ? 'الإرسالات' : 'Submissions')
                    ->counts('submissions')
                    ->badge()
                    ->color('warning'),
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
                        'admission' => app()->getLocale() === 'ar' ? 'القبول' : 'Admission',
                        'registration' => app()->getLocale() === 'ar' ? 'التسجيل' : 'Registration',
                        'academic' => app()->getLocale() === 'ar' ? 'أكاديمي' : 'Academic',
                        'financial' => app()->getLocale() === 'ar' ? 'مالي' : 'Financial',
                        'services' => app()->getLocale() === 'ar' ? 'خدمات' : 'Services',
                        'survey' => app()->getLocale() === 'ar' ? 'استبيان' : 'Survey',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label(__('filament.fields.is_active')),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->label(app()->getLocale() === 'ar' ? 'عرض' : 'View'),
                    Tables\Actions\EditAction::make()
                        ->label(app()->getLocale() === 'ar' ? 'تعديل' : 'Edit'),
                    Tables\Actions\Action::make('add_fields')
                        ->label(app()->getLocale() === 'ar' ? 'إضافة حقول' : 'Add Fields')
                        ->icon('heroicon-o-plus-circle')
                        ->url(fn (DynamicForm $record): string => static::getUrl('edit', ['record' => $record]) . '#relationManager=fields')
                        ->color('success'),
                    Tables\Actions\Action::make('duplicate')
                        ->label(app()->getLocale() === 'ar' ? 'نسخ' : 'Duplicate')
                        ->icon('heroicon-o-document-duplicate')
                        ->requiresConfirmation()
                        ->action(function (DynamicForm $record) {
                            $newForm = $record->replicate();
                            $newForm->code = $record->code . '_copy_' . time();
                            $newForm->name_en = $record->name_en . ' (Copy)';
                            $newForm->name_ar = $record->name_ar . ' (نسخة)';
                            $newForm->save();

                            foreach ($record->sections as $section) {
                                $newSection = $section->replicate();
                                $newSection->form_id = $newForm->id;
                                $newSection->save();
                            }

                            foreach ($record->fields as $field) {
                                $newField = $field->replicate();
                                $newField->form_id = $newForm->id;
                                $newField->save();
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
            ->emptyStateHeading(app()->getLocale() === 'ar' ? 'لا توجد نماذج بعد' : 'No forms yet')
            ->emptyStateDescription(app()->getLocale() === 'ar' ? 'أنشئ نموذجك الأول للبدء' : 'Create your first form to get started')
            ->emptyStateIcon('heroicon-o-document-text')
            ->defaultSort('sort_order')
            ->reorderable('sort_order');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\SectionsRelationManager::class,
            RelationManagers\FieldsRelationManager::class,
            RelationManagers\SubmissionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDynamicForms::route('/'),
            'create' => Pages\CreateDynamicForm::route('/create'),
            'view' => Pages\ViewDynamicForm::route('/{record}'),
            'edit' => Pages\EditDynamicForm::route('/{record}/edit'),
        ];
    }
}
