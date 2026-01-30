<?php

namespace App\Filament\Resources\StudentResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class EnrollmentsRelationManager extends RelationManager
{
    protected static string $relationship = 'enrollments';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('course_id')
                    ->relationship('course', 'name_en')
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('semester')
                    ->required(),
                Forms\Components\TextInput::make('academic_year')
                    ->required(),
                Forms\Components\TextInput::make('attendance')
                    ->numeric()
                    ->default(0)
                    ->suffix('%'),
                Forms\Components\Select::make('status')
                    ->options([
                        'ENROLLED' => 'Enrolled',
                        'DROPPED' => 'Dropped',
                        'COMPLETED' => 'Completed',
                        'FAILED' => 'Failed',
                    ])
                    ->default('ENROLLED')
                    ->required(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('course.name_en')
            ->columns([
                Tables\Columns\TextColumn::make('course.code')
                    ->label('Course Code')
                    ->sortable(),
                Tables\Columns\TextColumn::make('course.name_en')
                    ->label('Course Name')
                    ->sortable(),
                Tables\Columns\TextColumn::make('semester')
                    ->sortable(),
                Tables\Columns\TextColumn::make('academic_year')
                    ->sortable(),
                Tables\Columns\TextColumn::make('attendance')
                    ->suffix('%')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'primary' => 'ENROLLED',
                        'danger' => 'DROPPED',
                        'success' => 'COMPLETED',
                        'warning' => 'FAILED',
                    ]),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'ENROLLED' => 'Enrolled',
                        'DROPPED' => 'Dropped',
                        'COMPLETED' => 'Completed',
                        'FAILED' => 'Failed',
                    ]),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
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
}
