<?php

namespace App\Filament\Widgets;

use App\Models\Student;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LatestStudents extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Student::query()->latest()->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('student_id')
                    ->label('Student ID')
                    ->searchable(),
                Tables\Columns\TextColumn::make('name_en')
                    ->label('Name')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'ACTIVE',
                        'warning' => 'SUSPENDED',
                        'primary' => 'GRADUATED',
                        'danger' => 'WITHDRAWN',
                    ]),
                Tables\Columns\TextColumn::make('program_type')
                    ->badge(),
                Tables\Columns\TextColumn::make('college'),
                Tables\Columns\TextColumn::make('gpa')
                    ->label('GPA'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Enrolled')
                    ->dateTime()
                    ->sortable(),
            ])
            ->paginated(false);
    }
}
