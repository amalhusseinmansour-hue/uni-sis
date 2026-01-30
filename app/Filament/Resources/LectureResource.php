<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LectureResource\Pages;
use App\Models\Lecture;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Section;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\Filter;
use Illuminate\Database\Eloquent\Builder;

class LectureResource extends Resource
{
    protected static ?string $model = Lecture::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?int $navigationSort = 4;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.academic_management');
    }

    public static function getModelLabel(): string
    {
        return 'محاضرة';
    }

    public static function getPluralModelLabel(): string
    {
        return 'المحاضرات';
    }

    public static function getNavigationLabel(): string
    {
        return 'المحاضرات';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('معلومات المحاضرة الأساسية')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('course_id')
                            ->label('المقرر')
                            ->relationship('course', 'name_ar')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Forms\Components\Select::make('lecturer_id')
                            ->label('المحاضر')
                            ->relationship('lecturer', 'name', fn (Builder $query) => $query->whereIn('role', ['LECTURER', 'ADMIN']))
                            ->searchable()
                            ->preload()
                            ->required(),

                        Forms\Components\Select::make('semester_id')
                            ->label('الفصل الدراسي')
                            ->relationship('semester', 'name_en')
                            ->searchable()
                            ->preload(),

                        Forms\Components\TextInput::make('title_en')
                            ->label('العنوان (إنجليزي)')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('title_ar')
                            ->label('العنوان (عربي)')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\Select::make('type')
                            ->label('نوع المحاضرة')
                            ->options([
                                'REGULAR' => 'عادية',
                                'MAKEUP' => 'تعويضية',
                                'EXTRA' => 'إضافية',
                                'EXAM_REVIEW' => 'مراجعة امتحان',
                                'WORKSHOP' => 'ورشة عمل',
                                'LAB' => 'معمل',
                                'ONLINE' => 'أونلاين',
                            ])
                            ->default('REGULAR')
                            ->required(),

                        Forms\Components\Select::make('mode')
                            ->label('طريقة الحضور')
                            ->options([
                                'IN_PERSON' => 'حضوري',
                                'ONLINE' => 'عن بُعد',
                                'HYBRID' => 'مختلط',
                            ])
                            ->default('IN_PERSON')
                            ->required(),
                    ]),

                Section::make('التوقيت والمكان')
                    ->columns(3)
                    ->schema([
                        Forms\Components\DatePicker::make('lecture_date')
                            ->label('التاريخ')
                            ->required(),

                        Forms\Components\TimePicker::make('start_time')
                            ->label('وقت البداية')
                            ->seconds(false)
                            ->required(),

                        Forms\Components\TimePicker::make('end_time')
                            ->label('وقت النهاية')
                            ->seconds(false)
                            ->required(),

                        Forms\Components\TextInput::make('building')
                            ->label('المبنى')
                            ->maxLength(100),

                        Forms\Components\TextInput::make('room')
                            ->label('القاعة')
                            ->maxLength(100),

                        Forms\Components\TextInput::make('lecture_number')
                            ->label('رقم المحاضرة')
                            ->numeric()
                            ->minValue(1),
                    ]),

                Section::make('روابط المحاضرة الإلكترونية')
                    ->columns(2)
                    ->collapsed()
                    ->schema([
                        Forms\Components\TextInput::make('online_meeting_url')
                            ->label('رابط الاجتماع')
                            ->url()
                            ->maxLength(500),

                        Forms\Components\TextInput::make('online_meeting_id')
                            ->label('معرف الاجتماع')
                            ->maxLength(100),

                        Forms\Components\TextInput::make('online_meeting_password')
                            ->label('كلمة مرور الاجتماع')
                            ->maxLength(50),

                        Forms\Components\TextInput::make('recording_url')
                            ->label('رابط التسجيل')
                            ->url()
                            ->maxLength(500),
                    ]),

                Section::make('الوصف والملاحظات')
                    ->collapsed()
                    ->schema([
                        Forms\Components\Textarea::make('description_en')
                            ->label('الوصف (إنجليزي)')
                            ->rows(3),

                        Forms\Components\Textarea::make('description_ar')
                            ->label('الوصف (عربي)')
                            ->rows(3),

                        Forms\Components\Textarea::make('topics_covered')
                            ->label('المواضيع المغطاة')
                            ->rows(3),

                        Forms\Components\Textarea::make('notes')
                            ->label('ملاحظات')
                            ->rows(3),

                        Forms\Components\Textarea::make('homework_assigned')
                            ->label('الواجبات المعطاة')
                            ->rows(3),
                    ]),

                Section::make('الحالة')
                    ->columns(3)
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->label('الحالة')
                            ->options([
                                'SCHEDULED' => 'مجدولة',
                                'IN_PROGRESS' => 'جارية',
                                'COMPLETED' => 'مكتملة',
                                'CANCELLED' => 'ملغاة',
                                'POSTPONED' => 'مؤجلة',
                            ])
                            ->default('SCHEDULED')
                            ->required(),

                        Forms\Components\TextInput::make('expected_students')
                            ->label('عدد الطلاب المتوقع')
                            ->numeric()
                            ->minValue(0),

                        Forms\Components\TextInput::make('actual_attendance')
                            ->label('الحضور الفعلي')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('lecture_number')
                    ->label('#')
                    ->sortable(),

                Tables\Columns\TextColumn::make('title_ar')
                    ->label('العنوان')
                    ->searchable()
                    ->limit(30),

                Tables\Columns\TextColumn::make('course.name_ar')
                    ->label('المقرر')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('lecturer.name')
                    ->label('المحاضر')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('lecture_date')
                    ->label('التاريخ')
                    ->date('Y-m-d')
                    ->sortable(),

                Tables\Columns\TextColumn::make('start_time')
                    ->label('الوقت')
                    ->time('H:i'),

                Tables\Columns\TextColumn::make('room')
                    ->label('القاعة')
                    ->default('-'),

                Tables\Columns\BadgeColumn::make('type')
                    ->label('النوع')
                    ->colors([
                        'primary' => 'REGULAR',
                        'warning' => 'MAKEUP',
                        'info' => 'EXTRA',
                        'success' => 'LAB',
                        'secondary' => 'ONLINE',
                    ]),

                Tables\Columns\BadgeColumn::make('status')
                    ->label('الحالة')
                    ->colors([
                        'secondary' => 'SCHEDULED',
                        'warning' => 'IN_PROGRESS',
                        'success' => 'COMPLETED',
                        'danger' => 'CANCELLED',
                        'info' => 'POSTPONED',
                    ]),

                Tables\Columns\TextColumn::make('actual_attendance')
                    ->label('الحضور')
                    ->formatStateUsing(fn ($record) => "{$record->actual_attendance} / {$record->expected_students}"),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('تاريخ الإنشاء')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('course')
                    ->label('المقرر')
                    ->relationship('course', 'name_ar'),

                SelectFilter::make('lecturer')
                    ->label('المحاضر')
                    ->relationship('lecturer', 'name'),

                SelectFilter::make('status')
                    ->label('الحالة')
                    ->options([
                        'SCHEDULED' => 'مجدولة',
                        'IN_PROGRESS' => 'جارية',
                        'COMPLETED' => 'مكتملة',
                        'CANCELLED' => 'ملغاة',
                        'POSTPONED' => 'مؤجلة',
                    ]),

                SelectFilter::make('type')
                    ->label('النوع')
                    ->options([
                        'REGULAR' => 'عادية',
                        'MAKEUP' => 'تعويضية',
                        'EXTRA' => 'إضافية',
                        'EXAM_REVIEW' => 'مراجعة',
                        'LAB' => 'معمل',
                        'ONLINE' => 'أونلاين',
                    ]),

                Filter::make('today')
                    ->label('اليوم')
                    ->query(fn (Builder $query) => $query->whereDate('lecture_date', today())),

                Filter::make('this_week')
                    ->label('هذا الأسبوع')
                    ->query(fn (Builder $query) => $query->whereBetween('lecture_date', [now()->startOfWeek(), now()->endOfWeek()])),

                Filter::make('upcoming')
                    ->label('القادمة')
                    ->query(fn (Builder $query) => $query->where('lecture_date', '>=', today())),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('start')
                    ->label('بدء')
                    ->icon('heroicon-o-play')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'SCHEDULED')
                    ->action(fn ($record) => $record->start()),
                Tables\Actions\Action::make('complete')
                    ->label('إنهاء')
                    ->icon('heroicon-o-check')
                    ->color('primary')
                    ->visible(fn ($record) => $record->status === 'IN_PROGRESS')
                    ->action(fn ($record) => $record->complete()),
                Tables\Actions\Action::make('cancel')
                    ->label('إلغاء')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->visible(fn ($record) => in_array($record->status, ['SCHEDULED', 'IN_PROGRESS']))
                    ->requiresConfirmation()
                    ->action(fn ($record) => $record->cancel('تم الإلغاء من لوحة التحكم')),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('lecture_date', 'desc')
            ->defaultPaginationPageOption(25)
            ->deferLoading();
    }

    public static function getRelations(): array
    {
        return [
            LectureResource\RelationManagers\MaterialsRelationManager::class,
            LectureResource\RelationManagers\AttendanceRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLectures::route('/'),
            'create' => Pages\CreateLecture::route('/create'),
            'edit' => Pages\EditLecture::route('/{record}/edit'),
            'view' => Pages\ViewLecture::route('/{record}'),
        ];
    }
}
