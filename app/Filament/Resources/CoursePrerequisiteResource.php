<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CoursePrerequisiteResource\Pages;
use App\Models\CoursePrerequisite;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CoursePrerequisiteResource extends Resource
{
    protected static ?string $model = CoursePrerequisite::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-path';

    protected static ?int $navigationSort = 4;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.academic_management');
    }

    public static function getModelLabel(): string
    {
        return __('filament.course_prerequisite.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.course_prerequisite.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.prerequisites');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Prerequisite Details')
                    ->schema([
                        Forms\Components\Select::make('course_id')
                            ->relationship('course', 'name_en')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->label('Course'),

                        Forms\Components\Select::make('prerequisite_id')
                            ->relationship('prerequisite', 'name_en')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->label('Prerequisite Course')
                            ->different('course_id'),

                        Forms\Components\Select::make('type')
                            ->options([
                                'REQUIRED' => 'Required',
                                'RECOMMENDED' => 'Recommended',
                                'COREQUISITE' => 'Corequisite',
                            ])
                            ->default('REQUIRED')
                            ->required(),

                        Forms\Components\TextInput::make('minimum_grade')
                            ->placeholder('e.g., C')
                            ->maxLength(5)
                            ->nullable(),

                        Forms\Components\Textarea::make('notes')
                            ->rows(2)
                            ->nullable()
                            ->columnSpanFull(),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('course.code')
                    ->label('Course Code')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('course.name_en')
                    ->label('Course')
                    ->searchable()
                    ->limit(30),

                Tables\Columns\TextColumn::make('prerequisite.code')
                    ->label('Prerequisite Code')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('prerequisite.name_en')
                    ->label('Prerequisite')
                    ->searchable()
                    ->limit(30),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'REQUIRED' => 'danger',
                        'RECOMMENDED' => 'warning',
                        'COREQUISITE' => 'info',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('minimum_grade')
                    ->label('Min Grade')
                    ->placeholder('N/A'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'REQUIRED' => 'Required',
                        'RECOMMENDED' => 'Recommended',
                        'COREQUISITE' => 'Corequisite',
                    ]),

                Tables\Filters\SelectFilter::make('course')
                    ->relationship('course', 'name_en'),
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
            'index' => Pages\ListCoursePrerequisites::route('/'),
            'create' => Pages\CreateCoursePrerequisite::route('/create'),
            'edit' => Pages\EditCoursePrerequisite::route('/{record}/edit'),
        ];
    }
}
