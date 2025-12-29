<?php

namespace App\Filament\Resources\StudentResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class FinancialRecordsRelationManager extends RelationManager
{
    protected static string $relationship = 'financialRecords';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\DatePicker::make('date')
                    ->required(),
                Forms\Components\TextInput::make('description')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('amount')
                    ->required()
                    ->numeric()
                    ->prefix('$'),
                Forms\Components\Select::make('type')
                    ->options([
                        'DEBIT' => 'Debit',
                        'CREDIT' => 'Credit',
                    ])
                    ->required(),
                Forms\Components\Select::make('status')
                    ->options([
                        'PAID' => 'Paid',
                        'PENDING' => 'Pending',
                        'OVERDUE' => 'Overdue',
                    ])
                    ->required()
                    ->default('PENDING'),
                Forms\Components\TextInput::make('reference_number'),
                Forms\Components\Textarea::make('notes'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('description')
            ->columns([
                Tables\Columns\TextColumn::make('date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('description')
                    ->searchable(),
                Tables\Columns\TextColumn::make('amount')
                    ->money('USD')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('type')
                    ->colors([
                        'danger' => 'DEBIT',
                        'success' => 'CREDIT',
                    ]),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'PAID',
                        'warning' => 'PENDING',
                        'danger' => 'OVERDUE',
                    ]),
                Tables\Columns\TextColumn::make('reference_number')
                    ->searchable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'DEBIT' => 'Debit',
                        'CREDIT' => 'Credit',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'PAID' => 'Paid',
                        'PENDING' => 'Pending',
                        'OVERDUE' => 'Overdue',
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
