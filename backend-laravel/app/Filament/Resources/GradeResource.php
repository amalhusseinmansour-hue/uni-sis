<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GradeResource\Pages;
use App\Filament\Resources\GradeResource\RelationManagers;
use App\Models\Grade;
use App\Models\Semester;
use App\Models\Course;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Filters\SelectFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class GradeResource extends Resource
{
    protected static ?string $model = Grade::class;

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.academic_management');
    }

    public static function getModelLabel(): string
    {
        return __('filament.grade.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.grade.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.grades');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Student & Course')
                    ->schema([
                        Forms\Components\Select::make('student_id')
                            ->relationship('student', 'name_en')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('course_id')
                            ->relationship('course', 'code')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('semester_id')
                            ->relationship('semesterRelation', 'name_en')
                            ->searchable()
                            ->preload(),
                        Forms\Components\TextInput::make('semester')
                            ->required(),
                    ])->columns(2),
                Forms\Components\Section::make('Grades')
                    ->schema([
                        Forms\Components\TextInput::make('midterm')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100),
                        Forms\Components\TextInput::make('final')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100),
                        Forms\Components\TextInput::make('coursework')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100),
                        Forms\Components\TextInput::make('total')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100),
                        Forms\Components\TextInput::make('grade')
                            ->maxLength(5),
                        Forms\Components\TextInput::make('points')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(4),
                    ])->columns(3),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('student.student_id')
                    ->label('Student ID')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('student.name_en')
                    ->label('Student Name')
                    ->searchable()
                    ->sortable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('course.code')
                    ->label('Course')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('semester')
                    ->label('Semester')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('total')
                    ->label('Total')
                    ->numeric(2)
                    ->sortable()
                    ->color(fn ($state) => $state >= 50 ? 'success' : 'danger'),
                Tables\Columns\BadgeColumn::make('grade')
                    ->label('Grade')
                    ->colors([
                        'success' => fn ($state) => in_array($state, ['A+', 'A', 'B+']),
                        'warning' => fn ($state) => in_array($state, ['B', 'C+', 'C']),
                        'danger' => fn ($state) => in_array($state, ['D+', 'D', 'F']),
                    ]),
                Tables\Columns\TextColumn::make('points')
                    ->label('Points')
                    ->numeric(2)
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('midterm')
                    ->label('Midterm')
                    ->numeric(2)
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('final')
                    ->label('Final')
                    ->numeric(2)
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('semester')
                    ->options(fn () => Semester::pluck('name_en', 'name_en')->toArray())
                    ->label('Semester'),
                SelectFilter::make('grade')
                    ->options([
                        'A+' => 'A+',
                        'A' => 'A',
                        'B+' => 'B+',
                        'B' => 'B',
                        'C+' => 'C+',
                        'C' => 'C',
                        'D+' => 'D+',
                        'D' => 'D',
                        'F' => 'F',
                    ])
                    ->label('Grade'),
                Tables\Filters\Filter::make('has_score')
                    ->query(fn (Builder $query): Builder => $query->where('total', '>', 0))
                    ->label('With Scores Only')
                    ->toggle(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
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
            'index' => Pages\ListGrades::route('/'),
            'create' => Pages\CreateGrade::route('/create'),
            'edit' => Pages\EditGrade::route('/{record}/edit'),
        ];
    }
}
