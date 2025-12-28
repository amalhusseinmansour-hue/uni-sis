<?php

namespace App\Filament\Resources\DynamicReportResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ChartsRelationManager extends RelationManager
{
    protected static string $relationship = 'charts';

    protected static ?string $title = 'Report Charts';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Chart Identity')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('chart_key')
                            ->label('Chart Key')
                            ->required()
                            ->alphaDash()
                            ->maxLength(50),
                        Forms\Components\Select::make('chart_type')
                            ->label('Chart Type')
                            ->required()
                            ->options([
                                'bar' => 'Bar Chart',
                                'line' => 'Line Chart',
                                'area' => 'Area Chart',
                                'pie' => 'Pie Chart',
                                'donut' => 'Donut Chart',
                                'radar' => 'Radar Chart',
                                'scatter' => 'Scatter Plot',
                            ])
                            ->live(),
                    ]),
                Forms\Components\Section::make('Titles')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('title_en')
                            ->label('Title (English)')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('title_ar')
                            ->label('Title (Arabic)')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('subtitle_en')
                            ->label('Subtitle (EN)'),
                        Forms\Components\TextInput::make('subtitle_ar')
                            ->label('Subtitle (AR)'),
                    ]),
                Forms\Components\Section::make('Data Mapping')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('label_field')
                            ->label('Label Field')
                            ->required()
                            ->helperText('Field for chart labels (X-axis)'),
                        Forms\Components\TextInput::make('data_field')
                            ->label('Data Field')
                            ->required()
                            ->helperText('Field for chart values (Y-axis)'),
                        Forms\Components\TextInput::make('group_field')
                            ->label('Group Field')
                            ->helperText('Optional: group data by this field'),
                        Forms\Components\Select::make('aggregation')
                            ->label('Aggregation')
                            ->options([
                                'sum' => 'Sum',
                                'avg' => 'Average',
                                'count' => 'Count',
                                'min' => 'Minimum',
                                'max' => 'Maximum',
                            ])
                            ->default('sum'),
                    ]),
                Forms\Components\Section::make('Colors')
                    ->schema([
                        Forms\Components\TagsInput::make('colors')
                            ->label('Chart Colors')
                            ->placeholder('Add color...')
                            ->helperText('Hex colors like #3B82F6, #10B981, #F59E0B'),
                    ]),
                Forms\Components\Section::make('Display Options')
                    ->columns(3)
                    ->schema([
                        Forms\Components\Toggle::make('show_legend')
                            ->label('Show Legend')
                            ->default(true),
                        Forms\Components\Toggle::make('show_labels')
                            ->label('Show Data Labels')
                            ->default(false),
                        Forms\Components\Toggle::make('show_grid')
                            ->label('Show Grid')
                            ->default(true),
                        Forms\Components\Select::make('legend_position')
                            ->label('Legend Position')
                            ->options([
                                'top' => 'Top',
                                'bottom' => 'Bottom',
                                'left' => 'Left',
                                'right' => 'Right',
                            ])
                            ->default('bottom'),
                        Forms\Components\TextInput::make('height')
                            ->label('Height')
                            ->placeholder('300')
                            ->numeric(),
                        Forms\Components\TextInput::make('sort_order')
                            ->label('Sort Order')
                            ->numeric()
                            ->default(0),
                    ]),
                Forms\Components\Section::make('Advanced Options')
                    ->collapsed()
                    ->schema([
                        Forms\Components\KeyValue::make('options')
                            ->label('Chart.js Options')
                            ->keyLabel('Option')
                            ->valueLabel('Value')
                            ->helperText('Advanced Chart.js configuration'),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title_en')
            ->columns([
                Tables\Columns\TextColumn::make('chart_key')
                    ->label('Key')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('title_en')
                    ->label('Title')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('chart_type')
                    ->label('Type')
                    ->colors([
                        'primary' => fn ($state) => in_array($state, ['bar', 'line']),
                        'success' => fn ($state) => in_array($state, ['pie', 'donut']),
                        'warning' => 'area',
                        'info' => fn ($state) => in_array($state, ['radar', 'scatter']),
                    ]),
                Tables\Columns\TextColumn::make('label_field')
                    ->label('Labels'),
                Tables\Columns\TextColumn::make('data_field')
                    ->label('Data'),
                Tables\Columns\TextColumn::make('aggregation')
                    ->label('Aggregation')
                    ->badge()
                    ->color('gray'),
                Tables\Columns\IconColumn::make('show_legend')
                    ->label('Legend')
                    ->boolean(),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('chart_type')
                    ->options([
                        'bar' => 'Bar',
                        'line' => 'Line',
                        'pie' => 'Pie',
                        'donut' => 'Donut',
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
