<?php

namespace App\Filament\Resources\DynamicReportResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class FieldsRelationManager extends RelationManager
{
    protected static string $relationship = 'fields';

    protected static ?string $title = 'Report Fields';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Field Identity')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('field_key')
                            ->label('Field Key')
                            ->required()
                            ->alphaDash()
                            ->maxLength(50),
                        Forms\Components\TextInput::make('field_name')
                            ->label('Database Field')
                            ->required()
                            ->maxLength(100)
                            ->helperText('Column name or relation.column'),
                        Forms\Components\Select::make('data_type')
                            ->label('Data Type')
                            ->options([
                                'text' => 'Text',
                                'number' => 'Number',
                                'decimal' => 'Decimal',
                                'currency' => 'Currency',
                                'percentage' => 'Percentage',
                                'date' => 'Date',
                                'datetime' => 'Date & Time',
                                'boolean' => 'Boolean',
                            ])
                            ->default('text'),
                    ]),
                Forms\Components\Section::make('Labels')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('label_en')
                            ->label('Label (English)')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('label_ar')
                            ->label('Label (Arabic)')
                            ->required()
                            ->maxLength(255),
                    ]),
                Forms\Components\Section::make('Aggregation')
                    ->columns(3)
                    ->schema([
                        Forms\Components\Select::make('aggregation')
                            ->label('Aggregation Function')
                            ->options([
                                '' => 'None',
                                'sum' => 'Sum',
                                'avg' => 'Average',
                                'count' => 'Count',
                                'min' => 'Minimum',
                                'max' => 'Maximum',
                            ]),
                        Forms\Components\Toggle::make('include_in_total')
                            ->label('Include in Totals')
                            ->default(false),
                        Forms\Components\Toggle::make('include_in_subtotal')
                            ->label('Include in Subtotals')
                            ->default(false),
                    ]),
                Forms\Components\Section::make('Display')
                    ->columns(4)
                    ->schema([
                        Forms\Components\Select::make('align')
                            ->label('Alignment')
                            ->options([
                                'left' => 'Left',
                                'center' => 'Center',
                                'right' => 'Right',
                            ])
                            ->default('left'),
                        Forms\Components\TextInput::make('width')
                            ->label('Width')
                            ->placeholder('auto'),
                        Forms\Components\Toggle::make('is_visible')
                            ->label('Visible')
                            ->default(true),
                        Forms\Components\TextInput::make('sort_order')
                            ->label('Sort Order')
                            ->numeric()
                            ->default(0),
                    ]),
                Forms\Components\Section::make('Formatting')
                    ->schema([
                        Forms\Components\KeyValue::make('format_options')
                            ->label('Format Options')
                            ->keyLabel('Option')
                            ->valueLabel('Value')
                            ->helperText('E.g., decimals: 2, format: Y-m-d, prefix: $'),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('label_en')
            ->columns([
                Tables\Columns\TextColumn::make('field_key')
                    ->label('Key')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('field_name')
                    ->label('Field')
                    ->searchable(),
                Tables\Columns\TextColumn::make('label_en')
                    ->label('Label')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('data_type')
                    ->label('Type'),
                Tables\Columns\TextColumn::make('aggregation')
                    ->label('Aggregation')
                    ->badge()
                    ->color('success'),
                Tables\Columns\TextColumn::make('align')
                    ->label('Align'),
                Tables\Columns\IconColumn::make('is_visible')
                    ->label('Visible')
                    ->boolean(),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('data_type'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\ReplicateAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order');
    }
}
