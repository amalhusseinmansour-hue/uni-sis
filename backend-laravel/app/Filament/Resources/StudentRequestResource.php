<?php

namespace App\Filament\Resources;

use App\Filament\Resources\StudentRequestResource\Pages;
use App\Models\StudentRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Illuminate\Database\Eloquent\Builder;

class StudentRequestResource extends Resource
{
    protected static ?string $model = StudentRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?int $navigationSort = 3;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.students');
    }

    public static function getModelLabel(): string
    {
        return 'طلب طالب';
    }

    public static function getPluralModelLabel(): string
    {
        return 'طلبات الطلاب';
    }

    public static function getNavigationLabel(): string
    {
        return 'طلبات الطلاب';
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::pending()->count() ?: null;
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        $count = static::getModel()::pending()->count();
        return $count > 10 ? 'danger' : ($count > 0 ? 'warning' : 'success');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('معلومات الطلب')
                    ->schema([
                        Forms\Components\Select::make('student_id')
                            ->relationship('student', 'student_id')
                            ->getOptionLabelFromRecordUsing(fn ($record) => "{$record->student_id} - {$record->name_ar}")
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit')
                            ->label('الطالب'),

                        Forms\Components\TextInput::make('request_number')
                            ->label('رقم الطلب')
                            ->disabled()
                            ->dehydrated(false),

                        Forms\Components\Select::make('category')
                            ->options([
                                'REGISTRATION' => 'طلبات التسجيل',
                                'SEMESTER' => 'طلبات الفصل',
                                'ACADEMIC' => 'طلبات أكاديمية',
                                'FINANCIAL' => 'طلبات مالية',
                                'GRADUATION' => 'طلبات التخرج',
                                'DOCUMENTS' => 'طلبات وثائق',
                                'OTHER' => 'أخرى',
                            ])
                            ->required()
                            ->reactive()
                            ->label('الفئة'),

                        Forms\Components\Select::make('request_type')
                            ->options(fn (callable $get) => self::getRequestTypeOptions($get('category')))
                            ->required()
                            ->label('نوع الطلب'),

                        Forms\Components\Select::make('status')
                            ->options([
                                'DRAFT' => 'مسودة',
                                'SUBMITTED' => 'تم التقديم',
                                'UNDER_REVIEW' => 'قيد المراجعة',
                                'PENDING_DOCUMENTS' => 'بانتظار مستندات',
                                'PENDING_PAYMENT' => 'بانتظار الدفع',
                                'PENDING_APPROVAL' => 'بانتظار الموافقة',
                                'APPROVED' => 'موافق عليه',
                                'PARTIALLY_APPROVED' => 'موافق جزئياً',
                                'REJECTED' => 'مرفوض',
                                'CANCELLED' => 'ملغي',
                                'COMPLETED' => 'مكتمل',
                                'ON_HOLD' => 'موقوف',
                            ])
                            ->required()
                            ->label('الحالة'),

                        Forms\Components\Select::make('priority')
                            ->options([
                                'LOW' => 'منخفض',
                                'NORMAL' => 'عادي',
                                'HIGH' => 'عالي',
                                'URGENT' => 'عاجل',
                            ])
                            ->default('NORMAL')
                            ->label('الأولوية'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('تفاصيل الطلب')
                    ->schema([
                        Forms\Components\Textarea::make('description')
                            ->label('وصف الطلب')
                            ->rows(3),

                        Forms\Components\Textarea::make('reason')
                            ->label('سبب الطلب')
                            ->rows(3),
                    ])
                    ->columns(1),

                Forms\Components\Section::make('مراجعة المرشد الأكاديمي')
                    ->schema([
                        Forms\Components\Select::make('advisor_decision')
                            ->options([
                                'PENDING' => 'بانتظار المراجعة',
                                'APPROVED' => 'موافق',
                                'REJECTED' => 'مرفوض',
                                'NEEDS_INFO' => 'يحتاج معلومات',
                            ])
                            ->label('قرار المرشد'),

                        Forms\Components\Textarea::make('advisor_notes')
                            ->label('ملاحظات المرشد')
                            ->rows(2),
                    ])
                    ->columns(2)
                    ->collapsible(),

                Forms\Components\Section::make('مراجعة القسم')
                    ->schema([
                        Forms\Components\Select::make('department_decision')
                            ->options([
                                'PENDING' => 'بانتظار المراجعة',
                                'APPROVED' => 'موافق',
                                'REJECTED' => 'مرفوض',
                                'NEEDS_INFO' => 'يحتاج معلومات',
                            ])
                            ->label('قرار القسم'),

                        Forms\Components\Textarea::make('department_notes')
                            ->label('ملاحظات القسم')
                            ->rows(2),
                    ])
                    ->columns(2)
                    ->collapsible(),

                Forms\Components\Section::make('مراجعة العميد')
                    ->schema([
                        Forms\Components\Select::make('dean_decision')
                            ->options([
                                'PENDING' => 'بانتظار المراجعة',
                                'APPROVED' => 'موافق',
                                'REJECTED' => 'مرفوض',
                                'NEEDS_INFO' => 'يحتاج معلومات',
                            ])
                            ->label('قرار العميد'),

                        Forms\Components\Textarea::make('dean_notes')
                            ->label('ملاحظات العميد')
                            ->rows(2),
                    ])
                    ->columns(2)
                    ->collapsible(),

                Forms\Components\Section::make('القرار النهائي')
                    ->schema([
                        Forms\Components\Textarea::make('final_notes')
                            ->label('الملاحظات النهائية')
                            ->rows(2),

                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('سبب الرفض')
                            ->rows(2)
                            ->visible(fn (callable $get) => in_array($get('status'), ['REJECTED', 'PARTIALLY_APPROVED'])),
                    ])
                    ->columns(1)
                    ->collapsible(),
            ]);
    }

    protected static function getRequestTypeOptions(?string $category): array
    {
        $options = [
            'REGISTRATION' => [
                'SECTION_CHANGE' => 'تغيير شعبة',
                'LATE_REGISTRATION' => 'تسجيل متأخر',
                'EXCEPTIONAL_REGISTRATION' => 'تسجيل استثنائي',
                'OVERLOAD_REQUEST' => 'زيادة ساعات',
                'UNDERLOAD_REQUEST' => 'تخفيض ساعات',
            ],
            'SEMESTER' => [
                'SEMESTER_POSTPONE' => 'تأجيل فصل',
                'SEMESTER_WITHDRAWAL' => 'انسحاب من فصل',
                'STUDY_FREEZE' => 'تجميد دراسة',
                'RE_ENROLLMENT' => 'إعادة قيد',
            ],
            'ACADEMIC' => [
                'COURSE_EQUIVALENCY' => 'معادلة مواد',
                'EXAM_RETAKE' => 'إعادة امتحان',
                'GRADE_REVIEW' => 'مراجعة علامة',
                'GRADE_APPEAL' => 'استئناف درجة',
                'GRADUATION_PROJECT' => 'مشروع تخرج',
                'MAJOR_CHANGE' => 'تغيير تخصص',
                'STUDY_PLAN_CHANGE' => 'تغيير خطة',
                'COURSE_WITHDRAWAL' => 'انسحاب من مادة',
                'INCOMPLETE_EXTENSION' => 'تمديد غير مكتمل',
                'ACADEMIC_EXCUSE' => 'عذر أكاديمي',
            ],
            'FINANCIAL' => [
                'FEE_INSTALLMENT' => 'تقسيط رسوم',
                'SCHOLARSHIP_REQUEST' => 'طلب منحة',
                'DISCOUNT_REQUEST' => 'طلب خصم',
                'FINANCIAL_STATEMENT' => 'كشف حساب',
                'REFUND_REQUEST' => 'طلب استرداد',
                'PAYMENT_EXTENSION' => 'تمديد دفع',
            ],
            'GRADUATION' => [
                'GRADUATION_APPLICATION' => 'طلب تخرج',
                'CREDIT_CALCULATION' => 'احتساب ساعات',
                'GRADUATION_CERTIFICATE' => 'شهادة تخرج',
                'WHOM_IT_MAY_CONCERN' => 'لمن يهمه الأمر',
            ],
            'DOCUMENTS' => [
                'OFFICIAL_TRANSCRIPT' => 'كشف درجات رسمي',
                'ENROLLMENT_CERTIFICATE' => 'شهادة قيد',
                'STUDENT_ID_CARD' => 'بطاقة طالب',
                'CERTIFIED_COPY' => 'صورة طبق الأصل',
                'RECOMMENDATION_LETTER' => 'خطاب توصية',
                'EXPERIENCE_LETTER' => 'خطاب خبرة',
            ],
            'OTHER' => [
                'OTHER' => 'أخرى',
            ],
        ];

        return $options[$category] ?? [];
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('request_number')
                    ->label('رقم الطلب')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->color('primary')
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('student.student_id')
                    ->label('رقم الطالب')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('student.name_ar')
                    ->label('اسم الطالب')
                    ->searchable()
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('category')
                    ->label('الفئة')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'REGISTRATION' => 'تسجيل',
                        'SEMESTER' => 'فصل',
                        'ACADEMIC' => 'أكاديمي',
                        'FINANCIAL' => 'مالي',
                        'GRADUATION' => 'تخرج',
                        'DOCUMENTS' => 'وثائق',
                        'OTHER' => 'أخرى',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'REGISTRATION' => 'info',
                        'SEMESTER' => 'warning',
                        'ACADEMIC' => 'primary',
                        'FINANCIAL' => 'success',
                        'GRADUATION' => 'danger',
                        'DOCUMENTS' => 'gray',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('request_type')
                    ->label('نوع الطلب')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('الحالة')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'DRAFT' => 'مسودة',
                        'SUBMITTED' => 'تم التقديم',
                        'UNDER_REVIEW' => 'قيد المراجعة',
                        'PENDING_DOCUMENTS' => 'بانتظار مستندات',
                        'PENDING_PAYMENT' => 'بانتظار الدفع',
                        'PENDING_APPROVAL' => 'بانتظار الموافقة',
                        'APPROVED' => 'موافق عليه',
                        'PARTIALLY_APPROVED' => 'موافق جزئياً',
                        'REJECTED' => 'مرفوض',
                        'CANCELLED' => 'ملغي',
                        'COMPLETED' => 'مكتمل',
                        'ON_HOLD' => 'موقوف',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'DRAFT' => 'gray',
                        'SUBMITTED' => 'info',
                        'UNDER_REVIEW' => 'warning',
                        'PENDING_DOCUMENTS', 'PENDING_PAYMENT', 'PENDING_APPROVAL' => 'warning',
                        'APPROVED', 'COMPLETED' => 'success',
                        'PARTIALLY_APPROVED' => 'info',
                        'REJECTED' => 'danger',
                        'CANCELLED' => 'gray',
                        'ON_HOLD' => 'warning',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('priority')
                    ->label('الأولوية')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'LOW' => 'منخفض',
                        'NORMAL' => 'عادي',
                        'HIGH' => 'عالي',
                        'URGENT' => 'عاجل',
                        default => $state ?? 'عادي',
                    })
                    ->color(fn (?string $state): string => match ($state) {
                        'LOW' => 'gray',
                        'NORMAL' => 'info',
                        'HIGH' => 'warning',
                        'URGENT' => 'danger',
                        default => 'info',
                    }),

                Tables\Columns\TextColumn::make('request_date')
                    ->label('تاريخ الطلب')
                    ->date('Y-m-d')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('تاريخ الإنشاء')
                    ->dateTime('Y-m-d H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('الحالة')
                    ->options([
                        'SUBMITTED' => 'تم التقديم',
                        'UNDER_REVIEW' => 'قيد المراجعة',
                        'PENDING_DOCUMENTS' => 'بانتظار مستندات',
                        'PENDING_PAYMENT' => 'بانتظار الدفع',
                        'PENDING_APPROVAL' => 'بانتظار الموافقة',
                        'APPROVED' => 'موافق عليه',
                        'REJECTED' => 'مرفوض',
                        'COMPLETED' => 'مكتمل',
                    ])
                    ->multiple(),

                Tables\Filters\SelectFilter::make('category')
                    ->label('الفئة')
                    ->options([
                        'REGISTRATION' => 'تسجيل',
                        'SEMESTER' => 'فصل',
                        'ACADEMIC' => 'أكاديمي',
                        'FINANCIAL' => 'مالي',
                        'GRADUATION' => 'تخرج',
                        'DOCUMENTS' => 'وثائق',
                        'OTHER' => 'أخرى',
                    ]),

                Tables\Filters\SelectFilter::make('priority')
                    ->label('الأولوية')
                    ->options([
                        'LOW' => 'منخفض',
                        'NORMAL' => 'عادي',
                        'HIGH' => 'عالي',
                        'URGENT' => 'عاجل',
                    ]),

                Tables\Filters\Filter::make('pending')
                    ->label('الطلبات المعلقة فقط')
                    ->query(fn (Builder $query): Builder => $query->pending()),

                Tables\Filters\Filter::make('urgent')
                    ->label('العاجلة فقط')
                    ->query(fn (Builder $query): Builder => $query->urgent()),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('approve')
                    ->label('موافقة')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('موافقة على الطلب')
                    ->modalDescription('هل أنت متأكد من الموافقة على هذا الطلب؟')
                    ->form([
                        Forms\Components\Textarea::make('approval_notes')
                            ->label('ملاحظات الموافقة')
                            ->rows(3),
                    ])
                    ->action(function (StudentRequest $record, array $data): void {
                        $record->update([
                            'status' => 'APPROVED',
                            'final_decision_by' => auth()->id(),
                            'final_decision_at' => now(),
                            'final_notes' => $data['approval_notes'] ?? null,
                        ]);

                        $record->logAction(
                            auth()->id(),
                            'APPROVED',
                            $record->getOriginal('status'),
                            'APPROVED',
                            $data['approval_notes'] ?? 'تمت الموافقة على الطلب'
                        );

                        Notification::make()
                            ->title('تمت الموافقة على الطلب بنجاح')
                            ->success()
                            ->send();
                    })
                    ->visible(fn (StudentRequest $record): bool => $record->isPending()),

                Tables\Actions\Action::make('reject')
                    ->label('رفض')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('رفض الطلب')
                    ->modalDescription('هل أنت متأكد من رفض هذا الطلب؟')
                    ->form([
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('سبب الرفض')
                            ->required()
                            ->rows(3),
                    ])
                    ->action(function (StudentRequest $record, array $data): void {
                        $record->update([
                            'status' => 'REJECTED',
                            'final_decision_by' => auth()->id(),
                            'final_decision_at' => now(),
                            'rejection_reason' => $data['rejection_reason'],
                        ]);

                        $record->logAction(
                            auth()->id(),
                            'REJECTED',
                            $record->getOriginal('status'),
                            'REJECTED',
                            $data['rejection_reason']
                        );

                        Notification::make()
                            ->title('تم رفض الطلب')
                            ->warning()
                            ->send();
                    })
                    ->visible(fn (StudentRequest $record): bool => $record->isPending()),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('mark_under_review')
                        ->label('تحويل للمراجعة')
                        ->icon('heroicon-o-eye')
                        ->requiresConfirmation()
                        ->action(fn ($records) => $records->each->update(['status' => 'UNDER_REVIEW'])),
                ]),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('معلومات الطلب')
                    ->schema([
                        Infolists\Components\TextEntry::make('request_number')
                            ->label('رقم الطلب')
                            ->copyable(),
                        Infolists\Components\TextEntry::make('student.student_id')
                            ->label('رقم الطالب'),
                        Infolists\Components\TextEntry::make('student.name_ar')
                            ->label('اسم الطالب'),
                        Infolists\Components\TextEntry::make('category')
                            ->label('الفئة')
                            ->badge(),
                        Infolists\Components\TextEntry::make('request_type')
                            ->label('نوع الطلب'),
                        Infolists\Components\TextEntry::make('status')
                            ->label('الحالة')
                            ->badge(),
                        Infolists\Components\TextEntry::make('priority')
                            ->label('الأولوية')
                            ->badge(),
                        Infolists\Components\TextEntry::make('request_date')
                            ->label('تاريخ الطلب')
                            ->date(),
                    ])
                    ->columns(3),

                Infolists\Components\Section::make('تفاصيل الطلب')
                    ->schema([
                        Infolists\Components\TextEntry::make('description')
                            ->label('وصف الطلب')
                            ->columnSpanFull(),
                        Infolists\Components\TextEntry::make('reason')
                            ->label('سبب الطلب')
                            ->columnSpanFull(),
                    ]),

                Infolists\Components\Section::make('سير الموافقات')
                    ->schema([
                        Infolists\Components\TextEntry::make('advisor_decision')
                            ->label('قرار المرشد')
                            ->badge(),
                        Infolists\Components\TextEntry::make('advisor_notes')
                            ->label('ملاحظات المرشد'),
                        Infolists\Components\TextEntry::make('department_decision')
                            ->label('قرار القسم')
                            ->badge(),
                        Infolists\Components\TextEntry::make('department_notes')
                            ->label('ملاحظات القسم'),
                        Infolists\Components\TextEntry::make('dean_decision')
                            ->label('قرار العميد')
                            ->badge(),
                        Infolists\Components\TextEntry::make('dean_notes')
                            ->label('ملاحظات العميد'),
                    ])
                    ->columns(2),

                Infolists\Components\Section::make('القرار النهائي')
                    ->schema([
                        Infolists\Components\TextEntry::make('final_notes')
                            ->label('الملاحظات النهائية')
                            ->columnSpanFull(),
                        Infolists\Components\TextEntry::make('rejection_reason')
                            ->label('سبب الرفض')
                            ->columnSpanFull()
                            ->visible(fn ($record) => $record->status === 'REJECTED'),
                    ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListStudentRequests::route('/'),
            'create' => Pages\CreateStudentRequest::route('/create'),
            'view' => Pages\ViewStudentRequest::route('/{record}'),
            'edit' => Pages\EditStudentRequest::route('/{record}/edit'),
        ];
    }
}
