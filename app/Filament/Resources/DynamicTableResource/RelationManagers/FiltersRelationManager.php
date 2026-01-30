<?php

namespace App\Filament\Resources\DynamicTableResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class FiltersRelationManager extends RelationManager
{
    protected static string $relationship = 'filters';

    protected static ?string $title = 'Table Filters';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Filter Identity')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('filter_key')
                            ->label('Filter Key')
                            ->required()
                            ->alphaDash()
                            ->maxLength(50),
                        Forms\Components\TextInput::make('field_name')
                            ->label('Database Field')
                            ->required()
                            ->maxLength(100),
                        Forms\Components\Select::make('filter_type')
                            ->label('Filter Type')
                            ->required()
                            ->options([
                                'text' => 'Text Search',
                                'select' => 'Select Dropdown',
                                'multiselect' => 'Multi-Select',
                                'date' => 'Date Picker',
                                'date_range' => 'Date Range',
                                'number' => 'Number Input',
                                'number_range' => 'Number Range',
                                'boolean' => 'Yes/No Toggle',
                            ])
                            ->live(),
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
                        Forms\Components\TextInput::make('placeholder_en')
                            ->label('Placeholder (EN)'),
                        Forms\Components\TextInput::make('placeholder_ar')
                            ->label('Placeholder (AR)'),
                    ]),
                Forms\Components\Section::make('Operator & Options')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('operator')
                            ->label('Comparison Operator')
                            ->options([
                                'equals' => 'Equals',
                                'not_equals' => 'Not Equals',
                                'contains' => 'Contains',
                                'starts_with' => 'Starts With',
                                'ends_with' => 'Ends With',
                                'greater_than' => 'Greater Than',
                                'less_than' => 'Less Than',
                                'between' => 'Between',
                                'in' => 'In Array',
                                'not_in' => 'Not In Array',
                                'is_null' => 'Is Null',
                                'is_not_null' => 'Is Not Null',
                                'date_equals' => 'Date Equals',
                                'date_before' => 'Date Before',
                                'date_after' => 'Date After',
                                'date_between' => 'Date Between',
                            ])
                            ->default('equals'),
                        Forms\Components\TextInput::make('default_value')
                            ->label('Default Value'),
                    ]),
                Forms\Components\Section::make('Filter Options')
                    ->description('For Select and Multi-Select filters')
                    ->schema([
                        Forms\Components\Repeater::make('options')
                            ->label('Static Options')
                            ->schema([
                                Forms\Components\TextInput::make('value')
                                    ->label('Value')
                                    ->required(),
                                Forms\Components\TextInput::make('label_en')
                                    ->label('Label (EN)')
                                    ->required(),
                                Forms\Components\TextInput::make('label_ar')
                                    ->label('Label (AR)'),
                            ])
                            ->columns(3)
                            ->defaultItems(0)
                            ->collapsible(),
                        Forms\Components\TextInput::make('options_source')
                            ->label('Dynamic Options Source')
                            ->placeholder('table_name:value_field,label_field')
                            ->helperText('Load options from database'),
                    ]),
                Forms\Components\Section::make('Display Settings')
                    ->columns(3)
                    ->schema([
                        Forms\Components\Toggle::make('is_visible')
                            ->label('Visible')
                            ->default(true),
                        Forms\Components\Toggle::make('is_required')
                            ->label('Required')
                            ->default(false),
                        Forms\Components\TextInput::make('sort_order')
                            ->label('Sort Order')
                            ->numeric()
                            ->default(0),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('label_en')
            ->columns([
                Tables\Columns\TextColumn::make('filter_key')
                    ->label('Key')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('field_name')
                    ->label('Field')
                    ->searchable(),
                Tables\Columns\TextColumn::make('label_en')
                    ->label('Label')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('filter_type')
                    ->label('Type')
                    ->colors([
                        'primary' => 'text',
                        'success' => fn ($state) => in_array($state, ['select', 'multiselect']),
                        'warning' => fn ($state) => in_array($state, ['date', 'date_range']),
                        'info' => fn ($state) => in_array($state, ['number', 'number_range']),
                        'danger' => 'boolean',
                    ]),
                Tables\Columns\TextColumn::make('operator')
                    ->label('Operator')
                    ->badge()
                    ->color('gray'),
                Tables\Columns\IconColumn::make('is_visible')
                    ->label('Visible')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_required')
                    ->label('Required')
                    ->boolean(),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('filter_type')
                    ->options([
                        'text' => 'Text',
                        'select' => 'Select',
                        'date' => 'Date',
                        'boolean' => 'Boolean',
                    ]),
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
