<?php

namespace App\Filament\Resources\LectureResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class AttendanceRelationManager extends RelationManager
{
    protected static string $relationship = 'attendance';

    protected static ?string $title = 'سجل الحضور';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('student_id')
                    ->label('الطالب')
                    ->relationship('student', 'full_name_ar')
                    ->searchable()
                    ->preload()
                    ->required(),

                Forms\Components\Select::make('status')
                    ->label('الحالة')
                    ->options([
                        'PRESENT' => 'حاضر',
                        'ABSENT' => 'غائب',
                        'LATE' => 'متأخر',
                        'EXCUSED' => 'غياب بعذر',
                        'LEFT_EARLY' => 'انصرف مبكراً',
                    ])
                    ->required(),

                Forms\Components\TimePicker::make('check_in_time')
                    ->label('وقت الحضور')
                    ->seconds(false),

                Forms\Components\TimePicker::make('check_out_time')
                    ->label('وقت الانصراف')
                    ->seconds(false),

                Forms\Components\TextInput::make('minutes_late')
                    ->label('دقائق التأخير')
                    ->numeric()
                    ->default(0),

                Forms\Components\Textarea::make('notes')
                    ->label('ملاحظات')
                    ->rows(2),

                Forms\Components\Textarea::make('excuse_reason')
                    ->label('سبب العذر')
                    ->rows(2),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('student.student_id')
                    ->label('الرقم الجامعي')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('student.full_name_ar')
                    ->label('اسم الطالب')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('status')
                    ->label('الحالة')
                    ->colors([
                        'success' => 'PRESENT',
                        'danger' => 'ABSENT',
                        'warning' => 'LATE',
                        'info' => 'EXCUSED',
                        'secondary' => 'LEFT_EARLY',
                    ])
                    ->formatStateUsing(fn ($state) => match($state) {
                        'PRESENT' => 'حاضر',
                        'ABSENT' => 'غائب',
                        'LATE' => 'متأخر',
                        'EXCUSED' => 'بعذر',
                        'LEFT_EARLY' => 'انصرف مبكراً',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('check_in_time')
                    ->label('وقت الحضور')
                    ->time('H:i'),

                Tables\Columns\TextColumn::make('minutes_late')
                    ->label('التأخير')
                    ->formatStateUsing(fn ($state) => $state > 0 ? "{$state} دقيقة" : '-'),

                Tables\Columns\IconColumn::make('verified_by_qr')
                    ->label('QR')
                    ->boolean(),

                Tables\Columns\TextColumn::make('notes')
                    ->label('ملاحظات')
                    ->limit(30)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('الحالة')
                    ->options([
                        'PRESENT' => 'حاضر',
                        'ABSENT' => 'غائب',
                        'LATE' => 'متأخر',
                        'EXCUSED' => 'بعذر',
                        'LEFT_EARLY' => 'انصرف مبكراً',
                    ]),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->mutateFormDataUsing(function (array $data): array {
                        $data['recorded_by'] = auth()->id();
                        return $data;
                    }),
                Tables\Actions\Action::make('initialize')
                    ->label('تهيئة الحضور')
                    ->icon('heroicon-o-users')
                    ->action(function () {
                        $lecture = $this->getOwnerRecord();
                        \App\Models\LectureAttendance::initializeForLecture($lecture);
                    })
                    ->requiresConfirmation()
                    ->modalHeading('تهيئة سجلات الحضور')
                    ->modalDescription('سيتم إنشاء سجلات حضور لجميع الطلاب المسجلين في المقرر. هل تريد المتابعة؟'),
                Tables\Actions\Action::make('mark_all_present')
                    ->label('تحديد الكل حاضر')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->action(function () {
                        $this->getOwnerRecord()->attendance()->update(['status' => 'PRESENT', 'check_in_time' => now()]);
                    })
                    ->requiresConfirmation(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('present')
                    ->label('حاضر')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->action(fn ($record) => $record->update(['status' => 'PRESENT', 'check_in_time' => now()])),
                Tables\Actions\Action::make('absent')
                    ->label('غائب')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->action(fn ($record) => $record->update(['status' => 'ABSENT'])),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('mark_present')
                        ->label('تحديد حاضر')
                        ->icon('heroicon-o-check')
                        ->action(fn ($records) => $records->each(fn ($r) => $r->update(['status' => 'PRESENT', 'check_in_time' => now()]))),
                    Tables\Actions\BulkAction::make('mark_absent')
                        ->label('تحديد غائب')
                        ->icon('heroicon-o-x-mark')
                        ->action(fn ($records) => $records->each(fn ($r) => $r->update(['status' => 'ABSENT']))),
                ]),
            ]);
    }
}
