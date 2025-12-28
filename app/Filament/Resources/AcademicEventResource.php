<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AcademicEventResource\Pages;
use App\Models\AcademicEvent;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AcademicEventResource extends Resource
{
    protected static ?string $model = AcademicEvent::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar';

    protected static ?int $navigationSort = 6;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.academic_management');
    }

    public static function getModelLabel(): string
    {
        return __('filament.academic_event.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.academic_event.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.academic_events');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Event Details')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\Textarea::make('description')
                            ->rows(3)
                            ->nullable(),

                        Forms\Components\Select::make('semester_id')
                            ->relationship('semester', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable(),

                        Forms\Components\Select::make('type')
                            ->options([
                                'REGISTRATION' => 'Registration',
                                'CLASSES_START' => 'Classes Start',
                                'CLASSES_END' => 'Classes End',
                                'EXAM_PERIOD' => 'Exam Period',
                                'MIDTERM_EXAM' => 'Midterm Exam',
                                'FINAL_EXAM' => 'Final Exam',
                                'HOLIDAY' => 'Holiday',
                                'BREAK' => 'Break',
                                'DEADLINE' => 'Deadline',
                                'EVENT' => 'Event',
                                'OTHER' => 'Other',
                            ])
                            ->required(),

                        Forms\Components\DatePicker::make('start_date')
                            ->required(),

                        Forms\Components\DatePicker::make('end_date')
                            ->nullable()
                            ->afterOrEqual('start_date'),

                        Forms\Components\Toggle::make('is_holiday')
                            ->default(false),

                        Forms\Components\Toggle::make('is_all_day')
                            ->default(true),

                        Forms\Components\ColorPicker::make('color')
                            ->nullable(),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'REGISTRATION' => 'info',
                        'CLASSES_START', 'CLASSES_END' => 'success',
                        'EXAM_PERIOD', 'MIDTERM_EXAM', 'FINAL_EXAM' => 'warning',
                        'HOLIDAY', 'BREAK' => 'danger',
                        'DEADLINE' => 'primary',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('start_date')
                    ->date()
                    ->sortable(),

                Tables\Columns\TextColumn::make('end_date')
                    ->date()
                    ->sortable(),

                Tables\Columns\TextColumn::make('semester.name')
                    ->label('Semester')
                    ->sortable(),

                Tables\Columns\IconColumn::make('is_holiday')
                    ->boolean(),

                Tables\Columns\ColorColumn::make('color'),
            ])
            ->defaultSort('start_date', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('semester')
                    ->relationship('semester', 'name'),

                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'REGISTRATION' => 'Registration',
                        'CLASSES_START' => 'Classes Start',
                        'CLASSES_END' => 'Classes End',
                        'EXAM_PERIOD' => 'Exam Period',
                        'HOLIDAY' => 'Holiday',
                        'BREAK' => 'Break',
                        'DEADLINE' => 'Deadline',
                    ]),

                Tables\Filters\TernaryFilter::make('is_holiday'),
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
            'index' => Pages\ListAcademicEvents::route('/'),
            'create' => Pages\CreateAcademicEvent::route('/create'),
            'edit' => Pages\EditAcademicEvent::route('/{record}/edit'),
        ];
    }
}
