<?php

namespace App\Filament\Resources\ScholarshipResource\RelationManagers;

use App\Models\Student;
use App\Models\StudentScholarship;
use App\Services\FinanceService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;

class StudentsRelationManager extends RelationManager
{
    protected static string $relationship = 'studentScholarships';

    protected static ?string $title = 'Scholarship Recipients';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('student_id')
                    ->label('Student')
                    ->options(Student::where('status', 'ACTIVE')->pluck('name_en', 'id'))
                    ->searchable()
                    ->required(),

                Forms\Components\Select::make('status')
                    ->options([
                        'PENDING' => 'Pending',
                        'APPROVED' => 'Approved',
                        'ACTIVE' => 'Active',
                        'SUSPENDED' => 'Suspended',
                        'COMPLETED' => 'Completed',
                    ])
                    ->default('PENDING')
                    ->required(),

                Forms\Components\DatePicker::make('start_date')
                    ->default(now()),

                Forms\Components\DatePicker::make('end_date'),

                Forms\Components\TextInput::make('awarded_amount')
                    ->numeric()
                    ->prefix('$'),

                Forms\Components\Textarea::make('application_notes')
                    ->rows(2),

                Forms\Components\Textarea::make('approval_notes')
                    ->rows(2),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('student.name_en')
                    ->label('Student')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('student.student_id')
                    ->label('Student ID')
                    ->searchable(),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'PENDING',
                        'info' => 'APPROVED',
                        'success' => 'ACTIVE',
                        'danger' => 'SUSPENDED',
                        'gray' => 'COMPLETED',
                    ]),

                Tables\Columns\TextColumn::make('awarded_amount')
                    ->money('USD'),

                Tables\Columns\TextColumn::make('disbursed_amount')
                    ->money('USD'),

                Tables\Columns\TextColumn::make('semesters_used')
                    ->label('Semesters'),

                Tables\Columns\TextColumn::make('start_date')
                    ->date(),

                Tables\Columns\TextColumn::make('approved_at')
                    ->dateTime()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'PENDING' => 'Pending',
                        'APPROVED' => 'Approved',
                        'ACTIVE' => 'Active',
                        'SUSPENDED' => 'Suspended',
                    ]),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Add Recipient'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),

                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'PENDING')
                    ->requiresConfirmation()
                    ->action(function ($record) {
                        $record->approve(auth()->user());
                        Notification::make()
                            ->title('Scholarship Approved')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\Action::make('activate')
                    ->label('Activate')
                    ->icon('heroicon-o-play')
                    ->color('primary')
                    ->visible(fn ($record) => $record->status === 'APPROVED')
                    ->action(function ($record) {
                        $record->activate();
                        Notification::make()
                            ->title('Scholarship Activated')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\Action::make('suspend')
                    ->label('Suspend')
                    ->icon('heroicon-o-pause')
                    ->color('warning')
                    ->visible(fn ($record) => $record->status === 'ACTIVE')
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->required(),
                    ])
                    ->action(function ($record, array $data) {
                        $record->suspend($data['reason']);
                        Notification::make()
                            ->title('Scholarship Suspended')
                            ->warning()
                            ->send();
                    }),

                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
