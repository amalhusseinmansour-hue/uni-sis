<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FinancialRecordResource\Pages;
use App\Models\FinancialRecord;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FinancialRecordResource extends Resource
{
    protected static ?string $model = FinancialRecord::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?int $navigationSort = 1;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.finance');
    }

    public static function getModelLabel(): string
    {
        return __('filament.financial_record.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.financial_record.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.financial_records');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Financial Record')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('student_id')
                            ->relationship('student', 'name_en')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\DatePicker::make('date')
                            ->required()
                            ->default(now()),
                        Forms\Components\TextInput::make('description')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('amount')
                            ->required()
                            ->numeric()
                            ->prefix('$'),
                        Forms\Components\Select::make('type')
                            ->options([
                                'DEBIT' => 'Debit (Charge)',
                                'CREDIT' => 'Credit (Payment)',
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
                        Forms\Components\TextInput::make('reference_number')
                            ->maxLength(50),
                        Forms\Components\Textarea::make('notes')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
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
                Tables\Columns\TextColumn::make('date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('description')
                    ->searchable()
                    ->limit(30),
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
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
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
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('mark_paid')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->status !== 'PAID')
                    ->action(fn ($record) => $record->update(['status' => 'PAID'])),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('date', 'desc');
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
            'index' => Pages\ListFinancialRecords::route('/'),
            'create' => Pages\CreateFinancialRecord::route('/create'),
            'edit' => Pages\EditFinancialRecord::route('/{record}/edit'),
        ];
    }
}
