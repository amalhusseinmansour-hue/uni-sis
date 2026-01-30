<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ScheduleResource\Pages;
use App\Models\Schedule;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ScheduleResource extends Resource
{
    protected static ?string $model = Schedule::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?int $navigationSort = 5;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.academic_management');
    }

    public static function getModelLabel(): string
    {
        return __('filament.schedule.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.schedule.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.schedules');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Schedule Details')
                    ->schema([
                        Forms\Components\Select::make('course_id')
                            ->relationship('course', 'name_en')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Forms\Components\Select::make('semester_id')
                            ->relationship('semester', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Forms\Components\Select::make('instructor_id')
                            ->relationship('instructor', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable(),

                        Forms\Components\Select::make('day_of_week')
                            ->options([
                                'SUNDAY' => 'Sunday',
                                'MONDAY' => 'Monday',
                                'TUESDAY' => 'Tuesday',
                                'WEDNESDAY' => 'Wednesday',
                                'THURSDAY' => 'Thursday',
                                'FRIDAY' => 'Friday',
                                'SATURDAY' => 'Saturday',
                            ])
                            ->required(),

                        Forms\Components\TimePicker::make('start_time')
                            ->required(),

                        Forms\Components\TimePicker::make('end_time')
                            ->required()
                            ->after('start_time'),

                        Forms\Components\TextInput::make('room')
                            ->maxLength(50)
                            ->nullable(),

                        Forms\Components\TextInput::make('building')
                            ->maxLength(100)
                            ->nullable(),

                        Forms\Components\Select::make('type')
                            ->options([
                                'LECTURE' => 'Lecture',
                                'LAB' => 'Lab',
                                'TUTORIAL' => 'Tutorial',
                                'SEMINAR' => 'Seminar',
                            ])
                            ->default('LECTURE')
                            ->required(),

                        Forms\Components\TextInput::make('section')
                            ->maxLength(10)
                            ->nullable(),

                        Forms\Components\TextInput::make('capacity')
                            ->numeric()
                            ->nullable(),

                        Forms\Components\Toggle::make('is_active')
                            ->default(true),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('course.name_en')
                    ->label('Course')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('semester.name')
                    ->label('Semester')
                    ->sortable(),

                Tables\Columns\TextColumn::make('day_of_week')
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('start_time')
                    ->time('H:i'),

                Tables\Columns\TextColumn::make('end_time')
                    ->time('H:i'),

                Tables\Columns\TextColumn::make('room')
                    ->searchable(),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'LECTURE' => 'info',
                        'LAB' => 'success',
                        'TUTORIAL' => 'warning',
                        'SEMINAR' => 'danger',
                        default => 'gray',
                    }),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),

                Tables\Columns\TextColumn::make('instructor.name')
                    ->label('Instructor')
                    ->searchable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('semester')
                    ->relationship('semester', 'name'),

                Tables\Filters\SelectFilter::make('day_of_week')
                    ->options([
                        'SUNDAY' => 'Sunday',
                        'MONDAY' => 'Monday',
                        'TUESDAY' => 'Tuesday',
                        'WEDNESDAY' => 'Wednesday',
                        'THURSDAY' => 'Thursday',
                    ]),

                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'LECTURE' => 'Lecture',
                        'LAB' => 'Lab',
                        'TUTORIAL' => 'Tutorial',
                        'SEMINAR' => 'Seminar',
                    ]),

                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSchedules::route('/'),
            'create' => Pages\CreateSchedule::route('/create'),
            'edit' => Pages\EditSchedule::route('/{record}/edit'),
        ];
    }
}
