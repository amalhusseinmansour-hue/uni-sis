<?php

namespace App\Filament\Resources\DynamicReportResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ParametersRelationManager extends RelationManager
{
    protected static string $relationship = 'reportParameters';

    protected static ?string $title = 'Report Parameters';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Parameter Identity')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('param_key')
                            ->label('Parameter Key')
                            ->required()
                            ->alphaDash()
                            ->maxLength(50),
                        Forms\Components\TextInput::make('field_name')
                            ->label('Database Field')
                            ->maxLength(100)
                            ->helperText('Field to filter on'),
                        Forms\Components\Select::make('param_type')
                            ->label('Parameter Type')
                            ->required()
                            ->options([
                                'text' => 'Text Input',
                                'number' => 'Number',
                                'select' => 'Select Dropdown',
                                'multiselect' => 'Multi-Select',
                                'date' => 'Date',
                                'date_range' => 'Date Range',
                                'boolean' => 'Yes/No',
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
                Forms\Components\Section::make('Options')
                    ->description('For Select and Multi-Select parameters')
                    ->visible(fn (Forms\Get $get) => in_array($get('param_type'), ['select', 'multiselect']))
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
                            ->defaultItems(0),
                        Forms\Components\TextInput::make('options_source')
                            ->label('Dynamic Options Source')
                            ->placeholder('table:value,label'),
                    ]),
                Forms\Components\Section::make('Settings')
                    ->columns(4)
                    ->schema([
                        Forms\Components\Toggle::make('is_required')
                            ->label('Required')
                            ->default(false),
                        Forms\Components\TextInput::make('default_value')
                            ->label('Default Value'),
                        Forms\Components\Select::make('operator')
                            ->label('Operator')
                            ->options([
                                'equals' => 'Equals',
                                'not_equals' => 'Not Equals',
                                'contains' => 'Contains',
                                'greater_than' => 'Greater Than',
                                'less_than' => 'Less Than',
                                'between' => 'Between',
                                'in' => 'In',
                            ])
                            ->default('equals'),
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
                Tables\Columns\TextColumn::make('param_key')
                    ->label('Key')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('field_name')
                    ->label('Field')
                    ->searchable(),
                Tables\Columns\TextColumn::make('label_en')
                    ->label('Label')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('param_type')
                    ->label('Type')
                    ->colors([
                        'primary' => 'text',
                        'success' => fn ($state) => in_array($state, ['select', 'multiselect']),
                        'warning' => fn ($state) => in_array($state, ['date', 'date_range']),
                        'info' => 'number',
                        'danger' => 'boolean',
                    ]),
                Tables\Columns\TextColumn::make('operator')
                    ->label('Operator')
                    ->badge()
                    ->color('gray'),
                Tables\Columns\IconColumn::make('is_required')
                    ->label('Required')
                    ->boolean(),
                Tables\Columns\TextColumn::make('default_value')
                    ->label('Default')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('param_type'),
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
